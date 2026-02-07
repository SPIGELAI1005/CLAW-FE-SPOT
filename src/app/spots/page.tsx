import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { SpotsClient } from "./SpotsClient";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";

export default function SpotsPage() {
  return (
    <AuthGate>
      <Suspense fallback={<ListSkeleton />}>
        <SpotsClient />
      </Suspense>
    </AuthGate>
  );
}
