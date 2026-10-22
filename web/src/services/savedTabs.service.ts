import { SavedTab, Video } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { extractYouTubeVideoId, buildYouTubeWatchUrl } from '../utils/validation';

export class SavedTabsService {
  static getSavedTabs(): SavedTab[] {
    return StorageService.getItem<SavedTab[]>(STORAGE_KEYS.SAVED_TABS, []);
  }

  static addSavedTab(urlOrVideo: string | Video, customTitle?: string, note?: string): SavedTab[] {
    const tabs = this.getSavedTabs();

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
      id: `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      url,
      videoId,
      thumbnailUrl,
      createdAt: new Date().toISOString(),
      note,
    };

    const updated = [newTab, ...tabs];
    StorageService.setItem(STORAGE_KEYS.SAVED_TABS, updated);
    return updated;
  }

  static removeSavedTab(id: string): SavedTab[] {
    const tabs = this.getSavedTabs();
    const updated = tabs.filter((t) => t.id !== id);
    StorageService.setItem(STORAGE_KEYS.SAVED_TABS, updated);
    return updated;
  }

  static clearSavedTabs(): boolean {
    return StorageService.setItem(STORAGE_KEYS.SAVED_TABS, []);
  }
}
