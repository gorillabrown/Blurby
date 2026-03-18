import { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (t: string) => void;
  accentColor: string | null;
  setAccentColor: (c: string | null) => void;
  fontFamily: string | null;
  setFontFamily: (f: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
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
    "--border": "#2a2a2a",
    "--border-light": "#222",
    "--text": "#e8e4de",
    "--text-dim": "#888",
    "--text-dimmer": "#555",
    "--accent": "#c4a882",
    "--accent-glow": "rgba(196,168,130,0.3)",
    "--reader-bg": "#050505",
  },
  light: {
    "--bg": "#f5f3ef",
    "--bg-raised": "#ffffff",
    "--bg-hover": "#eae8e4",
    "--border": "#d4d0ca",
    "--border-light": "#e0ddd8",
    "--text": "#1a1a1a",
    "--text-dim": "#666",
    "--text-dimmer": "#999",
    "--accent": "#8b6f47",
    "--accent-glow": "rgba(139,111,71,0.3)",
    "--reader-bg": "#f0ede8",
  },
  eink: {
    "--bg": "#e8e4d9",
    "--bg-raised": "#dedad0",
    "--bg-hover": "#d4d0c6",
    "--border": "#b8b4a8",
    "--border-light": "#c8c4b8",
    "--text": "#1a1a1a",
    "--text-dim": "#4a4a4a",
    "--text-dimmer": "#7a7a7a",
    "--accent": "#333333",
    "--accent-glow": "rgba(51,51,51,0.2)",
    "--reader-bg": "#e8e4d9",
  },
};

const themeOrder = ["dark", "light", "eink", "system"];

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

export function ThemeProvider({ children, initialTheme = "dark" }: { children: React.ReactNode; initialTheme?: string }) {
  const [theme, setTheme] = useState(initialTheme);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);

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
    const vars = themes[resolvedTheme] || themes.dark;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.setAttribute("data-theme", resolvedTheme);

    // Apply custom accent color override
    if (accentColor) {
      root.style.setProperty("--accent", accentColor);
      const rgb = hexToRgb(accentColor);
      if (rgb) {
        root.style.setProperty("--accent-glow", `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`);
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
