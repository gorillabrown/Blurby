import { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (t: string) => void;
  accentColor: string | null;
  setAccentColor: (c: string | null) => void;
  fontFamily: string | null;
  setFontFamily: (f: string | null) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "blurby",
  setTheme: () => {},
  accentColor: null,
  setAccentColor: () => {},
  fontFamily: null,
  setFontFamily: () => {},
});

const themes: Record<string, Record<string, string>> = {
  dark: {
    "--bg": "#0f0f0f",
    "--bg-raised": "#181818",
    "--bg-hover": "#1e1e1e",
    "--bg-secondary": "#1a1a1a",
    "--border": "#2a2a2a",
    "--border-light": "#222",
    "--text": "#e8e4de",
    "--text-dim": "#8c8c8c",
    "--text-dimmer": "#737373",
    "--text-muted": "#666",
    "--accent": "#c4a882",
    "--accent-glow": "rgba(196,168,130,0.3)",
    "--accent-faded": "rgba(196,168,130,0.13)",
    "--accent-highlighted": "rgba(196,168,130,0.3)",
    "--danger-muted": "rgba(226,75,74,0.2)",
    "--reader-bg": "#050505",
    "--overlay-light": "rgba(255,255,255,0.06)",
    "--overlay-medium": "rgba(255,255,255,0.08)",
    "--overlay-heavy": "rgba(255,255,255,0.15)",
    "--overlay-backdrop": "rgba(15,15,15,0.85)",
    "--overlay-gradient": "rgba(0,0,0,0.6)",
    "--placeholder-bg": "#1e1e1e",
    "--placeholder-banner": "#3a3a3a",
    "--placeholder-text": "#bbb",
    "--badge-on-color": "#fff",
  },
  light: {
    "--bg": "#f5f3ef",
    "--bg-raised": "#ffffff",
    "--bg-hover": "#eae8e4",
    "--bg-secondary": "#ebe8e3",
    "--border": "#d4d0ca",
    "--border-light": "#e0ddd8",
    "--text": "#1a1a1a",
    "--text-dim": "#636363",
    "--text-dimmer": "#767676",
    "--text-muted": "#888",
    "--accent": "#8b6f47",
    "--accent-glow": "rgba(139,111,71,0.3)",
    "--accent-faded": "rgba(139,111,71,0.13)",
    "--accent-highlighted": "rgba(139,111,71,0.3)",
    "--danger-muted": "rgba(226,75,74,0.15)",
    "--reader-bg": "#f0ede8",
    "--overlay-light": "rgba(0,0,0,0.04)",
    "--overlay-medium": "rgba(0,0,0,0.06)",
    "--overlay-heavy": "rgba(0,0,0,0.10)",
    "--overlay-backdrop": "rgba(245,243,239,0.9)",
    "--overlay-gradient": "rgba(245,243,239,0.7)",
    "--placeholder-bg": "#e8e5e0",
    "--placeholder-banner": "#c8c4bc",
    "--placeholder-text": "#555",
    "--badge-on-color": "#fff",
  },
  blurby: {
    "--bg": "#1a2a4a",
    "--bg-raised": "#223456",
    "--bg-hover": "#2a3d62",
    "--bg-secondary": "#1e3050",
    "--border": "#2d4a6e",
    "--border-light": "#264060",
    "--text": "#ffffff",
    "--text-dim": "#b8cce0",
    "--text-dimmer": "#8aa4c0",
    "--text-muted": "#6d8faa",
    "--accent": "#FF5B7F",
    "--accent-glow": "rgba(255,91,127,0.3)",
    "--accent-faded": "rgba(255,91,127,0.12)",
    "--accent-highlighted": "rgba(255,91,127,0.28)",
    "--danger-muted": "rgba(255,91,127,0.18)",
    "--reader-bg": "#152440",
    "--overlay-light": "rgba(255,255,255,0.04)",
    "--overlay-medium": "rgba(255,255,255,0.07)",
    "--overlay-heavy": "rgba(255,255,255,0.12)",
    "--overlay-backdrop": "rgba(26,42,74,0.92)",
    "--overlay-gradient": "rgba(26,42,74,0.7)",
    "--placeholder-bg": "#223456",
    "--placeholder-banner": "#2d4a6e",
    "--placeholder-text": "#b8cce0",
    "--badge-on-color": "#fff",
  },
  eink: {
    "--bg": "#e8e4d9",
    "--bg-raised": "#dedad0",
    "--bg-hover": "#d4d0c6",
    "--bg-secondary": "#d8d4c8",
    "--border": "#b8b4a8",
    "--border-light": "#c8c4b8",
    "--text": "#1a1a1a",
    "--text-dim": "#4a4a4a",
    "--text-dimmer": "#7a7a7a",
    "--text-muted": "#666",
    "--accent": "#333333",
    "--accent-glow": "rgba(51,51,51,0.2)",
    "--accent-faded": "rgba(51,51,51,0.13)",
    "--accent-highlighted": "rgba(51,51,51,0.3)",
    "--danger-muted": "rgba(226,75,74,0.15)",
    "--reader-bg": "#e8e4d9",
    "--overlay-light": "rgba(0,0,0,0.04)",
    "--overlay-medium": "rgba(0,0,0,0.06)",
    "--overlay-heavy": "rgba(0,0,0,0.10)",
    "--overlay-backdrop": "rgba(232,228,217,0.9)",
    "--overlay-gradient": "rgba(232,228,217,0.7)",
    "--placeholder-bg": "#d4d0c6",
    "--placeholder-banner": "#b8b4a8",
    "--placeholder-text": "#333",
    "--badge-on-color": "#fff",
  },
};

const themeOrder = ["blurby", "dark", "light", "eink", "system"];

export function nextTheme(current: string): string {
  const idx = themeOrder.indexOf(current);
  return themeOrder[(idx + 1) % themeOrder.length];
}

export function themeLabel(theme: string): string {
  if (theme === "eink") return "e-ink";
  if (theme === "system") return "system";
  return theme;
}

// Parse hex color to r,g,b for generating glow
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

export function ThemeProvider({ children, initialTheme = "blurby" }: { children: React.ReactNode; initialTheme?: string }) {
  const [theme, setTheme] = useState(initialTheme);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);

  // Load saved theme preferences on mount
  useEffect(() => {
    const api = window.electronAPI;
    api.getState?.().then((state) => {
      if (state?.settings) {
        if (state.settings.theme) setTheme(state.settings.theme);
        if (state.settings.accentColor !== undefined) setAccentColor(state.settings.accentColor);
        if (state.settings.fontFamily !== undefined) setFontFamily(state.settings.fontFamily);
      }
    });
  }, []);

  // Fetch initial system theme and listen for changes
  useEffect(() => {
    const api = window.electronAPI;
    api.getSystemTheme?.().then((t) => setSystemTheme(t));
    const unsub = api.onSystemThemeChanged?.((t) => setSystemTheme(t));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme = theme === "system" ? systemTheme : theme;
    const vars = themes[resolvedTheme] || themes.blurby;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.setAttribute("data-theme", resolvedTheme);

    // Apply custom accent color override (blocked for blurby — brand palette is static)
    if (accentColor && resolvedTheme !== "blurby") {
      root.style.setProperty("--accent", accentColor);
      const rgb = hexToRgb(accentColor);
      if (rgb) {
        root.style.setProperty("--accent-glow", `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`);
        root.style.setProperty("--accent-faded", `rgba(${rgb.r},${rgb.g},${rgb.b},0.13)`);
        root.style.setProperty("--accent-highlighted", `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`);
      }
    }

    // Apply custom font family override
    if (fontFamily) {
      root.style.setProperty("--reader-font", fontFamily);
    } else {
      root.style.removeProperty("--reader-font");
    }
  }, [theme, systemTheme, accentColor, fontFamily]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, fontFamily, setFontFamily }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
