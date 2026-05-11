/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const user = userEvent.setup();
    vi.mocked(createTemplateAction).mockResolvedValue({ ok: true });
    render(<TemplateComposer />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /^Blank$/ }));
    await user.type(screen.getByLabelText(/^Name/), "Empty shell");
    await user.click(screen.getByRole("button", { name: /Create template/i }));

    await waitFor(() => expect(createTemplateAction).toHaveBeenCalled());
    expect(routerMocks.refresh).toHaveBeenCalled();
  });

  it("shows validation errors returned by the server action", async () => {
    const user = userEvent.setup();
    vi.mocked(createTemplateAction).mockResolvedValue({ error: "boom" });
    render(<TemplateComposer />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /^Blank$/ }));
    await user.type(screen.getByLabelText(/^Name/), "Letter A");
    await user.click(screen.getByRole("button", { name: /Create template/i }));

    await waitFor(() => expect(screen.getByText("boom")).toBeInTheDocument());
  });
});
