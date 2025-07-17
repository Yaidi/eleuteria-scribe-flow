import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    setupFiles: "./test/setup-unit.ts",
    environment: "jsdom",
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["test/smoke-test/**", "release/**"],
    coverage: {
      reporter: ["text", "json-summary", "json"],
      exclude: [
        "src/main.tsx",
        "src/**/*.d.ts",
        "test/**/*.test.{ts,tsx}",
        "test/**/**",
        "src/types/**",
        "backend/**",
        "**/*.config.*",
        "dist/**",
        "dist-electron/**",
        ".**",
        "electron/**",
        "src/store/electron/**", // TODO: Add tests for these
        "src/store/**/**config.ts",
        "src/store/**config.ts",
        "release/**",
        "src/components/ui", // Exclude UI components from coverage TODO: Add tests for these
      ],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
      reportOnFailure: true,
    },
  },
});
