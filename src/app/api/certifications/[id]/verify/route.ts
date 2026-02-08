import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { verifyCertification } from "@/lib/certification";
import type { CertificationPackage } from "@/lib/certification";

/**
 * GET /api/certifications/[id]/verify
 * Run the full verification pipeline on a stored certification.
 * Recomputes the fingerprint, verifies signatures, and checks on-chain status.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  // Fetch the certification record
  const { data: cert, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cert) {
    return NextResponse.json(
      { error: "Certification not found" },
      { status: 404 },
    );
  }

  // Run the full verification pipeline
  const result = await verifyCertification(
    cert.package_json as CertificationPackage,
  );

  return NextResponse.json({
    certificationId: cert.id,
    fingerprint: cert.fingerprint,
    offChainStatus: cert.status,
    verification: result,
  });
}
