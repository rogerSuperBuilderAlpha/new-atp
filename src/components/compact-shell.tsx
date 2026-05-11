import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompactShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f1df,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6">
        <header className="flex items-center justify-between gap-2 rounded-3xl border border-white/70 bg-white/75 px-3 py-2 shadow-sm backdrop-blur sm:gap-3 sm:px-4 sm:py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="rounded-2xl bg-slate-950 p-2 text-white sm:p-2.5">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
                {eyebrow}
              </span>
              <span className="block truncate text-base font-black sm:text-lg">{title}</span>
            </span>
          </Link>
          <nav className="flex shrink-0 gap-0.5 sm:gap-1">
            <Button variant="ghost" size="sm" className="px-2 sm:px-3" asChild>
              <Link href="/verify">Verify</Link>
            </Button>
            <Button variant="ghost" size="sm" className="px-2 sm:px-3" asChild>
              <Link href="/audit">Audit</Link>
            </Button>
            <Button variant="ghost" size="sm" className="px-2 sm:px-3" asChild>
              <Link href="/batch">Batch</Link>
            </Button>
          </nav>
        </header>
        <section className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-3xl text-sm text-slate-600">{description}</p>
        </section>
        {children}
      </div>
    </main>
  );
}
