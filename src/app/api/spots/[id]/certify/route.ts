import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateL2ReportBody, parseBody } from "@/lib/validations";
import { createInboxItem } from "@/lib/inboxHelpers";
import { buildCertificationPackage, anchorOnChain, hashData } from "@/lib/certification";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateL2ReportBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // SECURITY: Verify the caller is an L2 auditor participant for this spot
  const { data: participant } = await supabase
    .from("spot_participants")
    .select("role")
    .eq("spot_id", id)
    .eq("user_id", user.id)
    .eq("role", "l2_meta_auditor")
    .limit(1);

  if (!participant || participant.length === 0) {
    return NextResponse.json(
      { error: "Only assigned L2 auditors can certify this SPOT" },
      { status: 403 },
    );
  }

  // Insert L2 report (immutable)
  const { data: report, error: reportErr } = await supabase
    .from("l2_reports")
    .insert({
      spot_id: id,
      verdict: parsed.data.verdict,
      report: parsed.data.report,
      auditor_id: user.id,
    })
    .select("*")
    .single();

  if (reportErr) {
    console.error("[certify] L2 report insert failed:", reportErr.message);
    return NextResponse.json({ error: "Failed to create L2 report" }, { status: 500 });
  }

  // Update spot certification status based on verdict
  const certStatus =
    parsed.data.verdict === "pass" ? "certified" : parsed.data.verdict;

  const { data: spot } = await supabase
    .from("tables")
    .update({ certification_status: certStatus })
    .eq("id", id)
    .select("title, owner_id, contract, mode")
    .single();

  // Notify the spot owner about certification
  // PRIVACY: Hash the auditor ID in the payload to prevent PII correlation
  if (spot && spot.owner_id !== user.id) {
    const auditorPseudonym = await hashData(user.id);
    await createInboxItem({
      supabase,
      ownerId: spot.owner_id,
      type: "l2_certification",
      spotId: id,
      title: `Certification ${certStatus}: ${spot.title ?? "Untitled"}`,
      description: `L2 Arbiter has issued a ${certStatus.toUpperCase()} verdict.`,
      payload: { verdict: parsed.data.verdict, auditor_fingerprint: auditorPseudonym },
    });
  }

  // Blockchain anchoring (only for PASS verdicts)
  if (parsed.data.verdict === "pass" && spot) {
    try {
      // Gather audit metadata for the certification package
      const { data: l1Verdicts } = await supabase
        .from("l1_verdicts")
        .select("verdict, auditor_id")
        .eq("spot_id", id);

      const { data: participants } = await supabase
        .from("spot_participants")
        .select("role")
        .eq("spot_id", id);

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
        spotId: id,
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
        l2AuditorId: user.id,
        chainId,
        contractAddress,
      });

      // Anchor on-chain
      let txHash: string | null = null;
      let blockNumber: number | null = null;

      try {
        const anchor = await anchorOnChain(pkg.anchor.fingerprint);
        txHash = anchor.txHash;
        blockNumber = anchor.blockNumber;
        pkg.anchor.transactionHash = txHash as `0x${string}`;
        pkg.anchor.blockNumber = blockNumber;
      } catch (anchorErr) {
        // On-chain anchoring is best-effort; log sanitized message only
        console.error(
          "[certify] On-chain anchoring failed:",
          anchorErr instanceof Error ? anchorErr.message : "unknown",
        );
      }

      // Store certification record off-chain
      await supabase.from("certifications").insert({
        spot_id: id,
        l2_report_id: report.id,
        fingerprint: pkg.anchor.fingerprint,
        package_json: pkg,
        platform_sig: pkg.signatures.platform.signatureHex,
        chain_id: chainId,
        contract_addr: contractAddress,
        tx_hash: txHash,
        block_number: blockNumber,
        status: "valid",
      });
    } catch (certErr) {
      // Certification package generation failed; log sanitized message only
      console.error(
        "[certify] Blockchain certification failed:",
        certErr instanceof Error ? certErr.message : "unknown",
      );
    }
  }

  return NextResponse.json(report, { status: 201 });
}
