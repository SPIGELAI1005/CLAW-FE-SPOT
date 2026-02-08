import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { revokeOnChain } from "@/lib/certification";
import { RevokeCertificationBody, parseBody } from "@/lib/validations";

/**
 * POST /api/certifications/[id]/revoke
 * Revoke a certification both on-chain and off-chain.
 * Only the SPOT owner can revoke.
 *
 * PRIVACY: Only the enum reasonCode goes on-chain (via event log).
 * The free-text detail is stored off-chain in Supabase only.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  // Validate request body
  const parsed = await parseBody(request, RevokeCertificationBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Fetch the certification
  const { data: cert, error: certErr } = await supabase
    .from("certifications")
    .select("*, tables!inner(owner_id)")
    .eq("id", id)
    .single();

  if (certErr || !cert) {
    return NextResponse.json(
      { error: "Certification not found" },
      { status: 404 },
    );
  }

  // Authorization: only SPOT owner can revoke
  const spotOwnerId = (cert as Record<string, unknown>).tables
    ? ((cert as Record<string, unknown>).tables as Record<string, unknown>).owner_id
    : null;
  if (spotOwnerId !== user.id) {
    return NextResponse.json(
      { error: "Only the SPOT owner can revoke a certification" },
      { status: 403 },
    );
  }

  // Check current status
  if (cert.status !== "valid") {
    return NextResponse.json(
      { error: `Cannot revoke: certification status is already '${cert.status}'` },
      { status: 409 },
    );
  }

  // Revoke on-chain (only the enum code goes on-chain, never the free-text detail)
  try {
    await revokeOnChain(cert.fingerprint, parsed.data.reasonCode);
  } catch (err) {
    console.error(
      "[revoke] On-chain revocation failed:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "On-chain revocation failed. Please try again." },
      { status: 502 },
    );
  }

  // Update off-chain status (free-text detail stored here only)
  const revocationReason = parsed.data.detail
    ? `${parsed.data.reasonCode}: ${parsed.data.detail}`
    : parsed.data.reasonCode;

  const { error: updateErr } = await supabase
    .from("certifications")
    .update({
      status: "revoked",
      revocation_reason: revocationReason,
    })
    .eq("id", id);

  if (updateErr) {
    // On-chain succeeded but off-chain failed; log sanitized message only
    console.error(
      "[revoke] Off-chain update failed:",
      updateErr.message,
    );
    return NextResponse.json(
      { warning: "Revoked on-chain but off-chain update failed", error: updateErr.message },
      { status: 207 },
    );
  }

  return NextResponse.json({ status: "revoked", certificationId: id });
}
