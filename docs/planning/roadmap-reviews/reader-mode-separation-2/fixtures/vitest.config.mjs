// Standalone config for the RMS2 Wave A behavior-baseline recorder.
// Mirrors the repo vite.config.js test settings (react plugin, __APP_VERSION__, tests/setup.js)
// but discovers ONLY this directory, so plain `npm test` never runs it and it never runs the suite.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../../../", import.meta.url));
const pkg = JSON.parse(readFileSync(new URL("package.json", `file:///${root.replace(/\\/g, "/")}`), "utf-8"));

export default defineConfig({
  root,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react()],
  test: {
    root,
    environment: "jsdom",
    include: ["docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/**/*.test.tsx"],
    setupFiles: ["./tests/setup.js"],
    testTimeout: 30000,
  },
});
