import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * Authenticate the request and return the Supabase client + user.
 * Returns a JSON 401 error response if not authenticated.
 */
export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
      errorResponse: NextResponse.json(
        { error: error?.message ?? "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  return { supabase, user, errorResponse: null };
}
