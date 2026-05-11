/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routerMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerMocks.refresh }),
}));

vi.mock("@/actions/delete-template", () => ({
  deleteTemplateAction: vi.fn(),
}));

vi.mock("@/actions/update-template", () => ({
  updateTemplateAction: vi.fn(),
}));

vi.mock("./LetterPdfPreview", () => ({
  LetterPdfPreview: () => <div data-testid="stub-pdf-viewer" />,
}));

import { deleteTemplateAction } from "@/actions/delete-template";
import { updateTemplateAction } from "@/actions/update-template";

import { TemplateRows } from "./TemplateRows";

describe("TemplateRows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty-state copy", () => {
    render(<TemplateRows templates={[]} />);
    expect(screen.getByText("No templates yet.")).toBeInTheDocument();
  });

  it("explains blank templates have no preview", () => {
    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Empty",
            template_type: "blank",
            payload: {},
          },
        ]}
      />,
    );
    expect(screen.getByText(/Blank templates have nothing to preview/i)).toBeInTheDocument();
  });

  it("flags invalid stored letter payloads", () => {
    render(
      <TemplateRows
        templates={[
          {
            id: "bad",
            name: "Broken",
            template_type: "letter",
            payload: {},
          },
        ]}
      />,
    );
    expect(screen.getByText(/failed validation/i)).toBeInTheDocument();
  });

  it("toggles preview stub for healthy letters", async () => {
    render(
      <TemplateRows
        templates={[
          {
            id: "ok",
            name: "Fine",
            template_type: "letter",
            payload: { subject: "S", content: "C" },
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Show PDF preview/i }));
    await waitFor(() => expect(screen.getByTestId("stub-pdf-viewer")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Hide PDF preview/i }));
    expect(screen.queryByTestId("stub-pdf-viewer")).toBeNull();
  });

  it("surfaces delete failures", async () => {
    vi.mocked(deleteTemplateAction).mockResolvedValue({ error: "delete failed" });
    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "One",
            template_type: "blank",
            payload: {},
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(screen.getByText("delete failed")).toBeInTheDocument());
  });

  it("deletes after confirmation", async () => {
    vi.mocked(deleteTemplateAction).mockResolvedValue({ ok: true });
    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "One",
            template_type: "blank",
            payload: {},
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(deleteTemplateAction).toHaveBeenCalled());
    expect(routerMocks.refresh).toHaveBeenCalled();
  });

  it("surfaces failed updates", async () => {
    vi.mocked(updateTemplateAction).mockResolvedValue({ error: "save failed" });
    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "One",
            template_type: "blank",
            payload: {},
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByText("save failed")).toBeInTheDocument());
  });

  it("skips delete when the user cancels confirmation", async () => {
    globalThis.confirm = vi.fn(() => false);

    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "One",
            template_type: "blank",
            payload: {},
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteTemplateAction).not.toHaveBeenCalled();
  });

  it("submits letter edits including subject/content", async () => {
    vi.mocked(updateTemplateAction).mockResolvedValue({ ok: true });
    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Note",
            template_type: "letter",
            payload: { subject: "S", content: "C" },
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByDisplayValue("S"), { target: { value: "New subject" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateTemplateAction).toHaveBeenCalled());
    expect(routerMocks.refresh).toHaveBeenCalled();
  });

  it("submits edits through the server action", async () => {
    vi.mocked(updateTemplateAction).mockResolvedValue({ ok: true });
    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "One",
            template_type: "blank",
            payload: {},
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByDisplayValue("One"), { target: { value: "Renamed" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateTemplateAction).toHaveBeenCalled());
    expect(routerMocks.refresh).toHaveBeenCalled();
  });

  it("leaves edit mode when cancel is pressed", () => {
    render(
      <TemplateRows
        templates={[
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "One",
            template_type: "blank",
            payload: {},
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
