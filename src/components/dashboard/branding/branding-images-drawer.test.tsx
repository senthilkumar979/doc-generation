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

vi.mock("@/actions/upsert-org-brand-image", () => ({
  upsertOrgBrandImageAction: vi.fn(),
  deleteOrgBrandImageAction: vi.fn(),
}));

import { deleteOrgBrandImageAction, upsertOrgBrandImageAction } from "@/actions/upsert-org-brand-image";

import type { OrgBrandImageRow } from "@/lib/branding/org-brand-schema";

import { BrandingImagesDrawer } from "./branding-images-drawer";

function pngFile() {
  return new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "a.png", { type: "image/png" });
}

function clickOutlineClose(dialog: HTMLElement, user: ReturnType<(typeof userEvent)["setup"]>) {
  const target = [...dialog.querySelectorAll("button")].find(
    (b) => b.textContent?.trim() === "Close" && !b.querySelector("svg"),
  );
  if (!target) throw new Error('footer "Close" control not found');
  return user.click(target);
}

const image = {
  id: "img-9",
  org_id: "org-1",
  label: "",
  image_type: "hero" as const,
  image_url: "https://cdn.example/z.png",
  updated_at: "t",
} satisfies OrgBrandImageRow;

describe("BrandingImagesDrawer", () => {
  beforeEach(() => {
    vi.mocked(upsertOrgBrandImageAction).mockResolvedValue({ ok: true });
    vi.mocked(deleteOrgBrandImageAction).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows empty copy when no images exist", () => {
    render(<BrandingImagesDrawer open onOpenChange={vi.fn()} images={[]} />);

    expect(screen.getByText(/No additional images yet/i)).toBeInTheDocument();
  });

  it("lists thumbnails and exposes edit/delete handlers", async () => {
    const user = userEvent.setup();

    render(<BrandingImagesDrawer open onOpenChange={vi.fn()} images={[image]} />);

    expect(screen.getByRole("img", { name: /hero$/i })).toHaveAttribute("src", "https://cdn.example/z.png");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteOrgBrandImageAction).toHaveBeenCalled();
    expect(notifyMocks.success).toHaveBeenCalledWith("Additional image removed");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("clears editing state via the ghost button while preparing a new asset", async () => {
    const user = userEvent.setup();

    render(<BrandingImagesDrawer open onOpenChange={vi.fn()} images={[image]} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("surfaces server errors during delete", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteOrgBrandImageAction).mockResolvedValue({ error: "denied" });

    render(<BrandingImagesDrawer open onOpenChange={vi.fn()} images={[image]} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(notifyMocks.error).toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("denied");
  });

  it("submits a freshly added image entry", async () => {
    const user = userEvent.setup();

    render(<BrandingImagesDrawer open onOpenChange={vi.fn()} images={[]} />);

    await user.type(screen.getByLabelText(/^Label$/i), "Hero");
    await user.upload(screen.getByLabelText(/^Image file$/i), pngFile());
    await user.click(screen.getByRole("button", { name: "Add image" }));

    expect(upsertOrgBrandImageAction).toHaveBeenCalled();
    expect(notifyMocks.success).toHaveBeenCalledWith("Additional image added");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("surfaces save errors from the upsert action", async () => {
    const user = userEvent.setup();
    vi.mocked(upsertOrgBrandImageAction).mockResolvedValue({ error: "invalid" });

    render(<BrandingImagesDrawer open onOpenChange={vi.fn()} images={[]} />);

    await user.type(screen.getByLabelText(/^Label$/i), "Hero");
    await user.upload(screen.getByLabelText(/^Image file$/i), pngFile());
    await user.click(screen.getByRole("button", { name: "Add image" }));

    expect(notifyMocks.error).toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("invalid");
  });

  it("dismisses via the dialog close action", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<BrandingImagesDrawer open onOpenChange={onOpenChange} images={[]} />);

    await clickOutlineClose(screen.getByRole("dialog"), user);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
