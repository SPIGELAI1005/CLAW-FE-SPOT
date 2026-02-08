import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

/**
 * GET /api/certifications/[id]/export
 *
 * Returns the full certification record including package_json.
 * This is the only endpoint that exposes the complete package
 * (with signatures and public keys). Used by the CertificateExport
 * component for downloading a self-contained verifiable artifact.
 *
 * PRIVACY: Requires authentication. RLS restricts access to
 * SPOT owner and participants only.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("certifications")
    .select("id, fingerprint, status, package_json, created_at")
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data);
}
