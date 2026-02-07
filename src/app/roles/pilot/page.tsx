import { AuthGate } from "@/components/AuthGate";
import { PilotClient } from "./PilotClient";

export default function PilotPage() {
  return (
    <AuthGate>
      <PilotClient />
    </AuthGate>
  );
}
