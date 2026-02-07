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
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 shadow-lg dark:bg-stone-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
            Sign in to continue
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            CLAW:FE SPOT requires authentication to protect your workspaces
            and audit trails.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/30"
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
