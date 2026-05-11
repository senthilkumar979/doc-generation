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

import { BrandingMediaDrawer } from "./branding-media-drawer";

describe("BrandingMediaDrawer", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("submits logos and closes on success", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandProfileSectionAction).mockResolvedValue({ ok: true });
    const onOpenChange = vi.fn();

    render(
      <BrandingMediaDrawer
        open
        onOpenChange={onOpenChange}
        values={{ logoUrl: "https://cdn.example/l.png", iconUrl: "https://cdn.example/i.png" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(upsertOrgBrandProfileSectionAction).toHaveBeenCalled();
    expect(notifyMocks.success).toHaveBeenCalledWith("Core media updated", expect.any(Object));
    expect(refreshMock).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("surfaces branding save errors inline", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandProfileSectionAction).mockResolvedValue({ error: "reject" });

    render(
      <BrandingMediaDrawer open onOpenChange={vi.fn()} values={{ logoUrl: "", iconUrl: "" }} />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(notifyMocks.error).toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("reject");
  });

  it("dismisses immediately when cancel is chosen", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <BrandingMediaDrawer
        open
        onOpenChange={onOpenChange}
        values={{ logoUrl: "https://cdn.example/logo.png", iconUrl: "" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
