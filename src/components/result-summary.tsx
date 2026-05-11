import { Card, CardContent } from "@/components/ui/card";
import { VerdictBadge } from "@/components/verdict-badge";
import type { VerificationResult, VerdictStatus } from "@/lib/schema";

type SummaryLike = VerificationResult["summary"] | {
  status: VerdictStatus;
  pass: number;
  warning: number;
  fail: number;
  unknown: number;
};

export function ResultSummary({
  summary,
  compact = false,
}: {
  summary: SummaryLike;
  compact?: boolean;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className={compact ? "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3" : "flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Overall result</p>
          <p className={compact ? "mt-0.5 text-lg font-bold text-slate-950" : "mt-1 text-2xl font-bold text-slate-950"}>
            {summary.status === "pass"
              ? "Ready for agent review"
              : summary.status === "fail"
                ? "Needs attention"
                : "Review recommended"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VerdictBadge status={summary.status} />
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            {summary.pass} pass
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
            {summary.warning} warning
          </span>
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800">
            {summary.fail} fail
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
