import { SecurityClient } from "./SecurityClient";

export const metadata = {
  title: "Security and Trust - CLAW:FE SPOT",
  description:
    "Security, governance and trust architecture of CLAW:FE SPOT. Supervised multi-agent collaboration with independent auditing, cryptographic certification and smart contract anchoring.",
};

export default function SecurityPage() {
  return <SecurityClient />;
}
