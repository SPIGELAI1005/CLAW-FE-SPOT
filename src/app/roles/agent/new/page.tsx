import { AuthGate } from "@/components/AuthGate";
import { CreateAgentClient } from "./CreateAgentClient";

export default function CreateAgentPage() {
  return (
    <AuthGate>
      <CreateAgentClient />
    </AuthGate>
  );
}
