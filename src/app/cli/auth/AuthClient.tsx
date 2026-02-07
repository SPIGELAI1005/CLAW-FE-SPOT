"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AuthClient() {
  const search = useSearchParams();
  const callback = search.get("callback");
  const [status, setStatus] = useState<string>("Checking session…");
  const [ready, setReady] = useState(false);

  const safeCallback = useMemo(() => {
    if (!callback) return null;
    try {
      const u = new URL(callback);
      if (u.hostname !== "127.0.0.1" && u.hostname !== "localhost") return null;
      return u.toString();
    } catch {
      return null;
    }
  }, [callback]);

  useEffect(() => {
    (async () => {
      if (!safeCallback) {
        setStatus("Missing or invalid callback URL.");
        return;
      }
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStatus("You are not signed in. Please sign in first, then retry.");
        return;
      }
      setStatus("Ready to authorize this CLI on your machine.");
      setReady(true);
    })();
  }, [safeCallback]);

  async function authorize() {
    if (!safeCallback) return;
    setStatus("Sending token to local CLI…");

    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setStatus("No access token found. Please re-login.");
      return;
    }

    try {
      const res = await fetch(safeCallback, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });
      if (!res.ok) throw new Error("Callback failed");
      setStatus("Authorized. You can close this tab.");
      setReady(false);
    } catch {
      setStatus(
        "Could not reach the local CLI callback. Is the CLI login command still running?",
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Card>
        <div className="text-sm font-semibold">Authorize CLI</div>
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This will send your current session token to the CLAW-FE CLI running on
          this machine.
        </div>

        <div className="mt-6 text-sm">{status}</div>

        <div className="mt-6">
          <Button as="button" onClick={authorize} disabled={!ready}>
            Authorize
          </Button>
        </div>

        <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Safety: only localhost callbacks are allowed.
        </div>
      </Card>
    </div>
  );
}
