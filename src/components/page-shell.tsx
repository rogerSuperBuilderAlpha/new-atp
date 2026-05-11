import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageShell({
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="rounded-2xl bg-slate-950 p-3 text-white">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                TTB prototype
              </span>
              <span className="text-xl font-bold">Label verification</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2">
            <Button variant="ghost" asChild>
              <Link href="/verify">Verify</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/audit">Audit</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/batch">Batch</Link>
            </Button>
          </nav>
        </header>
        <section className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{description}</p>
        </section>
        {children}
      </div>
    </main>
  );
}
