"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { checkExecuteGating, checkCertificationGating } from "@/lib/spotGating";
import { participantRoleDisplayNames } from "@/lib/spotTypes";
import { CliHint } from "@/components/cli/CliHint";
import type { Spot, SpotParticipant, ParticipantRole } from "@/lib/spotTypes";

interface ContractPanelProps {
  spot: Spot;
  participants: SpotParticipant[];
  onModeSwitch?: () => void;
  onRequestCertification?: () => void;
  onRefreshParticipants?: () => void;
}

const roleBadgeTone: Record<ParticipantRole, "neutral" | "info" | "warning" | "success"> = {
  owner: "neutral",
  worker: "info",
  l1_auditor: "warning",
  l2_meta_auditor: "success",
};

const roleLabels: Record<ParticipantRole, string> = {
  owner: "Owner",
  worker: "Maker",
  l1_auditor: "Sentinel",
  l2_meta_auditor: "Arbiter",
};

export function ContractPanel({
  spot,
  participants,
  onModeSwitch,
  onRequestCertification,
  onRefreshParticipants,
}: ContractPanelProps) {
  const contract = spot.contract;
  const executeGating = checkExecuteGating(spot, participants);
  const certGating = checkCertificationGating(spot, participants);
  const [isEditing, setIsEditing] = useState(false);
  const [editScope, setEditScope] = useState(contract.scope);
  const [editTools, setEditTools] = useState(contract.allowedTools.join(", "));
  const [editData, setEditData] = useState(contract.allowedData.join(", "));
  const [editCriteria, setEditCriteria] = useState(contract.acceptanceCriteria.join("\n"));
  const [editTermination, setEditTermination] = useState(contract.terminationConditions);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isCertifying, setIsCertifying] = useState(false);

  const [isSigning, setIsSigning] = useState(false);

  // Invite agent state
  const [isInviting, setIsInviting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("worker");

  async function handleSaveContract() {
    setIsSaving(true);
    try {
      await fetch(`/api/spots/${spot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract: {
            scope: editScope,
            allowed_tools: editTools
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            allowed_data: editData
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            acceptance_criteria: editCriteria
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            termination_conditions: editTermination,
          },
        }),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleModeSwitch() {
    if (!onModeSwitch) return;
    setIsSwitching(true);
    try {
      await onModeSwitch();
    } finally {
      setIsSwitching(false);
    }
  }

  async function handleCertify() {
    if (!onRequestCertification) return;
    setIsCertifying(true);
    try {
      await onRequestCertification();
    } finally {
      setIsCertifying(false);
    }
  }

  async function handleInviteParticipant() {
    if (!inviteName.trim()) return;
    setIsInviting(true);
    try {
      await fetch(`/api/spots/${spot.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: inviteRole,
          display_name: inviteName.trim(),
        }),
      });
      setInviteName("");
      onRefreshParticipants?.();
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Contract */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Contract
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              label="Scope"
              value={editScope}
              onChange={(e) => setEditScope(e.target.value)}
              rows={3}
            />
            <Input
              label="Allowed Tools (comma separated)"
              value={editTools}
              onChange={(e) => setEditTools(e.target.value)}
            />
            <Input
              label="Allowed Data (comma separated)"
              value={editData}
              onChange={(e) => setEditData(e.target.value)}
            />
            <Textarea
              label="Acceptance Criteria (one per line)"
              value={editCriteria}
              onChange={(e) => setEditCriteria(e.target.value)}
              rows={3}
            />
            <Input
              label="Termination Conditions"
              value={editTermination}
              onChange={(e) => setEditTermination(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveContract}
                disabled={isSaving}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-40"
              >
                {isSaving ? "Saving..." : "Save Contract"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium hover:bg-stone-50 dark:border-stone-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Scope</div>
              <div className="mt-0.5">
                {contract.scope || <span className="italic text-stone-400">Not defined yet</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Allowed Tools</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {contract.allowedTools.length > 0
                  ? contract.allowedTools.map((tool) => (
                      <Badge key={tool} tone="info">{tool}</Badge>
                    ))
                  : <span className="text-xs italic text-stone-400">None specified</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Allowed Data</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {contract.allowedData.length > 0
                  ? contract.allowedData.map((d) => (
                      <Badge key={d} tone="neutral">{d}</Badge>
                    ))
                  : <span className="text-xs italic text-stone-400">None specified</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Acceptance Criteria</div>
              {contract.acceptanceCriteria.length > 0 ? (
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                  {contract.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              ) : (
                <span className="text-xs italic text-stone-400">Not defined yet</span>
              )}
            </div>
            {contract.signedAt ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><path d="m5 12 5 5L20 7"/></svg>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Contract signed {new Date(contract.signedAt).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <button
                onClick={async () => {
                  setIsSigning(true);
                  try {
                    await fetch(`/api/spots/${spot.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        contract: {
                          scope: contract.scope,
                          allowed_tools: contract.allowedTools,
                          allowed_data: contract.allowedData,
                          acceptance_criteria: contract.acceptanceCriteria,
                          termination_conditions: contract.terminationConditions,
                          signedAt: new Date().toISOString(),
                          signedBy: "current_user",
                        },
                      }),
                    });
                    window.location.reload();
                  } finally {
                    setIsSigning(false);
                  }
                }}
                disabled={isSigning || !contract.scope}
                className="w-full rounded-lg border-2 border-dashed border-stone-300 px-3 py-2.5 text-xs font-semibold text-stone-500 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:border-stone-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400"
                title={!contract.scope ? "Define a contract scope first" : "Sign the contract to enable EXECUTE mode"}
              >
                {isSigning ? "Signing..." : "Sign Contract"}
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Roles */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Roles
        </div>
        <div className="space-y-2">
          {participants.length === 0 ? (
            <p className="text-xs italic text-stone-400">No participants yet.</p>
          ) : (
            participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Avatar name={p.displayName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.displayName}</div>
                </div>
                <Badge tone={roleBadgeTone[p.role as ParticipantRole] ?? "neutral"}>
                  {roleLabels[p.role as ParticipantRole] ?? p.role}
                </Badge>
              </div>
            ))
          )}
        </div>

        {/* Add participant */}
        <div className="mt-3 border-t border-stone-100 pt-3 dark:border-stone-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Name..."
              className="h-8 flex-1 rounded-lg border border-stone-200 bg-transparent px-2 text-xs outline-none placeholder:text-stone-400 focus:border-amber-400 dark:border-stone-700"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-8 rounded-lg border border-stone-200 bg-transparent px-2 text-xs dark:border-stone-700"
            >
              <option value="worker">Maker</option>
              <option value="l1_auditor">Sentinel</option>
              <option value="l2_meta_auditor">Arbiter</option>
            </select>
            <button
              onClick={handleInviteParticipant}
              disabled={isInviting || !inviteName.trim()}
              className="rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900"
            >
              {isInviting ? "..." : "Add"}
            </button>
          </div>
        </div>
      </Card>

      {/* Status + Actions */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Status
        </div>
        <div className="space-y-3">
          {spot.mode === "discuss" && (
            <button
              disabled={!executeGating.canSwitch || isSwitching}
              onClick={handleModeSwitch}
              className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                !executeGating.canSwitch
                  ? executeGating.reasons.join(" ")
                  : "Switch this SPOT to execution mode"
              }
            >
              {isSwitching ? "Switching..." : "Switch to EXECUTE"}
            </button>
          )}
          {!executeGating.canSwitch && spot.mode === "discuss" && (
            <div className="space-y-1">
              {executeGating.reasons.map((reason, i) => (
                <p key={i} className="text-xs text-stone-400">{reason}</p>
              ))}
            </div>
          )}
          {spot.mode === "execute" && (
            <button
              disabled={!certGating.canRequestCertification || isCertifying}
              onClick={handleCertify}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                !certGating.canRequestCertification
                  ? certGating.reasons.join(" ")
                  : "Triggers L2 Meta-Auditor review"
              }
            >
              {isCertifying ? "Requesting..." : "Request Certification"}
            </button>
          )}
          {!certGating.canRequestCertification && spot.mode === "execute" && (
            <div className="space-y-1">
              {certGating.reasons.map((reason, i) => (
                <p key={i} className="text-xs text-stone-400">{reason}</p>
              ))}
            </div>
          )}
          {spot.certificationStatus === "certified" && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Certified</span>
            </div>
          )}
        </div>
      </Card>

      {/* CLI Hints */}
      <CliHint
        commands={[
          { label: "Show SPOT details", command: `spot show ${spot.id}` },
          ...(spot.mode === "discuss" ? [{ label: "Switch to EXECUTE mode", command: `spot switch-mode ${spot.id} --mode execute` }] : []),
          { label: "Send a message", command: `spot message ${spot.id} --content "Your message"` },
          ...(spot.mode === "execute" ? [{ label: "Request certification", command: `spot certify ${spot.id} --verdict pass --report "Report"` }] : []),
        ]}
      />
    </div>
  );
}
