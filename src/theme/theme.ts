import { lightColors, darkColors, ThemeColors } from './colors';

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    titleLarge: { fontSize: number; fontWeight: '700' | 'bold' };
    titleMedium: { fontSize: number; fontWeight: '600' | 'bold' };
    titleSmall: { fontSize: number; fontWeight: '600' };
    bodyLarge: { fontSize: number; fontWeight: '400' };
    bodyMedium: { fontSize: number; fontWeight: '400' };
    bodySmall: { fontSize: number; fontWeight: '400' };
    caption: { fontSize: number; fontWeight: '400' };
  };
}

const baseLayout = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    titleLarge: { fontSize: 24, fontWeight: '700' as const },
    titleMedium: { fontSize: 18, fontWeight: '600' as const },
    titleSmall: { fontSize: 16, fontWeight: '600' as const },
    bodyLarge: { fontSize: 16, fontWeight: '400' as const },
    bodyMedium: { fontSize: 14, fontWeight: '400' as const },
    bodySmall: { fontSize: 12, fontWeight: '400' as const },
    caption: { fontSize: 11, fontWeight: '400' as const },
  },
};

export const AppLightTheme: Theme = {
  dark: false,
  colors: lightColors,
  ...baseLayout,
};

export const AppDarkTheme: Theme = {
  dark: true,
  colors: darkColors,
  ...baseLayout,
};
