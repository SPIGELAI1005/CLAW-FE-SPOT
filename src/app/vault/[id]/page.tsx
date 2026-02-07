import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";
import { VaultDetailClient } from "./VaultDetailClient";
import { DetailSkeleton } from "@/components/ui/LoadingSkeleton";

export default async function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthGate>
      <Suspense fallback={<DetailSkeleton />}>
        <VaultDetailClient spotId={id} />
      </Suspense>
    </AuthGate>
  );
}
