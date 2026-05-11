import { ChevronRight } from "lucide-react";
import { VerdictBadge } from "@/components/verdict-badge";
import { cn } from "@/lib/utils";
import type { ComplianceCheck, FieldVerdict } from "@/lib/schema";

export type VerdictItem = FieldVerdict | ComplianceCheck;

export function VerdictRow({
  item,
  onClick,
  compact = false,
}: {
  item: VerdictItem;
  onClick: () => void;
  compact?: boolean;
}) {
  const isFormattingWarning =
    item.status === "warning" && /capitalization|punctuation|spacing|formatting/i.test(item.reason);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-14 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950",
        compact ? "py-2" : "py-3",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-slate-950">{item.label}</p>
          {isFormattingWarning ? (
            <span className="hidden rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900 sm:inline">
              Likely formatting only
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{item.reason}</p>
      </div>
      <VerdictBadge status={item.status} className="shrink-0 text-[10px]" />
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
    </button>
  );
}
