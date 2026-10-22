import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { SadduTubeBrand } from './SadduTubeBrand';
import { SearchAutocompleteDropdown } from './SearchAutocompleteDropdown';
import { SearchHistoryService } from '../services/searchHistory.service';
import {
  IoSearch,
  IoCloudDownloadOutline,
  IoSettingsOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoClose,
} from 'react-icons/io5';

interface NavbarProps {
  onOpenSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearchModal }) => {
  const { colors, isDark, setThemeMode } = useTheme();
  const { bookmarks, history } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [inlineSearch, setInlineSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelectSuggestion = (selectedQuery: string) => {
    SearchHistoryService.addSearchQuery(selectedQuery);
    setInlineSearch('');
    setShowDropdown(false);
    navigate(`/youtube?q=${encodeURIComponent(selectedQuery)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineSearch.trim()) return;
    const query = inlineSearch.trim();
    SearchHistoryService.addSearchQuery(query);
    setInlineSearch('');
    setShowDropdown(false);
    navigate(`/youtube?q=${encodeURIComponent(query)}`);
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <header
      className="app-navbar"
      style={{
        height: 64,
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <SadduTubeBrand size="medium" />
        </div>
      </div>

      {/* Center Search Bar (Visible on desktop & tablets) with Autocomplete */}
      <div style={{ position: 'relative', maxWidth: 480, flex: 1, margin: '0 1.5rem' }}>
        <form
          onSubmit={handleSearchSubmit}
          className="navbar-search-form"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colors.surfaceVariant,
            border: `1px solid ${showDropdown ? colors.primary : colors.border}`,
            borderRadius: 24,
            padding: '0 0.85rem',
            height: 40,
            transition: 'border-color 0.2s ease',
          }}
        >
          <IoSearch size={18} color={colors.textMuted} />
          <input
            type="text"
            placeholder="Search YouTube or paste URL..."
            value={inlineSearch}
            onChange={(e) => {
              setInlineSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: colors.textPrimary,
              fontSize: '0.88rem',
              padding: '0 0.5rem',
            }}
          />
          {inlineSearch && (
            <button
              type="button"
              onClick={() => {
                setInlineSearch('');
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
              <IoClose size={16} />
            </button>
          )}
        </form>

        <SearchAutocompleteDropdown
          query={inlineSearch}
          isOpen={showDropdown}
          onSelect={handleSelectSuggestion}
          onClose={() => setShowDropdown(false)}
        />
      </div>

      {/* Right action icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Mobile Search Button */}
        <button
          type="button"
          className="mobile-search-trigger"
          onClick={onOpenSearchModal}
          title="Search"
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            border: 'none',
            backgroundColor: colors.surfaceVariant,
            color: colors.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <IoSearch size={18} />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            border: 'none',
            backgroundColor: colors.surfaceVariant,
            color: colors.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          {isDark ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
        </button>

        {/* Downloads Screen Link */}
        <button
          type="button"
          onClick={() => navigate('/downloads')}
          title="Offline Downloads"
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            border: 'none',
            backgroundColor: location.pathname === '/downloads' ? colors.badgeBg : colors.surfaceVariant,
            color: location.pathname === '/downloads' ? colors.primary : colors.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <IoCloudDownloadOutline size={19} />
        </button>

        {/* Settings Screen Link */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          title="Settings"
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            border: 'none',
            backgroundColor: location.pathname === '/settings' ? colors.badgeBg : colors.surfaceVariant,
            color: location.pathname === '/settings' ? colors.primary : colors.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <IoSettingsOutline size={19} />
        </button>
      </div>
    </header>
  );
};
