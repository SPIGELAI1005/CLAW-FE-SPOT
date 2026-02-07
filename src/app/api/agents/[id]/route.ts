import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { parseBody, UpdateAgentBody } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agent: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, UpdateAgentBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Verify ownership
  const { data: existing } = await supabase
    .from("agents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.skills !== undefined) updates.skills = parsed.data.skills;
  if (parsed.data.tools !== undefined) updates.tools = parsed.data.tools;

  const { data, error } = await supabase
    .from("agents")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agent: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  // Verify ownership
  const { data: existing } = await supabase
    .from("agents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  const { error } = await supabase.from("agents").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
