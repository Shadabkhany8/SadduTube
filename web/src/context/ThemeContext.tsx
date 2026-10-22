import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';
import { StorageService, STORAGE_KEYS } from '../services/storage.service';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return StorageService.getItem<ThemeMode>(STORAGE_KEYS.SETTINGS, 'dark');
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    StorageService.setItem(STORAGE_KEYS.SETTINGS, mode);
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemIsDark);

  const colors = isDark ? darkColors : lightColors;

  // Sync with HTML class and body background
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.textPrimary;
  }, [isDark, colors]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
