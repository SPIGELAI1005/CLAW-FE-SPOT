import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Sign in required</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            To protect your Tables as a Single Point Of Truth, CLAW:FE SPOT
            requires authentication.
          </div>
          <div className="mt-5">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
