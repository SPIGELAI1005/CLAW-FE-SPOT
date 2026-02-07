import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { RolesClient } from "./RolesClient";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function RolesPage() {
  return (
    <AuthGate>
      <Suspense fallback={<PageSkeleton />}>
        <RolesClient />
      </Suspense>
    </AuthGate>
  );
}
