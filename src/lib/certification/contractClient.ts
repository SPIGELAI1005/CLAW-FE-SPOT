/**
 * Viem-based client for the CertificationRegistry smart contract.
 *
 * Handles all on-chain interactions: registering, revoking, superseding,
 * and reading verification status. Uses a server-side wallet for writes
 * and a public client for reads.
 *
 * The ABI is auto-generated from Hardhat compilation artifacts.
 * Run `node scripts/export-abi.cjs` after any contract change.
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  type Hex,
  type PublicClient,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { CERTIFICATION_REGISTRY_ABI } from "./abi";

// Re-export so other modules can import from a single place
export { CERTIFICATION_REGISTRY_ABI };

// ── Status Enum (matches Solidity) ─────────────────────────────────
const STATUS_MAP = {
  0: "not_found",
  1: "valid",
  2: "revoked",
  3: "superseded",
} as const;

export type OnChainStatus = (typeof STATUS_MAP)[keyof typeof STATUS_MAP];

export interface OnChainRecord {
  issuer: string;
  timestamp: number;
  status: OnChainStatus;
  supersededBy: string | null;
}

// ── Config ─────────────────────────────────────────────────────────

function getConfig() {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const contractAddress = process.env.CERTIFICATION_CONTRACT_ADDRESS as Hex | undefined;
  const privateKey = process.env.CERTIFICATION_PRIVATE_KEY as Hex | undefined;
  const chainIdStr = process.env.CHAIN_ID ?? "84532"; // Default: Base Sepolia

  if (!rpcUrl || !contractAddress) {
    throw new Error(
      "BLOCKCHAIN_RPC_URL and CERTIFICATION_CONTRACT_ADDRESS must be set",
    );
  }

  const chainId = parseInt(chainIdStr, 10);
  const chain: Chain = chainId === 8453 ? base : baseSepolia;

  return { rpcUrl, contractAddress, privateKey, chain };
}

// ── Clients ────────────────────────────────────────────────────────

let publicClientCache: PublicClient | null = null;

function getPublicClient(): PublicClient {
  if (publicClientCache) return publicClientCache;
  const { rpcUrl, chain } = getConfig();
  publicClientCache = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  return publicClientCache;
}

function getWalletClient() {
  const { rpcUrl, privateKey, chain } = getConfig();
  if (!privateKey) {
    throw new Error("CERTIFICATION_PRIVATE_KEY must be set for write operations");
  }
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
}

// ── Fingerprint to bytes32 conversion ──────────────────────────────

function fingerprintToBytes32(fingerprint: string): Hex {
  const clean = fingerprint.startsWith("0x") ? fingerprint : `0x${fingerprint}`;
  if (clean.length !== 66) {
    throw new Error(`Invalid fingerprint length: expected 66 chars (0x + 64), got ${clean.length}`);
  }
  return clean as Hex;
}

// ── Read Operations ────────────────────────────────────────────────

/**
 * Verify a certificate fingerprint on-chain. Returns the on-chain record.
 * This is a free read (no gas cost).
 */
export async function verifyOnChain(fingerprint: string): Promise<OnChainRecord> {
  const client = getPublicClient();
  const { contractAddress } = getConfig();

  const result = await client.readContract({
    address: contractAddress,
    abi: CERTIFICATION_REGISTRY_ABI,
    functionName: "getCertificate",
    args: [fingerprintToBytes32(fingerprint)],
  }) as unknown as {
    issuer: string;
    timestamp: bigint;
    status: number;
    supersededBy: string;
  };

  const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

  return {
    issuer: result.issuer,
    timestamp: Number(result.timestamp),
    status: STATUS_MAP[result.status as keyof typeof STATUS_MAP] ?? "not_found",
    supersededBy: result.supersededBy === ZERO_HASH ? null : result.supersededBy,
  };
}

/**
 * Check if a certificate is currently valid on-chain. Free read.
 */
export async function isValidOnChain(fingerprint: string): Promise<boolean> {
  const client = getPublicClient();
  const { contractAddress } = getConfig();

  return await client.readContract({
    address: contractAddress,
    abi: CERTIFICATION_REGISTRY_ABI,
    functionName: "isValid",
    args: [fingerprintToBytes32(fingerprint)],
  }) as boolean;
}

// ── Write Operations ───────────────────────────────────────────────

/**
 * Register (anchor) a fingerprint on-chain. Returns the transaction hash.
 */
export async function anchorOnChain(
  fingerprint: string,
): Promise<{ txHash: string; blockNumber: number }> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { contractAddress, chain } = getConfig();

  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: CERTIFICATION_REGISTRY_ABI,
    functionName: "register",
    args: [fingerprintToBytes32(fingerprint)],
    chain,
  });

  // Wait for the transaction to be mined
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return {
    txHash: receipt.transactionHash,
    blockNumber: Number(receipt.blockNumber),
  };
}

/**
 * Revoke a certificate on-chain. Returns the transaction hash.
 */
export async function revokeOnChain(
  fingerprint: string,
  reason: string,
): Promise<{ txHash: string }> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { contractAddress, chain } = getConfig();

  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: CERTIFICATION_REGISTRY_ABI,
    functionName: "revoke",
    args: [fingerprintToBytes32(fingerprint), reason],
    chain,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return { txHash: hash };
}

/**
 * Supersede an old certificate with a new one on-chain.
 */
export async function supersedeOnChain(
  oldFingerprint: string,
  newFingerprint: string,
): Promise<{ txHash: string }> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { contractAddress, chain } = getConfig();

  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: CERTIFICATION_REGISTRY_ABI,
    functionName: "supersede",
    args: [fingerprintToBytes32(oldFingerprint), fingerprintToBytes32(newFingerprint)],
    chain,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return { txHash: hash };
}
