// @vitest-environment jsdom

import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import { ThemeContext } from "../src/components/ThemeProvider";
import { ThemeSettings } from "../src/components/settings/ThemeSettings";

let container: HTMLDivElement | null = null;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  container?.remove();
  container = null;
});

describe("ThemeSettings polish", () => {
  it("makes E-Ink display toggles keyboard-operable switches", async () => {
    const onSettingsChange = vi.fn();
    const setEinkMode = vi.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ThemeContext.Provider
          value={{
            theme: "blurby",
            setTheme: vi.fn(),
            einkMode: false,
            setEinkMode,
            accentColor: null,
            setAccentColor: vi.fn(),
            fontFamily: null,
            setFontFamily: vi.fn(),
          }}
        >
          <ThemeSettings
            settings={{ ...DEFAULT_SETTINGS, einkMode: false }}
            onSettingsChange={onSettingsChange}
          />
        </ThemeContext.Provider>,
      );
    });

    const einkSwitch = container.querySelector<HTMLElement>('[role="switch"][aria-label="Toggle E-Ink display mode"]');
    expect(einkSwitch?.getAttribute("tabindex")).toBe("0");

    await act(async () => {
      einkSwitch?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(onSettingsChange).toHaveBeenCalledWith({ einkMode: true });
    expect(setEinkMode).toHaveBeenCalledWith(true);
  });
});
