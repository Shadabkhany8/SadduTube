export interface Bookmark {
  id: string;
  url: string;
  title: string;
  bookmarkedAt: string;
  videoId?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  watchedAt: string;
  videoId?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
}

export interface SavedTab {
  id: string;
  title: string;
  url: string;
  videoId?: string;
  thumbnailUrl?: string;
  createdAt: string;
  note?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  category?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
}

