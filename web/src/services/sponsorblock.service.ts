import { SponsorSegment } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';

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

const segmentCache = new Map<string, SponsorSegment[]>();

export const SponsorBlockService = {
  getSettings(): SponsorBlockSettings {
    return StorageService.getItem<SponsorBlockSettings>(STORAGE_KEYS.SPONSORBLOCK, DEFAULT_SETTINGS);
  },

  saveSettings(settings: SponsorBlockSettings): void {
    StorageService.setItem(STORAGE_KEYS.SPONSORBLOCK, settings);
  },

  async getSegmentsForVideo(videoId: string): Promise<SponsorSegment[]> {
    if (!videoId || videoId.length !== 11) return [];

    if (segmentCache.has(videoId)) {
      return segmentCache.get(videoId) || [];
    }

    try {
      const settings = this.getSettings();
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
      // Offline, timeout, or 404 (no segments found)
    }

    segmentCache.set(videoId, []);
    return [];
  },

  clearCache(): void {
    segmentCache.clear();
  },
};
