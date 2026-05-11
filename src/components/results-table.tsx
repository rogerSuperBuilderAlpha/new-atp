"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerdictBadge } from "@/components/verdict-badge";
import { resultsToCsv } from "@/lib/csv";
import type { VerificationResult } from "@/lib/schema";

export type BatchResultRow = {
  rowId: string;
  imageFile: string;
  status: VerificationResult["summary"]["status"] | "error";
  result?: VerificationResult;
  error?: string;
};

export function ResultsTable({ rows }: { rows: BatchResultRow[] }) {
  const [filter, setFilter] = useState<BatchResultRow["status"] | "all">("all");

  const filteredRows = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.status === filter)),
    [filter, rows],
  );

  function downloadReport() {
    const csv = resultsToCsv(rows);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "label-verification-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "pass", "warning", "fail", "error"] as const).map((status) => (
            <Button
              key={status}
              type="button"
              variant={filter === status ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All" : status}
            </Button>
          ))}
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={downloadReport} disabled={!rows.length}>
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Download report
        </Button>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
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
                <TableRow key={`${row.rowId}-${row.imageFile}`}>
                  <TableCell className="font-medium">{row.rowId}</TableCell>
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
                <TableCell colSpan={4} className="h-28 text-center text-slate-500">
                  No rows yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function useFilteredBatchRows(rows: BatchResultRow[]) {
  const [filter, setFilter] = useState<BatchResultRow["status"] | "all">("all");
  const filteredRows = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.status === filter)),
    [filter, rows],
  );

  return { filter, setFilter, filteredRows };
}
