import type { SupabaseClient } from "@supabase/supabase-js";

interface CreateInboxParams {
  supabase: SupabaseClient;
  ownerId: string;
  type: "spot_invite" | "contract_proposal" | "l1_approval" | "l2_certification";
  spotId?: string;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
}

/**
 * Create an inbox item for a user. Used internally by API routes
 * when actions trigger notifications (invites, approvals, etc.).
 */
export async function createInboxItem({
  supabase,
  ownerId,
  type,
  spotId,
  title,
  description,
  payload,
}: CreateInboxParams) {
  const { error } = await supabase.from("inbox_items").insert({
    owner_id: ownerId,
    type,
    spot_id: spotId ?? null,
    title,
    description: description ?? null,
    payload: payload ?? {},
  });

  if (error) {
    console.error("[createInboxItem] Failed:", error.message);
  }
}
