"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { ConversationPanel } from "./ConversationPanel";
import { ContractPanel } from "./ContractPanel";
import { ActionTimeline } from "./ActionTimeline";
import { ModeBadge } from "@/components/ui/ModeBadge";
import { CertBadge } from "@/components/ui/CertBadge";
import { useFetch, mapDbSpot, mapDbParticipant, mapDbMessage } from "@/lib/useFetch";
import { useRealtimeInserts, usePresence } from "@/lib/useRealtime";
import type { Spot, SpotMessage, SpotParticipant, L1VerdictRecord } from "@/lib/spotTypes";

interface SpotResponse {
  spot: Record<string, unknown>;
}

interface ParticipantsResponse {
  participants: Record<string, unknown>[];
}

interface MessagesResponse {
  messages: Record<string, unknown>[];
}

interface VerdictsResponse {
  verdicts: Record<string, unknown>[];
}

type MobileTab = "conversation" | "contract" | "timeline";

const mobileTabs = [
  { value: "conversation" as const, label: "Conversation" },
  { value: "contract" as const, label: "Contract" },
  { value: "timeline" as const, label: "Timeline" },
];

function mapDbVerdict(raw: Record<string, unknown>): L1VerdictRecord {
  return {
    id: String(raw.id ?? ""),
    spotId: String(raw.spot_id ?? ""),
    actionId: String(raw.action_id ?? ""),
    verdict: (raw.verdict === "block" ? "block" : "approve") as "approve" | "block",
    rationale: String(raw.rationale ?? ""),
    auditorId: String(raw.auditor_id ?? ""),
    createdAt: raw.created_at ? String(raw.created_at) : undefined,
  };
}

export function SpotWorkspace({ spotId }: { spotId: string }) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("conversation");

  const { data: spotData, isLoading: isSpotLoading, refetch: refetchSpot } =
    useFetch<SpotResponse>(`/api/spots/${spotId}`);
  const { data: participantsData, refetch: refetchParticipants } =
    useFetch<ParticipantsResponse>(`/api/spots/${spotId}/participants`);
  const { data: messagesData, refetch: refetchMessages } =
    useFetch<MessagesResponse>(`/api/spots/${spotId}/messages`);
  const { data: verdictsData, refetch: refetchVerdicts } =
    useFetch<VerdictsResponse>(`/api/spots/${spotId}/verdicts`);

  const spot: Spot | null = spotData?.spot
    ? (mapDbSpot(spotData.spot) as Spot)
    : null;
  const participants: SpotParticipant[] = (participantsData?.participants ?? []).map(
    mapDbParticipant,
  ) as SpotParticipant[];
  const messages: SpotMessage[] = (messagesData?.messages ?? []).map(
    mapDbMessage,
  ) as SpotMessage[];
  const verdicts: L1VerdictRecord[] = (verdictsData?.verdicts ?? []).map(
    mapDbVerdict,
  );

  // Real-time: subscribe to new messages in this SPOT
  useRealtimeInserts({
    table: "spot_messages",
    filterColumn: "spot_id",
    filterValue: spotId,
    onInsert: () => {
      refetchMessages();
    },
    enabled: true,
  });

  // Real-time: subscribe to new L1 verdicts
  useRealtimeInserts({
    table: "l1_verdicts",
    filterColumn: "spot_id",
    filterValue: spotId,
    onInsert: () => {
      refetchVerdicts();
    },
    enabled: true,
  });

  // Presence tracking
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.id) setUserId(d.id);
        if (d.display_name || d.email) setDisplayName(d.display_name || d.email);
      })
      .catch(() => {});
  }, []);

  const { presenceState, setTyping } = usePresence(spotId, userId, displayName);

  const handleSendMessage = useCallback(
    async (content: string) => {
      await fetch(`/api/spots/${spotId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type: "human" }),
      });
      refetchMessages();
    },
    [spotId, refetchMessages],
  );

  const handleModeSwitch = useCallback(async () => {
    await fetch(`/api/spots/${spotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "execute" }),
    });
    refetchSpot();
  }, [spotId, refetchSpot]);

  const handleRequestCertification = useCallback(async () => {
    await fetch(`/api/spots/${spotId}/certify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verdict: "pass",
        report: "Automated certification request.",
      }),
    });
    refetchSpot();
  }, [spotId, refetchSpot]);

  const handleCreateVerdict = useCallback(
    async (verdict: {
      action_id: string;
      verdict: "approve" | "block";
      rationale: string;
    }) => {
      await fetch(`/api/spots/${spotId}/verdicts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verdict),
      });
      refetchVerdicts();
    },
    [spotId, refetchVerdicts],
  );

  if (isSpotLoading || !spot) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="h-96 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
          <div className="h-96 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            {spot.title}
          </h1>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            {spot.goal}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeBadge mode={spot.mode} />
          <CertBadge status={spot.certificationStatus} />
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden">
        <Tabs value={mobileTab} onChange={setMobileTab} tabs={mobileTabs} />
      </div>

      {/* 3-panel layout */}
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className={`${mobileTab !== "conversation" ? "hidden md:block" : ""}`}>
            <ConversationPanel
              messages={messages}
              spotMode={spot.mode}
              onSend={handleSendMessage}
              presenceUsers={presenceState}
              onTypingChange={setTyping}
            />
          </div>
          <div className={`${mobileTab !== "timeline" ? "hidden md:block" : ""}`}>
            <ActionTimeline
              toolCalls={[]}
              verdicts={verdicts}
              spotMode={spot.mode}
              onCreateVerdict={handleCreateVerdict}
            />
          </div>
        </div>

        <div className={`${mobileTab !== "contract" ? "hidden md:block" : ""}`}>
          <ContractPanel
            spot={spot}
            participants={participants}
            onModeSwitch={handleModeSwitch}
            onRequestCertification={handleRequestCertification}
            onRefreshParticipants={refetchParticipants}
          />
        </div>
      </div>
    </div>
  );
}
