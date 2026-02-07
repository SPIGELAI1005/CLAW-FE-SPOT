import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { RecipeTemplateSchema } from "@/lib/recipeTypes";

export async function POST(
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
    .select("id, title")
    .eq("id", id)
    .single();

  if (recipeErr) return NextResponse.json({ error: recipeErr.message }, { status: 500 });

  const { data: versions, error: verErr } = await supabase
    .from("recipe_versions")
    .select("template, version")
    .eq("recipe_id", id)
    .order("version", { ascending: false })
    .limit(1);

  if (verErr) return NextResponse.json({ error: verErr.message }, { status: 500 });

  const latest = (versions ?? [])[0];
  if (!latest) return NextResponse.json({ error: "Recipe has no versions" }, { status: 400 });

  const parsed = RecipeTemplateSchema.safeParse(latest.template);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid recipe template" }, { status: 400 });
  }
  const t = parsed.data;

  const { data: table, error: tableErr } = await supabase
    .from("tables")
    .insert({
      owner_id: user.id,
      title: String(t.tableTitle || recipe.title),
      goal: String(t.goal || ""),
      acceptance_criteria: Array.isArray(t.acceptanceCriteria) ? t.acceptanceCriteria : [],
      constraints: Array.isArray(t.constraints) ? t.constraints : [],
      status: "draft",
    })
    .select("id")
    .single();

  if (tableErr) return NextResponse.json({ error: tableErr.message }, { status: 500 });

  return NextResponse.json({ tableId: table.id, recipeId: recipe.id, recipeVersion: latest.version });
}
