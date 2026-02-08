import { NextResponse } from "next/server";
import { verifyCertification } from "@/lib/certification";
import { CertificationPackageSchema } from "@/lib/certification";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * POST /api/certifications/verify
 *
 * Public verification endpoint that accepts raw certification JSON.
 * No authentication required. Useful for external verifiers who have
 * the full certificate JSON (exported from the vault or shared out-of-band).
 *
 * Rate limited to prevent abuse: 20 requests per minute per IP.
 *
 * Request body: the full CertificationPackage JSON object.
 * Response: verification result (hash match, on-chain status, signatures).
 */
const VERIFY_RATE_LIMIT = { maxRequests: 20, windowMs: 60_000 };

export async function POST(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`verify:${ip}`, VERIFY_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  // Parse the raw JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Validate against the CertificationPackage schema
  const parsed = CertificationPackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid certification package format",
        details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }

  // Run the full verification pipeline
  const result = await verifyCertification(parsed.data);

  return NextResponse.json({
    fingerprint: parsed.data.anchor.fingerprint,
    verified: result.verified,
    onChainStatus: result.onChainStatus,
    platformSignatureValid: result.platformSignatureValid,
    l1AuditorSignaturesValid: result.l1AuditorSignaturesValid,
    l2AuditorSignatureValid: result.l2AuditorSignatureValid,
    quorumSatisfied: result.quorumSatisfied,
    fingerprintMatch: result.fingerprintMatch,
    errors: result.errors,
    // Minimal on-chain metadata
    onChainIssuer: result.onChainIssuer,
    onChainTimestamp: result.onChainTimestamp,
    chainId: parsed.data.anchor.chainId,
    contractAddress: parsed.data.anchor.contractAddress,
  });
}
