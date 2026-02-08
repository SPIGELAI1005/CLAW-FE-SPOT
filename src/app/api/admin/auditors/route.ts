/**
 * Admin API: Auditor management.
 *
 * GET  /api/admin/auditors        - List all auditors
 * POST /api/admin/auditors        - Register a new auditor
 *
 * Protected: requires authenticated admin user.
 * Admin check: user must have role "admin" in the profiles table.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateAuditorBody } from "@/lib/certification/auditorTypes";

async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.errorResponse) return { ...auth, isAdmin: false };

  // Check admin role in profiles
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

export async function GET(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const includeRawKeys = searchParams.get("include_keys") === "true";

  // PRIVACY: By default, omit public_key_hex from key sub-records.
  // Only return raw keys when explicitly requested (?include_keys=true).
  const keyColumns = includeRawKeys
    ? "id, auditor_id, public_key_hex, key_fingerprint, algorithm, status, valid_from, valid_until, rotation_reason, created_at"
    : "id, auditor_id, key_fingerprint, algorithm, status, valid_from, valid_until, rotation_reason, created_at";

  const { data, error } = await supabase!
    .from("auditors")
    .select(`*, auditor_keys(${keyColumns})`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ auditors: data });
}

export async function POST(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  const parsed = CreateAuditorBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { displayAlias, role, userId } = parsed.data;

  // Check for duplicate user_id if provided
  if (userId) {
    const { data: existing } = await supabase!
      .from("auditors")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An auditor record already exists for this user" },
        { status: 409 },
      );
    }
  }

  const { data: auditor, error } = await supabase!
    .from("auditors")
    .insert({
      display_alias: displayAlias,
      role,
      user_id: userId ?? null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ auditor }, { status: 201 });
}
