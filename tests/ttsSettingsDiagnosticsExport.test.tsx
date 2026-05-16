// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import { TTSSettings } from "../src/components/settings/TTSSettings";
import type { BlurbySettings } from "../src/types";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

describe("TTSSettings diagnostics export", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
      },
    });
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("hides the diagnostics export action unless a developer export handler is provided", async () => {
    await act(async () => {
      root.render(
        <TTSSettings
          settings={DEFAULT_SETTINGS as BlurbySettings}
          onSettingsChange={vi.fn()}
        />,
      );
      await flushPromises();
    });

    expect(container.textContent).not.toContain("Export diagnostics");
  });

  it("exposes a clear diagnostics export action when a developer export handler is provided", async () => {
    const onExportNarrationDiagnostics = vi.fn();

    await act(async () => {
      root.render(
        <TTSSettings
          settings={DEFAULT_SETTINGS as BlurbySettings}
          onSettingsChange={vi.fn()}
          onExportNarrationDiagnostics={onExportNarrationDiagnostics}
        />,
      );
      await flushPromises();
    });

    const exportButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Export diagnostics",
    );
    expect(exportButton).toBeDefined();

    await act(async () => {
      exportButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(onExportNarrationDiagnostics).toHaveBeenCalledTimes(1);
  });
});
