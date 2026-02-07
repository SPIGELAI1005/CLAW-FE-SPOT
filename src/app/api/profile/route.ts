import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { parseBody, UpdateProfileBody } from "@/lib/validations";

export async function GET() {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  return NextResponse.json({
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "User",
    persona: user.user_metadata?.persona ?? "member",
    created_at: user.created_at,
  });
}

export async function PATCH(request: Request) {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, UpdateProfileBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.display_name) updates.display_name = parsed.data.display_name;
  if (parsed.data.persona) updates.persona = parsed.data.persona;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    display_name: updates.display_name ?? user.user_metadata?.display_name ?? user.email?.split("@")[0],
    persona: updates.persona ?? user.user_metadata?.persona ?? "member",
  });
}
