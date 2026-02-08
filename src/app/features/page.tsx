import { FeaturesClient } from "./FeaturesClient";

export const metadata = {
  title: "Features - CLAW:FE SPOT",
  description:
    "Explore the features of CLAW:FE SPOT: SPOT workspaces, contract-based execution, real-time L1 auditing, L2 meta-audit, cryptographic certification, CLI, and more.",
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
