import Link from "next/link";
import { ArrowRight, ClipboardCheck, Files, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const workflows = [
    {
      title: "Verify a label",
      description: "Compare expected COLA fields against uploaded artwork with per-field verdicts.",
      href: "/verify",
      icon: ShieldCheck,
      accent: "bg-slate-950 text-white",
    },
    {
      title: "Audit a label",
      description: "Extract label text and check required TTB elements without application data.",
      href: "/audit",
      icon: ClipboardCheck,
      accent: "bg-amber-700 text-white",
    },
    {
      title: "Batch verify",
      description: "Upload a CSV and many images, then watch results stream into a report table.",
      href: "/batch",
      icon: Files,
      accent: "bg-emerald-700 text-white",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#f9dca8,transparent_28%),radial-gradient(circle_at_85%_15%,#bae6fd,transparent_26%),linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-8">
        <header className="flex items-center justify-between gap-2 rounded-3xl border border-white/70 bg-white/65 px-3 py-2 shadow-sm backdrop-blur sm:gap-3 sm:px-4 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="rounded-2xl bg-slate-950 p-2 text-white sm:p-2.5">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">TTB prototype</p>
              <p className="truncate text-base font-black leading-tight sm:text-lg">Label Verification</p>
            </div>
          </div>
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

        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI-powered checks, agent-controlled judgment
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
            Alcohol label review without the eye-strain.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            Read label artwork, compare it against expected application fields, and flag routine
            compliance issues in seconds. Built for busy TTB agents who need obvious answers, not
            another system to wrestle.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {workflows.map((workflow) => {
            const Icon = workflow.icon;

            return (
              <Card key={workflow.href} className="group border-white/80 bg-white/75 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-4">
                  <span className={`inline-flex rounded-2xl p-2.5 ${workflow.accent}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="mt-3 text-xl font-black">{workflow.title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{workflow.description}</p>
                  <Button variant="ghost" className="mt-3 px-0 font-bold" asChild>
                    <Link href={workflow.href}>
                      Open workflow
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-700 md:grid-cols-3">
          <div className="flex gap-2">
            <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-slate-950" aria-hidden />
            <p>
              <strong>Sub-5 second target.</strong> One AI extraction call per label, then deterministic checks.
            </p>
          </div>
          <p>
            <strong>Judgment preserved.</strong> Case-only differences become warnings, not automatic rejects.
          </p>
          <p>
            <strong>No persistence.</strong> Prototype requests are processed in-memory with no submission storage.
          </p>
        </div>
      </section>
    </main>
  );
}
