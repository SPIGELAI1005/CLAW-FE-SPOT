"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";

interface CertificateExportProps {
  spotId: string;
}

/**
 * Export button for downloading the full certification package JSON.
 * The exported file is self-contained. An external verifier can use it
 * with any Ethereum RPC to verify the certificate without platform access.
 */
export function CertificateExport({ spotId }: CertificateExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/certifications?spot_id=${spotId}`);
      if (!res.ok) return;
      const { certifications } = await res.json();
      if (!certifications?.length) return;

      // Fetch the full certification with package_json via export endpoint
      const certId = certifications[0].id;
      const detailRes = await fetch(`/api/certifications/${certId}/export`);
      if (!detailRes.ok) return;
      const cert = await detailRes.json();

      // Export the package_json: this is the self-contained verifiable artifact
      const packageJson = cert.package_json;
      const blob = new Blob([JSON.stringify(packageJson, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert.fingerprint.slice(0, 12)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setIsExporting(false);
    }
  }, [spotId]);

  return (
    <Button
      as="button"
      variant="secondary"
      onClick={handleExport}
      isLoading={isExporting}
      className="h-8 gap-1.5 px-3 text-xs"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Export Certificate
    </Button>
  );
}
