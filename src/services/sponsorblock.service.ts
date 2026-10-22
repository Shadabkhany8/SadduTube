import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SponsorSegment {
  category: string;
  actionType: string;
  segment: [number, number];
  UUID: string;
}

const SETTINGS_KEY = '@saddutube_sponsorblock_settings';

export interface SponsorBlockSettings {
  enabled: boolean;
  skipSponsors: boolean;
  skipIntros: boolean;
  skipOutros: boolean;
  skipReminders: boolean;
}

const DEFAULT_SETTINGS: SponsorBlockSettings = {
  enabled: true,
  skipSponsors: true,
  skipIntros: true,
  skipOutros: true,
  skipReminders: true,
};

// In-memory cache for segment data
const segmentCache = new Map<string, SponsorSegment[]>();

export const SponsorBlockService = {
  /**
   * Load user's SponsorBlock preferences
   */
  async getSettings(): Promise<SponsorBlockSettings> {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Save user's SponsorBlock preferences
   */
  async saveSettings(settings: SponsorBlockSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed saving SponsorBlock settings:', e);
    }
  },

  /**
   * Fetch skip segments for a YouTube video
   */
  async getSegmentsForVideo(videoId: string): Promise<SponsorSegment[]> {
    if (!videoId || videoId.length !== 11) return [];

    if (segmentCache.has(videoId)) {
      return segmentCache.get(videoId) || [];
    }

    try {
      const settings = await this.getSettings();
      if (!settings.enabled) return [];

      const categories: string[] = [];
      if (settings.skipSponsors) categories.push('sponsor', 'selfpromo');
      if (settings.skipIntros) categories.push('intro');
      if (settings.skipOutros) categories.push('outro');
      if (settings.skipReminders) categories.push('interaction');

      if (categories.length === 0) return [];

      const categoriesParam = encodeURIComponent(JSON.stringify(categories));
      const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}&categories=${categoriesParam}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const segments: SponsorSegment[] = await response.json();
        segmentCache.set(videoId, segments);
        return segments;
      }
    } catch {
      // Offline, timeout, or 404 (no segments found for this video)
    }

    segmentCache.set(videoId, []);
    return [];
  },

  /**
   * Clear cache if needed
   */
  clearCache(): void {
    segmentCache.clear();
  },
};
