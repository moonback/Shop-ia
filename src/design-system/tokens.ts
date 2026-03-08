export type ThemeName = "light" | "dark" | "high-contrast";

export const lightTheme = {
  colors: {
    primary: "#FF9900",
    primaryHover: "#e88a00",
    bgMain: "#ffffff",
    bgSecondary: "#f6f6f6",
    bgCard: "#ffffff",
    bgNavbar: "#131921",
    textPrimary: "#111111",
    textSecondary: "#565959",
    textInverse: "#ffffff",
    borderLight: "#e7e7e7",
    borderDefault: "#d5d9d9",
    success: "#067d62",
    warning: "#b12704",
    info: "#007185",
    focusRing: "#146eb4",
  },
  typography: {
    fontFamilyBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontFamilyDisplay: '"Playfair Display", ui-serif, Georgia, serif',
    lineHeightBase: "1.5",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadows: {
    card: "0 2px 8px rgba(17, 17, 17, 0.08)",
    cardHover: "0 8px 24px rgba(17, 17, 17, 0.14)",
    focus: "0 0 0 3px rgba(20, 110, 180, 0.28)",
  },
} as const;

export const themes = {
  light: lightTheme,
  dark: lightTheme,
  "high-contrast": lightTheme,
} as const;
