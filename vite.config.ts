import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import electron from "vite-plugin-electron";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.ts",
        vite: {
          build: {
            outDir: "dist-electron",
          },
          resolve: {
            alias: {
              "@": path.resolve(__dirname, "src"),
            },
          },
        },
      },
      {
        entry: path.join(__dirname, "electron/preload.ts"),
        vite: {
          build: {
            outDir: "dist-electron",
            lib: {
              entry: path.join(__dirname, "electron/preload.ts"),
              formats: ["cjs"],
              fileName: () => `preload.cjs`,
            },
            rollupOptions: {
              output: {
                entryFileNames: `preload.cjs`,
              },
            },
          },
          resolve: {
            alias: {
              "@": path.resolve(__dirname, "src"),
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
