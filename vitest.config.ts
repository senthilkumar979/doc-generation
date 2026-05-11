import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/lib/**/*.ts",
        "src/actions/**/*.ts",
        "src/components/dashboard/**/*.tsx",
        "src/components/navigation/**/*.tsx",
        "src/components/releases/**/*.tsx",
        "src/components/site/**/*.tsx",
        "src/components/templates/**/*.tsx",
        // Unit-tested UI primitive (remainder of `components/ui` stays out of thresholds).
        "src/components/ui/breadcrumb.tsx",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/types.ts",
        "**/*.stories.tsx",
        "src/middleware.ts",
      ],
      thresholds: {
        lines: 95,
        branches: 90,
        functions: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
