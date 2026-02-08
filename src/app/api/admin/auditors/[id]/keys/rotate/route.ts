/**
 * Admin API: Key rotation.
 *
 * POST /api/admin/auditors/:id/keys/rotate  - Rotate an auditor's active key
 *
 * This closes the current key's validity window and creates a new one.
 * Old certifications remain verifiable because the old key's window
 * still covers their issuedAt timestamp.
 *
 * Protected: requires authenticated admin user.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { RotateKeyBody } from "@/lib/certification/auditorTypes";
import { rotateKey, getActiveKey } from "@/lib/certification/auditorRegistry";

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = RotateKeyBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Check that the auditor has an active key to rotate
  const currentKey = await getActiveKey(id);
  if (!currentKey) {
    return NextResponse.json(
      { error: "No active key to rotate. Add a key first." },
      { status: 400 },
    );
  }

  const newKey = await rotateKey(
    id,
    parsed.data.newPublicKeyHex,
    parsed.data.reason,
  );

  if (!newKey) {
    return NextResponse.json(
      { error: "Key rotation failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    rotated: true,
    previousKeyId: currentKey.id,
    newKey,
  });
}
