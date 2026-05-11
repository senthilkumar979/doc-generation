/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrandingSectionCard } from "./branding-section-card";

describe("BrandingSectionCard", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('labels the action "Add" when no row values exist', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <BrandingSectionCard
        title="Identity"
        description="Desc"
        rows={[{ label: "Company", value: null }]}
        onEdit={onEdit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('shows "Edit" when at least one value is populated', () => {
    render(
      <BrandingSectionCard
        title="Identity"
        description="Desc"
        rows={[
          { label: "Company", value: "" },
          { label: "Tagline", value: "Better docs" },
        ]}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("renders a swatch preview for palette labels", () => {
    render(
      <BrandingSectionCard
        title="Colors"
        description="_palette"
        rows={[{ label: "Primary", value: "#336699" }]}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("#336699")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders image preview for Logo label", () => {
    render(
      <BrandingSectionCard
        title="Media"
        description="Logo"
        rows={[{ label: "Logo", value: "https://cdn.example/logo.png" }]}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByRole("img", { name: "Logo preview" })).toHaveAttribute(
      "src",
      "https://cdn.example/logo.png",
    );
  });

  it("invokes onRemove after confirming the destructive control", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", vi.fn(() => true));
    const onRemove = vi.fn().mockResolvedValue(undefined);

    render(
      <BrandingSectionCard
        title="Media"
        description="Logo"
        rows={[
          {
            label: "Logo",
            value: "https://cdn.example/logo.png",
            onRemove,
          },
        ]}
        onEdit={vi.fn()}
      />,
    );

    const preview = screen.getByRole("img", { name: "Logo preview" });
    await user.hover(preview.parentElement ?? preview);

    await user.click(screen.getByRole("button", { name: /remove logo image/i }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("shows muted empty copy when rows are empty", () => {
    render(
      <BrandingSectionCard title="Extras" description="Nothing here" rows={[]} emptyText="None yet" onEdit={vi.fn()} />,
    );
    expect(screen.getByText("None yet")).toBeInTheDocument();
  });

  it("renders dash when a cell lacks text", () => {
    render(
      <BrandingSectionCard title="X" description="y" rows={[{ label: "Company", value: "   " }]} onEdit={vi.fn()} />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
