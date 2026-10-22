import { Bookmark } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, cleanYouTubeTitle } from '../utils/validation';

export class BookmarkService {
  /**
   * Fetch all bookmarked items sorted by bookmarkedAt date (newest first)
   */
  static async getBookmarks(): Promise<Bookmark[]> {
    return await StorageService.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  }

  /**
   * Check if a URL or video is currently bookmarked
   */
  static async isBookmarked(url: string): Promise<boolean> {
    if (!url) return false;
    const bookmarks = await this.getBookmarks();
    const videoId = extractYouTubeVideoId(url);

    return bookmarks.some((b) => {
      if (b.url === url) return true;
      if (videoId && b.videoId === videoId) return true;
      return false;
    });
  }

  /**
   * Toggle bookmark status for a YouTube URL. Returns updated boolean state and new list.
   */
  static async toggleBookmark(url: string, title?: string): Promise<{ isBookmarked: boolean; bookmarks: Bookmark[] }> {
    if (!url || url.startsWith('about:')) {
      const bookmarks = await this.getBookmarks();
      return { isBookmarked: false, bookmarks };
    }

    const bookmarks = await this.getBookmarks();
    const videoId = extractYouTubeVideoId(url) || undefined;
    const cleanedTitle = cleanYouTubeTitle(title) || (videoId ? `YouTube Video (${videoId})` : 'YouTube Page');

    const existingIndex = bookmarks.findIndex((b) => {
      if (b.url === url) return true;
      if (videoId && b.videoId === videoId) return true;
      return false;
    });

    let updated: Bookmark[];
    let newState = false;

    if (existingIndex >= 0) {
      // Remove
      updated = bookmarks.filter((_, idx) => idx !== existingIndex);
      newState = false;
    } else {
      // Add
      const newBookmark: Bookmark = {
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url,
        title: cleanedTitle,
        bookmarkedAt: new Date().toISOString(),
        videoId,
        thumbnailUrl: getYouTubeThumbnailUrl(videoId),
      };
      updated = [newBookmark, ...bookmarks];
      newState = true;
    }

    await StorageService.setItem(STORAGE_KEYS.BOOKMARKS, updated);
    return { isBookmarked: newState, bookmarks: updated };
  }

  /**
   * Remove individual bookmark by id or URL
   */
  static async removeBookmark(idOrUrl: string): Promise<Bookmark[]> {
    const bookmarks = await this.getBookmarks();
    const videoId = extractYouTubeVideoId(idOrUrl);
    const updated = bookmarks.filter((b) => {
      if (b.id === idOrUrl) return false;
      if (b.url === idOrUrl) return false;
      if (videoId && b.videoId === videoId) return false;
      return true;
    });
    await StorageService.setItem(STORAGE_KEYS.BOOKMARKS, updated);
    return updated;
  }

  /**
   * Clear all bookmarks
   */
  static async clearBookmarks(): Promise<boolean> {
    return await StorageService.setItem(STORAGE_KEYS.BOOKMARKS, []);
  }
}
