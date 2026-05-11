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
  deleteOrgBrandAddressAction: vi.fn(),
}));

import { deleteOrgBrandAddressAction } from "@/actions/upsert-org-brand-address";

import type { OrgBrandAddressRow } from "@/lib/branding/org-brand-schema";

import { BrandingAddressPanel } from "./branding-address-panel";

function clickOutlineClose(dialog: HTMLElement, user: ReturnType<(typeof userEvent)["setup"]>) {
  const target = [...dialog.querySelectorAll("button")].find(
    (b) => b.textContent?.trim() === "Close" && !b.querySelector("svg"),
  );
  if (!target) throw new Error('footer "Close" control not found');
  return user.click(target);
}

const row = {
  id: "addr-1",
  org_id: "org-9",
  label: "",
  address_line1: "10 Main St",
  address_line2: null,
  city: "Boston",
  region: "MA",
  postal_code: "02101",
  country: "US",
  is_primary: false,
  updated_at: "t",
} satisfies OrgBrandAddressRow;

describe("BrandingAddressPanel", () => {
  beforeEach(() => {
    vi.mocked(deleteOrgBrandAddressAction).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows an untitled label fallback and summary text", () => {
    render(<BrandingAddressPanel addresses={[row]} />);
    expect(screen.getByText("Untitled address")).toBeInTheDocument();
    expect(screen.getByText(/10 Main St/i)).toBeInTheDocument();
  });

  it("lets users edit an existing address by opening the seeded dialog", async () => {
    const user = userEvent.setup();

    render(<BrandingAddressPanel addresses={[row]} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText(/city/i)).toHaveValue("Boston");
  });

  it("handles delete successes with a toast and refresh", async () => {
    const user = userEvent.setup();

    render(<BrandingAddressPanel addresses={[row]} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteOrgBrandAddressAction).toHaveBeenCalled();
    expect(notifyMocks.success).toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows inline errors coming back from deletes", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteOrgBrandAddressAction).mockResolvedValue({ error: "blocked" });

    render(<BrandingAddressPanel addresses={[row]} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(notifyMocks.error).toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("blocked");
  });

  it("clears seeded edits when closing the footer close control", async () => {
    const user = userEvent.setup();

    render(<BrandingAddressPanel addresses={[row]} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await clickOutlineClose(screen.getByRole("dialog"), user);

    await user.click(screen.getByRole("button", { name: "Add address" }));
    expect(screen.getByRole("button", { name: "Add address" })).toBeInTheDocument();
  });
});
