/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownView } from "./MarkdownView";

describe("MarkdownView", () => {
  it("renders sanitized markdown", () => {
    render(<MarkdownView source="# Hi\n\n**Bold**" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hi");
    expect(screen.getByText("Bold")).toBeInTheDocument();
  });
});
