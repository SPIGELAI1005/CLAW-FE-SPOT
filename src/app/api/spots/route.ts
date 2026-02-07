import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateSpotBody, parseBody } from "@/lib/validations";

export async function GET() {
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ spots: data });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateSpotBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const body = parsed.data;
  const { data, error } = await supabase
    .from("tables")
    .insert({
      owner_id: user.id,
      title: body.title,
      goal: body.goal,
      status: "draft",
      mode: body.mode,
      certification_status: "uncertified",
      contract: {},
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
