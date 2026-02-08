/**
 * Admin API: Single auditor management.
 *
 * GET    /api/admin/auditors/:id   - Get auditor details + keys
 * PATCH  /api/admin/auditors/:id   - Update auditor (alias, status)
 *
 * Protected: requires authenticated admin user.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { UpdateAuditorBody } from "@/lib/certification/auditorTypes";

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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const { data: auditor, error } = await supabase!
    .from("auditors")
    .select("*, auditor_keys(*)")
    .eq("id", id)
    .single();

  if (error || !auditor) {
    return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
  }

  return NextResponse.json({ auditor });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateAuditorBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.displayAlias) updates.display_alias = parsed.data.displayAlias;
  if (parsed.data.status) updates.status = parsed.data.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const { data: auditor, error } = await supabase!
    .from("auditors")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!auditor) {
    return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
  }

  return NextResponse.json({ auditor });
}
