import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { CliReferenceClient } from "./CliReferenceClient";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function CliPage() {
  return (
    <AuthGate>
      <Suspense fallback={<PageSkeleton />}>
        <CliReferenceClient />
      </Suspense>
    </AuthGate>
  );
}
