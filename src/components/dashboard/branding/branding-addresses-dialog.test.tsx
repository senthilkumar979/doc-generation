/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("@/actions/upsert-org-brand-address", () => ({
  upsertOrgBrandAddressAction: vi.fn(),
}));

import { upsertOrgBrandAddressAction } from "@/actions/upsert-org-brand-address";

import type { OrgBrandAddressRow } from "@/lib/branding/org-brand-schema";

import { BrandingAddressesDialog } from "./branding-addresses-dialog";

function clickOutlineClose(dialog: HTMLElement, user: ReturnType<(typeof userEvent)["setup"]>) {
  const target = [...dialog.querySelectorAll("button")].find(
    (b) => b.textContent?.trim() === "Close" && !b.querySelector("svg"),
  );
  if (!target) throw new Error('footer "Close" control not found');
  return user.click(target);
}

const sampleAddress = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  org_id: "org-1",
  label: "HQ",
  address_line1: "1 Wharf",
  address_line2: null,
  city: "Boston",
  region: "MA",
  postal_code: "02101",
  country: "US",
  is_primary: false,
  updated_at: "t",
} satisfies OrgBrandAddressRow;

describe("BrandingAddressesDialog", () => {
  beforeEach(() => {
    vi.mocked(upsertOrgBrandAddressAction).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('uses "Add address" copy when opening without a seeded row', async () => {
    const user = userEvent.setup();

    render(
      <BrandingAddressesDialog open onOpenChange={vi.fn()} addresses={[sampleAddress]} />,
    );

    expect(screen.getByRole("button", { name: "Add address" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add address" }));
    expect(upsertOrgBrandAddressAction).toHaveBeenCalled();
  });

  it("pre-fills the form when a seed id is provided", () => {
    render(
      <BrandingAddressesDialog
        open
        onOpenChange={vi.fn()}
        addresses={[sampleAddress]}
        seedEditAddressId={sampleAddress.id}
      />,
    );

    expect(screen.getByLabelText(/city/i)).toHaveValue("Boston");
  });

  it("treats a missing seed lookup as create mode fields", () => {
    render(
      <BrandingAddressesDialog
        open
        onOpenChange={vi.fn()}
        addresses={[sampleAddress]}
        seedEditAddressId="b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99"
      />,
    );

    expect(screen.getByRole("button", { name: "Add address" })).toBeInTheDocument();
  });

  it("shows update copy when seeded", async () => {
    const user = userEvent.setup();

    render(
      <BrandingAddressesDialog
        open
        onOpenChange={vi.fn()}
        addresses={[sampleAddress]}
        seedEditAddressId={sampleAddress.id}
      />,
    );

    expect(screen.getByRole("button", { name: /update address/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /update address/i }));
    expect(notifyMocks.success).toHaveBeenCalledWith("Address updated", expect.any(Object));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("surfaces failures from the upsert action", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandAddressAction).mockResolvedValue({ error: "bad validation" });

    render(<BrandingAddressesDialog open onOpenChange={vi.fn()} addresses={[sampleAddress]} />);

    await user.click(screen.getByRole("button", { name: "Add address" }));
    expect(notifyMocks.error).toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("bad validation");
  });

  it("calls onOpenChange(false) from the footer close control", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<BrandingAddressesDialog open onOpenChange={onOpenChange} addresses={[sampleAddress]} />);

    await clickOutlineClose(screen.getByRole("dialog"), user);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
