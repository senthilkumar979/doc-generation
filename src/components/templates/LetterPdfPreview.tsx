"use client";

import dynamic from "next/dynamic";

import type { LetterPayload } from "@/lib/templates/payload-schema";

import { LetterPdfDocument } from "./LetterPdfDocument";

const PDFViewer = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
      Loading preview…
    </div>
  ),
});

export interface LetterPdfPreviewProps {
  payload: LetterPayload;
}

export function LetterPdfPreview({ payload }: LetterPdfPreviewProps) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <LetterPdfDocument payload={payload} />
      </PDFViewer>
    </div>
  );
}
