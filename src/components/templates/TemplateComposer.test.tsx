/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routerMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerMocks.refresh }),
}));

vi.mock("@/actions/create-template", () => ({
  createTemplateAction: vi.fn(),
}));

import { createTemplateAction } from "@/actions/create-template";

import { TemplateComposer } from "./TemplateComposer";

describe("TemplateComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("submits blanks and refreshes router", async () => {
    vi.mocked(createTemplateAction).mockResolvedValue({ ok: true });
    render(<TemplateComposer />);

    fireEvent.change(screen.getByLabelText(/^Type/), { target: { value: "blank" } });
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Empty shell" } });
    fireEvent.click(screen.getByRole("button", { name: /Create template/i }));

    await waitFor(() => expect(createTemplateAction).toHaveBeenCalled());
    expect(routerMocks.refresh).toHaveBeenCalled();
  });

  it("shows validation errors returned by the server action", async () => {
    vi.mocked(createTemplateAction).mockResolvedValue({ error: "boom" });
    render(<TemplateComposer />);

    fireEvent.change(screen.getByLabelText(/^Type/), { target: { value: "blank" } });
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Letter A" } });
    fireEvent.click(screen.getByRole("button", { name: /Create template/i }));

    await waitFor(() => expect(screen.getByText("boom")).toBeInTheDocument());
  });
});
