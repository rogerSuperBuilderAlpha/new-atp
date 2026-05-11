"use client";

import { useState } from "react";
import { ResultSummary } from "@/components/result-summary";
import type { BatchResultRow } from "@/components/results-table";
import { VerdictDetailDialog } from "@/components/verdict-detail-dialog";
import { VerdictRow, type VerdictItem } from "@/components/verdict-row";
import { WarningDiffDialog } from "@/components/warning-diff-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FieldVerdict } from "@/lib/schema";

export function BatchRowDialog({
  row,
  open,
  onOpenChange,
}: {
  row: BatchResultRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [detailItem, setDetailItem] = useState<VerdictItem | null>(null);
  const [warningItem, setWarningItem] = useState<FieldVerdict | null>(null);

  function openVerdict(item: VerdictItem) {
    if ("field" in item && item.field === "governmentWarning") {
      setWarningItem(item);
      return;
    }
    setDetailItem(item);
  }

  const allItems = row?.result
    ? [...row.result.fieldVerdicts, ...row.result.complianceChecks]
    : [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Row {row?.rowId}: {row?.imageFile}
            </DialogTitle>
            <DialogDescription>
              Drill into the specific fields only when a row needs agent attention.
            </DialogDescription>
          </DialogHeader>

          {row?.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
              {row.error}
            </div>
          ) : null}

          {row?.result ? (
            <div className="space-y-3">
              <ResultSummary summary={row.result.summary} compact />
              <div className="grid gap-2 md:grid-cols-2">
                {allItems.map((item) => (
                  <VerdictRow
                    key={"field" in item ? item.field : item.id}
                    item={item}
                    compact
                    onClick={() => openVerdict(item)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <VerdictDetailDialog
        item={detailItem}
        open={Boolean(detailItem)}
        onOpenChange={(nextOpen) => !nextOpen && setDetailItem(null)}
      />
      <WarningDiffDialog
        item={warningItem}
        open={Boolean(warningItem)}
        onOpenChange={(nextOpen) => !nextOpen && setWarningItem(null)}
      />
    </>
  );
}
