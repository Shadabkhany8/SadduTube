import React, { useState, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Toast, ToastProps } from './components/Toast';
import { SearchModal } from './components/SearchModal';
import { HomeScreen } from './screens/HomeScreen';
import { VideoScreen } from './screens/VideoScreen';
import { YouTubeBrowserScreen } from './screens/YouTubeBrowserScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SavedTabsScreen } from './screens/SavedTabsScreen';
import { DownloadsScreen } from './screens/DownloadsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function AppLayout() {
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastProps>({ message: null });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, actionText?: string, onAction?: () => void) => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setToast({ message, actionText, onAction });
      toastTimeoutRef.current = setTimeout(() => {
        setToast({ message: null });
      }, 2600);
    },
    []
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: colors.background,
        color: colors.textPrimary,
      }}
    >
      <Navbar onOpenSearchModal={() => setSearchModalOpen(true)} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main
          className="app-main-content"
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<HomeScreen onToast={showToast} />} />
            <Route path="/video/:id" element={<VideoScreen onToast={showToast} />} />
            <Route path="/youtube" element={<YouTubeBrowserScreen onToast={showToast} />} />
            <Route path="/bookmarks" element={<BookmarksScreen onToast={showToast} />} />
            <Route path="/history" element={<HistoryScreen onToast={showToast} />} />
            <Route path="/saved-tabs" element={<SavedTabsScreen onToast={showToast} />} />
            <Route path="/downloads" element={<DownloadsScreen onToast={showToast} />} />
            <Route path="/settings" element={<SettingsScreen onToast={showToast} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <BottomNav />

      {/* Floating Toast notification */}
      <Toast
        message={toast.message}
        actionText={toast.actionText}
        onAction={toast.onAction}
      />

      {/* Quick Search Modal */}
      <SearchModal
        visible={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppDataProvider>
          <AppLayout />
        </AppDataProvider>
      </ThemeProvider>
    </Router>
  );
}
