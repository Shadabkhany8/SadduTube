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
  refreshBookmarks: () => void;
  isBookmarked: (urlOrId: string) => boolean;
  toggleBookmark: (urlOrVideo: string | Video, title?: string) => boolean;
  removeBookmark: (idOrUrl: string) => void;
  clearBookmarks: () => void;

  // History Actions
  refreshHistory: () => void;
  addToHistory: (urlOrVideo: string | Video, title?: string, channelTitle?: string) => void;
  updateHistoryTitle: (url: string, title: string, channelTitle?: string) => void;
  removeFromHistory: (idOrUrl: string) => void;
  clearHistory: () => void;

  // Saved Tabs Actions
  refreshSavedTabs: () => void;
  addSavedTab: (urlOrVideo: string | Video, customTitle?: string, note?: string) => void;
  removeSavedTab: (id: string) => void;
  clearSavedTabs: () => void;

  // Global Actions
  clearAllData: () => void;
}

const AppDataContext = createContext<AppDataContextType>({} as AppDataContextType);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedTabs, setSavedTabs] = useState<SavedTab[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(() => {
    setIsLoading(true);
    try {
      const bm = BookmarkService.getBookmarks();
      const hist = HistoryService.getHistory();
      const st = SavedTabsService.getSavedTabs();
      setBookmarks(bm);
      setHistory(hist);
      setSavedTabs(st);
      setTimeout(() => {
        HistoryService.syncMissingTitles();
      }, 1000);
    } catch (error) {
      console.error('Error loading initial app data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Bookmarks methods
  const refreshBookmarks = useCallback(() => {
    setBookmarks(BookmarkService.getBookmarks());
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

  const toggleBookmark = useCallback((urlOrVideo: string | Video, title?: string): boolean => {
    const url = typeof urlOrVideo === 'object' ? `https://www.youtube.com/watch?v=${urlOrVideo.id}` : urlOrVideo;
    const titleText = typeof urlOrVideo === 'object' ? urlOrVideo.title : title;
    const result = BookmarkService.toggleBookmark(url, titleText);
    setBookmarks(result.bookmarks);
    return result.isBookmarked;
  }, []);

  const removeBookmark = useCallback((idOrUrl: string) => {
    const updated = BookmarkService.removeBookmark(idOrUrl);
    setBookmarks(updated);
  }, []);

  const clearBookmarks = useCallback(() => {
    BookmarkService.clearBookmarks();
    setBookmarks([]);
  }, []);

  // History methods
  const refreshHistory = useCallback(() => {
    setHistory(HistoryService.getHistory());
  }, []);

  const addToHistory = useCallback((urlOrVideo: string | Video, title?: string, channelTitle?: string) => {
    const updated = HistoryService.addToHistory(urlOrVideo, title, channelTitle);
    setHistory(updated);
  }, []);

  const updateHistoryTitle = useCallback((url: string, title: string, channelTitle?: string) => {
    const updated = HistoryService.updateHistoryTitle(url, title, channelTitle);
    setHistory(updated);
  }, []);

  const removeFromHistory = useCallback((idOrUrl: string) => {
    const updated = HistoryService.removeFromHistory(idOrUrl);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    HistoryService.clearHistory();
    setHistory([]);
  }, []);

  // Saved Tabs methods
  const refreshSavedTabs = useCallback(() => {
    setSavedTabs(SavedTabsService.getSavedTabs());
  }, []);

  const addSavedTab = useCallback((urlOrVideo: string | Video, customTitle?: string, note?: string) => {
    const updated = SavedTabsService.addSavedTab(urlOrVideo, customTitle, note);
    setSavedTabs(updated);
  }, []);

  const removeSavedTab = useCallback((id: string) => {
    const updated = SavedTabsService.removeSavedTab(id);
    setSavedTabs(updated);
  }, []);

  const clearSavedTabs = useCallback(() => {
    SavedTabsService.clearSavedTabs();
    setSavedTabs([]);
  }, []);

  const clearAllData = useCallback(() => {
    HistoryService.clearHistory();
    BookmarkService.clearBookmarks();
    SavedTabsService.clearSavedTabs();
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
