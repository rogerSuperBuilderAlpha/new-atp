"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { VerdictBadge } from "@/components/verdict-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hasRequiredWarningHeader, normalizeWarning, normalizeWhitespace } from "@/lib/compare";
import { STANDARD_GOVERNMENT_WARNING, type FieldVerdict } from "@/lib/schema";

export function WarningDiffDialog({
  item,
  open,
  onOpenChange,
}: {
  item: FieldVerdict | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const actual = item?.actual ?? "";
  const expected = item?.expected ?? STANDARD_GOVERNMENT_WARNING;
  const headingOk = actual ? hasRequiredWarningHeader(actual) : false;
  const textOk = actual ? normalizeWarning(expected) === normalizeWarning(actual) : false;
  const whitespaceOnly =
    actual && normalizeWhitespace(expected) !== normalizeWhitespace(actual) && textOk;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-3">
            <DialogTitle className="text-2xl">Government Warning review</DialogTitle>
            {item ? <VerdictBadge status={item.status} /> : null}
          </div>
          <DialogDescription className="text-base">
            Jenny called this out as the check that needs exact attention: all-caps heading first,
            then statutory text.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          <CheckLine ok={headingOk} label='Heading is exactly "GOVERNMENT WARNING:" in all caps' />
          <CheckLine ok={textOk} label="Warning text matches statutory wording after whitespace normalization" />
        </div>

        {whitespaceOnly ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Text appears to differ only by line breaks or spacing. This is usually acceptable for the
            statutory text check.
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <WarningText title="Expected statutory text" value={expected} />
          <WarningText title="Text found on label" value={actual || "Not found"} />
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Normalized comparison</p>
          <div className="mt-3 grid gap-3 text-sm lg:grid-cols-2">
            <p className="whitespace-pre-wrap break-words rounded-xl bg-white/10 p-3">
              {normalizeWarning(expected)}
            </p>
            <p className="whitespace-pre-wrap break-words rounded-xl bg-white/10 p-3">
              {actual ? normalizeWarning(actual) : "not found"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CheckLine({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CheckCircle2 : XCircle;

  return (
    <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Icon className={ok ? "h-5 w-5 text-emerald-700" : "h-5 w-5 text-rose-700"} />
      <p className="text-sm font-semibold text-slate-900">{label}</p>
    </div>
  );
}

function WarningText({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-900">{value}</p>
    </div>
  );
}
