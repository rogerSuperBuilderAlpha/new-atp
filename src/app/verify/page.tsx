"use client";

import { FileText, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { CompactShell } from "@/components/compact-shell";
import { Dropzone } from "@/components/dropzone";
import { beverageOptions, expectedFieldDefinitions } from "@/components/field-definitions";
import { ExtractedTextDialog } from "@/components/extracted-text-dialog";
import { ImageLightbox } from "@/components/image-lightbox";
import { ResultSummary } from "@/components/result-summary";
import { loadSampleLabel, sampleExpectedFields } from "@/components/sample-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VerdictDetailDialog } from "@/components/verdict-detail-dialog";
import { VerdictRow, type VerdictItem } from "@/components/verdict-row";
import { WarningDiffDialog } from "@/components/warning-diff-dialog";
import { STANDARD_GOVERNMENT_WARNING, type ExpectedFields, type FieldVerdict, type VerificationResult } from "@/lib/schema";

export default function VerifyPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expected, setExpected] = useState<ExpectedFields>({
    beverageType: "spirits",
    governmentWarning: STANDARD_GOVERNMENT_WARNING,
  });
  const [warningEditorOpen, setWarningEditorOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<VerdictItem | null>(null);
  const [warningItem, setWarningItem] = useState<FieldVerdict | null>(null);
  const [extractedOpen, setExtractedOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!image) {
      setError("Choose a label image before running verification.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("expected", JSON.stringify(expected));

      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Verification failed.");
        return;
      }

      setResult(payload);
    } finally {
      setIsLoading(false);
    }
  }

  async function onLoadSample() {
    setError(null);
    setExpected(sampleExpectedFields);
    setImage(await loadSampleLabel());
    setResult(null);
  }

  function openVerdict(item: VerdictItem) {
    if ("field" in item && item.field === "governmentWarning") {
      setWarningItem(item);
      return;
    }
    if ("id" in item && item.id === "government-warning") {
      setWarningItem({
        field: "governmentWarning",
        label: item.label,
        expected: expected.governmentWarning ?? null,
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
      eyebrow="Single label verification"
      title="Verify label"
      description="Keep the core review in one viewport: label image on the left, expected fields or verdicts on the right."
    >
      <form className="grid gap-4 lg:h-[calc(100vh-9.5rem)] lg:min-h-[34rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]" onSubmit={onSubmit}>
        <section className="flex flex-col gap-3 lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <div>
              <p className="text-sm font-black text-slate-950">Label artwork</p>
              <p className="text-xs text-slate-600">Click the preview to inspect glare, angle, or tiny warning text.</p>
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
                {result ? "Verdicts" : "Expected application fields"}
              </p>
              <p className="text-xs text-slate-600">
                {result ? "Tap any row for details." : "Long text stays collapsed until needed."}
              </p>
            </div>
            <select
              aria-label="Beverage type"
              value={expected.beverageType}
              onChange={(event) =>
                setExpected((current) => ({
                  ...current,
                  beverageType: event.target.value as ExpectedFields["beverageType"],
                }))
              }
              className="h-10 shrink-0 rounded-full border border-input bg-background px-3 text-sm"
            >
              {beverageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-3">
              <AlertTitle>Unable to verify</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {result ? (
            <div className="flex flex-1 flex-col gap-3 lg:min-h-0">
              <ResultSummary summary={result.summary} compact />
              <div className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Application field comparison
                  </p>
                  {result.fieldVerdicts.map((item) => (
                    <VerdictRow key={item.field} item={item} onClick={() => openVerdict(item)} />
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    TTB compliance checks
                  </p>
                  {result.complianceChecks.map((item) => (
                    <VerdictRow key={item.id} item={item} onClick={() => openVerdict(item)} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setExtractedOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" aria-hidden />
                  Extracted text
                </Button>
                <Button type="button" className="rounded-2xl" onClick={() => setResult(null)}>
                  Edit fields
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
              {expectedFieldDefinitions
                .filter((field) => field.key !== "governmentWarning")
                .map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key} className="text-xs font-bold">
                      {field.label}
                    </Label>
                    {field.key === "producerNameAddress" ? (
                      <Textarea
                        id={field.key}
                        value={(expected[field.key] as string | undefined) ?? ""}
                        placeholder={field.placeholder}
                        rows={2}
                        onChange={(event) =>
                          setExpected((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                      />
                    ) : (
                      <Input
                        id={field.key}
                        value={(expected[field.key] as string | undefined) ?? ""}
                        placeholder={field.placeholder}
                        onChange={(event) =>
                          setExpected((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Government Warning
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-700">
                      {expected.governmentWarning || "No expected warning text"}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setWarningEditorOpen(true)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 border-t border-slate-200 pt-3">
            <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="mr-2 h-5 w-5" aria-hidden />
              )}
              {isLoading ? "Reading label..." : result ? "Run again" : "Verify label"}
            </Button>
          </div>
        </section>
      </form>

      <Dialog open={warningEditorOpen} onOpenChange={setWarningEditorOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Expected Government Warning</DialogTitle>
            <DialogDescription>
              Keep this collapsed during routine review. Edit only when the application expects a
              different warning statement.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={expected.governmentWarning ?? ""}
            rows={7}
            onChange={(event) =>
              setExpected((current) => ({ ...current, governmentWarning: event.target.value }))
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setExpected((current) => ({ ...current, governmentWarning: STANDARD_GOVERNMENT_WARNING }))
              }
            >
              Use standard text
            </Button>
            <Button type="button" onClick={() => setWarningEditorOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
