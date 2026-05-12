"use client";

import { ChevronDown, FileText, Loader2, RotateCcw, ScanLine, Sparkles } from "lucide-react";
import { useState } from "react";
import { CompactShell } from "@/components/compact-shell";
import { Dropzone } from "@/components/dropzone";
import { beverageOptions, expectedFieldDefinitions } from "@/components/field-definitions";
import {
  applicationFieldHelp,
  beverageTypeHelp,
  complianceSectionHelp,
  expectedFieldHelp,
} from "@/components/field-help";
import { ExtractedTextDialog } from "@/components/extracted-text-dialog";
import { ImageLightbox } from "@/components/image-lightbox";
import { ResultSummary } from "@/components/result-summary";
import { loadSampleLabel, sampleLabels, type SampleKey } from "@/components/sample-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VerdictDetailDialog } from "@/components/verdict-detail-dialog";
import { VerdictRow, type VerdictItem } from "@/components/verdict-row";
import { WarningDiffDialog } from "@/components/warning-diff-dialog";
import {
  STANDARD_GOVERNMENT_WARNING,
  type BeverageType,
  type ExpectedFields,
  type FieldVerdict,
  type VerificationResult,
} from "@/lib/schema";

const beverageLabelLookup: Record<BeverageType, string> = Object.fromEntries(
  beverageOptions.map((option) => [option.value, option.label]),
) as Record<BeverageType, string>;

const sampleEntries = Object.entries(sampleLabels) as Array<
  [SampleKey, (typeof sampleLabels)[SampleKey]]
>;

export default function VerifyPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expected, setExpected] = useState<ExpectedFields>({});
  const [showFields, setShowFields] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [warningEditorOpen, setWarningEditorOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<VerdictItem | null>(null);
  const [warningItem, setWarningItem] = useState<FieldVerdict | null>(null);
  const [extractedOpen, setExtractedOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasAnyExpected = expectedFieldDefinitions.some(
    (field) => Boolean((expected[field.key] as string | undefined)?.trim()),
  );
  const comparisonEnabled = showFields && hasAnyExpected;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!image) {
      setError("Choose a label image before running analysis.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("expected", JSON.stringify(comparisonEnabled ? expected : {}));

      const response = await fetch("/api/verify", { method: "POST", body: formData });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Analysis failed.");
        return;
      }

      setResult(payload);
    } finally {
      setIsLoading(false);
    }
  }

  async function onLoadSample(sampleKey: SampleKey = "clean") {
    const sample = sampleLabels[sampleKey];
    setError(null);
    setExpected(sample.expected);
    setShowFields(true);
    setImage(await loadSampleLabel(sampleKey));
    setResult(null);
  }

  function onClearAll() {
    setImage(null);
    setExpected({});
    setShowFields(false);
    setResult(null);
    setError(null);
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

  const detectedBeverage = result?.extracted.detectedBeverageType;
  const fieldVerdictsCount = result?.fieldVerdicts.length ?? 0;

  return (
    <CompactShell
      eyebrow="Single-label review"
      title="Review a label"
      description="Upload a label image to extract the visible fields and run the standard TTB compliance checks. Optionally provide values from the COLA application for a side-by-side comparison."
    >
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
              How to use this page
            </p>
            <InfoTip title="What happens when you click Analyze">
              <p>
                The image is sent to a vision model that extracts the visible text fields and
                classifies the beverage type. The extracted text is then checked against TTB
                compliance rules using deterministic logic (not the model). Nothing is stored
                after the response is returned.
              </p>
            </InfoTip>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full"
            aria-expanded={showInstructions}
            onClick={() => setShowInstructions((current) => !current)}
          >
            <ChevronDown
              className={`mr-1 h-4 w-4 transition ${showInstructions ? "rotate-180" : ""}`}
              aria-hidden
            />
            {showInstructions ? "Hide instructions" : "Show instructions"}
          </Button>
        </div>
        {showInstructions ? (
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-3">
            <li className="rounded-2xl bg-slate-50 p-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 1
              </span>
              <p className="mt-1 font-semibold text-slate-950">Upload the label image.</p>
              <p className="mt-1">PNG, JPEG, GIF, or WEBP. Use the largest clear copy available.</p>
            </li>
            <li className="rounded-2xl bg-slate-50 p-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 2 (optional)
              </span>
              <p className="mt-1 font-semibold text-slate-950">
                Add the application values for comparison.
              </p>
              <p className="mt-1">
                Skip this step for a compliance-only audit. Add it to also see a field-by-field
                comparison.
              </p>
            </li>
            <li className="rounded-2xl bg-slate-50 p-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 3
              </span>
              <p className="mt-1 font-semibold text-slate-950">Analyze and review.</p>
              <p className="mt-1">Open any row to see the expected and extracted text in detail.</p>
            </li>
          </ol>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Upload a label, optionally add application values, then analyze.
          </p>
        )}
      </section>

      <form className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]" onSubmit={onSubmit}>
        <section className="flex flex-col gap-3 lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-slate-300 bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 1
              </p>
              <p className="text-lg font-black text-slate-950">Upload label artwork</p>
              <p className="text-xs text-slate-600">
                Start here. Choose a label image, then analyze or load a reviewer sample.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {image && !result ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-full font-bold shadow-sm"
                  onClick={onClearAll}
                >
                  <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
                  Reset review
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => onLoadSample("clean")}
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                Load sample
              </Button>
            </div>
          </div>
          <Dropzone
            file={image}
            label="Choose or drop a label image"
            description="PNG, JPEG, GIF, or WEBP. Tap this box to upload from phone, tablet, or desktop."
            actionLabel="Upload label image"
            onFileChange={(file) => {
              setImage(file);
              setResult(null);
            }}
            compact
            className="flex-1 border-2 border-slate-900/70 bg-white shadow-lg ring-4 ring-amber-100 lg:min-h-0"
            onPreviewClick={(url) => {
              setPreviewUrl(url);
              setLightboxOpen(true);
            }}
          />
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Reviewer samples
              </p>
              <p className="text-xs text-slate-500">Pass, warning, fail, and glare paths.</p>
            </div>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {sampleEntries.map(([key, sample]) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto min-h-9 justify-start rounded-xl px-3 py-1.5 text-left whitespace-normal"
                  onClick={() => onLoadSample(key)}
                >
                  {sample.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col rounded-3xl border border-white/70 bg-white/80 p-3 shadow-sm lg:min-h-0">
          {result ? (
            <ResultPanel
              result={result}
              detectedBeverage={detectedBeverage}
              fieldVerdictsCount={fieldVerdictsCount}
              onOpenVerdict={openVerdict}
              onOpenExtracted={() => setExtractedOpen(true)}
              onEditAgain={() => setResult(null)}
              onResetReview={onClearAll}
            />
          ) : (
            <SetupPanel
              showFields={showFields}
              hasAnyExpected={hasAnyExpected}
              expected={expected}
              setExpected={setExpected}
              onToggleFields={() => setShowFields((current) => !current)}
              onEditWarning={() => setWarningEditorOpen(true)}
            />
          )}

          {error ? (
            <Alert variant="destructive" className="mt-3">
              <AlertTitle>Unable to analyze</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-3 border-t border-slate-200 pt-3">
            <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ScanLine className="mr-2 h-5 w-5" aria-hidden />
              )}
              {isLoading
                ? "Reading label..."
                : result
                  ? "Analyze again"
                  : comparisonEnabled
                    ? "Analyze and compare"
                    : "Analyze label"}
            </Button>
          </div>
        </section>
      </form>

      <Dialog open={warningEditorOpen} onOpenChange={setWarningEditorOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Expected Government Warning text</DialogTitle>
            <DialogDescription>
              Provide the warning text from the application. Most applications use the standard
              statutory text; edit only when the application explicitly differs.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={expected.governmentWarning ?? ""}
            rows={7}
            className="break-words"
            onChange={(event) =>
              setExpected((current) => ({ ...current, governmentWarning: event.target.value }))
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setExpected((current) => {
                  const next = { ...current };
                  delete next.governmentWarning;
                  return next;
                })
              }
            >
              Clear expected warning
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setExpected((current) => ({
                  ...current,
                  governmentWarning: STANDARD_GOVERNMENT_WARNING,
                }))
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

function SetupPanel({
  showFields,
  hasAnyExpected,
  expected,
  setExpected,
  onToggleFields,
  onEditWarning,
}: {
  showFields: boolean;
  hasAnyExpected: boolean;
  expected: ExpectedFields;
  setExpected: React.Dispatch<React.SetStateAction<ExpectedFields>>;
  onToggleFields: () => void;
  onEditWarning: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-950">Application values for comparison</p>
            <InfoTip title={applicationFieldHelp.title}>
              <p>{applicationFieldHelp.body}</p>
            </InfoTip>
          </div>
          <p className="text-xs text-slate-600">
            {showFields
              ? "Comparison is ON. Hide this section to run compliance-only review."
              : "Comparison is OFF. Add fields to compare against COLA application values."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onToggleFields}
        >
          <ChevronDown
            className={`mr-2 h-4 w-4 transition ${showFields ? "rotate-180" : ""}`}
            aria-hidden
          />
          {showFields ? "Hide fields" : hasAnyExpected ? "Edit fields" : "Add fields"}
        </Button>
      </div>

      {showFields ? (
        <div className="flex-1 space-y-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          {expectedFieldDefinitions
            .filter((field) => field.key !== "governmentWarning")
            .map((field) => {
              const help = expectedFieldHelp[field.key];
              return (
                <div key={field.key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={field.key} className="text-xs font-bold">
                      {field.label}
                    </Label>
                    {help ? (
                      <InfoTip title={help.title}>
                        <p>{help.body}</p>
                      </InfoTip>
                    ) : null}
                  </div>
                  {field.key === "producerNameAddress" ? (
                    <Textarea
                      id={field.key}
                      value={(expected[field.key] as string | undefined) ?? ""}
                      placeholder={field.placeholder}
                      rows={2}
                      className="placeholder:italic placeholder:text-slate-400"
                      onChange={(event) =>
                        setExpected((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                    />
                  ) : (
                    <Input
                      id={field.key}
                      value={(expected[field.key] as string | undefined) ?? ""}
                      placeholder={field.placeholder}
                      className="placeholder:italic placeholder:text-slate-400"
                      onChange={(event) =>
                        setExpected((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                    />
                  )}
                </div>
              );
            })}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Government Warning
                  </p>
                  <InfoTip title={expectedFieldHelp.governmentWarning.title}>
                    <p>{expectedFieldHelp.governmentWarning.body}</p>
                  </InfoTip>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-slate-700">
                  {expected.governmentWarning || "Standard statutory text will be assumed."}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={onEditWarning}>
                Edit
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="beverageType-override" className="text-xs font-bold">
                    Beverage type override
                  </Label>
                  <InfoTip title={beverageTypeHelp.title}>
                    <p>{beverageTypeHelp.body}</p>
                  </InfoTip>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Leave on Auto-detect unless the application category differs.
                </p>
              </div>
              <select
                id="beverageType-override"
                value={expected.beverageType ?? ""}
                onChange={(event) =>
                  setExpected((current) => ({
                    ...current,
                    beverageType: (event.target.value || undefined) as
                      | BeverageType
                      | undefined,
                  }))
                }
                className="h-10 shrink-0 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Auto-detect</option>
                {beverageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          <p className="text-base font-bold text-slate-950">
            Ready when you are.
          </p>
          <p className="mt-2">
            With an image alone, the system will read the label, classify the beverage type, and
            run the standard compliance checks (required fields, ABV format, net contents
            wording, Government Warning text, image readability).
          </p>
          <p className="mt-2">Hidden fields are ignored. Use the reviewer sample buttons beside the label preview to load pass, warning, fail, and image-quality examples.</p>
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  result,
  detectedBeverage,
  fieldVerdictsCount,
  onOpenVerdict,
  onOpenExtracted,
  onEditAgain,
  onResetReview,
}: {
  result: VerificationResult;
  detectedBeverage: BeverageType | null | undefined;
  fieldVerdictsCount: number;
  onOpenVerdict: (item: VerdictItem) => void;
  onOpenExtracted: () => void;
  onEditAgain: () => void;
  onResetReview: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-950">Results</p>
            <InfoTip title="How results are produced">
              <p>
                The vision model extracts label text. Deterministic comparison and TTB rules
                produce the verdicts you see. Tap any row for the expected and extracted values.
              </p>
            </InfoTip>
          </div>
          <p className="text-xs text-slate-600">
            {detectedBeverage
              ? `Classified as ${beverageLabelLookup[detectedBeverage]} from the label.`
              : "Tap any row for the supporting evidence."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="rounded-full font-bold shadow-sm"
            onClick={onResetReview}
          >
            <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
            Reset review
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={onEditAgain}
          >
            Edit inputs
          </Button>
        </div>
      </div>

      <ResultSummary summary={result.summary} compact />

      <div className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        {fieldVerdictsCount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Application field comparison
              </p>
              <InfoTip title={applicationFieldHelp.title}>
                <p>{applicationFieldHelp.body}</p>
              </InfoTip>
            </div>
            {result.fieldVerdicts.map((item) => (
              <VerdictRow key={item.field} item={item} onClick={() => onOpenVerdict(item)} />
            ))}
          </div>
        ) : null}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              TTB compliance checks
            </p>
            <InfoTip title={complianceSectionHelp.title}>
              <p>{complianceSectionHelp.body}</p>
            </InfoTip>
          </div>
          {result.complianceChecks.map((item) => (
            <VerdictRow key={item.id} item={item} onClick={() => onOpenVerdict(item)} />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <Button type="button" variant="outline" className="w-full rounded-2xl" onClick={onOpenExtracted}>
          <FileText className="mr-2 h-4 w-4" aria-hidden />
          View extracted label text
        </Button>
      </div>
    </div>
  );
}
