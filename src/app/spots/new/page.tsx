import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { NewSpotClient } from "./NewSpotClient";
import { FormSkeleton } from "@/components/ui/LoadingSkeleton";

export default function NewSpotPage() {
  return (
    <AuthGate>
      <Suspense fallback={<FormSkeleton />}>
        <NewSpotClient />
      </Suspense>
    </AuthGate>
  );
}
