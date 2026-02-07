import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateMessageBody, parseBody } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  // Try the dedicated spot_messages table first; fall back to tables.log JSONB
  const { data: msgs, error: msgsErr } = await supabase
    .from("spot_messages")
    .select("*")
    .eq("spot_id", id)
    .order("created_at", { ascending: true });

  if (!msgsErr && msgs) {
    return NextResponse.json({ messages: msgs });
  }

  // Fallback: read from JSONB log column (legacy)
  const { data: spot, error } = await supabase
    .from("tables")
    .select("id, log")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const messages = Array.isArray(spot?.log) ? spot.log : [];
  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateMessageBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Try inserting into the dedicated spot_messages table
  const { data: msg, error: insertErr } = await supabase
    .from("spot_messages")
    .insert({
      spot_id: id,
      sender_id: user.id,
      sender_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "User",
      content: parsed.data.content,
      type: parsed.data.type,
    })
    .select("*")
    .single();

  if (!insertErr && msg) {
    return NextResponse.json(msg, { status: 201 });
  }

  // Fallback: append to JSONB log column (legacy)
  const { data: spot, error: fetchErr } = await supabase
    .from("tables")
    .select("log")
    .eq("id", id)
    .single();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const currentLog = Array.isArray(spot?.log) ? spot.log : [];
  const newMessage = {
    id: crypto.randomUUID(),
    type: parsed.data.type,
    sender_id: user.id,
    sender_name: user.email?.split("@")[0] ?? "User",
    content: parsed.data.content,
    created_at: new Date().toISOString(),
  };

  const { error: updateErr } = await supabase
    .from("tables")
    .update({ log: [...currentLog, newMessage] })
    .eq("id", id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  return NextResponse.json(newMessage, { status: 201 });
}
