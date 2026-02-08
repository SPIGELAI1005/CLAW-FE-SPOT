import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { AddParticipantBody, parseBody } from "@/lib/validations";
import { createInboxItem } from "@/lib/inboxHelpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("spot_participants")
    .select("*")
    .eq("spot_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[participants/GET]", error.message);
    return NextResponse.json({ error: "Failed to retrieve participants" }, { status: 500 });
  }
  return NextResponse.json({ participants: data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, AddParticipantBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from("spot_participants")
    .insert({
      spot_id: id,
      user_id: parsed.data.user_id ?? null,
      agent_id: parsed.data.agent_id ?? null,
      role: parsed.data.role,
      display_name: parsed.data.display_name,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[participants/POST]", error.message);
    return NextResponse.json({ error: "Failed to add participant" }, { status: 500 });
  }

  // Create inbox item for the invited user (if a user, not an agent)
  if (parsed.data.user_id) {
    // Get spot title for the notification
    const { data: spot } = await supabase
      .from("tables")
      .select("title")
      .eq("id", id)
      .single();

    await createInboxItem({
      supabase,
      ownerId: parsed.data.user_id,
      type: "spot_invite",
      spotId: id,
      title: `Invited to SPOT: ${spot?.title ?? "Untitled"}`,
      description: `You have been invited as ${parsed.data.role} by ${user.email?.split("@")[0] ?? "someone"}.`,
      payload: { role: parsed.data.role, invited_by: user.id },
    });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: spotId } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const url = new URL(request.url);
  const participantId = url.searchParams.get("pid");
  if (!participantId) {
    return NextResponse.json({ error: "Missing pid query parameter" }, { status: 400 });
  }

  // Verify the current user owns the spot
  const { data: spot } = await supabase
    .from("tables")
    .select("owner_id")
    .eq("id", spotId)
    .single();

  if (!spot || spot.owner_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("spot_participants")
    .delete()
    .eq("id", participantId)
    .eq("spot_id", spotId);

  if (error) {
    console.error("[participants/DELETE]", error.message);
    return NextResponse.json({ error: "Failed to remove participant" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
