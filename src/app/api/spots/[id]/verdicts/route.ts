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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
