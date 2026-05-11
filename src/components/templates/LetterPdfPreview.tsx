"use client";

import dynamic from "next/dynamic";

import { Spinner } from "@/components/ui/spinner";
import type { LetterPayload } from "@/lib/templates/payload-schema";

import { LetterPdfDocument } from "./LetterPdfDocument";

const PDFViewer = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
      <Spinner />
      Loading preview…
    </div>
  ),
});

export interface LetterPdfPreviewProps {
  payload: LetterPayload;
}

export function LetterPdfPreview({ payload }: LetterPdfPreviewProps) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-border bg-muted/50 shadow-[inset_0_1px_0_rgb(255_255_255_/_5%)]">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <LetterPdfDocument payload={payload} />
      </PDFViewer>
    </div>
  );
}
