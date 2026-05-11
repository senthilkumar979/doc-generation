/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const notifyMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/lib/toast", () => ({
  notify: notifyMocks,
}));

vi.mock("@/actions/upsert-org-brand-profile", () => ({
  upsertOrgBrandProfileSectionAction: vi.fn(),
}));

import { upsertOrgBrandProfileSectionAction } from "@/actions/upsert-org-brand-profile";

import { BrandingEditDialog } from "./branding-edit-dialog";

const baseFields = [{ name: "companyName", label: "Company name" }] as const;

describe("BrandingEditDialog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("submits identity changes and notifies on success", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandProfileSectionAction).mockResolvedValue({ ok: true });
    const onOpenChange = vi.fn();

    render(
      <BrandingEditDialog
        open
        onOpenChange={onOpenChange}
        title="Edit identity"
        description="About your company."
        section="identity"
        values={{ companyName: "Acme" }}
        fields={[...baseFields]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(upsertOrgBrandProfileSectionAction).toHaveBeenCalled();
    expect(notifyMocks.success).toHaveBeenCalledWith("Identity updated");
    expect(refreshMock).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses the colors toast variant", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandProfileSectionAction).mockResolvedValue({ ok: true });

    render(
      <BrandingEditDialog
        open
        onOpenChange={vi.fn()}
        title="Colors"
        description="Hex palette"
        section="colors"
        values={{ primaryColor: "#223344", secondaryColor: "", accentColor: "" }}
        fields={[
          { name: "primaryColor", label: "Primary color" },
          { name: "secondaryColor", label: "Secondary" },
          { name: "accentColor", label: "Accent" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(notifyMocks.success).toHaveBeenCalledWith("Brand colors updated");
  });

  it("falls back to the core media toast when editing that section shape", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandProfileSectionAction).mockResolvedValue({ ok: true });

    render(
      <BrandingEditDialog
        open
        onOpenChange={vi.fn()}
        title="Media"
        description="URLs"
        section="media"
        values={{ logoUrl: "https://cdn.example/logo.png", iconUrl: "" }}
        fields={[
          { name: "logoUrl", label: "Logo URL", type: "url" },
          { name: "iconUrl", label: "Icon URL", type: "url" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(notifyMocks.success).toHaveBeenCalledWith("Core media URLs updated");
  });

  it("surfaces action errors", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandProfileSectionAction).mockResolvedValue({ error: "no row" });

    render(
      <BrandingEditDialog
        open
        onOpenChange={vi.fn()}
        title="Edit identity"
        description="Company"
        section="identity"
        values={{ companyName: "" }}
        fields={[...baseFields]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(notifyMocks.error).toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("no row");
  });

  it("closes when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <BrandingEditDialog
        open
        onOpenChange={onOpenChange}
        title="Edit identity"
        description="Company"
        section="identity"
        values={{}}
        fields={[...baseFields]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
