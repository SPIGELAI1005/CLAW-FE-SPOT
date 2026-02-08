/**
 * Admin API: Individual key operations.
 *
 * DELETE /api/admin/auditors/:id/keys/:keyId  - Revoke a specific key
 *
 * Protected: requires authenticated admin user.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { RevokeKeyBody } from "@/lib/certification/auditorTypes";
import { revokeKey } from "@/lib/certification/auditorRegistry";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; keyId: string }> },
) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id, keyId } = await params;

  // Verify the key belongs to the specified auditor
  const { data: key } = await supabase!
    .from("auditor_keys")
    .select("id, auditor_id, status")
    .eq("id", keyId)
    .eq("auditor_id", id)
    .single();

  if (!key) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  if (key.status === "revoked") {
    return NextResponse.json(
      { error: "Key is already revoked" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = RevokeKeyBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Reason is required", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const success = await revokeKey(keyId, parsed.data.reason);
  if (!success) {
    return NextResponse.json(
      { error: "Failed to revoke key" },
      { status: 500 },
    );
  }

  return NextResponse.json({ revoked: true, keyId });
}
