import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AgentsClient } from "./AgentsClient";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";

export default function AgentsPage() {
  return (
    <AuthGate>
      <Suspense fallback={<ListSkeleton />}>
        <AgentsClient />
      </Suspense>
    </AuthGate>
  );
}
