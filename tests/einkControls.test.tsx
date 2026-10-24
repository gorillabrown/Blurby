// @vitest-environment jsdom

import React from "react";
import Module, { createRequire } from "module";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import { ThemeContext, ThemeProvider, nextTheme } from "../src/components/ThemeProvider";
import { ThemeSettings } from "../src/components/settings/ThemeSettings";
import QuickSettingsPopover from "../src/components/QuickSettingsPopover";

// EINK-CONTROLS-1, Done-when 1: red first (standing rule 43, LL-138).
// One E-ink switch (einkMode) carries the E-ink colours; the E-ink theme option is gone;
// settings schema 13 -> 14 folds theme "eink" into light + einkMode; Dark's --bg is pure black.
// The light-theme control passes on the base and after the change.

const require = createRequire(import.meta.url);
const migrations = require("../main/migrations.js");
const { CURRENT_SETTINGS_SCHEMA, settingsMigrations, runMigrations } = migrations;
const upgrade = (data: Record<string, unknown>) => runMigrations(data, settingsMigrations, CURRENT_SETTINGS_SCHEMA);

let container: HTMLDivElement | null = null;
let root: Root | null = null;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  container?.remove();
  container = null;
  const html = document.documentElement;
  html.removeAttribute("data-theme");
  html.removeAttribute("data-eink");
  html.removeAttribute("style");
  delete (window as any).electronAPI;
});

async function renderProvider(settings: { theme: string; einkMode: boolean }) {
  (window as any).electronAPI = {
    getState: () => Promise.resolve({ settings }),
    getSystemTheme: () => Promise.resolve("dark"),
    onSystemThemeChanged: () => () => {},
  };
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(<ThemeProvider><div /></ThemeProvider>);
  });
  await act(async () => { await Promise.resolve(); });
  const html = document.documentElement;
  return {
    dataTheme: html.getAttribute("data-theme"),
    dataEink: html.getAttribute("data-eink"),
    bg: html.style.getPropertyValue("--bg"),
  };
}

function themeContextValue() {
  return {
    theme: "blurby",
    setTheme: vi.fn(),
    einkMode: false,
    setEinkMode: vi.fn(),
    accentColor: null,
    setAccentColor: vi.fn(),
    fontFamily: null,
    setFontFamily: vi.fn(),
  };
}

function einkThemeButtons(el: HTMLElement) {
  return Array.from(el.querySelectorAll("button")).filter((b) => {
    const text = `${b.textContent ?? ""} ${b.getAttribute("aria-label") ?? ""}`;
    return /\be-?ink\b/i.test(text);
  });
}

function loadWindowManager() {
  const electronMock = {
    BrowserWindow: function BrowserWindow() {},
    Tray: function Tray() {},
    Menu: {},
    nativeTheme: { shouldUseDarkColors: true, themeSource: "system" },
    session: {},
  };
  const originalLoad = (Module as any)._load;
  (Module as any)._load = function patchedLoad(request: string, parent: unknown, isMain: boolean) {
    if (request === "electron") return electronMock;
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    delete require.cache[require.resolve("../main/window-manager.js")];
    return require("../main/window-manager.js");
  } finally {
    (Module as any)._load = originalLoad;
  }
}

describe("EINK-CONTROLS-1: one E-ink switch", () => {
  it("(e1) einkMode true with theme dark applies data-theme=eink and data-eink=true", async () => {
    const r = await renderProvider({ theme: "dark", einkMode: true });
    expect(r.dataTheme).toBe("eink");
    expect(r.dataEink).toBe("true");
    expect(r.bg).toBe("#e8e4d9");
  });

  it("(e2) einkMode false with theme dark applies data-theme=dark and no data-eink", async () => {
    const r = await renderProvider({ theme: "dark", einkMode: false });
    expect(r.dataTheme).toBe("dark");
    expect(r.dataEink).toBeNull();
  });

  it("(e7) Dark is pure black: theme dark, einkMode false gives --bg #000000", async () => {
    const r = await renderProvider({ theme: "dark", einkMode: false });
    expect(r.bg).toBe("#000000");
  });

  it("(control) theme light, einkMode false renders as on the base", async () => {
    const r = await renderProvider({ theme: "light", einkMode: false });
    expect(r.dataTheme).toBe("light");
    expect(r.dataEink).toBeNull();
    expect(r.bg).toBe("#f5f3ef");
  });

  it("(e3) ThemeSettings renders no E-ink theme option, but keeps the E-ink switch", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root!.render(
        <ThemeContext.Provider value={themeContextValue()}>
          <ThemeSettings settings={{ ...DEFAULT_SETTINGS, theme: "dark", einkMode: false }} onSettingsChange={vi.fn()} />
        </ThemeContext.Provider>,
      );
    });
    expect(einkThemeButtons(container)).toEqual([]);
    expect(container.querySelector('[role="switch"][aria-label="Toggle E-Ink display mode"]')).not.toBeNull();
  });

  it("(e3) QuickSettingsPopover renders no E-ink theme option", async () => {
    for (const context of ["library", "reader"]) {
      container = document.createElement("div");
      document.body.appendChild(container);
      root = createRoot(container);
      await act(async () => {
        root!.render(
          <QuickSettingsPopover context={context} settings={{ theme: "dark" }} onSettingsChange={vi.fn()} onClose={vi.fn()} />,
        );
      });
      const themeButtons = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
      expect(themeButtons.map((b) => b.textContent)).toEqual(expect.arrayContaining(["Dark", "Light"]));
      expect(einkThemeButtons(container)).toEqual([]);
      await act(async () => root!.unmount());
      root = null;
      container.remove();
      container = null;
    }
  });

  it("(e4) nextTheme never returns eink", () => {
    for (const t of ["blurby", "dark", "light", "system", "eink"]) {
      expect(nextTheme(t)).not.toBe("eink");
    }
  });

  it("(e5) migration 13 -> 14 folds theme eink into light with einkMode on, idempotently", () => {
    expect(CURRENT_SETTINGS_SCHEMA).toBeGreaterThanOrEqual(14);
    const a = upgrade({ schemaVersion: 13, theme: "eink", einkMode: false });
    expect(a).toMatchObject({ theme: "light", einkMode: true, schemaVersion: CURRENT_SETTINGS_SCHEMA });

    const b = upgrade({ schemaVersion: 13, theme: "dark", einkMode: true });
    expect(b).toMatchObject({ theme: "dark", einkMode: true, schemaVersion: CURRENT_SETTINGS_SCHEMA });

    const c = upgrade({ schemaVersion: 13, theme: "blurby", einkMode: false });
    expect(c).toMatchObject({ theme: "blurby", einkMode: false });

    const step = settingsMigrations[13];
    const once = step({ schemaVersion: 13, theme: "eink", einkMode: false });
    const twice = step({ ...once });
    expect(twice).toEqual(once);
  });

  it("(e6) the title bar takes the E-ink colours when einkMode is on and the theme is dark", () => {
    const { getThemeColors } = loadWindowManager();
    const eink = getThemeColors({ theme: "eink" });
    expect(getThemeColors({ theme: "dark", einkMode: true })).toEqual(eink);
    expect(getThemeColors({ theme: "dark", einkMode: false }).bg).toBe("#000000");
  });
});
