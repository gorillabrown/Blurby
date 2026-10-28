import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { installConsoleCapture } from "./utils/consoleCapture";

// Install console ring buffer before anything else (HOTFIX-11)
installConsoleCapture();

async function boot() {
  // In dev mode outside Electron, inject the electronAPI stub before React mounts.
  // CRITICAL: The stub must be installed BEFORE importing App, because components
  // like LibraryContainer capture `window.electronAPI` at module scope.
  if (import.meta.env.DEV && typeof window !== "undefined" && !(window as any).electronAPI) {
    const { installStubIfNeeded } = await import("./test-harness/stub-loader");
    await installStubIfNeeded();
  }

  // Dynamic import so App's module tree evaluates AFTER the stub is installed
  const { default: App } = await import("./App");

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
