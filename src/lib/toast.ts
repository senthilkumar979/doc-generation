import { gooeyToast, type GooeyPromiseData, type GooeyToastOptions } from "goey-toast";

type NotifyExtras = Pick<GooeyToastOptions, "description" | "duration" | "action">;

const notifyOptions: GooeyToastOptions = {
  bounce: 0.45,
  borderColor: '#E0E0E0',
  borderWidth: 2,
  timing: { displayDuration: 2000 },
};

export const notify = {
  success(message: string, options?: NotifyExtras) {
    return gooeyToast.success(message, { ...notifyOptions, ...options });
  },
  error(message: string, options?: NotifyExtras) {
    return gooeyToast.error(message, { ...notifyOptions, ...options });
  },
  info(message: string, options?: NotifyExtras) {
    return gooeyToast.info(message, { ...notifyOptions, ...options });
  },
  warning(message: string, options?: NotifyExtras) {
    return gooeyToast.warning(message, { ...notifyOptions, ...options });
  },
  /** Neutral toast; use for indefinite “working…” style messages or swap to `toast.promise`. */
  loading(message: string, options?: Pick<GooeyToastOptions, "description" | "duration">) {
    return gooeyToast(message, { ...notifyOptions, ...options });
  },
};

export type { GooeyPromiseData, GooeyToastOptions };

/** Same API as `gooeyToast` — use `.promise`, `.dismiss`, `.update`, etc. */
export const toast = gooeyToast;
