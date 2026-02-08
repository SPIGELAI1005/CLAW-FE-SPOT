/**
 * Export the compiled ABI as a TypeScript module usable by the web app.
 *
 * Usage:
 *   npx hardhat compile
 *   node scripts/export-abi.cjs
 *
 * Reads the Hardhat compilation artifact and writes a TypeScript file
 * to src/lib/certification/abi.ts so the contract client can import it
 * directly, eliminating manual ABI maintenance.
 */
const fs = require("fs");
const path = require("path");

const ARTIFACT_PATH = path.resolve(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "CertificationRegistry.sol",
  "CertificationRegistry.json",
);

const OUTPUT_PATH = path.resolve(
  __dirname,
  "..",
  "src",
  "lib",
  "certification",
  "abi.ts",
);

function main() {
  if (!fs.existsSync(ARTIFACT_PATH)) {
    console.error("Artifact not found. Run `npx hardhat compile` first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));
  const abi = JSON.stringify(artifact.abi, null, 2);

  const output = `/**\n * Auto-generated ABI for CertificationRegistry.\n * Do not edit manually. Run: node scripts/export-abi.cjs\n */\nexport const CERTIFICATION_REGISTRY_ABI = ${abi} as const;\n`;

  fs.writeFileSync(OUTPUT_PATH, output, "utf8");
  console.log("ABI exported to:", OUTPUT_PATH);
}

main();
