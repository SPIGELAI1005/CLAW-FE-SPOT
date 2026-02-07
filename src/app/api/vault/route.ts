import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

export async function GET() {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  // Get all spots owned by user with their L1/L2 data
  const { data: spots, error: spotsErr } = await supabase
    .from("tables")
    .select("id, title, status, mode, certification_status, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (spotsErr) return NextResponse.json({ error: spotsErr.message }, { status: 500 });

  // For each spot, get verdict summary
  const entries = await Promise.all(
    (spots ?? []).map(async (spot) => {
      const { count: l1Count } = await supabase
        .from("l1_verdicts")
        .select("*", { count: "exact", head: true })
        .eq("spot_id", spot.id);

      const { data: l2 } = await supabase
        .from("l2_reports")
        .select("verdict")
        .eq("spot_id", spot.id)
        .order("created_at", { ascending: false })
        .limit(1);

      return {
        spot_id: spot.id,
        spot_title: spot.title,
        mode: spot.mode,
        certification_status: spot.certification_status ?? "uncertified",
        l1_verdict_count: l1Count ?? 0,
        l2_verdict: l2?.[0]?.verdict ?? null,
        updated_at: spot.updated_at,
      };
    }),
  );

  return NextResponse.json({ entries });
}
