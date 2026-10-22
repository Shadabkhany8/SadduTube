import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { IoPlay, IoBookmark, IoBookmarkOutline, IoFolderOpenOutline } from 'react-icons/io5';
import { formatRelativeTime } from '../utils/formatters';

interface VideoCardProps {
  video: Video;
  layout?: 'vertical' | 'horizontal';
  onSaveTabModal?: (video: Video) => void;
  onToast?: (msg: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  layout = 'vertical',
  onSaveTabModal,
  onToast,
}) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useAppData();

  const bookmarked = isBookmarked(video.id);

  // Directly use official Google YouTube CDN for 100% reliable image loading
  const defaultCdnThumb = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  const [thumbSrc, setThumbSrc] = React.useState<string>(() => {
    if (!video.thumbnailUrl || video.thumbnailUrl.includes('invidious')) {
      return defaultCdnThumb;
    }
    return video.thumbnailUrl;
  });

  React.useEffect(() => {
    if (!video.thumbnailUrl || video.thumbnailUrl.includes('invidious')) {
      setThumbSrc(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`);
    } else {
      setThumbSrc(video.thumbnailUrl);
    }
  }, [video.id, video.thumbnailUrl]);

  const handleThumbError = () => {
    if (thumbSrc.includes('hqdefault.jpg')) {
      setThumbSrc(`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`);
    } else if (thumbSrc.includes('mqdefault.jpg')) {
      setThumbSrc(`https://img.youtube.com/vi/${video.id}/default.jpg`);
    }
  };

  const handleOpenVideo = () => {
    navigate(`/video/${video.id}`, { state: { video } });
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeBookmarked = !bookmarked;
    toggleBookmark(video);
    if (onToast) {
      onToast(willBeBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
    }
  };

  const handleSaveTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveTabModal) {
      onSaveTabModal(video);
    }
  };

  if (layout === 'horizontal') {
    return (
      <div
        className="video-card-horizontal"
        onClick={handleOpenVideo}
        style={{
          display: 'flex',
          gap: '0.85rem',
          padding: '0.65rem',
          borderRadius: 16,
          backgroundColor: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          cursor: 'pointer',
          transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          marginBottom: '0.75rem',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 82,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: colors.surfaceVariant,
          }}
        >
          <img
            src={thumbSrc}
            alt={video.title}
            onError={handleThumbError}
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          {video.duration && (
            <span
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.15rem 0.35rem',
                borderRadius: 4,
              }}
            >
              {video.duration}
            </span>
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
            className="play-hover-overlay"
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
              }}
            >
              <IoPlay size={14} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h4
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {video.title}
          </h4>
          <span style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
            {video.channelTitle}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: colors.textMuted }}>
            {video.viewCount && <span>{video.viewCount}</span>}
            {video.viewCount && <span>•</span>}
            <span>{formatRelativeTime(video.publishedAt)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={handleToggleBookmark}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              border: 'none',
              backgroundColor: bookmarked ? 'rgba(255, 30, 56, 0.15)' : colors.surfaceVariant,
              color: bookmarked ? colors.primary : colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {bookmarked ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}
          </button>

          <button
            onClick={handleSaveTab}
            title="Save Tab"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              border: 'none',
              backgroundColor: colors.surfaceVariant,
              color: colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <IoFolderOpenOutline size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Vertical (Grid layout)
  return (
    <div
      className="video-card-vertical"
      onClick={handleOpenVideo}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        backgroundColor: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: colors.surfaceVariant,
          overflow: 'hidden',
        }}
      >
        <img
          src={thumbSrc}
          alt={video.title}
          onError={handleThumbError}
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        {video.duration && (
          <span
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.15rem 0.4rem',
              borderRadius: 5,
            }}
          >
            {video.duration}
          </span>
        )}
      </div>

      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 0.35rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5rem',
          }}
        >
          {video.title}
        </h4>

        <div style={{ marginTop: 'auto' }}>
          <span style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.25rem' }}>
            {video.channelTitle}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: colors.textMuted,
            }}
          >
            <span>{video.viewCount || 'YouTube Video'}</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={handleToggleBookmark}
                title={bookmarked ? 'Bookmarked' : 'Bookmark'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: bookmarked ? colors.primary : colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 2,
                }}
              >
                {bookmarked ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}
              </button>
              <button
                onClick={handleSaveTab}
                title="Save Tab"
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 2,
                }}
              >
                <IoFolderOpenOutline size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
