/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}));

import { LetterPdfDocument } from "./LetterPdfDocument";

describe("LetterPdfDocument", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders subject and body text", () => {
    render(<LetterPdfDocument payload={{ subject: "Hi", content: "There" }} />);
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByText("There")).toBeInTheDocument();
  });
});
