"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSupabaseBrowserClient } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook to subscribe to Supabase Realtime INSERT events on a table,
 * filtered by a specific column value (e.g. spot_id).
 */
export function useRealtimeInserts<T extends Record<string, unknown>>({
  table,
  filterColumn,
  filterValue,
  onInsert,
  enabled = true,
}: {
  table: string;
  filterColumn: string;
  filterValue: string;
  onInsert: (payload: T) => void;
  enabled?: boolean;
}) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onInsertRef = useRef(onInsert);
  onInsertRef.current = onInsert;

  useEffect(() => {
    if (!enabled || !filterValue) return;

    const supabase = getSupabaseBrowserClient();
    const channelName = `${table}:${filterColumn}:${filterValue}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as "system",
        {
          event: "INSERT",
          schema: "public",
          table,
          filter: `${filterColumn}=eq.${filterValue}`,
        } as Record<string, string>,
        (payload: { new: T }) => {
          onInsertRef.current(payload.new);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [table, filterColumn, filterValue, enabled]);
}

/**
 * Hook for presence tracking in a SPOT channel.
 * Tracks who is currently viewing a SPOT and typing status.
 */
export function usePresence(spotId: string, userId: string, displayName: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [presenceState, setPresenceState] = useState<
    Array<{ userId: string; displayName: string; isTyping: boolean }>
  >([]);

  useEffect(() => {
    if (!spotId || !userId) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`presence:spot:${spotId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: Array<{ userId: string; displayName: string; isTyping: boolean }> = [];

        for (const [key, presences] of Object.entries(state)) {
          const latest = (presences as Array<Record<string, unknown>>)[0];
          if (latest) {
            users.push({
              userId: key,
              displayName: String(latest.displayName ?? "Unknown"),
              isTyping: Boolean(latest.isTyping),
            });
          }
        }

        setPresenceState(users.filter((u) => u.userId !== userId));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            displayName,
            isTyping: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [spotId, userId, displayName]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (channelRef.current) {
        await channelRef.current.track({
          displayName,
          isTyping,
          online_at: new Date().toISOString(),
        });
      }
    },
    [displayName],
  );

  return { presenceState, setTyping };
}
