import { createContext, PropsWithChildren, useContext, useLayoutEffect, useMemo, useState } from "react";
import { ThemeName, themes } from "../design-system/tokens";

type ThemeContextValue = {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function toCssVars(themeName: ThemeName) {
  const theme = themes[themeName];
  return {
    "--color-primary": theme.colors.primary,
    "--color-primary-hover": theme.colors.primaryHover,
    "--bg-main": theme.colors.bgMain,
    "--bg-secondary": theme.colors.bgSecondary,
    "--bg-card": theme.colors.bgCard,
    "--bg-navbar": theme.colors.bgNavbar,
    "--text-primary": theme.colors.textPrimary,
    "--text-secondary": theme.colors.textSecondary,
    "--text-inverse": theme.colors.textInverse,
    "--border-light": theme.colors.borderLight,
    "--border-default": theme.colors.borderDefault,
    "--success": theme.colors.success,
    "--warning": theme.colors.warning,
    "--info": theme.colors.info,
    "--focus-ring": theme.colors.focusRing,
    "--shadow-card": theme.shadows.card,
    "--shadow-card-hover": theme.shadows.cardHover,
    "--shadow-focus": theme.shadows.focus,
  } as const;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeName, setThemeName] = useState<ThemeName>("light");

  useLayoutEffect(() => {
    const root = document.documentElement;
    const vars = toCssVars(themeName);
    root.dataset.theme = themeName;
    Object.entries(vars).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
  }, [themeName]);

  const value = useMemo(() => ({ themeName, setThemeName }), [themeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
