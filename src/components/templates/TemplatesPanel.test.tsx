/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./TemplateComposer", () => ({
  TemplateComposer: () => <div data-testid="composer" />,
}));

vi.mock("./TemplateRows", () => ({
  TemplateRows: () => <div data-testid="rows" />,
}));

import { TemplatesPanel } from "./TemplatesPanel";

describe("TemplatesPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders composer and rows zones", () => {
    render(<TemplatesPanel templates={[]} />);
    expect(screen.getByTestId("composer")).toBeInTheDocument();
    expect(screen.getByTestId("rows")).toBeInTheDocument();
  });
});
