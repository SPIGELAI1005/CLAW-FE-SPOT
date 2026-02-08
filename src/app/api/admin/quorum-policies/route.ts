/**
 * Admin API: Quorum policy management.
 *
 * GET  /api/admin/quorum-policies          - List all policies
 * POST /api/admin/quorum-policies          - Create a new quorum policy
 *
 * Protected: requires authenticated admin user.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateQuorumPolicyBody } from "@/lib/certification/auditorTypes";

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

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase!
    .from("quorum_policies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ policies: data });
}

export async function POST(request: NextRequest) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  const parsed = CreateQuorumPolicyBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { policyVersion, minL1Signatures, requireL2Signature, description } = parsed.data;

  // Deactivate any existing policy with the same version
  await supabase!
    .from("quorum_policies")
    .update({ active: false })
    .eq("policy_version", policyVersion);

  const { data: policy, error } = await supabase!
    .from("quorum_policies")
    .insert({
      policy_version: policyVersion,
      min_l1_signatures: minL1Signatures,
      require_l2_signature: requireL2Signature,
      description: description ?? null,
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ policy }, { status: 201 });
}
