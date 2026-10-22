import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { SearchAutocompleteDropdown } from './SearchAutocompleteDropdown';
import { SearchHistoryService } from '../services/searchHistory.service';
import {
  IoSearch,
  IoClose,
  IoLogoYoutube,
  IoBookmark,
  IoTime,
  IoHome,
  IoFlame,
  IoMusicalNotes,
  IoGameController,
  IoAlbums,
  IoLibrary,
} from 'react-icons/io5';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(true);

  if (!visible) return null;

  const handleSelectSuggestion = (selectedQuery: string) => {
    SearchHistoryService.addSearchQuery(selectedQuery);
    onClose();
    setQuery('');
    navigate(`/youtube?q=${encodeURIComponent(selectedQuery)}`);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    const targetQuery = query.trim();
    SearchHistoryService.addSearchQuery(targetQuery);
    onClose();
    setQuery('');
    navigate(`/youtube?q=${encodeURIComponent(targetQuery)}`);
  };

  const handleQuickJump = (destUrl: string) => {
    onClose();
    navigate(`/youtube?url=${encodeURIComponent(destUrl)}`);
  };

  const quickDests = [
    { label: 'YouTube Home', url: 'https://www.youtube.com', icon: <IoHome size={15} /> },
    { label: 'Trending', url: 'https://www.youtube.com/feed/trending', icon: <IoFlame size={15} /> },
    { label: 'Music', url: 'https://www.youtube.com/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ', icon: <IoMusicalNotes size={15} /> },
    { label: 'Gaming', url: 'https://www.youtube.com/gaming', icon: <IoGameController size={15} /> },
    { label: 'Subscriptions', url: 'https://www.youtube.com/feed/subscriptions', icon: <IoAlbums size={15} /> },
    { label: 'Library', url: 'https://www.youtube.com/feed/library', icon: <IoLibrary size={15} /> },
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.overlay,
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IoLogoYoutube size={24} color={colors.primary} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              Search YouTube
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.textMuted,
              display: 'flex',
              padding: 4,
            }}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <form onSubmit={handleSearch}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: colors.surfaceVariant,
                border: `1px solid ${showDropdown ? colors.primary : colors.border}`,
                borderRadius: 14,
                padding: '0 0.85rem',
                gap: '0.65rem',
                marginBottom: '0.75rem',
                transition: 'border-color 0.2s ease',
              }}
            >
              <IoSearch size={20} color={colors.textMuted} />
              <input
                type="text"
                placeholder="Search query or enter YouTube URL..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                autoFocus
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  padding: '0.85rem 0',
                  color: colors.textPrimary,
                  fontSize: '0.95rem',
                }}
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setShowDropdown(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.textMuted,
                    display: 'flex',
                    padding: 2,
                  }}
                >
                  <IoClose size={18} />
                </button>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '0.8rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              Go to YouTube
            </button>
          </form>

          <SearchAutocompleteDropdown
            query={query}
            isOpen={showDropdown}
            onSelect={handleSelectSuggestion}
            onClose={() => setShowDropdown(false)}
            style={{ maxHeight: 250 }}
          />
        </div>

        {/* Quick Nav Row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/bookmarks');
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 149, 0, 0.12)',
              border: '1px solid rgba(255, 149, 0, 0.25)',
              color: colors.textPrimary,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <IoBookmark size={16} color="#FF9500" />
            Saved Bookmarks
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/history');
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: 12,
              backgroundColor: 'rgba(0, 122, 255, 0.12)',
              border: '1px solid rgba(0, 122, 255, 0.25)',
              color: colors.textPrimary,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <IoTime size={16} color="#007AFF" />
            Watch History
          </button>
        </div>

        {/* Quick Destinations */}
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.textSecondary,
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Quick Destinations
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {quickDests.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleQuickJump(item.url)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: 20,
                  backgroundColor: colors.surfaceVariant,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ color: colors.primary }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
