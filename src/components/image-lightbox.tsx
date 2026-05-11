"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ImageLightbox({
  src,
  title = "Label image",
  open,
  onOpenChange,
}: {
  src: string | null;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Inspect the uploaded label at a larger size.</DialogDescription>
        </DialogHeader>
        {src ? (
          <div className="relative h-[70vh] overflow-hidden rounded-3xl bg-slate-100">
            <Image src={src} alt={title} fill className="object-contain" />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
