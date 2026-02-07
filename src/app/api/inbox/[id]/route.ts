import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { PatchInboxItemBody, parseBody } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, PatchInboxItemBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from("inbox_items")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
