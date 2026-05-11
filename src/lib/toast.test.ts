import { afterEach, describe, expect, it, vi } from "vitest";

const gooeyToastMocks = vi.hoisted(() => {
  const gooeyToast = Object.assign(vi.fn(() => "loading-id"), {
    success: vi.fn(() => "success-id"),
    error: vi.fn(() => "error-id"),
    info: vi.fn(() => "info-id"),
    warning: vi.fn(() => "warning-id"),
  });
  return { gooeyToast };
});

vi.mock("goey-toast", () => ({
  gooeyToast: gooeyToastMocks.gooeyToast,
}));

import { gooeyToast } from "goey-toast";

import { notify, toast } from "./toast";

describe("notify", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to gooeyToast variants with shared options", () => {
    expect(notify.success("Done")).toBe("success-id");
    expect(vi.mocked(gooeyToast.success)).toHaveBeenCalledWith(
      "Done",
      expect.objectContaining({
        bounce: 0.45,
        borderWidth: 2,
        timing: expect.any(Object),
      }),
    );

    expect(notify.error("Bad", { description: "x" })).toBe("error-id");
    expect(vi.mocked(gooeyToast.error)).toHaveBeenCalledWith(
      "Bad",
      expect.objectContaining({ description: "x" }),
    );

    expect(notify.info("Hi")).toBe("info-id");
    expect(notify.warning("Careful")).toBe("warning-id");
  });

  it("exposes loading through the base gooeyToast call", () => {
    expect(notify.loading("Wait")).toBe("loading-id");
    expect(vi.mocked(gooeyToast)).toHaveBeenCalledWith("Wait", expect.objectContaining({ bounce: 0.45 }));
  });

  it("re-exports gooeyToast as toast", () => {
    expect(toast).toBe(gooeyToast);
  });
});
