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
  IoGridOutline,
  IoListOutline,
} from 'react-icons/io5';

interface BookmarksScreenProps {
  onToast: (msg: string) => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ onToast }) => {
  const { colors } = useTheme();
  const { bookmarks, removeBookmark, clearBookmarks } = useAppData();
  const navigate = useNavigate();

  const [filterQuery, setFilterQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredBookmarks = bookmarks.filter((item) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q))
    );
  });

  const handleClearAll = () => {
    clearBookmarks();
    setShowClearModal(false);
    onToast('Cleared all bookmarks');
  };

  return (
    <div
      className="bookmarks-screen-container"
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
          Bookmarks ({bookmarks.length})
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {bookmarks.length > 0 && (
            <>
              {/* Grid / List View Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                title={viewMode === 'list' ? 'Grid View' : 'List View'}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: colors.surfaceVariant,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {viewMode === 'list' ? <IoGridOutline size={18} /> : <IoListOutline size={18} />}
              </button>

              <button
                onClick={() => setShowClearModal(true)}
                title="Clear All Bookmarks"
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
            </>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      {bookmarks.length > 0 && (
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
            placeholder="Search saved bookmarks..."
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
      {bookmarks.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No Bookmarks Saved"
          description="Save favorite YouTube videos or pages with one tap while browsing to easily access them later."
          buttonTitle="Discover Videos"
          onButtonPress={() => navigate('/youtube')}
        />
      ) : filteredBookmarks.length === 0 ? (
        <EmptyState
          icon="filter"
          title="No Matching Bookmarks"
          description={`No bookmarks match your search for "${filterQuery}".`}
          buttonTitle="Clear Filter"
          onButtonPress={() => setFilterQuery('')}
        />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {filteredBookmarks.map((item) => (
            <BrowserItemCard
              key={item.id}
              id={item.id}
              url={item.url}
              title={item.title}
              timestamp={item.bookmarkedAt}
              thumbnailUrl={item.thumbnailUrl}
              onDelete={() => {
                removeBookmark(item.id);
                onToast('Removed bookmark');
              }}
              layout="compact"
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredBookmarks.map((item) => (
            <BrowserItemCard
              key={item.id}
              id={item.id}
              url={item.url}
              title={item.title}
              timestamp={item.bookmarkedAt}
              thumbnailUrl={item.thumbnailUrl}
              onDelete={() => {
                removeBookmark(item.id);
                onToast('Removed bookmark');
              }}
              layout="list"
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={showClearModal}
        title="Clear All Bookmarks?"
        message="Are you sure you want to delete all saved bookmarks? This action cannot be undone."
        confirmText="Clear All"
        isDanger={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};
