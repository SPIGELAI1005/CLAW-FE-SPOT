"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Helper to convert DB snake_case spot rows to our camelCase Spot type.
 */
export function mapDbSpot(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    title: (row.title as string) ?? "",
    goal: (row.goal as string) ?? "",
    mode: (row.mode as string) ?? "discuss",
    status: (row.status as string) ?? "draft",
    certificationStatus: (row.certification_status as string) ?? "uncertified",
    contract: row.contract
      ? mapDbContract(row.contract as Record<string, unknown>)
      : {
          scope: "",
          allowedTools: [],
          allowedData: [],
          acceptanceCriteria: [],
          terminationConditions: "",
          signedAt: null,
        },
    createdAt: row.created_at as string | undefined,
    updatedAt: row.updated_at as string | undefined,
  };
}

function mapDbContract(c: Record<string, unknown>) {
  return {
    scope: (c.scope as string) ?? "",
    allowedTools: (c.allowed_tools as string[]) ?? [],
    allowedData: (c.allowed_data as string[]) ?? [],
    acceptanceCriteria: (c.acceptance_criteria as string[]) ?? [],
    terminationConditions: (c.termination_conditions as string) ?? "",
    signedAt: (c.signed_at as string) ?? null,
  };
}

export function mapDbParticipant(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    spotId: row.spot_id as string,
    userId: row.user_id as string | undefined,
    agentId: row.agent_id as string | undefined,
    role: row.role as string,
    displayName: row.display_name as string,
  };
}

export function mapDbAgent(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    type: (row.type as string) ?? "worker",
    description: (row.description as string) ?? "",
    skills: (row.skills as string[]) ?? [],
    tools: (row.tools as string[]) ?? [],
    trustLevel: (row.trust_level as number) ?? 0,
    certifiedOutcomes: (row.certified_outcomes as number) ?? 0,
    avatarUrl: row.avatar_url as string | undefined,
    createdAt: row.created_at as string | undefined,
  };
}

export function mapDbInboxItem(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    type: row.type as string,
    spotId: row.spot_id as string | undefined,
    title: (row.title as string) ?? "",
    description: (row.description as string) ?? "",
    status: (row.status as string) ?? "pending",
    createdAt: row.created_at as string | undefined,
  };
}

export function mapDbMessage(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    spotId: row.spot_id as string ?? "",
    type: (row.type as string) ?? "human",
    senderName: (row.sender_name as string) ?? "User",
    content: (row.content as string) ?? "",
    createdAt: row.created_at as string | undefined,
  };
}
