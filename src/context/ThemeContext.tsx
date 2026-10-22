import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppDarkTheme, AppLightTheme, Theme } from '../theme/theme';
import { ThemeMode } from '../types';
import { StorageService, STORAGE_KEYS } from '../services/storage.service';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: AppDarkTheme,
  themeMode: 'dark',
  setThemeMode: () => {},
  isDark: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Load initial user theme preference
    StorageService.getItem<ThemeMode>(STORAGE_KEYS.SETTINGS, 'dark').then((savedMode) => {
      if (savedMode) setThemeModeState(savedMode);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    StorageService.setItem(STORAGE_KEYS.SETTINGS, mode);
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? AppDarkTheme : AppLightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
