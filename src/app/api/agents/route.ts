import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateAgentBody, parseBody } from "@/lib/validations";

export async function GET() {
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agents: data });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateAgentBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from("agents")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      description: parsed.data.description ?? null,
      skills: parsed.data.skills,
      tools: parsed.data.tools,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
