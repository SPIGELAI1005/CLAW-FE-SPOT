import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { InboxClient } from "./InboxClient";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";

export default function InboxPage() {
  return (
    <AuthGate>
      <Suspense fallback={<ListSkeleton count={4} />}>
        <InboxClient />
      </Suspense>
    </AuthGate>
  );
}
