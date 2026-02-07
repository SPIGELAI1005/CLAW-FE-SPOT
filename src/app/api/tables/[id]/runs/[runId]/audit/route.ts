import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; runId: string }> },
) {
  const { id: tableId, runId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure run belongs to table
  const { data: run, error: runErr } = await supabase
    .from("runs")
    .select("id")
    .eq("id", runId)
    .eq("table_id", tableId)
    .single();

  if (runErr) return NextResponse.json({ error: runErr.message }, { status: 500 });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("audit_reports")
    .select("id, table_id, run_id, passed, summary, issues, created_at")
    .eq("table_id", tableId)
    .eq("run_id", runId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const report = (data ?? [])[0] ?? null;
  return NextResponse.json({ report });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; runId: string }> },
) {
  const { id: tableId, runId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 401 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure run belongs to table
  const { data: run, error: runErr } = await supabase
    .from("runs")
    .select("id")
    .eq("id", runId)
    .eq("table_id", tableId)
    .single();

  if (runErr) return NextResponse.json({ error: runErr.message }, { status: 500 });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as {
    passed?: boolean;
    summary?: string;
    issues?: Array<{ title: string; severity?: string; details?: string; fix?: string }>;
  };

  if (typeof body.passed !== "boolean") {
    return NextResponse.json({ error: "passed (boolean) is required" }, { status: 400 });
  }

  const issues = Array.isArray(body.issues) ? body.issues : [];

  const { data, error } = await supabase
    .from("audit_reports")
    .insert({
      owner_id: user.id,
      table_id: tableId,
      run_id: runId,
      passed: body.passed,
      summary: body.summary ?? null,
      issues,
    })
    .select("id, table_id, run_id, passed, summary, issues, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Status transitions (Phase 3: audit gate)
  const nextStatus = body.passed ? "done" : "fix_required";

  const { error: runUpdateErr } = await supabase
    .from("runs")
    .update({ status: nextStatus })
    .eq("id", runId)
    .eq("table_id", tableId);

  if (runUpdateErr) {
    return NextResponse.json({ error: runUpdateErr.message }, { status: 500 });
  }

  const { error: tableUpdateErr } = await supabase
    .from("tables")
    .update({ status: nextStatus })
    .eq("id", tableId);

  if (tableUpdateErr) {
    return NextResponse.json({ error: tableUpdateErr.message }, { status: 500 });
  }

  return NextResponse.json({ report: data, nextStatus });
}
