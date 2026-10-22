import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  HISTORY: '@saddutube_history',
  BOOKMARKS: '@saddutube_bookmarks',
  SAVED_TABS: '@saddutube_saved_tabs',
  SEARCH_HISTORY: '@saddutube_search_history',
  SETTINGS: '@saddutube_settings',
  AUTH: '@saddutube_auth_state',
};

// Legacy keys for seamless backwards compatibility & migration
const LEGACY_STORAGE_KEYS: Record<string, string> = {
  '@saddutube_history': '@vidyopro_history',
  '@saddutube_bookmarks': '@vidyopro_bookmarks',
  '@saddutube_saved_tabs': '@vidyopro_saved_tabs',
  '@saddutube_search_history': '@vidyopro_search_history',
  '@saddutube_settings': '@vidyopro_settings',
};

// In-memory key-value cache for instantaneous in-turn read access
const memoryCache = new Map<string, string>();

const getWebLocalStorage = (): Storage | null => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

export class StorageService {
  /**
   * Retrieve item from persistent storage with automatic migration and in-memory cache
   */
  static async getItem<T>(key: string, defaultValue: T): Promise<T> {
    // 1. Check in-memory cache first
    if (memoryCache.has(key)) {
      try {
        const cached = memoryCache.get(key);
        if (cached !== undefined && cached !== null) {
          return JSON.parse(cached) as T;
        }
      } catch {
        // Continue to persistent storage
      }
    }

    // 2. Check web localStorage if on Web platform
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      try {
        let webVal = webStorage.getItem(key);
        // Check legacy key if empty
        if (webVal === null && LEGACY_STORAGE_KEYS[key]) {
          webVal = webStorage.getItem(LEGACY_STORAGE_KEYS[key]);
          if (webVal !== null) {
            webStorage.setItem(key, webVal);
          }
        }

        if (webVal !== null) {
          memoryCache.set(key, webVal);
          return JSON.parse(webVal) as T;
        }
      } catch (err) {
        console.warn('Web storage read error:', err);
      }
    }

    // 3. Primary persistence: AsyncStorage (works on Android, iOS, and modern web)
    try {
      let jsonValue = await AsyncStorage.getItem(key);

      // Automatic backwards compatibility migration from legacy key
      if (jsonValue === null && LEGACY_STORAGE_KEYS[key]) {
        try {
          const legacyVal = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS[key]);
          if (legacyVal !== null) {
            jsonValue = legacyVal;
            // Migrate to new SadduTube key
            await AsyncStorage.setItem(key, legacyVal);
          }
        } catch {
          // Ignore legacy read failure
        }
      }

      if (jsonValue !== null) {
        memoryCache.set(key, jsonValue);
        return JSON.parse(jsonValue) as T;
      }
    } catch (error) {
      console.warn(`AsyncStorage getItem error for key "${key}":`, error);
    }

    return defaultValue;
  }

  /**
   * Persist item to AsyncStorage, Web localStorage, and in-memory cache
   */
  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);

      // Always update in-memory cache immediately
      memoryCache.set(key, jsonValue);

      // Web platform storage
      const webStorage = getWebLocalStorage();
      if (webStorage) {
        try {
          webStorage.setItem(key, jsonValue);
        } catch (err) {
          console.warn('Web storage setItem error:', err);
        }
      }

      // Native persistent storage
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`AsyncStorage setItem error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from persistent storage
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      memoryCache.delete(key);

      const webStorage = getWebLocalStorage();
      if (webStorage) {
        try {
          webStorage.removeItem(key);
          if (LEGACY_STORAGE_KEYS[key]) {
            webStorage.removeItem(LEGACY_STORAGE_KEYS[key]);
          }
        } catch {}
      }

      await AsyncStorage.removeItem(key);
      if (LEGACY_STORAGE_KEYS[key]) {
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEYS[key]).catch(() => {});
      }

      return true;
    } catch (error) {
      console.error(`AsyncStorage removeItem error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all app storage
   */
  static async clearAll(): Promise<boolean> {
    try {
      memoryCache.clear();

      const webStorage = getWebLocalStorage();
      if (webStorage) {
        try {
          webStorage.clear();
        } catch {}
      }

      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('AsyncStorage clearAll error:', error);
      return false;
    }
  }
}
