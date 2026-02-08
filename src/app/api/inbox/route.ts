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

  if (error) {
    console.error("[inbox/GET]", error.message);
    return NextResponse.json({ error: "Failed to retrieve inbox items" }, { status: 500 });
  }
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateInboxItemBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // SECURITY: Always use the authenticated user's ID as owner_id.
  // Never trust owner_id from the client body (prevents IDOR).
  const { data, error } = await supabase
    .from("inbox_items")
    .insert({
      owner_id: user.id,
      type: parsed.data.type,
      spot_id: parsed.data.spot_id ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      payload: parsed.data.payload ?? {},
    })
    .select("*")
    .single();

  if (error) {
    console.error("[inbox/POST]", error.message);
    return NextResponse.json({ error: "Failed to create inbox item" }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
