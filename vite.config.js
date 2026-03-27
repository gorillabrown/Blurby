import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    setupFiles: ["./tests/setup.js"],
    exclude: [".Backup/**", ".claude/**", "node_modules/**", "Example App/**"],
  },
});
