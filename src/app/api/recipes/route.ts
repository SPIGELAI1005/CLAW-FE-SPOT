import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, description, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ recipes: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    template?: unknown;
  };

  const title = (body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const template = body.template;
  if (!template || typeof template !== "object") {
    return NextResponse.json({ error: "template is required" }, { status: 400 });
  }

  const { data: recipe, error: recipeErr } = await supabase
    .from("recipes")
    .insert({
      owner_id: user.id,
      title,
      description: (body.description ?? "").trim() || null,
    })
    .select("id, title, description, created_at, updated_at")
    .single();

  if (recipeErr) return NextResponse.json({ error: recipeErr.message }, { status: 500 });

  const { data: version, error: versionErr } = await supabase
    .from("recipe_versions")
    .insert({
      owner_id: user.id,
      recipe_id: recipe.id,
      version: 1,
      template,
    })
    .select("id, recipe_id, version, template, created_at")
    .single();

  if (versionErr) return NextResponse.json({ error: versionErr.message }, { status: 500 });

  return NextResponse.json({ recipe, version });
}
