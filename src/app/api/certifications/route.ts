import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { parseBody } from "@/lib/validations";
import {
  CreateCertificationBody,
  buildCertificationPackage,
  anchorOnChain,
} from "@/lib/certification";
import { z } from "zod";

const uuidSchema = z.string().uuid();

/**
 * GET /api/certifications?spot_id=<uuid>
 * List certifications for a SPOT. Requires authentication.
 */
export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const spotId = searchParams.get("spot_id");

  // Validate spot_id format if provided
  if (spotId && !uuidSchema.safeParse(spotId).success) {
    return NextResponse.json({ error: "Invalid spot_id format" }, { status: 400 });
  }

  let query = supabase
    .from("certifications")
    .select("id, spot_id, fingerprint, status, chain_id, contract_addr, tx_hash, block_number, created_at")
    .order("created_at", { ascending: false });

  if (spotId) {
    query = query.eq("spot_id", spotId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[certifications/GET]", error.message);
    return NextResponse.json({ error: "Failed to retrieve certifications" }, { status: 500 });
  }

  return NextResponse.json({ certifications: data ?? [] });
}

/**
 * POST /api/certifications
 *
 * Standalone certification creation endpoint.
 * Decoupled from the L2 certify route so that certifications can be
 * re-issued, triggered by admins, or retried after a failed anchoring.
 *
 * Requires: a SPOT with a passing L2 report already on file.
 */
export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateCertificationBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { spotId, l2ReportId, toolchain } = parsed.data;

  // Validate: SPOT exists and caller is the owner
  const { data: spot, error: spotErr } = await supabase
    .from("tables")
    .select("id, owner_id, title, mode, contract, certification_status")
    .eq("id", spotId)
    .single();

  if (spotErr || !spot) {
    return NextResponse.json({ error: "SPOT not found" }, { status: 404 });
  }
  if (spot.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Only the SPOT owner can create a certification" },
      { status: 403 },
    );
  }

  // Validate: L2 report exists and has verdict "pass"
  const { data: report, error: reportErr } = await supabase
    .from("l2_reports")
    .select("id, verdict, auditor_id")
    .eq("id", l2ReportId)
    .eq("spot_id", spotId)
    .single();

  if (reportErr || !report) {
    return NextResponse.json({ error: "L2 report not found" }, { status: 404 });
  }
  if (report.verdict !== "pass") {
    return NextResponse.json(
      { error: "Only passing L2 reports can be certified" },
      { status: 409 },
    );
  }

  // Check for existing valid certification with the same report
  const { data: existing } = await supabase
    .from("certifications")
    .select("id")
    .eq("l2_report_id", l2ReportId)
    .eq("status", "valid")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "A valid certification already exists for this report" },
      { status: 409 },
    );
  }

  // Gather audit metadata
  const { data: l1Verdicts } = await supabase
    .from("l1_verdicts")
    .select("verdict, auditor_id")
    .eq("spot_id", spotId);

  const { data: participants } = await supabase
    .from("spot_participants")
    .select("role")
    .eq("spot_id", spotId);

  const l1List = l1Verdicts ?? [];
  const participantList = participants ?? [];

  const l1AuditorIds = [...new Set(
    l1List.map((v) => v.auditor_id as string),
  )];

  const contract = (spot.contract ?? {}) as Record<string, unknown>;
  const allowedTools = (contract.allowed_tools as string[]) ?? [];
  const acceptanceCriteria = (contract.acceptance_criteria as string[]) ?? [];

  const chainId = parseInt(process.env.CHAIN_ID ?? "84532", 10);
  const contractAddress =
    process.env.CERTIFICATION_CONTRACT_ADDRESS ??
    "0x0000000000000000000000000000000000000000";

  // Build the certification package
  const pkg = await buildCertificationPackage({
    spotId,
    spotContract: contract,
    mode: (spot.mode as string) ?? "execute",
    participantCount: participantList.length || 1,
    participantRoles: participantList.map((p) => p.role as string),
    toolCount: allowedTools.length,
    constraintCount: acceptanceCriteria.length,
    l1VerdictCount: l1List.length,
    l1ApproveCount: l1List.filter((v) => v.verdict === "approve").length,
    l1BlockCount: l1List.filter((v) => v.verdict === "block").length,
    l1AuditorIds,
    l2ReportId: report.id,
    l2AuditorId: report.auditor_id,
    chainId,
    contractAddress,
    agentVersions: toolchain?.agentVersions,
    modelIdentifiers: toolchain?.modelIdentifiers,
  });

  // Anchor on-chain (best-effort)
  let txHash: string | null = null;
  let blockNumber: number | null = null;

  try {
    const anchor = await anchorOnChain(pkg.anchor.fingerprint);
    txHash = anchor.txHash;
    blockNumber = anchor.blockNumber;
    pkg.anchor.transactionHash = txHash as `0x${string}`;
    pkg.anchor.blockNumber = blockNumber;
  } catch (anchorErr) {
    // Log only the message, never the full error object (may contain RPC URLs or keys)
    console.error(
      "[certifications/create] On-chain anchoring failed:",
      anchorErr instanceof Error ? anchorErr.message : "unknown",
    );
  }

  // Store off-chain record
  const { data: certRow, error: insertErr } = await supabase
    .from("certifications")
    .insert({
      spot_id: spotId,
      l2_report_id: report.id,
      fingerprint: pkg.anchor.fingerprint,
      package_json: pkg,
      platform_sig: pkg.signatures.platform.signatureHex,
      chain_id: chainId,
      contract_addr: contractAddress,
      tx_hash: txHash,
      block_number: blockNumber,
      status: "valid",
    })
    .select("id, fingerprint, status, tx_hash, block_number, created_at")
    .single();

  if (insertErr) {
    console.error("[certifications/POST]", insertErr.message);
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }

  return NextResponse.json(certRow, { status: 201 });
}
