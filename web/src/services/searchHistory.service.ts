import { SearchHistoryItem } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';

const DEFAULT_POPULAR_SEARCHES: SearchHistoryItem[] = [
  { id: 'sh_1', query: 'latest Bollywood songs', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'sh_2', query: 'Tauba Tauba Bad Newz', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'sh_3', query: 'Arijit Singh mashup', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: 'sh_4', query: 'trending music india', timestamp: new Date(Date.now() - 28800000).toISOString() },
];

export class SearchHistoryService {
  /**
   * Get search history
   */
  static getSearchHistory(): SearchHistoryItem[] {
    return StorageService.getItem<SearchHistoryItem[]>(
      STORAGE_KEYS.SEARCH_HISTORY,
      DEFAULT_POPULAR_SEARCHES
    );
  }

  /**
   * Add a search query to search history
   */
  static addSearchQuery(query: string): SearchHistoryItem[] {
    const trimmed = query.trim();
    if (!trimmed) return this.getSearchHistory();

    const current = this.getSearchHistory();
    const filtered = current.filter(
      (item) => item.query.toLowerCase() !== trimmed.toLowerCase()
    );

    const newItem: SearchHistoryItem = {
      id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      query: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered].slice(0, 30);
    StorageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, updated);
    return updated;
  }

  /**
   * Remove single search query by ID or query string
   */
  static removeSearchQuery(queryOrId: string): SearchHistoryItem[] {
    const current = this.getSearchHistory();
    const updated = current.filter(
      (item) =>
        item.id !== queryOrId && item.query.toLowerCase() !== queryOrId.toLowerCase()
    );
    StorageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, updated);
    return updated;
  }

  /**
   * Clear all search history
   */
  static clearSearchHistory(): boolean {
    return StorageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, []);
  }
}
