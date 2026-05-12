"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LabelFields } from "@/lib/schema";

const labelFields: Array<{ key: keyof LabelFields; label: string }> = [
  { key: "brandName", label: "Brand name" },
  { key: "classType", label: "Class/type" },
  { key: "detectedBeverageType", label: "Detected beverage type" },
  { key: "alcoholContent", label: "Alcohol content" },
  { key: "netContents", label: "Net contents" },
  { key: "producerNameAddress", label: "Producer / bottler / importer" },
  { key: "countryOfOrigin", label: "Country of origin" },
  { key: "governmentWarning", label: "Government Warning" },
];

export function ExtractedTextDialog({
  fields,
  open,
  onOpenChange,
}: {
  fields: LabelFields | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Extracted label text</DialogTitle>
          <DialogDescription className="text-base">
            Raw fields returned by the vision extraction step, with image-quality notes surfaced for
            agent judgment.
          </DialogDescription>
        </DialogHeader>

        {fields ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                Extraction confidence
              </p>
              <p className="mt-1 text-3xl font-black">{Math.round(fields.confidence * 100)}%</p>
              {fields.imageQualityNotes.length ? (
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {fields.imageQualityNotes.join("; ")}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {labelFields.map(({ key, label }) => (
                <div key={key} className="min-w-0 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">
                    {typeof fields[key] === "string" && fields[key] ? fields[key] : "Not found"}
                  </p>
                </div>
              ))}
            </div>

            {fields.additionalText.length ? (
              <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Other text
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-slate-900">
                  {fields.additionalText.join("; ")}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
