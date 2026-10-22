import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { BrowserItemCard } from '../components/BrowserItemCard';
import { VideoCard } from '../components/VideoCard';
import { AddSavedTabModal } from '../components/AddSavedTabModal';
import { Video } from '../types';
import { YouTubeService } from '../services/youtube.service';
import { extractYouTubeVideoId, normalizeYouTubeUrl } from '../utils/validation';
import {
  IoLogoYoutube,
  IoSearch,
  IoCloseCircle,
  IoCompass,
  IoBookmark,
  IoTime,
  IoCloudDownload,
  IoPlayCircleOutline,
  IoBookmarkOutline,
  IoFlameOutline,
} from 'react-icons/io5';

interface HomeScreenProps {
  onToast: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onToast }) => {
  const { colors } = useTheme();
  const { history, bookmarks } = useAppData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  // Strictly filter to actual videos only
  const validHistory = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  );

  useEffect(() => {
    let isCurrent = true;
    const loadVideos = async () => {
      setLoadingVideos(true);
      try {
        if (selectedCategory === 'All') {
          const list = await YouTubeService.getPopularVideos(16);
          if (isCurrent) setPopularVideos(list);
        } else {
          const list = await YouTubeService.searchVideos(`${selectedCategory} India`, 16);
          if (isCurrent) setPopularVideos(list);
        }
      } catch (e) {
        console.warn('Failed loading videos for category:', selectedCategory, e);
      } finally {
        if (isCurrent) setLoadingVideos(false);
      }
    };
    loadVideos();
    return () => {
      isCurrent = false;
    };
  }, [selectedCategory]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim();
    const videoId = extractYouTubeVideoId(trimmed);

    if (videoId) {
      navigate(`/video/${videoId}`);
    } else {
      navigate(`/youtube?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const categories = ['All', 'Music', 'Gaming', 'Technology', 'Travel & Vlogs', 'Cooking & Food', 'Sports'];

  return (
    <div className="home-screen-container" style={{ padding: '1.25rem', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Hero Card */}
      <div
        className="hero-card"
        style={{
          borderRadius: 20,
          backgroundColor: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 30, 56, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary,
              flexShrink: 0,
            }}
          >
            <IoLogoYoutube size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: colors.textPrimary, margin: '0 0 0.25rem' }}>
              Experience SadduTube
            </h2>
            <p style={{ fontSize: '0.88rem', color: colors.textSecondary, margin: 0, lineHeight: 1.4 }}>
              Watch, search, and discover YouTube with persistent watch history and ad-free playback.
            </p>
          </div>
        </div>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: colors.surfaceVariant,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              padding: '0 0.85rem',
              gap: '0.65rem',
              height: 48,
            }}
          >
            <IoSearch size={20} color={colors.textMuted} />
            <input
              type="text"
              placeholder="Search YouTube or enter video URL / ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: colors.textPrimary,
                fontSize: '0.95rem',
              }}
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
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
        </form>

        {/* Primary Action Button */}
        <button
          onClick={() => (searchQuery.trim() ? handleSearchSubmit() : navigate('/youtube'))}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 14,
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          <IoCompass size={20} />
          {searchQuery.trim() ? 'Search on YouTube' : 'Open YouTube'}
        </button>
      </div>

      {/* Navigation Quick Cards */}
      <div
        className="nav-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          onClick={() => navigate('/bookmarks')}
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 16,
            padding: '1.15rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          className="clickable-nav-card"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: 'rgba(255, 149, 0, 0.15)',
              color: '#FF9500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.65rem',
            }}
          >
            <IoBookmark size={20} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.2rem' }}>
            Bookmarks
          </h4>
          <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>
            {bookmarks.length} {bookmarks.length === 1 ? 'saved page' : 'saved pages'}
          </span>
        </div>

        <div
          onClick={() => navigate('/history')}
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 16,
            padding: '1.15rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          className="clickable-nav-card"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: 'rgba(0, 122, 255, 0.15)',
              color: '#007AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.65rem',
            }}
          >
            <IoTime size={20} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.2rem' }}>
            History
          </h4>
          <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>
            {validHistory.length} {validHistory.length === 1 ? 'video watched' : 'videos watched'}
          </span>
        </div>

        <div
          onClick={() => navigate('/downloads')}
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 16,
            padding: '1.15rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          className="clickable-nav-card"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: 'rgba(48, 209, 88, 0.15)',
              color: '#30D158',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.65rem',
            }}
          >
            <IoCloudDownload size={20} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.2rem' }}>
            Downloads
          </h4>
          <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>
            Offline media
          </span>
        </div>
      </div>

      {/* Continue Watching Carousel */}
      {validHistory.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IoPlayCircleOutline size={20} color={colors.primary} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                Continue Watching
              </h3>
            </div>
            <button
              onClick={() => navigate('/history')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.primary,
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              View All ({validHistory.length})
            </button>
          </div>

          <div
            className="horizontal-scroll-row"
            style={{
              display: 'flex',
              gap: '0.85rem',
              overflowX: 'auto',
              paddingBottom: '0.65rem',
              scrollbarWidth: 'thin',
            }}
          >
            {validHistory.slice(0, 10).map((item) => (
              <BrowserItemCard
                key={item.id}
                id={item.id}
                url={item.url}
                title={item.title}
                timestamp={item.watchedAt}
                thumbnailUrl={item.thumbnailUrl}
                layout="compact"
              />
            ))}
          </div>
        </section>
      )}

      {/* Bookmarked Pages Carousel */}
      {bookmarks.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IoBookmarkOutline size={20} color={colors.primary} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                Saved Bookmarks
              </h3>
            </div>
            <button
              onClick={() => navigate('/bookmarks')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.primary,
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              View All ({bookmarks.length})
            </button>
          </div>

          <div
            className="horizontal-scroll-row"
            style={{
              display: 'flex',
              gap: '0.85rem',
              overflowX: 'auto',
              paddingBottom: '0.65rem',
              scrollbarWidth: 'thin',
            }}
          >
            {bookmarks.slice(0, 10).map((item) => (
              <BrowserItemCard
                key={item.id}
                id={item.id}
                url={item.url}
                title={item.title}
                timestamp={item.bookmarkedAt}
                thumbnailUrl={item.thumbnailUrl}
                layout="compact"
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending & Featured Videos Feed */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <IoFlameOutline size={22} color={colors.primary} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
            Trending & Discover
          </h3>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 20,
                border: `1px solid ${selectedCategory === cat ? colors.primary : colors.border}`,
                backgroundColor: selectedCategory === cat ? colors.primary : colors.surfaceVariant,
                color: selectedCategory === cat ? '#FFFFFF' : colors.textPrimary,
                fontSize: '0.82rem',
                fontWeight: selectedCategory === cat ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loadingVideos ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
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
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {popularVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                layout="vertical"
                onSaveTabModal={(v) => setModalVideo(v)}
                onToast={onToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* Save Tab Modal */}
      {modalVideo && (
        <AddSavedTabModal
          visible={Boolean(modalVideo)}
          initialUrl={`https://www.youtube.com/watch?v=${modalVideo.id}`}
          initialTitle={modalVideo.title}
          onClose={() => setModalVideo(null)}
          onSave={(url, title, note) => {
            onToast('Saved tab to workspace!');
          }}
        />
      )}
    </div>
  );
};
