import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { VideoCard } from '../components/VideoCard';
import { Video } from '../types';
import { YouTubeService } from '../services/youtube.service';
import { extractYouTubeVideoId, normalizeYouTubeUrl } from '../utils/validation';
import {
  IoSearch,
  IoLogoYoutube,
  IoCompass,
  IoFlame,
  IoMusicalNotes,
  IoGameController,
  IoAlbums,
  IoLibrary,
  IoCloseCircle,
} from 'react-icons/io5';

interface YouTubeBrowserScreenProps {
  onToast: (msg: string) => void;
}

export const YouTubeBrowserScreen: React.FC<YouTubeBrowserScreenProps> = ({ onToast }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const initialUrl = searchParams.get('url') || '';
  const initialQuery = searchParams.get('q') || '';

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Trending');

  useEffect(() => {
    // If a direct video URL or ID was provided, navigate directly to player
    if (initialUrl) {
      const vId = extractYouTubeVideoId(initialUrl);
      if (vId) {
        navigate(`/video/${vId}`, { replace: true });
        return;
      }
    }

    if (initialQuery) {
      handleSearchQuery(initialQuery);
    } else {
      loadCategoryFeed('Trending');
    }
  }, [initialUrl, initialQuery, navigate]);

  const loadCategoryFeed = async (category: string) => {
    setActiveCategory(category);
    setLoading(true);
    try {
      const vids = await YouTubeService.getPopularVideos(15);
      setResults(vids);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearchQuery = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    setLoading(true);
    setActiveCategory(`Search: "${searchStr}"`);
    try {
      const vId = extractYouTubeVideoId(searchStr);
      if (vId) {
        navigate(`/video/${vId}`);
        return;
      }
      const vids = await YouTubeService.searchVideos(searchStr, 15);
      setResults(vids);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    handleSearchQuery(queryInput);
  };

  const quickJumpButtons = [
    { label: 'Trending', icon: <IoFlame size={16} /> },
    { label: 'Music', icon: <IoMusicalNotes size={16} /> },
    { label: 'Gaming', icon: <IoGameController size={16} /> },
    { label: 'Tech', icon: <IoCompass size={16} /> },
    { label: 'News', icon: <IoAlbums size={16} /> },
    { label: 'Library', icon: <IoLibrary size={16} /> },
  ];

  return (
    <div
      className="youtube-browser-container"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '1.25rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Address / Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
      >
        <IoLogoYoutube size={28} color={colors.primary} />
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search YouTube or paste URL / Video ID..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: colors.textPrimary,
            }}
          />
          {queryInput.length > 0 && (
            <button
              type="button"
              onClick={() => setQueryInput('')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.textMuted,
                cursor: 'pointer',
                display: 'flex',
                padding: 2,
              }}
            >
              <IoCloseCircle size={18} />
            </button>
          )}
          <button
            type="submit"
            style={{
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '0.55rem 1.15rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <IoSearch size={16} />
            Search
          </button>
        </form>
      </div>

      {/* Quick Destinations bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {quickJumpButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => {
              setQueryInput(btn.label);
              handleSearchQuery(btn.label);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: 20,
              border: `1px solid ${activeCategory.includes(btn.label) ? colors.primary : colors.border}`,
              backgroundColor: activeCategory.includes(btn.label) ? colors.primary : colors.surfaceVariant,
              color: activeCategory.includes(btn.label) ? '#FFFFFF' : colors.textPrimary,
              fontSize: '0.85rem',
              fontWeight: activeCategory.includes(btn.label) ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.18s ease',
            }}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
          {activeCategory} ({results.length})
        </h3>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              style={{
                height: 220,
                backgroundColor: colors.surfaceVariant,
                borderRadius: 16,
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.textSecondary }}>
          <p>No results found for your query.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {results.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              layout="vertical"
              onToast={onToast}
            />
          ))}
        </div>
      )}
    </div>
  );
};
