import { HistoryItem, Video } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, cleanYouTubeTitle } from '../utils/validation';

export class HistoryService {
  static getHistory(): HistoryItem[] {
    const raw = StorageService.getItem<HistoryItem[]>(STORAGE_KEYS.HISTORY, []);

    // Strict video validation: Only keep actual videos with valid 11-char videoId
    const validOnly = raw
      .filter((item) => {
        const vid = item.videoId || extractYouTubeVideoId(item.url);
        if (!vid || vid.length !== 11) return false;
        if (item.title === 'YouTube') return false;
        return true;
      })
      .map((item) => {
        const vid = item.videoId || extractYouTubeVideoId(item.url)!;
        return {
          ...item,
          videoId: vid,
          thumbnailUrl: item.thumbnailUrl || getYouTubeThumbnailUrl(vid),
        };
      });

    if (validOnly.length !== raw.length) {
      StorageService.setItem(STORAGE_KEYS.HISTORY, validOnly);
    }

    return validOnly;
  }

  static addToHistory(
    urlOrVideo: string | Video,
    title?: string,
    channelTitle?: string
  ): HistoryItem[] {
    let url: string;
    let videoId: string | undefined;
    let videoTitle: string | undefined = title;
    let channel: string | undefined = channelTitle;
    let thumbUrl: string | undefined;

    if (typeof urlOrVideo === 'object') {
      videoId = urlOrVideo.id;
      url = `https://www.youtube.com/watch?v=${urlOrVideo.id}`;
      videoTitle = urlOrVideo.title;
      channel = urlOrVideo.channelTitle;
      thumbUrl = urlOrVideo.thumbnailUrl;
    } else {
      url = urlOrVideo;
      if (!url || url.startsWith('about:')) {
        return this.getHistory();
      }
      videoId = extractYouTubeVideoId(url) || undefined;
    }

    if (!videoId || videoId.length !== 11) {
      return this.getHistory();
    }

    const history = this.getHistory();
    const thumbnailUrl = thumbUrl || getYouTubeThumbnailUrl(videoId);
    const cleanedTitle = cleanYouTubeTitle(videoTitle);

    const displayTitle =
      cleanedTitle && cleanedTitle !== 'YouTube'
        ? cleanedTitle
        : `YouTube Video (${videoId})`;

    const filtered = history.filter((item) => {
      if (videoId && item.videoId === videoId) return false;
      return item.url !== url;
    });

    const newItem: HistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url,
      title: displayTitle,
      watchedAt: new Date().toISOString(),
      videoId,
      thumbnailUrl,
      channelTitle: channel,
    };

    const updatedHistory = [newItem, ...filtered].slice(0, 200);
    StorageService.setItem(STORAGE_KEYS.HISTORY, updatedHistory);
    return updatedHistory;
  }

  static updateHistoryTitle(url: string, title: string, channelTitle?: string): HistoryItem[] {
    if (!url || !title) return this.getHistory();

    const history = this.getHistory();
    const cleanedTitle = cleanYouTubeTitle(title);
    if (!cleanedTitle || cleanedTitle === 'YouTube') return history;

    const videoId = extractYouTubeVideoId(url);
    let changed = false;

    const updated = history.map((item) => {
      const matches = item.url === url || (videoId && item.videoId === videoId);
      if (matches) {
        let itemChanged = false;
        const newItem = { ...item };

        if (newItem.title !== cleanedTitle && (newItem.title.startsWith('YouTube Video (') || newItem.title === 'YouTube Page')) {
          newItem.title = cleanedTitle;
          itemChanged = true;
        }

        if (channelTitle && !newItem.channelTitle) {
          newItem.channelTitle = channelTitle;
          itemChanged = true;
        }

        if (itemChanged) {
          changed = true;
          return newItem;
        }
      }
      return item;
    });

    if (changed) {
      StorageService.setItem(STORAGE_KEYS.HISTORY, updated);
    }
    return updated;
  }

  static removeFromHistory(itemIdOrUrl: string): HistoryItem[] {
    const history = this.getHistory();
    const updated = history.filter((item) => item.id !== itemIdOrUrl && item.url !== itemIdOrUrl);
    StorageService.setItem(STORAGE_KEYS.HISTORY, updated);
    return updated;
  }

  static clearHistory(): boolean {
    return StorageService.setItem(STORAGE_KEYS.HISTORY, []);
  }
}
