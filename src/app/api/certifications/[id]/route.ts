import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

/**
 * GET /api/certifications/[id]
 * Fetch a single certification by ID. Requires authentication.
 *
 * PRIVACY: Returns only metadata columns by default.
 * The full package_json (containing signatures and public keys) is
 * intentionally excluded. Use the /export sub-route for the full package.
 */

// Columns safe for general display (no signatures or raw keys)
const SAFE_COLUMNS = [
  "id",
  "spot_id",
  "l2_report_id",
  "fingerprint",
  "status",
  "chain_id",
  "contract_addr",
  "tx_hash",
  "block_number",
  "superseded_by",
  "revocation_reason",
  "created_at",
].join(", ");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("certifications")
    .select(SAFE_COLUMNS)
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data);
}
