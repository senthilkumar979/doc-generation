/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routerMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerMocks.refresh }),
}));

vi.mock("@/actions/create-api-key", () => ({
  createApiKeyAction: vi.fn(),
}));

vi.mock("@/actions/revoke-api-key", () => ({
  revokeApiKeyAction: vi.fn(),
}));

import { createApiKeyAction } from "@/actions/create-api-key";
import { revokeApiKeyAction } from "@/actions/revoke-api-key";

import { ApiKeysPanel } from "./ApiKeysPanel";

describe("ApiKeysPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty state", () => {
    render(<ApiKeysPanel keys={[]} />);
    expect(screen.getByText("No API keys yet.")).toBeInTheDocument();
  });

  it("lists keys and revoke control", () => {
    render(
      <ApiKeysPanel
        keys={[
          {
            id: "kid",
            name: "Prod",
            key_prefix: "docr_live_xx",
            created_at: "2026-05-01T00:00:00.000Z",
            revoked_at: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("Prod")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revoke" })).toBeInTheDocument();
  });

  it("shows revoked row without revoke button", () => {
    render(
      <ApiKeysPanel
        keys={[
          {
            id: "kid",
            name: "Old",
            key_prefix: "docr_live_xx",
            created_at: "2026-05-01T00:00:00.000Z",
            revoked_at: "2026-05-02T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("Revoked")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Revoke" })).toBeNull();
  });

  it("surfaces create errors from the server action", async () => {
    vi.mocked(createApiKeyAction).mockResolvedValue({ error: "save failed" });
    render(<ApiKeysPanel keys={[]} />);

    fireEvent.change(screen.getByPlaceholderText("Production PDFs"), { target: { value: "Prod" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate API key/ }));

    await waitFor(() => expect(screen.getByText("save failed")).toBeInTheDocument());
  });

  it("shows the one-time secret after create and dismisses it", async () => {
    vi.mocked(createApiKeyAction).mockResolvedValue({
      revealed: { id: "k1", plaintext: "docr_live_secretvalue", name: "Prod" },
    });
    render(<ApiKeysPanel keys={[]} />);

    fireEvent.change(screen.getByPlaceholderText("Production PDFs"), { target: { value: "Prod" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate API key/ }));

    await waitFor(() => expect(screen.getByText("Copy this secret now")).toBeInTheDocument());
    expect(screen.getByText("docr_live_secretvalue")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /saved it/i }));
    expect(screen.queryByText("Copy this secret now")).toBeNull();
  });

  it("shows Creating while the action is in flight", async () => {
    let complete: () => void;
    const pending = new Promise<void>((resolve) => {
      complete = resolve;
    });
    vi.mocked(createApiKeyAction).mockImplementation(
      async () =>
        pending.then(() => ({
          revealed: { id: "k1", plaintext: "x", name: "n" },
        })),
    );

    render(<ApiKeysPanel keys={[]} />);
    fireEvent.change(screen.getByPlaceholderText("Production PDFs"), { target: { value: "L" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate API key/ }));

    expect(await screen.findByRole("button", { name: "Creating…" })).toBeDisabled();
    complete!();

    await waitFor(() => expect(screen.getByText("Copy this secret now")).toBeInTheDocument());
  });

  it("ignores neither error nor revealed without changing panels", async () => {
    vi.mocked(createApiKeyAction).mockResolvedValue({});
    render(<ApiKeysPanel keys={[]} />);

    fireEvent.change(screen.getByPlaceholderText("Production PDFs"), { target: { value: "L" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate API key/ }));

    await waitFor(() => expect(createApiKeyAction).toHaveBeenCalled());
    expect(screen.queryByText("Copy this secret now")).toBeNull();
  });

  it("shows revoke errors from the server action", async () => {
    vi.mocked(revokeApiKeyAction).mockResolvedValue({ error: "cannot revoke" });
    render(
      <ApiKeysPanel
        keys={[
          {
            id: "kid",
            name: "Prod",
            key_prefix: "docr_live_xx",
            created_at: "2026-05-01T00:00:00.000Z",
            revoked_at: null,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    await waitFor(() => expect(screen.getByText("cannot revoke")).toBeInTheDocument());
  });

  it("shows Revoking while revoke is pending", async () => {
    let finish: () => void;
    const gate = new Promise<void>((resolve) => {
      finish = resolve;
    });
    vi.mocked(revokeApiKeyAction).mockImplementation(async () =>
      gate.then(() => ({ ok: true as const })),
    );

    render(
      <ApiKeysPanel
        keys={[
          {
            id: "kid",
            name: "Prod",
            key_prefix: "docr_live_xx",
            created_at: "2026-05-01T00:00:00.000Z",
            revoked_at: null,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    expect(await screen.findByText("Revoking…")).toBeInTheDocument();

    finish!();
    await waitFor(() => expect(screen.queryByText("Revoking…")).toBeNull());
  });
});
