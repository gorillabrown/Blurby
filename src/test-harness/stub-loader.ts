// src/test-harness/stub-loader.ts — Conditional stub injection for browser testing
// This module is imported at the top of main.tsx ONLY in dev mode.
// In production builds, the import is tree-shaken away by Vite.

/**
 * Install the electronAPI stub if we're running outside Electron.
 * Must be called synchronously before React mounts so that all components
 * see window.electronAPI on first render.
 */
export async function installStubIfNeeded(): Promise<void> {
  // Only install in dev mode when electronAPI is absent (i.e., plain browser)
  if (typeof window !== "undefined" && !(window as any).electronAPI) {
    // Dynamic import so the stub module is never included in production chunks
    const { installStub } = await import("./electron-api-stub");
    installStub();
  }
}
