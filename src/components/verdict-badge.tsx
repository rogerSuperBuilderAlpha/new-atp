import { AlertTriangle, CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VerdictStatus } from "@/lib/schema";

const styles: Record<VerdictStatus | "error", string> = {
  pass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  fail: "border-rose-200 bg-rose-50 text-rose-800",
  unknown: "border-slate-200 bg-slate-50 text-slate-700",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

const icons = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
  unknown: CircleHelp,
  error: XCircle,
};

export function VerdictBadge({
  status,
  className,
}: {
  status: VerdictStatus | "error";
  className?: string;
}) {
  const Icon = icons[status];

  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-full px-3 py-1", styles[status], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {status.toUpperCase()}
    </Badge>
  );
}
