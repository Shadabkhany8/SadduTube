import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from '../utils/formatters';
import { extractYouTubeVideoId } from '../utils/validation';
import { IoPlay, IoTimeOutline, IoLinkOutline, IoBookmark, IoBookmarkOutline, IoTrashOutline } from 'react-icons/io5';

interface BrowserItemCardProps {
  id: string;
  url: string;
  title: string;
  timestamp?: string;
  thumbnailUrl?: string;
  onDelete?: () => void;
  onBookmarkToggle?: () => void;
  isBookmarked?: boolean;
  layout?: 'list' | 'compact';
}

export const BrowserItemCard: React.FC<BrowserItemCardProps> = ({
  url,
  title,
  timestamp,
  thumbnailUrl,
  onDelete,
  onBookmarkToggle,
  isBookmarked = false,
  layout = 'list',
}) => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const videoId = extractYouTubeVideoId(url);

  const handlePress = () => {
    if (videoId) {
      navigate(`/video/${videoId}`);
    } else {
      navigate(`/youtube?url=${encodeURIComponent(url)}`);
    }
  };

  const domain = url ? url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : 'youtube.com';

  if (layout === 'compact') {
    return (
      <div
        className="compact-browser-card"
        onClick={handlePress}
        style={{
          width: 170,
          borderRadius: 14,
          backgroundColor: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          overflow: 'hidden',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div
          style={{
            width: '100%',
            height: 96,
            position: 'relative',
            backgroundColor: colors.surfaceVariant,
          }}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IoPlay size={24} color={colors.primary} />
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              backgroundColor: 'rgba(0,0,0,0.75)',
              borderRadius: 8,
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
            }}
          >
            <IoPlay size={10} style={{ marginLeft: 1 }} />
          </div>
        </div>

        <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: colors.textPrimary,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.1rem',
            }}
          >
            {title || 'YouTube Page'}
          </span>
          {timestamp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: colors.textMuted }}>
              <IoTimeOutline size={12} />
              <span>{formatRelativeTime(timestamp)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full list layout
  return (
    <div
      className="list-browser-card"
      onClick={handlePress}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.65rem 0.85rem',
        borderRadius: 16,
        backgroundColor: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        marginBottom: '0.65rem',
        gap: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: 110,
          height: 68,
          borderRadius: 10,
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          backgroundColor: colors.surfaceVariant,
        }}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IoPlay size={24} color={colors.primary} />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.75)',
            borderRadius: 6,
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
          }}
        >
          <IoPlay size={9} style={{ marginLeft: 1 }} />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: colors.textPrimary,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title || 'YouTube Page'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: colors.textMuted }}>
          <IoLinkOutline size={12} />
          <span style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {domain}
          </span>
          {timestamp && (
            <>
              <span>•</span>
              <span>{formatRelativeTime(timestamp)}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {onBookmarkToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle();
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              border: 'none',
              backgroundColor: isBookmarked ? 'rgba(255, 30, 56, 0.15)' : colors.surfaceVariant,
              color: isBookmarked ? colors.primary : colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isBookmarked ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}
          </button>
        )}

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              border: 'none',
              backgroundColor: colors.surfaceVariant,
              color: colors.danger,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <IoTrashOutline size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
