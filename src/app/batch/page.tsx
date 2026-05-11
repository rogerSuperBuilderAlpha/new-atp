"use client";

import { Download, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { BatchRowDialog } from "@/components/batch-row-dialog";
import { CompactShell } from "@/components/compact-shell";
import { type BatchResultRow, useFilteredBatchRows } from "@/components/results-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

export default function BatchPage() {
  const [csv, setCsv] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [rows, setRows] = useState<BatchResultRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<BatchResultRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { filter, setFilter, filteredRows } = useFilteredBatchRows(rows);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRows([]);
    setError(null);

    if (!csv) {
      setError("Choose a CSV file before starting batch verification.");
      return;
    }

    if (images.length === 0) {
      setError("Choose at least one label image.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("csv", csv);
    for (const image of images) formData.append("images", image);

    const response = await fetch("/api/batch", { method: "POST", body: formData });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => ({ error: "Batch verification failed." }));
      setError(payload.error ?? "Batch verification failed.");
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
      eyebrow="Batch verification"
      title="Batch verify"
      description="A slim upload strip gives way to a full-width results table. Tap a row for details."
    >
      <div className="flex flex-col gap-3 lg:min-h-[calc(100vh-9.5rem)]">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-white/70 bg-white/90 p-3 shadow-sm backdrop-blur lg:sticky lg:top-3 lg:z-10"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
            <div className="space-y-1">
              <Label htmlFor="csv" className="text-xs font-bold">Expected fields CSV</Label>
                <Input
                  id="csv"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => setCsv(event.target.files?.item(0) ?? null)}
                />
              {csv ? <p className="truncate text-xs font-medium text-slate-600">{csv.name}</p> : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="images" className="text-xs font-bold">Label images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  multiple
                  onChange={(event) => setImages(Array.from(event.target.files ?? []))}
                />
              <p className="truncate text-xs text-slate-600">
                {images.length ? `${images.length} images selected` : "Exact filename match required"}
              </p>
            </div>

            <Button type="button" variant="outline" className="h-10 rounded-2xl" onClick={downloadTemplate}>
              <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden />
              Template
            </Button>

            <Button className="h-10 rounded-2xl font-bold" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" aria-hidden />
              )}
                {isLoading ? "Processing batch..." : "Start batch"}
              </Button>
          </div>

          {(isLoading || rows.length > 0) ? (
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
              <Progress value={Math.min((rows.length / Math.max(images.length, 1)) * 100, 100)} />
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
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-slate-600">{filteredRows.length} visible rows</p>
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
                      Upload a CSV and label images to start streaming results.
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
