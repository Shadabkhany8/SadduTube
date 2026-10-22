import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export const OFFICIAL_AUTH_URLS = {
  // Official Google sign-in endpoint for YouTube with automatic account picker
  YOUTUBE_SIGNIN:
    'https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fm.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue',
  // Official Google account chooser
  ACCOUNT_CHOOSER:
    'https://accounts.google.com/AccountChooser?service=youtube&continue=https%3A%2F%2Fm.youtube.com',
  // Official YouTube Account / Channel dashboard
  YOUTUBE_ACCOUNT:
    'https://m.youtube.com/account',
  // Official Google Logout
  GOOGLE_LOGOUT:
    'https://accounts.google.com/Logout?service=youtube&continue=https%3A%2F%2Fm.youtube.com',
};

export interface AuthSessionResult {
  type: 'success' | 'dismiss' | 'cancel' | 'error';
  url?: string;
}

export class AuthService {
  /**
   * Launch official Google authentication session for YouTube.
   * Utilizes system browser (Chrome Custom Tabs on Android / ASWebAuthenticationSession on iOS)
   * to automatically present the device's existing Google Account Picker, allowing one-tap sign-in
   * without manually typing email and password.
   */
  static async openOfficialGoogleLogin(): Promise<AuthSessionResult> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(OFFICIAL_AUTH_URLS.YOUTUBE_SIGNIN, '_blank');
          return { type: 'success' };
        }
      }

      // Launch official system browser authentication session
      const result = await WebBrowser.openAuthSessionAsync(
        OFFICIAL_AUTH_URLS.YOUTUBE_SIGNIN,
        'saddutube://auth'
      );

      if (result.type === 'success') {
        return { type: 'success', url: (result as any).url };
      } else if (result.type === 'dismiss' || result.type === 'cancel') {
        return { type: 'dismiss' };
      }

      return { type: 'success' };
    } catch (error) {
      console.warn('Error launching official Google login:', error);
      // Fallback to openBrowserAsync
      try {
        await WebBrowser.openBrowserAsync(OFFICIAL_AUTH_URLS.YOUTUBE_SIGNIN);
        return { type: 'success' };
      } catch (fallbackError) {
        console.error('Fallback browser error:', fallbackError);
        return { type: 'error' };
      }
    }
  }

  /**
   * Open the official Google Account Chooser in the system browser
   * allowing the user to select or switch between existing phone Google accounts.
   */
  static async openAccountChooser(): Promise<void> {
    try {
      await WebBrowser.openBrowserAsync(OFFICIAL_AUTH_URLS.ACCOUNT_CHOOSER);
    } catch (err) {
      console.warn('Could not open account chooser:', err);
    }
  }

  /**
   * Open official Google logout in the system browser
   */
  static async openOfficialSignOut(): Promise<void> {
    try {
      await WebBrowser.openBrowserAsync(OFFICIAL_AUTH_URLS.GOOGLE_LOGOUT);
    } catch (err) {
      console.warn('Could not open logout URL:', err);
    }
  }
}
