import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { SettingsClient } from "./SettingsClient";
import { FormSkeleton } from "@/components/ui/LoadingSkeleton";

export default function SettingsPage() {
  return (
    <AuthGate>
      <Suspense fallback={<FormSkeleton />}>
        <SettingsClient />
      </Suspense>
    </AuthGate>
  );
}
