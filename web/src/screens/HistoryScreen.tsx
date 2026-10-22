import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { BrowserItemCard } from '../components/BrowserItemCard';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  IoArrowBack,
  IoTrashOutline,
  IoSearch,
  IoCloseCircle,
} from 'react-icons/io5';

interface HistoryScreenProps {
  onToast: (msg: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onToast }) => {
  const { colors } = useTheme();
  const { history, removeFromHistory, clearHistory, isBookmarked, toggleBookmark } = useAppData();
  const navigate = useNavigate();

  const [filterQuery, setFilterQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Strictly filter to actual videos only
  const validVideos = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  );

  const filteredHistory = validVideos.filter((item) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.channelTitle && item.channelTitle.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q))
    );
  });

  const handleClearAll = () => {
    clearHistory();
    setShowClearModal(false);
    onToast('Cleared watch history');
  };

  return (
    <div
      className="history-screen-container"
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '1.25rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.85rem',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 12,
            backgroundColor: colors.surfaceVariant,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <IoArrowBack size={18} />
          Back
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
          Watch History ({validVideos.length})
        </h2>

        {validVideos.length > 0 ? (
          <button
            onClick={() => setShowClearModal(true)}
            title="Clear Watch History"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: 'none',
              color: colors.danger,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IoTrashOutline size={18} />
          </button>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>

      {/* Filter / Search Bar */}
      {validVideos.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colors.surfaceVariant,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: '0 0.85rem',
            gap: '0.65rem',
            height: 44,
            marginBottom: '1.25rem',
          }}
        >
          <IoSearch size={18} color={colors.textMuted} />
          <input
            type="text"
            placeholder="Search watch history..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: colors.textPrimary,
              fontSize: '0.9rem',
            }}
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.textMuted,
                display: 'flex',
                padding: 2,
              }}
            >
              <IoCloseCircle size={18} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {validVideos.length === 0 ? (
        <EmptyState
          icon="time"
          title="No Watch History"
          description="Videos you watch in SadduTube will automatically be saved here and persist across browser sessions."
          buttonTitle="Explore Videos"
          onButtonPress={() => navigate('/youtube')}
        />
      ) : filteredHistory.length === 0 ? (
        <EmptyState
          icon="filter"
          title="No Matching History"
          description={`No history entries match your search for "${filterQuery}".`}
          buttonTitle="Clear Filter"
          onButtonPress={() => setFilterQuery('')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredHistory.map((item) => (
            <BrowserItemCard
              key={item.id}
              id={item.id}
              url={item.url}
              title={item.title}
              timestamp={item.watchedAt}
              thumbnailUrl={item.thumbnailUrl}
              isBookmarked={isBookmarked(item.url)}
              onBookmarkToggle={() => {
                const isNow = toggleBookmark(item.url, item.title);
                onToast(isNow ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
              }}
              onDelete={() => {
                removeFromHistory(item.id);
                onToast('Removed from history');
              }}
              layout="list"
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={showClearModal}
        title="Clear Watch History?"
        message="Are you sure you want to clear your local watch history? This action cannot be undone."
        confirmText="Clear History"
        isDanger={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};
