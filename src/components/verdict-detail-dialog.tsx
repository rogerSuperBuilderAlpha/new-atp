"use client";

import { VerdictBadge } from "@/components/verdict-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { VerdictItem } from "@/components/verdict-row";

export function VerdictDetailDialog({
  item,
  open,
  onOpenChange,
}: {
  item: VerdictItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const field = item && "field" in item ? item : null;
  const isFormattingWarning =
    item?.status === "warning" && /capitalization|punctuation|spacing|formatting/i.test(item.reason);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        {item ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle className="break-words text-2xl">{item.label}</DialogTitle>
                <VerdictBadge status={item.status} />
              </div>
              <DialogDescription className="break-words text-base">{item.reason}</DialogDescription>
            </DialogHeader>

            {isFormattingWarning ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-bold">Why this is a warning, not a fail</p>
                <p className="mt-1">
                  The normalized values match. The difference appears limited to capitalization,
                  punctuation, spacing, or wording format that an agent can quickly accept or reject.
                </p>
              </div>
            ) : null}

            {field ? (
              <div className="grid gap-3 md:grid-cols-2">
                <TextBlock title="Expected application value" value={field.expected} />
                <TextBlock title="Text found on label" value={field.actual} />
              </div>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TextBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}
