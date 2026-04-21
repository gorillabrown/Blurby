import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk — React and react-dom
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "vendor";
          }

          // TTS chunk — Kokoro strategy, narration hooks, audio utilities
          // Grouped because these are loaded only when narration is active
          if (
            id.includes("src/hooks/narration/") ||
            id.includes("src/hooks/useNarration") ||
            id.includes("src/utils/ttsCache") ||
            id.includes("src/utils/narrationPlanner") ||
            id.includes("src/utils/narratePerf") ||
            id.includes("src/utils/narrateDiagnostics") ||
            id.includes("src/utils/narrationContinuity") ||
            id.includes("src/utils/narrationPortability") ||
            id.includes("src/utils/audioPlayer") ||
            id.includes("src/utils/pauseDetection") ||
            id.includes("src/utils/pronunciationOverrides") ||
            id.includes("src/utils/voiceSelection") ||
            id.includes("src/modes/NarrateMode") ||
            id.includes("src/types/narration")
          ) {
            return "tts";
          }

          // Settings chunk — settings panel components and their context
          // Grouped because the settings UI is infrequently visited
          if (
            id.includes("src/components/settings/") ||
            id.includes("src/components/SettingsMenu") ||
            id.includes("src/contexts/SettingsContext")
          ) {
            return "settings";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    setupFiles: ["./tests/setup.js"],
    exclude: [".Backup/**", ".claude/**", "node_modules/**", "Example App/**", "tmp/**"],
    testTimeout: 10000,
  },
});
