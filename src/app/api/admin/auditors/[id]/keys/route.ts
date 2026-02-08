/**
 * Admin API: Auditor key management.
 *
 * GET  /api/admin/auditors/:id/keys          - List all keys for an auditor
 * POST /api/admin/auditors/:id/keys          - Add a new key to an auditor
 *
 * Protected: requires authenticated admin user.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { AddAuditorKeyBody } from "@/lib/certification/auditorTypes";
import { computeKeyFingerprint } from "@/lib/certification/auditorRegistry";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const includeRawKeys = searchParams.get("include_keys") === "true";

  // PRIVACY: Omit public_key_hex by default; return only key_fingerprint.
  const columns = includeRawKeys
    ? "*"
    : "id, auditor_id, key_fingerprint, algorithm, status, valid_from, valid_until, rotation_reason, created_at";

  const { data: keys, error } = await supabase!
    .from("auditor_keys")
    .select(columns)
    .eq("auditor_id", id)
    .order("valid_from", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keys: keys ?? [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  // Verify auditor exists
  const { data: auditor } = await supabase!
    .from("auditors")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!auditor) {
    return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
  }

  if (auditor.status !== "active") {
    return NextResponse.json(
      { error: "Cannot add key to non-active auditor" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = AddAuditorKeyBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { publicKeyHex } = parsed.data;
  const keyFingerprint = await computeKeyFingerprint(publicKeyHex);

  // Check for duplicate key fingerprint
  const { data: existing } = await supabase!
    .from("auditor_keys")
    .select("id")
    .eq("key_fingerprint", keyFingerprint)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A key with this fingerprint is already registered" },
      { status: 409 },
    );
  }

  const { data: newKey, error } = await supabase!
    .from("auditor_keys")
    .insert({
      auditor_id: id,
      public_key_hex: publicKeyHex,
      key_fingerprint: keyFingerprint,
      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ key: newKey }, { status: 201 });
}
