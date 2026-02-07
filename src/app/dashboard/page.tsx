import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { HomeClient } from "./HomeClient";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function DashboardPage() {
  return (
    <AuthGate>
      <Suspense fallback={<PageSkeleton />}>
        <HomeClient />
      </Suspense>
    </AuthGate>
  );
}
