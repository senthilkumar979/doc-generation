/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StyleSheet: { create: (s: Record<string, unknown>) => s },
  PDFViewer: ({ children }: { children: React.ReactNode }) => <div data-testid="viewer">{children}</div>,
}));

import { LetterPdfPreview } from "./LetterPdfPreview";

describe("LetterPdfPreview", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a PDF viewer with letter content", async () => {
    render(<LetterPdfPreview payload={{ subject: "Subject", content: "Line" }} />);
    await waitFor(() => expect(screen.getByTestId("viewer")).toBeInTheDocument());
    expect(screen.getByText("Subject")).toBeInTheDocument();
    expect(screen.getByText("Line")).toBeInTheDocument();
  });
});
