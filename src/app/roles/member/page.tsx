import { AuthGate } from "@/components/AuthGate";
import { MemberClient } from "./MemberClient";

export default function MemberPage() {
  return (
    <AuthGate>
      <MemberClient />
    </AuthGate>
  );
}
