import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SearchHistoryService } from '../services/searchHistory.service';
import { SuggestionService } from '../services/suggestion.service';
import { SearchHistoryItem } from '../types';
import { IoSearchOutline, IoTimeOutline, IoClose, IoTrashOutline } from 'react-icons/io5';

interface SearchAutocompleteDropdownProps {
  query: string;
  isOpen: boolean;
  onSelect: (selectedQuery: string) => void;
  onClose: () => void;
  style?: React.CSSProperties;
}

export const SearchAutocompleteDropdown: React.FC<SearchAutocompleteDropdownProps> = ({
  query,
  isOpen,
  onSelect,
  onClose,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load history whenever dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHistoryItems(SearchHistoryService.getSearchHistory());
    }
  }, [isOpen]);

  // Fetch live YouTube suggestions as user types
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setLiveSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const results = await SuggestionService.getLiveSuggestions(trimmed);
        setLiveSuggestions(results);
      } catch {
        setLiveSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim().toLowerCase();

  // Filter history matching current query (or all recent if query is empty)
  const matchedHistory = trimmedQuery
    ? historyItems.filter((h) => h.query.toLowerCase().includes(trimmedQuery))
    : historyItems;

  // Filter live suggestions to avoid duplicate with history
  const filteredSuggestions = liveSuggestions.filter(
    (sug) => !matchedHistory.some((h) => h.query.toLowerCase() === sug.toLowerCase())
  );

  const hasAnyItems = matchedHistory.length > 0 || filteredSuggestions.length > 0;

  const handleRemoveHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = SearchHistoryService.removeSearchQuery(id);
    setHistoryItems(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    SearchHistoryService.clearSearchHistory();
    setHistoryItems([]);
  };

  return (
    <div
      ref={dropdownRef}
      className="search-autocomplete-dropdown"
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        right: 0,
        backgroundColor: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 16,
        boxShadow: isDark
          ? '0 16px 36px rgba(0, 0, 0, 0.65)'
          : '0 12px 30px rgba(0, 0, 0, 0.12)',
        zIndex: 9999,
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        maxHeight: 380,
        overflowY: 'auto',
        ...style,
      }}
    >
      {/* 1. Recent Search History Items */}
      {matchedHistory.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.95rem 0.35rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: colors.textMuted,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <span>{trimmedQuery ? 'From Search History' : 'Recent Searches'}</span>
            {!trimmedQuery && (
              <button
                type="button"
                onClick={handleClearAllHistory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.primary,
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0,
                }}
              >
                <IoTrashOutline size={12} />
                Clear
              </button>
            )}
          </div>

          {matchedHistory.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.query)}
              className="suggestion-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.95rem',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                color: colors.textPrimary,
                fontSize: '0.88rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surfaceVariant;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                <IoTimeOutline size={16} color={colors.textMuted} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                  }}
                >
                  {item.query}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                title="Remove from history"
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: 4,
                }}
              >
                <IoClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. Real-Time Live YouTube Suggestions */}
      {filteredSuggestions.length > 0 && (
        <div>
          {matchedHistory.length > 0 && (
            <div
              style={{
                padding: '0.45rem 0.95rem 0.25rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: colors.textMuted,
                borderTop: `1px solid ${colors.border}`,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              YouTube Suggestions
            </div>
          )}

          {filteredSuggestions.map((suggestion, idx) => (
            <div
              key={`${suggestion}-${idx}`}
              onClick={() => onSelect(suggestion)}
              className="suggestion-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.95rem',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                color: colors.textPrimary,
                fontSize: '0.88rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surfaceVariant;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <IoSearchOutline size={16} color={colors.primary} style={{ flexShrink: 0 }} />
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {suggestion}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Empty State fallback if nothing found */}
      {!hasAnyItems && (
        <div style={{ padding: '1rem', textAlign: 'center', color: colors.textMuted, fontSize: '0.85rem' }}>
          {loadingSuggestions ? 'Loading suggestions...' : 'Type to search YouTube'}
        </div>
      )}
    </div>
  );
};
