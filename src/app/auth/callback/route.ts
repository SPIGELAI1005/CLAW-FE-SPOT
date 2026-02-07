import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * Validate the `next` redirect target to prevent open-redirect attacks.
 * Only relative paths starting with "/" are allowed — no protocol, no host.
 */
function safeRedirectPath(raw: string | null): string {
  const fallback = "/dashboard";
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  try {
    const parsed = new URL(raw, "http://localhost");
    if (parsed.host !== "localhost") return fallback;
  } catch {
    return fallback;
  }
  return raw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeRedirectPath(url.searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=missing_config", url));
  }

  // PKCE flow: exchange authorization code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Friendly message for the common PKCE verifier mismatch
      const isPkceError =
        error.message.toLowerCase().includes("pkce") ||
        error.message.toLowerCase().includes("code verifier");
      const errorMsg = isPkceError
        ? "expired_link"
        : encodeURIComponent(error.message);
      return NextResponse.redirect(new URL(`/login?error=${errorMsg}`, url));
    }
    return NextResponse.redirect(new URL(next, url));
  }

  // Token hash flow (email OTP / magic link fallback)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, url),
      );
    }
    return NextResponse.redirect(new URL(next, url));
  }

  // No code or token_hash — redirect to login
  return NextResponse.redirect(new URL("/login?error=missing_code", url));
}
