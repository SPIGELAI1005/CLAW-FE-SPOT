import type { Metadata } from "next";
import { VerifyClient } from "./VerifyClient";

export const metadata: Metadata = {
  title: "Verify Certificate | CLAW:FE SPOT",
  description: "Independently verify a CLAW:FE SPOT certification using the exported JSON file.",
};

export default function VerifyPage() {
  return <VerifyClient />;
}
