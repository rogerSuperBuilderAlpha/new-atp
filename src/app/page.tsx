import Link from "next/link";
import { ArrowRight, Files, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { formatBytes, uploadLimits } from "@/lib/limits";

export default function Home() {
  const workflows = [
    {
      title: "Review a single label",
      description:
        "Upload one label image. The system extracts the visible fields, classifies the beverage type, and runs the standard TTB compliance checks. Provide optional COLA application values to also see a field-by-field comparison.",
      href: "/verify",
      icon: ShieldCheck,
      accent: "bg-slate-950 text-white",
    },
    {
      title: "Review a batch of labels",
      description:
        "Upload many label images at once. Add an expected-fields CSV to compare each label against its application values, or skip the CSV to run a compliance-only audit. Results stream into a sortable table you can export.",
      href: "/batch",
      icon: Files,
      accent: "bg-emerald-800 text-white",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_15%_10%,#f9dca8,transparent_28%),radial-gradient(circle_at_85%_15%,#bae6fd,transparent_26%),linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-3 py-3 sm:px-8">
        <header className="flex items-center justify-between gap-2 rounded-3xl border border-white/70 bg-white/65 px-3 py-2 shadow-sm backdrop-blur sm:gap-3 sm:px-4 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="rounded-2xl bg-slate-950 p-2 text-white sm:p-2.5">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
                TTB prototype
              </p>
              <p className="truncate text-base font-black leading-tight sm:text-lg">
                Label Verification
              </p>
            </div>
          </div>
          <nav className="flex shrink-0 gap-0.5 sm:gap-1">
            <Button variant="ghost" size="sm" className="px-2 sm:px-3" asChild>
              <Link href="/verify">Review</Link>
            </Button>
            <Button variant="ghost" size="sm" className="px-2 sm:px-3" asChild>
              <Link href="/batch">Batch</Link>
            </Button>
          </nav>
        </header>

        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Compliance review tools
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Faster review of alcohol beverage labels.
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
            Upload a label image and the system reads the visible text, classifies the beverage,
            and runs the routine TTB checks an agent would normally do by hand. Use the single-
            label workflow to review one application, or the batch workflow to process many
            labels at once.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
              How to use this prototype
            </p>
            <InfoTip title="About this prototype">
              <p>
                This is a standalone proof of concept. No data is stored after a request
                completes; uploads are processed in memory and discarded.
              </p>
              <p>
                The system uses a vision model to read the label text, then deterministic
                checks decide pass, warning, or fail. Warnings indicate items an agent should
                confirm; failures indicate items that would normally require resubmission.
              </p>
            </InfoTip>
          </div>
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-3">
            <li className="rounded-2xl bg-white p-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 1
              </span>
              <p className="mt-1 font-semibold text-slate-950">Open a workflow.</p>
              <p className="mt-1">Choose single-label review or batch.</p>
            </li>
            <li className="rounded-2xl bg-white p-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 2
              </span>
              <p className="mt-1 font-semibold text-slate-950">Upload the label image.</p>
              <p className="mt-1">PNG, JPEG, GIF, or WEBP. Application fields are optional.</p>
            </li>
            <li className="rounded-2xl bg-white p-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 3
              </span>
              <p className="mt-1 font-semibold text-slate-950">Review the results.</p>
              <p className="mt-1">Open any row for the expected and extracted text side by side.</p>
            </li>
          </ol>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
          {workflows.map((workflow) => {
            const Icon = workflow.icon;

            return (
              <Card
                key={workflow.href}
                className="group border-white/80 bg-white/85 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="p-5">
                  <span className={`inline-flex rounded-2xl p-2.5 ${workflow.accent}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="mt-3 text-xl font-black">{workflow.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{workflow.description}</p>
                  <Button variant="ghost" className="mt-3 px-0 font-bold" asChild>
                    <Link href={workflow.href}>
                      Open workflow
                      <ArrowRight
                        className="ml-2 h-4 w-4 transition group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="grid gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm md:grid-cols-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
              Security and limits
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Prototype only: not for production COLA decisions. Uploads are processed in memory,
              discarded after the response, and capped at {uploadLimits.maxImages} images per batch,
              {formatBytes(uploadLimits.maxImageBytes)} per image, and{" "}
              {formatBytes(uploadLimits.maxCsvBytes)} per CSV.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
              AI data flow
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Images are sent from the server to Vercel AI Gateway and the configured model
              provider for text extraction. Gateway credentials stay server-side; no model API key
              is exposed to the browser.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
              Performance target
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Sarah&apos;s 5-second target is the product goal. Current prototype latency depends on
              provider response time; the app uses low-detail extraction and streaming batch rows to
              reduce perceived wait.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
