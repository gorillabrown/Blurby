import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

async function boot() {
  // In dev mode outside Electron, inject the electronAPI stub before React mounts
  if (import.meta.env.DEV && typeof window !== "undefined" && !(window as any).electronAPI) {
    const { installStubIfNeeded } = await import("./test-harness/stub-loader");
    await installStubIfNeeded();
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
