import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AgentProfileClient } from "./AgentProfileClient";
import { DetailSkeleton } from "@/components/ui/LoadingSkeleton";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthGate>
      <Suspense fallback={<DetailSkeleton />}>
        <AgentProfileClient agentId={id} />
      </Suspense>
    </AuthGate>
  );
}
