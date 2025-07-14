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
    environment: "jsdom",
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "json-summary", "json"],
      exclude: [
        "src/**/*.d.ts",
        "test/**/*.test.{ts,tsx}",
        "test/**/**",
        "src/types/**",
        "backend/**",
        "**/*.config.*",
        "dist/**",
        "dist-electron/**",
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
