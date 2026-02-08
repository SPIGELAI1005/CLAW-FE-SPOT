import { NextResponse } from "next/server";
import { verifyCertification } from "@/lib/certification";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { CertificationPackage } from "@/lib/certification";

/**
 * GET /api/certifications/[id]/public
 *
 * PUBLIC verification endpoint. No authentication required.
 * The [id] parameter here is the certification fingerprint (64-char hex).
 * Returns only the verification result and minimal metadata.
 * Does NOT expose the full package, SPOT data, or any user info.
 *
 * This endpoint enables external parties to verify a certificate
 * using only the fingerprint (obtained from the certificate JSON).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: fingerprint } = await params;

  // Validate fingerprint format (64-char hex)
  if (!/^[0-9a-f]{64}$/.test(fingerprint)) {
    return NextResponse.json(
      { error: "Invalid fingerprint format. Expected 64-char lowercase hex." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  // Look up the certification by fingerprint
  // Use service-level access since this is a public endpoint
  const { data: cert, error } = await supabase
    .from("certifications")
    .select("package_json, status, created_at, chain_id, contract_addr, tx_hash, block_number")
    .eq("fingerprint", fingerprint)
    .single();

  if (error || !cert) {
    return NextResponse.json(
      {
        verified: false,
        fingerprint,
        error: "No certification found for this fingerprint",
      },
      { status: 404 },
    );
  }

  // Run verification pipeline
  const result = await verifyCertification(
    cert.package_json as CertificationPackage,
  );

  // Return only verification status + minimal on-chain metadata (no PII)
  return NextResponse.json({
    fingerprint,
    verified: result.verified,
    status: cert.status,
    onChainStatus: result.onChainStatus,
    chainId: cert.chain_id,
    contractAddress: cert.contract_addr,
    transactionHash: cert.tx_hash,
    blockNumber: cert.block_number,
    issuedAt: cert.created_at,
    platformSignatureValid: result.platformSignatureValid,
    errors: result.errors,
  });
}
