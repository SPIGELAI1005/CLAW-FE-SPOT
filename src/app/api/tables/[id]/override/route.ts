import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: tableId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("status_overrides")
    .select("id, run_id, from_status, to_status, reason, created_at")
    .eq("table_id", tableId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ overrides: data ?? [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: tableId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 401 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { reason?: string; runId?: string };
  const reason = (body.reason ?? "").trim();
  if (!reason) return NextResponse.json({ error: "reason is required" }, { status: 400 });

  // Read current table status (for audit trail)
  const { data: table, error: tableErr } = await supabase
    .from("tables")
    .select("status")
    .eq("id", tableId)
    .single();

  if (tableErr) return NextResponse.json({ error: tableErr.message }, { status: 500 });

  const runId = (body.runId ?? "").trim() || null;

  // Record override
  const { error: insertErr } = await supabase.from("status_overrides").insert({
    owner_id: user.id,
    table_id: tableId,
    run_id: runId,
    from_status: table?.status ?? null,
    to_status: "done",
    reason,
  });

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  const { error: tableUpdateErr } = await supabase
    .from("tables")
    .update({ status: "done" })
    .eq("id", tableId);

  if (tableUpdateErr) return NextResponse.json({ error: tableUpdateErr.message }, { status: 500 });

  if (runId) {
    // best-effort: set run to done and append a log event
    const { data: run, error: runErr } = await supabase
      .from("runs")
      .select("log")
      .eq("id", runId)
      .eq("table_id", tableId)
      .single();

    if (runErr) return NextResponse.json({ error: runErr.message }, { status: 500 });

    const prevLog = Array.isArray(run?.log) ? (run.log as unknown[]) : [];
    const nextLog = [
      ...prevLog,
      {
        at: new Date().toISOString(),
        type: "override",
        message: `Override: mark done. Reason: ${reason}`,
      },
    ];

    const { error: runUpdateErr } = await supabase
      .from("runs")
      .update({ status: "done", log: nextLog })
      .eq("id", runId)
      .eq("table_id", tableId);
    if (runUpdateErr) return NextResponse.json({ error: runUpdateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, nextStatus: "done" });
}
