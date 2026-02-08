"use client";

import { useState, useCallback } from "react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────

interface LocalVerification {
  fingerprint: string;
  recomputedFingerprint: string;
  fingerprintMatch: boolean;
}

interface ServerVerification {
  fingerprint: string;
  verified: boolean;
  onChainStatus: string;
  platformSignatureValid: boolean;
  l1AuditorSignaturesValid: boolean | null;
  l2AuditorSignatureValid: boolean | null;
  quorumSatisfied: boolean | null;
  fingerprintMatch: boolean;
  errors: string[];
  onChainIssuer: string | null;
  onChainTimestamp: number | null;
  chainId: number;
  contractAddress: string;
}

type VerifyStep = "idle" | "local" | "server" | "done" | "error";

// ── Browser-side canonicalize + SHA-256 ────────────────────────────

function canonicalizeJSON(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalizeJSON(item)).join(",") + "]";
  }
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  const parts = sorted.map((key) => {
    const val = (obj as Record<string, unknown>)[key];
    if (val === undefined) return null;
    return JSON.stringify(key) + ":" + canonicalizeJSON(val);
  }).filter(Boolean);
  return "{" + parts.join(",") + "}";
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function computeFingerprintLocal(
  pkg: Record<string, unknown>,
): Promise<string> {
  const { signatures: _s, anchor: _a, ...core } = pkg;
  const canonical = canonicalizeJSON(core);
  return sha256Hex(canonical);
}

// ── Explorer URL helper ────────────────────────────────────────────

function getExplorerUrl(chainId: number, txHash: string): string {
  if (chainId === 8453) return `https://basescan.org/tx/${txHash}`;
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

// ── Component ──────────────────────────────────────────────────────

export function VerifyClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [step, setStep] = useState<VerifyStep>("idle");
  const [localResult, setLocalResult] = useState<LocalVerification | null>(null);
  const [serverResult, setServerResult] = useState<ServerVerification | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const reset = useCallback(() => {
    setStep("idle");
    setLocalResult(null);
    setServerResult(null);
    setErrorMsg("");
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setJsonInput(text);
      reset();
    };
    reader.readAsText(file);
  }, [reset]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleVerify = useCallback(async () => {
    reset();

    // 1. Parse JSON locally
    let pkg: Record<string, unknown>;
    try {
      pkg = JSON.parse(jsonInput);
    } catch {
      setErrorMsg("Invalid JSON. Please paste or upload a valid certification package.");
      setStep("error");
      return;
    }

    // Quick check: does it look like a cert package?
    if (!pkg.anchor || !pkg.certificate || !pkg.signatures) {
      setErrorMsg("This does not appear to be a CLAW:FE SPOT certification package. Missing required fields: anchor, certificate, signatures.");
      setStep("error");
      return;
    }

    // 2. Compute fingerprint locally in the browser
    setStep("local");
    try {
      const anchor = pkg.anchor as Record<string, unknown>;
      const storedFingerprint = (anchor.fingerprint as string) ?? "";
      const recomputed = await computeFingerprintLocal(pkg);
      const fingerprintMatch = recomputed === storedFingerprint;

      setLocalResult({
        fingerprint: storedFingerprint,
        recomputedFingerprint: recomputed,
        fingerprintMatch,
      });
    } catch (err) {
      setErrorMsg(`Local fingerprint computation failed: ${err instanceof Error ? err.message : "unknown error"}`);
      setStep("error");
      return;
    }

    // 3. Send to server for on-chain + signature verification
    setStep("server");
    try {
      const res = await fetch("/api/certifications/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonInput,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.error ?? `Server returned ${res.status}`;
        setErrorMsg(msg);
        setStep("error");
        return;
      }

      const data = await res.json();
      setServerResult(data as ServerVerification);
      setStep("done");
    } catch (err) {
      setErrorMsg(`Server verification failed: ${err instanceof Error ? err.message : "Network error"}`);
      setStep("error");
    }
  }, [jsonInput, reset]);

  const isVerified = serverResult?.verified === true;
  const hasLocalMatch = localResult?.fingerprintMatch === true;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo className="h-6" />
          </Link>
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-400">
            External Verifier
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Title section */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
            Verify a Certificate
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Paste or upload a CLAW:FE SPOT certification JSON to verify its integrity and on-chain status.
            No account required.
          </p>
        </div>

        {/* Input area */}
        <Card className="mb-6">
          <div
            className={`relative rounded-xl border-2 border-dashed transition-colors ${
              isDragging
                ? "border-amber-400 bg-amber-50/50 dark:border-amber-600 dark:bg-amber-950/20"
                : "border-stone-200 dark:border-stone-700"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); reset(); }}
              placeholder='{"$schema":"https://clawfe.io/schemas/certification-package/v1.json", ...}'
              className="h-48 w-full resize-none rounded-xl bg-transparent p-4 font-mono text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none dark:text-stone-300 dark:placeholder:text-stone-600"
              spellCheck={false}
            />

            {/* Drag hint overlay */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-amber-50/80 dark:bg-amber-950/60">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Drop JSON file here
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800">
              <UploadIcon />
              Upload File
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>

            <Button
              onClick={handleVerify}
              disabled={!jsonInput.trim() || step === "local" || step === "server"}
              isLoading={step === "local" || step === "server"}
            >
              {step === "local"
                ? "Computing hash..."
                : step === "server"
                  ? "Checking chain..."
                  : "Verify"}
            </Button>
          </div>
        </Card>

        {/* Error */}
        {step === "error" && (
          <Card className="mb-6 border-rose-200 dark:border-rose-800">
            <div className="flex items-start gap-3">
              <StatusIcon status="fail" />
              <div>
                <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                  Verification Failed
                </h3>
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errorMsg}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {step === "done" && localResult && serverResult && (
          <div className="space-y-4">
            {/* Overall verdict */}
            <Card
              className={
                isVerified
                  ? "border-emerald-200 dark:border-emerald-800"
                  : "border-rose-200 dark:border-rose-800"
              }
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={isVerified ? "pass" : "fail"} />
                <div>
                  <h3
                    className={`text-base font-bold ${
                      isVerified
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {isVerified ? "Certificate Verified" : "Verification Failed"}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Fingerprint: <code className="font-mono">{localResult.fingerprint.slice(0, 16)}...{localResult.fingerprint.slice(-8)}</code>
                  </p>
                </div>
              </div>
            </Card>

            {/* Detailed checks */}
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
                Verification Checks
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <CheckRow
                  label="Fingerprint Match"
                  description="SHA-256 hash recomputed in your browser"
                  passed={hasLocalMatch}
                />
                <CheckRow
                  label="Server Fingerprint"
                  description="Hash verified by the server"
                  passed={serverResult.fingerprintMatch}
                />
                <CheckRow
                  label="Platform Signature"
                  description="ECDSA-secp256k1 (EIP-191)"
                  passed={serverResult.platformSignatureValid}
                />
                <CheckRow
                  label="On-Chain Status"
                  description={`Status: ${serverResult.onChainStatus}`}
                  passed={serverResult.onChainStatus === "valid"}
                />
                {serverResult.l1AuditorSignaturesValid !== null && (
                  <CheckRow
                    label="L1 Auditor Signatures"
                    description="Co-signed by L1 auditors"
                    passed={serverResult.l1AuditorSignaturesValid}
                  />
                )}
                {serverResult.l2AuditorSignatureValid !== null && (
                  <CheckRow
                    label="L2 Auditor Signature"
                    description="Co-signed by L2 meta-auditor"
                    passed={serverResult.l2AuditorSignatureValid}
                  />
                )}
                {serverResult.quorumSatisfied !== null && (
                  <CheckRow
                    label="Quorum Policy"
                    description="M-of-N auditor threshold met"
                    passed={serverResult.quorumSatisfied}
                  />
                )}
              </div>

              {/* Errors list */}
              {serverResult.errors.length > 0 && (
                <div className="mt-3 rounded-lg bg-rose-50 p-3 dark:bg-rose-950/30">
                  <p className="mb-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Issues detected:
                  </p>
                  <ul className="space-y-0.5">
                    {serverResult.errors.map((err, i) => (
                      <li key={i} className="text-xs text-rose-600 dark:text-rose-400">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* On-chain metadata */}
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
                Blockchain Record
              </h3>
              <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                <MetaRow label="Chain ID" value={String(serverResult.chainId)} />
                <MetaRow label="Contract" value={truncateAddr(serverResult.contractAddress)} />
                {serverResult.onChainIssuer && (
                  <MetaRow label="Issuer" value={truncateAddr(serverResult.onChainIssuer)} />
                )}
                {serverResult.onChainTimestamp && serverResult.onChainTimestamp > 0 && (
                  <MetaRow
                    label="Anchored At"
                    value={new Date(serverResult.onChainTimestamp * 1000).toUTCString()}
                  />
                )}
              </dl>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            This verification is performed using cryptographic hashing (SHA-256) and on-chain state reads.
            No account or login is required.{" "}
            <Link href="/" className="text-amber-600 hover:underline dark:text-amber-400">
              Learn more about CLAW:FE SPOT
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function StatusIcon({ status }: { status: "pass" | "fail" }) {
  const color = status === "pass"
    ? "text-emerald-500 dark:text-emerald-400"
    : "text-rose-500 dark:text-rose-400";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${color}`}
    >
      {status === "pass" ? (
        <>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </>
      )}
    </svg>
  );
}

function CheckRow({
  label,
  description,
  passed,
}: {
  label: string;
  description: string;
  passed: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border p-2.5 ${
        passed
          ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
          : "border-rose-100 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20"
      }`}
    >
      <span className="mt-0.5 shrink-0">
        {passed ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </span>
      <div>
        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
          {label}
        </span>
        <span className="ml-1 text-[10px] text-stone-400 dark:text-stone-400">
          {description}
        </span>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="font-medium text-stone-500 dark:text-stone-400">{label}:</dt>
      <dd className="font-mono text-stone-700 dark:text-stone-300">{value}</dd>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function truncateAddr(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}
