export const COLORS = {
  // Primary colors
  primary: "#6200ee",
  primaryDark: "#3700b3",
  primaryLight: "#bb86fc",

  // Secondary colors
  secondary: "#03dac6",
  secondaryDark: "#018786",

  // Background colors
  background: {
    dark: "#121212",
    darker: "#0a0a0a",
    card: "#1e1e1e",
    light: "#ffffff",
    lightGray: "#f5f5f5",
  },

  // Text colors
  text: {
    primary: "#ffffff",
    secondary: "#b0b0b0",
    tertiary: "#757575",
    light: "#121212",
    accent: "#bb86fc",
  },

  // Utility colors
  error: "#cf6679",
  success: "#4caf50",
  warning: "#ff9800",
  info: "#2196f3",

  // Misc
  divider: "#2e2e2e",
  overlay: "rgba(0, 0, 0, 0.5)",
};

export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    title: 28,
  },
  weights: {
    light: "300",
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Add this export type definition before the darkTheme and lightTheme declarations
export type ThemeType = {
  colors: typeof COLORS;
  fonts: typeof FONTS;
  spacing: typeof SPACING;
  shadows: typeof SHADOWS;
  isDark: boolean;
};

// Theme object that combines all theme elements
export const darkTheme: ThemeType = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  shadows: SHADOWS,
  isDark: true,
};

export const lightTheme: ThemeType = {
  ...darkTheme,
  colors: {
    ...COLORS,
    background: {
      dark: "#ffffff",
      darker: "#f5f5f5",
      card: "#f0f0f0",
      light: "#121212",
      lightGray: "#e0e0e0",
    },
    text: {
      primary: "#121212",
      secondary: "#555555",
      tertiary: "#888888",
      light: "#ffffff",
      accent: "#6200ee",
    },
    divider: "#e0e0e0",
  },
  isDark: false,
};
