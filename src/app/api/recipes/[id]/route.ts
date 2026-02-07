import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: recipe, error: recipeErr } = await supabase
    .from("recipes")
    .select("id, title, description, created_at, updated_at")
    .eq("id", id)
    .single();

  if (recipeErr) return NextResponse.json({ error: recipeErr.message }, { status: 500 });

  const { data: versions, error: verErr } = await supabase
    .from("recipe_versions")
    .select("id, recipe_id, version, template, created_at")
    .eq("recipe_id", id)
    .order("version", { ascending: false });

  if (verErr) return NextResponse.json({ error: verErr.message }, { status: 500 });

  return NextResponse.json({ recipe, versions: versions ?? [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  // Compute next version number
  const { data: last, error: lastErr } = await supabase
    .from("recipe_versions")
    .select("version")
    .eq("recipe_id", id)
    .order("version", { ascending: false })
    .limit(1);

  if (lastErr) return NextResponse.json({ error: lastErr.message }, { status: 500 });

  const nextVersion = ((last ?? [])[0]?.version ?? 0) + 1;

  const template = body.template;
  if (!template || typeof template !== "object") {
    return NextResponse.json({ error: "template is required" }, { status: 400 });
  }

  const { error: updErr } = await supabase
    .from("recipes")
    .update({
      title: (body.title ?? "").trim() || undefined,
      description: (body.description ?? "").trim() || null,
    })
    .eq("id", id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  const { data: version, error: verErr } = await supabase
    .from("recipe_versions")
    .insert({
      owner_id: user.id,
      recipe_id: id,
      version: nextVersion,
      template,
    })
    .select("id, recipe_id, version, template, created_at")
    .single();

  if (verErr) return NextResponse.json({ error: verErr.message }, { status: 500 });

  return NextResponse.json({ version });
}
