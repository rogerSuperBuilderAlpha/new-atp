"use client";

import { Download, FileSpreadsheet, Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { useState } from "react";
import { BatchRowDialog } from "@/components/batch-row-dialog";
import { CompactShell } from "@/components/compact-shell";
import { beverageOptions } from "@/components/field-definitions";
import { beverageTypeHelp, optionalCsvHelp } from "@/components/field-help";
import { type BatchResultRow, useFilteredBatchRows } from "@/components/results-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerdictBadge } from "@/components/verdict-badge";
import { batchTemplateCsv, resultsToCsv } from "@/lib/csv";
import type { BeverageType } from "@/lib/schema";

export default function BatchPage() {
  const [csv, setCsv] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [beverageType, setBeverageType] = useState<BeverageType | "">("");
  const [rows, setRows] = useState<BatchResultRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<BatchResultRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { filter, setFilter, filteredRows } = useFilteredBatchRows(rows);

  function resetForm() {
    setCsv(null);
    setImages([]);
    setBeverageType("");
    setRows([]);
    setError(null);
    setFilter("all");
    setFormKey((current) => current + 1);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRows([]);
    setError(null);

    if (images.length === 0) {
      setError("Choose at least one label image.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    if (csv) formData.append("csv", csv);
    if (beverageType) formData.append("beverageType", beverageType);
    for (const image of images) formData.append("images", image);

    const response = await fetch("/api/batch", { method: "POST", body: formData });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => ({ error: "The batch request did not complete." }));
      setError(payload.error ?? "The batch request did not complete.");
      setIsLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const row = JSON.parse(line) as BatchResultRow;
        setRows((current) => [...current, row]);
      }
    }

    if (buffer.trim()) {
      setRows((current) => [...current, JSON.parse(buffer) as BatchResultRow]);
    }

    setIsLoading(false);
  }

  function downloadTemplate() {
    triggerCsvDownload(batchTemplateCsv(), "label-batch-template.csv");
  }

  function downloadReport() {
    if (rows.length === 0) return;
    triggerCsvDownload(resultsToCsv(rows), "label-batch-report.csv");
  }

  function triggerCsvDownload(content: string, filename: string) {
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <CompactShell
      eyebrow="Batch review"
      title="Review many labels"
      description="Upload one or many label images. Provide an optional CSV of application values to also see a field-by-field comparison per row. Results stream into the table below and can be exported when finished."
    >
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
            How to use this page
          </p>
          <InfoTip title="About batch review">
            <p>
              Each image is processed independently with the same vision extraction and TTB
              checks used by the single-label workflow. Up to five labels run concurrently.
              Rows appear as they finish.
            </p>
            <p>
              No files are stored after the response. Image filenames are kept only for the
              duration of the request.
            </p>
          </InfoTip>
        </div>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-3">
          <li className="rounded-2xl bg-slate-50 p-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Step 1
            </span>
            <p className="mt-1 font-semibold text-slate-950">Select label images.</p>
            <p className="mt-1">PNG, JPEG, GIF, or WEBP. You can select many at once.</p>
          </li>
          <li className="rounded-2xl bg-slate-50 p-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Step 2 (optional)
            </span>
            <p className="mt-1 font-semibold text-slate-950">Add an expected-fields CSV.</p>
            <p className="mt-1">
              Use the <span className="font-semibold">Template</span> button for the required
              column layout. Filenames in the CSV must match the uploaded images exactly.
            </p>
          </li>
          <li className="rounded-2xl bg-slate-50 p-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Step 3
            </span>
            <p className="mt-1 font-semibold text-slate-950">Start the run.</p>
            <p className="mt-1">
              Tap a row to see per-field detail. Use <span className="font-semibold">Download
              report</span> for a CSV export.
            </p>
          </li>
        </ol>
      </section>

      <div className="flex flex-col gap-3 lg:min-h-[calc(100vh-22rem)]">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-white/70 bg-white/90 p-3 shadow-sm backdrop-blur lg:sticky lg:top-3 lg:z-10"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="csv" className="text-xs font-bold">
                  Expected fields CSV{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </Label>
                <InfoTip title={optionalCsvHelp.title}>
                  <p>{optionalCsvHelp.body}</p>
                </InfoTip>
              </div>
              <Input
                key={`csv-${formKey}`}
                id="csv"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setCsv(event.target.files?.item(0) ?? null)}
              />
              <p className="truncate text-xs text-slate-600">
                {csv ? csv.name : "Skip to run a compliance-only review per image."}
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="images" className="text-xs font-bold">
                Label images
              </Label>
              <Input
                key={`images-${formKey}`}
                id="images"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                multiple
                onChange={(event) => setImages(Array.from(event.target.files ?? []))}
              />
              <p className="truncate text-xs text-slate-600">
                {images.length
                  ? `${images.length} images selected`
                  : "Filenames must match the CSV's imageFile column when a CSV is provided."}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="beverageType" className="text-xs font-bold">
                  Beverage type
                </Label>
                <InfoTip title={beverageTypeHelp.title}>
                  <p>{beverageTypeHelp.body}</p>
                </InfoTip>
              </div>
              <select
                id="beverageType"
                value={beverageType}
                onChange={(event) =>
                  setBeverageType(event.target.value as BeverageType | "")
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Auto-detect</option>
                {beverageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="truncate text-xs text-slate-600">Override only if needed.</p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-2xl"
              onClick={downloadTemplate}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden />
              Template
            </Button>

            <Button className="h-10 rounded-2xl font-bold" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" aria-hidden />
              )}
              {isLoading
                ? "Processing..."
                : csv
                  ? "Start review with CSV"
                  : "Start compliance review"}
            </Button>
          </div>

          {isLoading || rows.length > 0 ? (
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
              <Progress
                value={Math.min((rows.length / Math.max(images.length, 1)) * 100, 100)}
              />
              <p className="text-sm font-semibold text-slate-700">
                {rows.length} of {Math.max(images.length, rows.length)} rows completed
              </p>
            </div>
          ) : null}

          {error ? (
            <Alert variant="destructive" className="mt-3">
              <AlertTitle>Unable to process batch</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </form>

        <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/70 bg-white/85 p-3 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {(["all", "pass", "warning", "fail", "error"] as const).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  className="rounded-full capitalize"
                  onClick={() => setFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-slate-600">
                {filteredRows.length} visible rows
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={downloadReport}
                disabled={rows.length === 0}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download report
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={resetForm}
                disabled={isLoading || (!csv && images.length === 0 && rows.length === 0)}
              >
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                Reset
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length ? (
                  filteredRows.map((row) => (
                    <TableRow
                      key={`${row.rowId}-${row.imageFile}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedRow(row)}
                    >
                      <TableCell className="font-bold">{row.rowId}</TableCell>
                      <TableCell>{row.imageFile}</TableCell>
                      <TableCell>
                        <VerdictBadge status={row.status} />
                      </TableCell>
                      <TableCell className="max-w-lg text-sm text-slate-600">
                        {row.error
                          ? row.error
                          : `${row.result?.summary.pass ?? 0} pass, ${row.result?.summary.warning ?? 0} warning, ${row.result?.summary.fail ?? 0} fail`}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                      Select label images above to begin. A CSV is optional.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <BatchRowDialog
        row={selectedRow}
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      />
    </CompactShell>
  );
}
