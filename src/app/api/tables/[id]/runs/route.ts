import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type RunLogEvent = {
  at: string; // ISO
  type: string;
  message: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("runs")
    .select("id, table_id, status, title, log, created_at, updated_at")
    .eq("table_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ runs: data ?? [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 401 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { title?: string };
  const title = (body.title ?? "Run").trim() || "Run";

  const { data, error } = await supabase
    .from("runs")
    .insert({
      owner_id: user.id,
      table_id: id,
      title,
      status: "queued",
      log: [],
    })
    .select("id, table_id, status, title, log, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ run: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    runId?: string;
    action?: "simulate";
  };

  const runId = (body.runId ?? "").trim();
  if (!runId) return NextResponse.json({ error: "runId is required" }, { status: 400 });

  if (body.action !== "simulate") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const { data: run, error: getErr } = await supabase
    .from("runs")
    .select("id, status, log")
    .eq("table_id", id)
    .eq("id", runId)
    .single();

  if (getErr) return NextResponse.json({ error: getErr.message }, { status: 500 });

  const now = new Date();
  const mk = (secOffset: number, type: string, message: string): RunLogEvent => ({
    at: new Date(now.getTime() + secOffset * 1000).toISOString(),
    type,
    message,
  });

  const prevLog: RunLogEvent[] = Array.isArray(run?.log) ? (run.log as RunLogEvent[]) : [];

  // Simple orchestrator stub: inject a few timeline events and move to needs_review.
  const nextLog = [
    ...prevLog,
    mk(0, "status", "Queued → Running"),
    mk(2, "step", "Driver: prepared plan + roles"),
    mk(5, "step", "Writer: drafted output artifacts"),
    mk(8, "step", "Editor: tightened + removed fluff"),
    mk(12, "audit", "Auditor: checks pending (Phase 3)"),
    mk(13, "status", "Running → Needs review"),
  ];

  const { data: updated, error: updateErr } = await supabase
    .from("runs")
    .update({
      status: "needs_review",
      log: nextLog,
    })
    .eq("table_id", id)
    .eq("id", runId)
    .select("id, table_id, status, title, log, created_at, updated_at")
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ run: updated });
}
