import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { VaultClient } from "./VaultClient";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";

export default function VaultPage() {
  return (
    <AuthGate>
      <Suspense fallback={<ListSkeleton />}>
        <VaultClient />
      </Suspense>
    </AuthGate>
  );
}
