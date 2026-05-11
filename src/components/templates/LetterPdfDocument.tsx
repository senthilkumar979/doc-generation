"use client";

import { Document, Page, StyleSheet, Text } from "@react-pdf/renderer";

import type { LetterPayload } from "@/lib/templates/payload-schema";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 11 },
  subject: { fontSize: 14, marginBottom: 16 },
  content: { lineHeight: 1.45 },
});

export interface LetterPdfDocumentProps {
  payload: LetterPayload;
}

export function LetterPdfDocument({ payload }: LetterPdfDocumentProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.subject}>{payload.subject}</Text>
        <Text style={styles.content}>{payload.content}</Text>
      </Page>
    </Document>
  );
}
