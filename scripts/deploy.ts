/**
 * Deploy CertificationRegistry to any configured network.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network localhost
 *   npx hardhat run scripts/deploy.ts --network baseSepolia
 *   npx hardhat run scripts/deploy.ts --network base
 *
 * Environment variables:
 *   INITIAL_ISSUER - Address to grant ISSUER + REVOKER roles at deploy time.
 *                    If not set, the deployer address is used.
 */
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const initialIssuer = process.env.INITIAL_ISSUER ?? deployer.address;

  console.log("Deploying CertificationRegistry...");
  console.log("  Deployer (owner):", deployer.address);
  console.log("  Initial issuer:", initialIssuer);

  const Factory = await ethers.getContractFactory("CertificationRegistry");
  const registry = await Factory.deploy(initialIssuer);
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const network = await ethers.provider.getNetwork();

  console.log("");
  console.log("Deployed successfully!");
  console.log("  Contract address:", address);
  console.log("  Chain ID:", network.chainId.toString());
  console.log("  Block:", (await ethers.provider.getBlockNumber()).toString());
  console.log("");
  console.log("Next steps:");
  console.log(`  1. Set CERTIFICATION_CONTRACT_ADDRESS=${address} in .env`);
  console.log(`  2. Set CHAIN_ID=${network.chainId} in .env`);
  console.log("  3. Run: npx hardhat run scripts/export-abi.ts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
