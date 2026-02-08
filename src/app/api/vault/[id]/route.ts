import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  // Get spot
  const { data: spot, error: spotErr } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();
  if (spotErr || !spot) {
    // PGRST116 = "no rows" i.e. not found or not authorized via RLS
    const status = spotErr?.code === "PGRST116" || !spot ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? "SPOT not found" : "Failed to retrieve SPOT" },
      { status },
    );
  }

  // Get L1 verdicts
  const { data: l1Verdicts } = await supabase
    .from("l1_verdicts")
    .select("*")
    .eq("spot_id", id)
    .order("created_at", { ascending: true });

  // Get L2 reports
  const { data: l2Reports } = await supabase
    .from("l2_reports")
    .select("*")
    .eq("spot_id", id)
    .order("created_at", { ascending: true });

  // Get participants
  const { data: participants } = await supabase
    .from("spot_participants")
    .select("*")
    .eq("spot_id", id);

  return NextResponse.json({
    spot,
    l1_verdicts: l1Verdicts ?? [],
    l2_reports: l2Reports ?? [],
    participants: participants ?? [],
  });
}
