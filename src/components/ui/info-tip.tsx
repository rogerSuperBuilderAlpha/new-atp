"use client";

import { Info } from "lucide-react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";

type InfoTipProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
};

export function InfoTip({
  title,
  children,
  className,
  iconClassName,
  side = "top",
}: InfoTipProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        aria-label={`More info: ${title}`}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-slate-400 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950",
          className,
        )}
      >
        <Info className={cn("h-4 w-4", iconClassName)} aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-lg outline-none"
        >
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <div className="space-y-2">{children}</div>
          <Popover.Arrow className="fill-white" width={12} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
