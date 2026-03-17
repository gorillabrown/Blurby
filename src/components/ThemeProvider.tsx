import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ theme: "dark", setTheme: () => {} });

const themes = {
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
};

export function ThemeProvider({ children, initialTheme = "dark" }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const vars = themes[theme] || themes.dark;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
