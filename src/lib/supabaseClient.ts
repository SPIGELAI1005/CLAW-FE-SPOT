import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "./env";

let cached: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (cached) return cached;
  const env = getEnv();
  cached = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return cached;
}
