/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), prefetch: vi.fn() }),
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
  removeOrgBrandCoreMediaAction: vi.fn(),
}));

vi.mock("@/actions/upsert-org-brand-address", () => ({
  upsertOrgBrandAddressAction: vi.fn(),
  deleteOrgBrandAddressAction: vi.fn(),
}));

vi.mock("@/actions/upsert-org-brand-image", () => ({
  upsertOrgBrandImageAction: vi.fn(),
  deleteOrgBrandImageAction: vi.fn(),
}));

import { deleteOrgBrandAddressAction, upsertOrgBrandAddressAction } from "@/actions/upsert-org-brand-address";
import { deleteOrgBrandImageAction, upsertOrgBrandImageAction } from "@/actions/upsert-org-brand-image";
import { removeOrgBrandCoreMediaAction, upsertOrgBrandProfileSectionAction } from "@/actions/upsert-org-brand-profile";

import type { OrgBrandImageRow, OrgBrandProfileRow } from "@/lib/branding/org-brand-schema";

import { BrandingSettingsPanel } from "./branding-settings-panel";

function clickOutlineClose(dialog: HTMLElement, user: ReturnType<(typeof userEvent)["setup"]>) {
  const target = [...dialog.querySelectorAll("button")].find(
    (b) => b.textContent?.trim() === "Close" && !b.querySelector("svg"),
  );
  if (!target) throw new Error('footer "Close" control not found');
  return user.click(target);
}

function cardRoot(title: string): HTMLElement {
  const heading = screen.getByRole("heading", { name: title });
  const root = heading.closest("[data-slot=\"card\"]");
  if (!root) throw new Error(`card not found for ${title}`);
  return root as HTMLElement;
}

describe("BrandingSettingsPanel", () => {
  beforeEach(() => {
    vi.mocked(upsertOrgBrandProfileSectionAction).mockResolvedValue({ ok: true });
    vi.mocked(removeOrgBrandCoreMediaAction).mockResolvedValue({ ok: true });
    vi.mocked(upsertOrgBrandAddressAction).mockResolvedValue({ ok: true });
    vi.mocked(deleteOrgBrandAddressAction).mockResolvedValue({ ok: true });
    vi.mocked(upsertOrgBrandImageAction).mockResolvedValue({ ok: true });
    vi.mocked(deleteOrgBrandImageAction).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens the media and image drawers using the trailing Add buttons", async () => {
    const user = userEvent.setup();

    render(<BrandingSettingsPanel profile={null} addresses={[]} images={[]} />);

    await user.click(within(cardRoot("Core media")).getByRole("button", { name: "Add" }));
    expect(screen.getByRole("heading", { name: /brand logo & icon/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await user.click(within(cardRoot("Additional images")).getByRole("button", { name: "Add" }));
    expect(screen.getByRole("heading", { name: /additional images/i })).toBeInTheDocument();
    await clickOutlineClose(screen.getByRole("dialog"), user);
  });

  it("supports inline identity edits from the Identity card", async () => {
    const user = userEvent.setup();

    render(<BrandingSettingsPanel profile={null} addresses={[]} images={[]} />);

    await user.click(screen.getAllByRole("button", { name: "Add" })[0]);
    expect(screen.getByRole("heading", { name: /edit identity/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
  });

  it("dismisses the colors edit dialog with the escape key", async () => {
    const user = userEvent.setup();

    render(<BrandingSettingsPanel profile={null} addresses={[]} images={[]} />);

    await user.click(within(cardRoot("Brand colors")).getByRole("button", { name: "Add" }));
    expect(screen.getByRole("heading", { name: /edit brand colors/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("heading", { name: /edit brand colors/i })).not.toBeInTheDocument();
  });

  it("surfaces seeded additional image rows inside the teaser card", () => {
    const images = [
      {
        id: "im-77",
        org_id: "org-x",
        label: "Hero art",
        image_type: "hero" as const,
        image_url: "https://cdn.example/h.png",
        updated_at: "t",
      },
    ] satisfies OrgBrandImageRow[];

    render(<BrandingSettingsPanel profile={null} addresses={[]} images={images} />);

    expect(screen.getByText("Hero art")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Hero art preview" })).toHaveAttribute(
      "src",
      "https://cdn.example/h.png",
    );
  });

  it("falls back when an additional image lacks a label", () => {
    render(
      <BrandingSettingsPanel
        profile={null}
        addresses={[]}
        images={[
          {
            id: "im-plain",
            org_id: "org-x",
            label: null,
            image_type: "general",
            image_url: "https://cdn.example/p.png",
            updated_at: "t",
          },
        ]}
      />,
    );

    expect(within(cardRoot("Additional images")).getByText(/untitled image/i)).toBeInTheDocument();
  });

  it("uses multiline fields for editable taglines inside the Identity dialog", async () => {
    const user = userEvent.setup();

    render(<BrandingSettingsPanel profile={null} addresses={[]} images={[]} />);

    await user.click(within(cardRoot("Identity")).getByRole("button", { name: "Add" }));

    expect(screen.getByLabelText(/^Tagline$/i).tagName).toBe("TEXTAREA");
  });

  it("renders profile-backed identity and color rows", () => {
    const profile = {
      id: "bp-1",
      org_id: "org-x",
      company_name: "DocRail Demo",
      legal_name: "DocRail LLC",
      tagline: "Docs that move",
      website_url: "https://docrail.example",
      support_email: "hi@docrail.example",
      primary_color: "#111111",
      secondary_color: "#222222",
      accent_color: "#333333",
      logo_url: null,
      icon_url: null,
      updated_at: "t",
    } satisfies OrgBrandProfileRow;

    render(<BrandingSettingsPanel profile={profile} addresses={[]} images={[]} />);

    expect(screen.getByText("DocRail Demo")).toBeInTheDocument();
    expect(screen.getByText("#111111")).toBeInTheDocument();
  });
});
