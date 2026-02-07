import { Suspense } from "react";
import { AuthClient } from "./AuthClient";

export const dynamic = "force-dynamic";

export default function CliAuthPage() {
  return (
    <Suspense>
      <AuthClient />
    </Suspense>
  );
}
