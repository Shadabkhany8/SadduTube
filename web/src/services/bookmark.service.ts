import { Bookmark } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, cleanYouTubeTitle } from '../utils/validation';

export class BookmarkService {
  static getBookmarks(): Bookmark[] {
    return StorageService.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  }

  static isBookmarked(url: string): boolean {
    if (!url) return false;
    const bookmarks = this.getBookmarks();
    const videoId = extractYouTubeVideoId(url);

    return bookmarks.some((b) => {
      if (b.url === url) return true;
      if (videoId && b.videoId === videoId) return true;
      return false;
    });
  }

  static toggleBookmark(url: string, title?: string): { isBookmarked: boolean; bookmarks: Bookmark[] } {
    if (!url || url.startsWith('about:')) {
      const bookmarks = this.getBookmarks();
      return { isBookmarked: false, bookmarks };
    }

    const bookmarks = this.getBookmarks();
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
      updated = bookmarks.filter((_, idx) => idx !== existingIndex);
      newState = false;
    } else {
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

    StorageService.setItem(STORAGE_KEYS.BOOKMARKS, updated);
    return { isBookmarked: newState, bookmarks: updated };
  }

  static removeBookmark(idOrUrl: string): Bookmark[] {
    const bookmarks = this.getBookmarks();
    const videoId = extractYouTubeVideoId(idOrUrl);
    const updated = bookmarks.filter((b) => {
      if (b.id === idOrUrl) return false;
      if (b.url === idOrUrl) return false;
      if (videoId && b.videoId === videoId) return false;
      return true;
    });
    StorageService.setItem(STORAGE_KEYS.BOOKMARKS, updated);
    return updated;
  }

  static clearBookmarks(): boolean {
    return StorageService.setItem(STORAGE_KEYS.BOOKMARKS, []);
  }
}
