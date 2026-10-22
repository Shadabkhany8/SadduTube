import { HistoryItem, Video } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, cleanYouTubeTitle } from '../utils/validation';

export class HistoryService {
  /**
   * Fetch all watch history items sorted by watchedAt timestamp (most recent first).
   * Automatically sanitizes and purges any legacy non-video pages (e.g. "YouTube", homepages, search results).
   */
  static async getHistory(): Promise<HistoryItem[]> {
    const raw = await StorageService.getItem<HistoryItem[]>(STORAGE_KEYS.HISTORY, []);
    
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

    // If any legacy non-video entries were purged, update storage immediately
    if (validOnly.length !== raw.length) {
      await StorageService.setItem(STORAGE_KEYS.HISTORY, validOnly);
    }

    return validOnly;
  }

  /**
   * Add a watched YouTube video to history.
   * STRICT: Only valid YouTube videos (with recognized 11-char videoId) are saved.
   * Non-video pages (homepage, search results, feeds) are completely ignored.
   */
  static async addToHistory(
    urlOrVideo: string | Video,
    title?: string,
    channelTitle?: string
  ): Promise<HistoryItem[]> {
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
        return await this.getHistory();
      }
      videoId = extractYouTubeVideoId(url) || undefined;
    }

    // STRICT: Only actual videos with an 11-character video ID are allowed into watch history
    if (!videoId || videoId.length !== 11) {
      return await this.getHistory();
    }

    // Validate that it is an actual video route (watch, shorts, embed, youtu.be)
    const isVideoRoute =
      url.includes('watch') ||
      url.includes('shorts') ||
      url.includes('youtu.be') ||
      url.includes('embed');

    if (!isVideoRoute) {
      return await this.getHistory();
    }

    const history = await this.getHistory();
    const thumbnailUrl = thumbUrl || getYouTubeThumbnailUrl(videoId);
    const cleanedTitle = cleanYouTubeTitle(videoTitle);

    // Reject generic "YouTube" titles
    const displayTitle =
      cleanedTitle && cleanedTitle !== 'YouTube'
        ? cleanedTitle
        : `YouTube Video (${videoId})`;

    // Filter out existing occurrence of the same videoId or URL (deduplicate)
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

    // Place at the top of history list (newest first, max 200 items)
    const updatedHistory = [newItem, ...filtered].slice(0, 200);
    await StorageService.setItem(STORAGE_KEYS.HISTORY, updatedHistory);
    return updatedHistory;
  }

  /**
   * Update title and channel of an existing history item once metadata loads
   */
  static async updateHistoryTitle(url: string, title: string, channelTitle?: string): Promise<HistoryItem[]> {
    if (!url || !title) return await this.getHistory();

    const history = await this.getHistory();
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
      await StorageService.setItem(STORAGE_KEYS.HISTORY, updated);
    }
    return updated;
  }

  /**
   * Remove individual history entry by id or URL
   */
  static async removeFromHistory(itemIdOrUrl: string): Promise<HistoryItem[]> {
    const history = await this.getHistory();
    const updated = history.filter((item) => item.id !== itemIdOrUrl && item.url !== itemIdOrUrl);
    await StorageService.setItem(STORAGE_KEYS.HISTORY, updated);
    return updated;
  }

  /**
   * Clear entire history
   */
  static async clearHistory(): Promise<boolean> {
    return await StorageService.setItem(STORAGE_KEYS.HISTORY, []);
  }
}
