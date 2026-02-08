"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BlockchainBadge } from "./BlockchainBadge";
import { useFetch } from "@/lib/useFetch";

interface CertificationSummary {
  id: string;
  spot_id: string;
  fingerprint: string;
  status: "valid" | "revoked" | "superseded";
  chain_id: number;
  contract_addr: string;
  tx_hash: string | null;
  block_number: number | null;
  created_at: string;
}

interface VerificationResponse {
  certificationId: string;
  fingerprint: string;
  offChainStatus: string;
  verification: {
    verified: boolean;
    fingerprintMatch: boolean;
    onChainStatus: string;
    onChainIssuer: string | null;
    onChainTimestamp: number | null;
    platformSignatureValid: boolean;
    l1AuditorSignaturesValid: boolean | null;
    l2AuditorSignatureValid: boolean | null;
    quorumSatisfied: boolean | null;
    errors: string[];
  };
}

interface CertificateVerificationProps {
  spotId: string;
}

function getExplorerUrl(chainId: number, txHash: string): string {
  if (chainId === 8453) return `https://basescan.org/tx/${txHash}`;
  if (chainId === 84532) return `https://sepolia.basescan.org/tx/${txHash}`;
  return `https://etherscan.io/tx/${txHash}`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function CertificateVerification({ spotId }: CertificateVerificationProps) {
  const { data, isLoading } = useFetch<{ certifications: CertificationSummary[] }>(
    `/api/certifications?spot_id=${spotId}`,
  );
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResponse | null>(null);

  const handleVerify = useCallback(async (certId: string) => {
    setVerifying(certId);
    setVerificationResult(null);
    try {
      const res = await fetch(`/api/certifications/${certId}/verify`);
      if (res.ok) {
        const result = await res.json();
        setVerificationResult(result);
      }
    } catch {
      // silently fail; verification result remains null
    } finally {
      setVerifying(null);
    }
  }, []);

  const certs = data?.certifications ?? [];

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="h-4 w-48 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
          <div className="h-20 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
        </div>
      </Card>
    );
  }

  if (certs.length === 0) return null;

  const latestCert = certs[0];

  return (
    <Card className="border-emerald-200/50 dark:border-emerald-900/30">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Blockchain Certificate
        </div>
        <BlockchainBadge
          status={
            latestCert.tx_hash
              ? (latestCert.status as "valid" | "revoked" | "superseded")
              : "pending"
          }
        />
      </div>

      {/* Certificate Details */}
      <div className="space-y-3">
        {/* Fingerprint */}
        <div>
          <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Fingerprint (SHA-256)
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <code className="rounded-lg bg-stone-50 px-2 py-1 font-mono text-xs text-stone-700 dark:bg-stone-900 dark:text-stone-300">
              {truncateHash(latestCert.fingerprint)}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(latestCert.fingerprint)}
              className="rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
              title="Copy full fingerprint"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </div>

        {/* On-chain reference */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Chain
            </div>
            <div className="mt-0.5 text-xs font-medium">
              {latestCert.chain_id === 8453 ? "Base" : latestCert.chain_id === 84532 ? "Base Sepolia" : `Chain ${latestCert.chain_id}`}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Block
            </div>
            <div className="mt-0.5 text-xs font-medium">
              {latestCert.block_number ? `#${latestCert.block_number.toLocaleString()}` : "Pending"}
            </div>
          </div>
        </div>

        {/* Transaction Hash */}
        {latestCert.tx_hash && (
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Transaction
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <a
                href={getExplorerUrl(latestCert.chain_id, latestCert.tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-stone-50 px-2 py-1 font-mono text-xs text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:bg-stone-900 dark:text-sky-400 dark:hover:bg-sky-950/30"
              >
                {truncateHash(latestCert.tx_hash)}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              </a>
            </div>
          </div>
        )}

        {/* Anchored timestamp */}
        <div>
          <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Anchored
          </div>
          <div className="mt-0.5 text-xs text-stone-600 dark:text-stone-300">
            {new Date(latestCert.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Verification Section */}
      <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Button
            as="button"
            variant="secondary"
            onClick={() => handleVerify(latestCert.id)}
            disabled={verifying === latestCert.id}
            isLoading={verifying === latestCert.id}
            className="h-8 px-3 text-xs"
          >
            {verifying === latestCert.id ? "Verifying..." : "Verify On-Chain"}
          </Button>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="mt-3 space-y-2">
            {verificationResult.verification.verified ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                <div>
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Verified
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    Fingerprint matches, platform signature valid, on-chain status confirmed.
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-rose-50 px-4 py-3 dark:bg-rose-950/30">
                <div className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                  Verification Failed
                </div>
                <ul className="mt-1 space-y-0.5">
                  {verificationResult.verification.errors.map((err, i) => (
                    <li key={i} className="text-xs text-rose-600 dark:text-rose-400">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detail checks */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <CheckItem
                label="Fingerprint"
                passed={verificationResult.verification.fingerprintMatch}
              />
              <CheckItem
                label="Platform Sig"
                passed={verificationResult.verification.platformSignatureValid}
              />
              <CheckItem
                label="On-Chain"
                passed={verificationResult.verification.onChainStatus === "valid"}
              />
              {verificationResult.verification.l1AuditorSignaturesValid !== null && (
                <CheckItem
                  label="L1 Sigs"
                  passed={verificationResult.verification.l1AuditorSignaturesValid}
                />
              )}
              {verificationResult.verification.l2AuditorSignatureValid !== null && (
                <CheckItem
                  label="L2 Sig"
                  passed={verificationResult.verification.l2AuditorSignatureValid}
                />
              )}
              {verificationResult.verification.quorumSatisfied !== null && (
                <CheckItem
                  label="Quorum"
                  passed={verificationResult.verification.quorumSatisfied}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* History (if multiple certs) */}
      {certs.length > 1 && (
        <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
          <div className="mb-2 text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Certificate History ({certs.length} total)
          </div>
          <div className="space-y-1.5">
            {certs.slice(1).map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-xs dark:bg-stone-900"
              >
                <div className="flex items-center gap-2">
                  <BlockchainBadge status={cert.status as "valid" | "revoked" | "superseded"} />
                  <code className="font-mono text-stone-500">
                    {truncateHash(cert.fingerprint)}
                  </code>
                </div>
                <span className="text-stone-400">
                  {new Date(cert.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ── Check Item (verification detail) ─────────────────────────────── */

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
        passed
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
      }`}
    >
      {passed ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      )}
      {label}
    </div>
  );
}
