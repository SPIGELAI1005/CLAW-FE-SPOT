import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { PatchSpotBody, parseBody } from "@/lib/validations";
import { createInboxItem } from "@/lib/inboxHelpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ spot: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, PatchSpotBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const body = parsed.data;
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.goal !== undefined) update.goal = body.goal;
  if (body.mode !== undefined) update.mode = body.mode;
  if (body.certification_status !== undefined) update.certification_status = body.certification_status;
  if (body.contract !== undefined) update.contract = body.contract;

  const { data, error } = await supabase
    .from("tables")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If mode switched to execute, notify all participants
  if (body.mode === "execute") {
    const { data: participants } = await supabase
      .from("spot_participants")
      .select("user_id")
      .eq("spot_id", id);

    if (participants) {
      for (const p of participants) {
        if (p.user_id && p.user_id !== user.id) {
          await createInboxItem({
            supabase,
            ownerId: p.user_id,
            type: "l1_approval",
            spotId: id,
            title: `SPOT switched to EXECUTE: ${data?.title ?? "Untitled"}`,
            description: "This SPOT has entered EXECUTE mode. L1 auditor review is now active.",
            payload: { switched_by: user.id },
          });
        }
      }
    }
  }

  return NextResponse.json({ spot: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  // Verify ownership
  const { data: spot } = await supabase
    .from("tables")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!spot || spot.owner_id !== user.id) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  const { error } = await supabase.from("tables").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
