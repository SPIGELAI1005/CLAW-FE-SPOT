import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateInboxItemBody, parseBody } from "@/lib/validations";

export async function GET() {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const { data, error } = await supabase
    .from("inbox_items")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateInboxItemBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from("inbox_items")
    .insert({
      owner_id: parsed.data.owner_id,
      type: parsed.data.type,
      spot_id: parsed.data.spot_id ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      payload: parsed.data.payload ?? {},
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
