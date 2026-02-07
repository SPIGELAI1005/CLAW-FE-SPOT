import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { SpotWorkspace } from "./SpotWorkspace";
import { DetailSkeleton } from "@/components/ui/LoadingSkeleton";

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthGate>
      <Suspense fallback={<DetailSkeleton />}>
        <SpotWorkspace spotId={id} />
      </Suspense>
    </AuthGate>
  );
}
