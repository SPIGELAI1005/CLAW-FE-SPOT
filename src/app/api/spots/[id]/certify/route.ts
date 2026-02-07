import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { CreateL2ReportBody, parseBody } from "@/lib/validations";
import { createInboxItem } from "@/lib/inboxHelpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const parsed = await parseBody(request, CreateL2ReportBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

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

  if (reportErr) return NextResponse.json({ error: reportErr.message }, { status: 500 });

  // Update spot certification status based on verdict
  const certStatus =
    parsed.data.verdict === "pass" ? "certified" : parsed.data.verdict;

  const { data: spot } = await supabase
    .from("tables")
    .update({ certification_status: certStatus })
    .eq("id", id)
    .select("title, owner_id")
    .single();

  // Notify the spot owner about certification
  if (spot && spot.owner_id !== user.id) {
    await createInboxItem({
      supabase,
      ownerId: spot.owner_id,
      type: "l2_certification",
      spotId: id,
      title: `Certification ${certStatus}: ${spot.title ?? "Untitled"}`,
      description: `L2 Arbiter has issued a ${certStatus.toUpperCase()} verdict.`,
      payload: { verdict: parsed.data.verdict, auditor_id: user.id },
    });
  }

  return NextResponse.json(report, { status: 201 });
}
