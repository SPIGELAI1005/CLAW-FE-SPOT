import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { FaqClient } from "./FaqClient";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function FaqPage() {
  return (
    <AuthGate>
      <Suspense fallback={<PageSkeleton />}>
        <FaqClient />
      </Suspense>
    </AuthGate>
  );
}
