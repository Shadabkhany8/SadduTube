export const STORAGE_KEYS = {
  HISTORY: '@saddutube_history',
  BOOKMARKS: '@saddutube_bookmarks',
  SAVED_TABS: '@saddutube_saved_tabs',
  SEARCH_HISTORY: '@saddutube_search_history',
  SETTINGS: '@saddutube_settings',
  DOWNLOADS: '@saddutube_downloads',
  SPONSORBLOCK: '@saddutube_sponsorblock_settings',
};

const LEGACY_STORAGE_KEYS: Record<string, string> = {
  '@saddutube_history': '@vidyopro_history',
  '@saddutube_bookmarks': '@vidyopro_bookmarks',
  '@saddutube_saved_tabs': '@vidyopro_saved_tabs',
  '@saddutube_search_history': '@vidyopro_search_history',
  '@saddutube_settings': '@vidyopro_settings',
};

const memoryCache = new Map<string, string>();

export class StorageService {
  static getItem<T>(key: string, defaultValue: T): T {
    if (memoryCache.has(key)) {
      try {
        const cached = memoryCache.get(key);
        if (cached !== undefined && cached !== null) {
          return JSON.parse(cached) as T;
        }
      } catch {
        // continue
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        let val = window.localStorage.getItem(key);
        if (val === null && LEGACY_STORAGE_KEYS[key]) {
          val = window.localStorage.getItem(LEGACY_STORAGE_KEYS[key]);
          if (val !== null) {
            window.localStorage.setItem(key, val);
          }
        }

        if (val !== null) {
          memoryCache.set(key, val);
          return JSON.parse(val) as T;
        }
      } catch (err) {
        console.warn('StorageService.getItem error:', err);
      }
    }

    return defaultValue;
  }

  static setItem<T>(key: string, value: T): boolean {
    try {
      const jsonValue = JSON.stringify(value);
      memoryCache.set(key, jsonValue);

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, jsonValue);
      }
      return true;
    } catch (err) {
      console.error('StorageService.setItem error:', err);
      return false;
    }
  }

  static removeItem(key: string): boolean {
    try {
      memoryCache.delete(key);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        if (LEGACY_STORAGE_KEYS[key]) {
          window.localStorage.removeItem(LEGACY_STORAGE_KEYS[key]);
        }
      }
      return true;
    } catch (err) {
      console.error('StorageService.removeItem error:', err);
      return false;
    }
  }

  static clearAll(): boolean {
    try {
      memoryCache.clear();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
      return true;
    } catch (err) {
      console.error('StorageService.clearAll error:', err);
      return false;
    }
  }
}
