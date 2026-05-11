"use client";

import { ClipboardCheck, FileText, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { CompactShell } from "@/components/compact-shell";
import { Dropzone } from "@/components/dropzone";
import { beverageOptions } from "@/components/field-definitions";
import { ExtractedTextDialog } from "@/components/extracted-text-dialog";
import { ImageLightbox } from "@/components/image-lightbox";
import { ResultSummary } from "@/components/result-summary";
import { loadSampleLabel } from "@/components/sample-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VerdictDetailDialog } from "@/components/verdict-detail-dialog";
import { VerdictRow, type VerdictItem } from "@/components/verdict-row";
import { WarningDiffDialog } from "@/components/warning-diff-dialog";
import type { BeverageType, ComplianceCheck, FieldVerdict, LabelFields, VerdictStatus } from "@/lib/schema";

type AuditResult = {
  extracted: LabelFields;
  complianceChecks: ComplianceCheck[];
  summary: {
    status: VerdictStatus;
    pass: number;
    warning: number;
    fail: number;
    unknown: number;
  };
};

export default function AuditPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [beverageType, setBeverageType] = useState<BeverageType>("spirits");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [detailItem, setDetailItem] = useState<VerdictItem | null>(null);
  const [warningItem, setWarningItem] = useState<FieldVerdict | null>(null);
  const [extractedOpen, setExtractedOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError(null);

    if (!image) {
      setError("Choose a label image before running the audit.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("beverageType", beverageType);

      const response = await fetch("/api/audit", { method: "POST", body: formData });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Audit failed.");
        return;
      }

      setResult(payload);
    } finally {
      setIsLoading(false);
    }
  }

  async function onLoadSample() {
    setError(null);
    setBeverageType("spirits");
    setImage(await loadSampleLabel());
    setResult(null);
  }

  function openVerdict(item: ComplianceCheck) {
    if (item.id === "government-warning") {
      setWarningItem({
        field: "governmentWarning",
        label: item.label,
        expected: null,
        actual: result?.extracted.governmentWarning ?? null,
        status: item.status,
        reason: item.reason,
      });
      return;
    }
    setDetailItem(item);
  }

  return (
    <CompactShell
      eyebrow="Image-only audit"
      title="Audit label"
      description="Upload artwork only; the app extracts fields and shows a compact checklist with details on demand."
    >
      <form className="grid gap-4 lg:h-[calc(100vh-9.5rem)] lg:min-h-[34rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]" onSubmit={onSubmit}>
        <section className="flex flex-col gap-3 lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <div>
              <p className="text-sm font-black text-slate-950">Label artwork</p>
              <p className="text-xs text-slate-600">Open the preview when image quality is questionable.</p>
            </div>
            <Button type="button" variant="outline" className="rounded-full" onClick={onLoadSample}>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden />
              Load sample
            </Button>
          </div>
          <Dropzone
            file={image}
            onFileChange={(file) => {
              setImage(file);
              setResult(null);
            }}
            compact
            label="Drop one label image"
            description="Audit without application data."
            className="flex-1 lg:min-h-0"
            onPreviewClick={(url) => {
              setPreviewUrl(url);
              setLightboxOpen(true);
            }}
          />
        </section>

        <section className="flex flex-col rounded-3xl border border-white/70 bg-white/80 p-3 shadow-sm lg:min-h-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-950">
                {result ? "Compliance checklist" : "Audit setup"}
              </p>
              <p className="text-xs text-slate-600">
                {result ? "Tap a row to review the evidence." : "Choose beverage type and run the check."}
              </p>
            </div>
            <div className="shrink-0 space-y-2">
              <Label htmlFor="beverageType" className="sr-only">Beverage type</Label>
              <select
                id="beverageType"
                value={beverageType}
                onChange={(event) => setBeverageType(event.target.value as BeverageType)}
                className="h-10 rounded-full border border-input bg-background px-3 text-sm"
              >
                {beverageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-3">
              <AlertTitle>Unable to audit</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {result ? (
            <div className="flex flex-1 flex-col gap-3 lg:min-h-0">
              <ResultSummary summary={result.summary} compact />
              <div className="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                {result.complianceChecks.map((item) => (
                  <VerdictRow key={item.id} item={item} onClick={() => openVerdict(item)} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setExtractedOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" aria-hidden />
                  Extracted text
                </Button>
                <Button type="button" className="rounded-2xl" onClick={() => setResult(null)}>
                  New audit
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between rounded-3xl bg-slate-50 p-4">
              <div>
                <p className="text-2xl font-black text-slate-950">Ready for image-only review.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The checklist covers required fields, the exact Government Warning, ABV format,
                  net contents, and image readability.
                </p>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="rounded-2xl bg-white p-3 font-semibold">1. Upload label artwork</div>
                <div className="rounded-2xl bg-white p-3 font-semibold">2. Run audit</div>
                <div className="rounded-2xl bg-white p-3 font-semibold">3. Tap only the rows that need attention</div>
              </div>
            </div>
          )}

          <div className="mt-3 border-t border-slate-200 pt-3">
            <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ClipboardCheck className="mr-2 h-5 w-5" aria-hidden />
              )}
              {isLoading ? "Auditing label..." : result ? "Run again" : "Audit label"}
            </Button>
          </div>
        </section>
      </form>

      <VerdictDetailDialog
        item={detailItem}
        open={Boolean(detailItem)}
        onOpenChange={(open) => !open && setDetailItem(null)}
      />
      <WarningDiffDialog
        item={warningItem}
        open={Boolean(warningItem)}
        onOpenChange={(open) => !open && setWarningItem(null)}
      />
      <ExtractedTextDialog
        fields={result?.extracted ?? null}
        open={extractedOpen}
        onOpenChange={setExtractedOpen}
      />
      <ImageLightbox
        src={previewUrl}
        title={image?.name ?? "Label image"}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </CompactShell>
  );
}
