import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AppDataProvider } from '../src/context/AppDataContext';

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, orientation: 'portrait' }} />
        <Stack.Screen name="youtube" options={{ headerShown: false, orientation: 'all' }} />
        <Stack.Screen name="video/[id]" options={{ headerShown: false, orientation: 'all' }} />
        <Stack.Screen name="history" options={{ headerShown: false, orientation: 'portrait' }} />
        <Stack.Screen name="bookmarks" options={{ headerShown: false, orientation: 'portrait' }} />
        <Stack.Screen name="saved-tabs" options={{ headerShown: false, orientation: 'portrait' }} />
        <Stack.Screen name="downloads" options={{ headerShown: false, orientation: 'portrait' }} />
        <Stack.Screen name="settings" options={{ headerShown: false, orientation: 'portrait' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppDataProvider>
          <RootLayoutContent />
        </AppDataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
