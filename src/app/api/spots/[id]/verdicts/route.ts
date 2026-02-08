import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateL1VerdictBody, parseBody } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("l1_verdicts")
    .select("*")
    .eq("spot_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[verdicts/GET]", error.message);
    return NextResponse.json({ error: "Failed to retrieve verdicts" }, { status: 500 });
  }
  return NextResponse.json({ verdicts: data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateL1VerdictBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // SECURITY: Verify the caller is an L1 auditor participant for this spot
  const { data: participant } = await supabase
    .from("spot_participants")
    .select("role")
    .eq("spot_id", id)
    .eq("user_id", user.id)
    .eq("role", "l1_auditor")
    .limit(1);

  if (!participant || participant.length === 0) {
    return NextResponse.json(
      { error: "Only assigned L1 auditors can submit verdicts for this SPOT" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("l1_verdicts")
    .insert({
      spot_id: id,
      action_id: parsed.data.action_id,
      verdict: parsed.data.verdict,
      rationale: parsed.data.rationale,
      auditor_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[verdicts/POST]", error.message);
    return NextResponse.json({ error: "Failed to submit verdict" }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
