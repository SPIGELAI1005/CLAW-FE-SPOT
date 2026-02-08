import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

/**
 * POST /api/admin/certifications/:id/purge
 *
 * Data retention: purge the off-chain content of a certification while
 * preserving the on-chain proof. After purge:
 *  - package_json is set to null (signatures, public keys, metadata removed)
 *  - platform_sig is set to "[REDACTED]"
 *  - auditor_sigs is set to null
 *
 * The fingerprint, chain metadata, status, and timestamps are preserved,
 * so the on-chain proof remains independently verifiable.
 *
 * PRIVACY: This enables compliance with data retention policies.
 * Once purged, the certification can still be verified via the on-chain
 * fingerprint, but the full package cannot be reconstructed.
 *
 * Protected: requires authenticated admin user.
 * Irreversible: there is no undo.
 */

async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.errorResponse) return { ...auth, isAdmin: false };

  const { data: profile } = await auth.supabase!
    .from("profiles")
    .select("role")
    .eq("id", auth.user!.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      ...auth,
      isAdmin: false,
      errorResponse: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { ...auth, isAdmin: true };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  // Verify the certification exists
  const { data: cert } = await supabase!
    .from("certifications")
    .select("id, fingerprint, status, package_json")
    .eq("id", id)
    .single();

  if (!cert) {
    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  }

  // Already purged?
  if (!cert.package_json) {
    return NextResponse.json(
      { error: "Certification content has already been purged" },
      { status: 409 },
    );
  }

  // Purge off-chain content
  const { error: updateErr } = await supabase!
    .from("certifications")
    .update({
      package_json: null,
      platform_sig: "[REDACTED]",
      auditor_sigs: null,
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    purged: true,
    certificationId: id,
    fingerprint: cert.fingerprint,
    message: "Off-chain content purged. On-chain proof remains verifiable.",
  });
}
