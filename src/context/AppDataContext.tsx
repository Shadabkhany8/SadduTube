import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Bookmark, HistoryItem, SavedTab, Video } from '../types';
import { BookmarkService } from '../services/bookmark.service';
import { HistoryService } from '../services/history.service';
import { SavedTabsService } from '../services/savedTabs.service';

interface AppDataContextType {
  bookmarks: Bookmark[];
  history: HistoryItem[];
  savedTabs: SavedTab[];
  isLoading: boolean;

  // Bookmarks Actions
  refreshBookmarks: () => Promise<void>;
  isBookmarked: (urlOrId: string) => boolean;
  toggleBookmark: (urlOrVideo: string | Video, title?: string) => Promise<boolean>;
  removeBookmark: (idOrUrl: string) => Promise<void>;
  clearBookmarks: () => Promise<void>;

  // History Actions
  refreshHistory: () => Promise<void>;
  addToHistory: (urlOrVideo: string | Video, title?: string, channelTitle?: string) => Promise<void>;
  updateHistoryTitle: (url: string, title: string, channelTitle?: string) => Promise<void>;
  removeFromHistory: (idOrUrl: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  // Saved Tabs Actions
  refreshSavedTabs: () => Promise<void>;
  addSavedTab: (urlOrVideo: string | Video, customTitle?: string, note?: string) => Promise<void>;
  removeSavedTab: (id: string) => Promise<void>;
  clearSavedTabs: () => Promise<void>;

  // Global Actions
  clearAllData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType>({} as AppDataContextType);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedTabs, setSavedTabs] = useState<SavedTab[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [bm, hist, st] = await Promise.all([
          BookmarkService.getBookmarks(),
          HistoryService.getHistory(),
          SavedTabsService.getSavedTabs(),
        ]);
        setBookmarks(bm);
        setHistory(hist);
        setSavedTabs(st);
      } catch (error) {
        console.error('Error loading initial app data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Bookmarks methods
  const refreshBookmarks = useCallback(async () => {
    const bm = await BookmarkService.getBookmarks();
    setBookmarks(bm);
  }, []);

  const isBookmarked = useCallback(
    (urlOrId: string): boolean => {
      if (!urlOrId) return false;
      return bookmarks.some(
        (b) => b.url === urlOrId || b.id === urlOrId || (b.videoId && (urlOrId.includes(b.videoId) || urlOrId === b.videoId))
      );
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(async (urlOrVideo: string | Video, title?: string): Promise<boolean> => {
    const url = typeof urlOrVideo === 'object' ? `https://www.youtube.com/watch?v=${urlOrVideo.id}` : urlOrVideo;
    const titleText = typeof urlOrVideo === 'object' ? urlOrVideo.title : title;
    const result = await BookmarkService.toggleBookmark(url, titleText);
    setBookmarks(result.bookmarks);
    return result.isBookmarked;
  }, []);

  const removeBookmark = useCallback(async (idOrUrl: string) => {
    const updated = await BookmarkService.removeBookmark(idOrUrl);
    setBookmarks(updated);
  }, []);

  const clearBookmarks = useCallback(async () => {
    await BookmarkService.clearBookmarks();
    setBookmarks([]);
  }, []);

  // History methods
  const refreshHistory = useCallback(async () => {
    const hist = await HistoryService.getHistory();
    setHistory(hist);
  }, []);

  const addToHistory = useCallback(async (urlOrVideo: string | Video, title?: string, channelTitle?: string) => {
    const updated = await HistoryService.addToHistory(urlOrVideo, title, channelTitle);
    setHistory(updated);
  }, []);

  const updateHistoryTitle = useCallback(async (url: string, title: string, channelTitle?: string) => {
    const updated = await HistoryService.updateHistoryTitle(url, title, channelTitle);
    setHistory(updated);
  }, []);

  const removeFromHistory = useCallback(async (idOrUrl: string) => {
    const updated = await HistoryService.removeFromHistory(idOrUrl);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(async () => {
    await HistoryService.clearHistory();
    setHistory([]);
  }, []);

  // Saved Tabs methods
  const refreshSavedTabs = useCallback(async () => {
    const st = await SavedTabsService.getSavedTabs();
    setSavedTabs(st);
  }, []);

  const addSavedTab = useCallback(async (urlOrVideo: string | Video, customTitle?: string, note?: string) => {
    const updated = await SavedTabsService.addSavedTab(urlOrVideo, customTitle, note);
    setSavedTabs(updated);
  }, []);

  const removeSavedTab = useCallback(async (id: string) => {
    const updated = await SavedTabsService.removeSavedTab(id);
    setSavedTabs(updated);
  }, []);

  const clearSavedTabs = useCallback(async () => {
    await SavedTabsService.clearSavedTabs();
    setSavedTabs([]);
  }, []);

  const clearAllData = useCallback(async () => {
    await Promise.all([
      HistoryService.clearHistory(),
      BookmarkService.clearBookmarks(),
      SavedTabsService.clearSavedTabs(),
    ]);
    setHistory([]);
    setBookmarks([]);
    setSavedTabs([]);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        bookmarks,
        history,
        savedTabs,
        isLoading,
        refreshBookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        clearBookmarks,
        refreshHistory,
        addToHistory,
        updateHistoryTitle,
        removeFromHistory,
        clearHistory,
        refreshSavedTabs,
        addSavedTab,
        removeSavedTab,
        clearSavedTabs,
        clearAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);

