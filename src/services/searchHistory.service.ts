import { SearchHistoryItem } from '../types';
import { StorageService, STORAGE_KEYS } from './storage.service';

const DEFAULT_GENERAL_SEARCHES: SearchHistoryItem[] = [
  { id: 'sh_1', query: 'cricket highlights', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'sh_2', query: 'latest Bollywood songs', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'sh_3', query: 'travel vlog 2024', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: 'sh_4', query: 'iPhone 16 review', timestamp: new Date(Date.now() - 28800000).toISOString() },
  { id: 'sh_5', query: 'Minecraft hardcore survival', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'sh_6', query: 'funny viral videos', timestamp: new Date(Date.now() - 120000000).toISOString() },
];

export class SearchHistoryService {
  /**
   * Get search history
   */
  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    return await StorageService.getItem<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY, DEFAULT_GENERAL_SEARCHES);
  }

  /**
   * Add a search query to search history
   */
  static async addSearchQuery(query: string): Promise<SearchHistoryItem[]> {
    const trimmed = query.trim();
    if (!trimmed) return await this.getSearchHistory();

    const current = await this.getSearchHistory();
    const filtered = current.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());

    const newItem: SearchHistoryItem = {
      id: `sh_${Date.now()}`,
      query: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered].slice(0, 20); // Keep top 20 recent searches
    await StorageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, updated);
    return updated;
  }

  /**
   * Remove single search query by ID or query string
   */
  static async removeSearchQuery(queryOrId: string): Promise<SearchHistoryItem[]> {
    const current = await this.getSearchHistory();
    const updated = current.filter(
      (item) => item.id !== queryOrId && item.query.toLowerCase() !== queryOrId.toLowerCase()
    );
    await StorageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, updated);
    return updated;
  }

  /**
   * Clear all search history
   */
  static async clearSearchHistory(): Promise<boolean> {
    return await StorageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, []);
  }
}
