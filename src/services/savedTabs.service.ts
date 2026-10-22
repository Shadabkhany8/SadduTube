import { SavedTab, Video } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { extractYouTubeVideoId, buildYouTubeWatchUrl } from '../utils/validation';

export class SavedTabsService {
  /**
   * Get all saved tabs
   */
  static async getSavedTabs(): Promise<SavedTab[]> {
    return await StorageService.getItem<SavedTab[]>(STORAGE_KEYS.SAVED_TABS, []);
  }

  /**
   * Save a YouTube tab / URL or Video item
   */
  static async addSavedTab(urlOrVideo: string | Video, customTitle?: string, note?: string): Promise<SavedTab[]> {
    const tabs = await this.getSavedTabs();

    let title = customTitle || '';
    let url = '';
    let videoId: string | undefined;
    let thumbnailUrl: string | undefined;

    if (typeof urlOrVideo === 'object') {
      const video = urlOrVideo as Video;
      videoId = video.id;
      title = customTitle || video.title;
      url = buildYouTubeWatchUrl(video.id);
      thumbnailUrl = video.thumbnailUrl;
    } else {
      url = urlOrVideo.trim();
      const extractedId = extractYouTubeVideoId(url);
      if (extractedId) {
        videoId = extractedId;
        thumbnailUrl = `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`;
      }
      if (!title) {
        title = videoId ? `YouTube Video (${videoId})` : url;
      }
    }

    const newTab: SavedTab = {
      id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      url,
      videoId,
      thumbnailUrl,
      createdAt: new Date().toISOString(),
      note,
    };

    const updated = [newTab, ...tabs];
    await StorageService.setItem(STORAGE_KEYS.SAVED_TABS, updated);
    return updated;
  }

  /**
   * Remove saved tab by ID
   */
  static async removeSavedTab(id: string): Promise<SavedTab[]> {
    const tabs = await this.getSavedTabs();
    const updated = tabs.filter((t) => t.id !== id);
    await StorageService.setItem(STORAGE_KEYS.SAVED_TABS, updated);
    return updated;
  }

  /**
   * Clear all saved tabs
   */
  static async clearSavedTabs(): Promise<boolean> {
    return await StorageService.setItem(STORAGE_KEYS.SAVED_TABS, []);
  }
}
