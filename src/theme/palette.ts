/** DocRail enterprise palette — source of truth for Storybook + documentation. Mirrors `src/app/globals.css` @theme tokens. */
export const palette = {
  brand: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    secondary: "#475569",
    accent: "#06B6D4",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#0284C7",
  },
  surface: {
    bg: "#0F172A",
    card: "#1E293B",
    border: "#334155",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#CBD5E1",
    muted: "#64748B",
  },
} as const;
