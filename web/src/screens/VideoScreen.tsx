import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoCard } from '../components/VideoCard';
import { AddSavedTabModal } from '../components/AddSavedTabModal';
import { DownloadModal } from '../components/DownloadModal';
import { Video } from '../types';
import { YouTubeService } from '../services/youtube.service';
import { deduplicateVideos, formatRelativeTime } from '../utils/formatters';
import {
  IoArrowBack,
  IoBookmark,
  IoBookmarkOutline,
  IoFolderOpenOutline,
  IoShareSocialOutline,
  IoCloudDownloadOutline,
  IoPerson,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5';

interface VideoScreenProps {
  onToast: (msg: string, actionText?: string, onAction?: () => void) => void;
}

export const VideoScreen: React.FC<VideoScreenProps> = ({ onToast }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { isBookmarked, toggleBookmark, addSavedTab, addToHistory } = useAppData();

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreRelated, setLoadingMoreRelated] = useState(false);
  const [relatedPage, setRelatedPage] = useState(1);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showSaveTabModal, setShowSaveTabModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const videoId = id || '';
  const bookmarked = videoId ? isBookmarked(videoId) : false;

  useEffect(() => {
    if (!videoId) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRelatedPage(1);
    setHasMoreRelated(true);

    const loadDetails = async () => {
      setLoading(true);
      try {
        const details = await YouTubeService.getVideoById(videoId);
        setVideo(details);

        // Auto log to watch history
        addToHistory(details);

        // Fetch tailored related songs/videos specifically for this video
        const related = await YouTubeService.getRelatedVideos(details, 30, 1);
        setRelatedVideos(related.filter((v) => v.id !== videoId));
      } catch (err) {
        console.warn('Failed to load video details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [videoId, addToHistory]);

  const handleLoadMoreRelated = async () => {
    if (!video || loadingMoreRelated) return;
    setLoadingMoreRelated(true);
    try {
      const nextPage = relatedPage + 1;
      const more = await YouTubeService.getRelatedVideos(video, 25, nextPage);
      const filtered = more.filter((v) => v.id !== video.id);
      setRelatedVideos((prev) => deduplicateVideos(prev, filtered));
      setRelatedPage(nextPage);
      if (filtered.length === 0) setHasMoreRelated(false);
    } catch {
      // ignore
    } finally {
      setLoadingMoreRelated(false);
    }
  };

  const handleToggleBookmark = () => {
    if (!video) return;
    const willBeBookmarked = !bookmarked;
    toggleBookmark(video);
    onToast(
      willBeBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
      willBeBookmarked ? 'View' : undefined,
      willBeBookmarked ? () => navigate('/bookmarks') : undefined
    );
  };

  const handleShare = async () => {
    if (!video) return;
    const shareUrl = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch "${video.title}" on YouTube:`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      onToast('Link copied to clipboard!');
    } catch {
      onToast('Share URL: ' + shareUrl);
    }
  };

  const handleSponsorSkipped = (savedSeconds: number, category: string) => {
    onToast(`⚡ Skipped ${category} (${savedSeconds}s saved)`);
  };

  if (!videoId) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: colors.textPrimary }}>
        <h2>Invalid Video ID</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '1rem',
            padding: '0.65rem 1.5rem',
            borderRadius: 12,
            border: 'none',
            backgroundColor: colors.primary,
            color: '#FFF',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div
      className="video-screen-layout"
      style={{
        maxWidth: 1300,
        margin: '0 auto',
        padding: '1rem 1.25rem 3rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Row with Back button and Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          gap: '1rem',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
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

        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: 0,
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {video ? video.title : 'Loading Video...'}
        </h3>

        <div style={{ display: 'flex', gap: '0.45rem' }}>
          <button
            onClick={() => setShowDownloadModal(true)}
            title="Download Offline"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: 'none',
              backgroundColor: colors.surfaceVariant,
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IoCloudDownloadOutline size={18} />
          </button>

          <button
            onClick={handleShare}
            title="Share Video"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: 'none',
              backgroundColor: colors.surfaceVariant,
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IoShareSocialOutline size={18} />
          </button>
        </div>
      </div>

      <div className="video-player-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '1.5rem' }}>
        {/* Main Column */}
        <div style={{ minWidth: 0 }}>
          {/* Official YouTube Embedded Player */}
          <VideoPlayer
            videoId={videoId}
            title={video?.title}
            onSponsorSkipped={handleSponsorSkipped}
          />

          {/* Video Metadata & Info */}
          {loading ? (
            <div style={{ padding: '1.5rem 0' }}>
              <div style={{ height: 24, width: '70%', backgroundColor: colors.surfaceVariant, borderRadius: 6, marginBottom: '0.75rem' }} />
              <div style={{ height: 16, width: '40%', backgroundColor: colors.surfaceVariant, borderRadius: 6 }} />
            </div>
          ) : video ? (
            <div style={{ paddingTop: '1.25rem' }}>
              <h1
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: colors.textPrimary,
                  lineHeight: 1.35,
                  margin: '0 0 0.5rem',
                }}
              >
                {video.title}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: colors.textMuted,
                  marginBottom: '1rem',
                }}
              >
                <span>{video.viewCount || 'YouTube Video'}</span>
                <span>•</span>
                <span>{formatRelativeTime(video.publishedAt)}</span>
              </div>

              {/* Action Pills Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <button
                  onClick={handleToggleBookmark}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: bookmarked ? colors.badgeBg : colors.surfaceVariant,
                    color: bookmarked ? colors.primary : colors.textPrimary,
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {bookmarked ? <IoBookmark size={18} /> : <IoBookmarkOutline size={18} />}
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>

                <button
                  onClick={() => setShowSaveTabModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: colors.surfaceVariant,
                    color: colors.textPrimary,
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IoFolderOpenOutline size={18} />
                  Save Tab
                </button>

                <button
                  onClick={() => setShowDownloadModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: colors.surfaceVariant,
                    color: colors.textPrimary,
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IoCloudDownloadOutline size={18} />
                  Download
                </button>

                <button
                  onClick={handleShare}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: colors.surfaceVariant,
                    color: colors.textPrimary,
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IoShareSocialOutline size={18} />
                  Share
                </button>
              </div>

              {/* Channel Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  <IoPerson size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.15rem' }}>
                    {video.channelTitle}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                    YouTube Creator
                  </span>
                </div>
              </div>

              {/* Description Box */}
              <div
                onClick={() => setShowFullDesc(!showFullDesc)}
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 14,
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: colors.textSecondary,
                    lineHeight: 1.55,
                    margin: 0,
                    whiteSpace: 'pre-line',
                    display: showFullDesc ? 'block' : '-webkit-box',
                    WebkitLineClamp: showFullDesc ? undefined : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {video.description || 'No description available for this video.'}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginTop: '0.5rem',
                    color: colors.primary,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <span>{showFullDesc ? 'Show less' : 'Read more...'}</span>
                  {showFullDesc ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar / Related Videos Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: colors.textPrimary,
                margin: 0,
              }}
            >
              Related Songs & Videos ({relatedVideos.length})
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: colors.primary,
                backgroundColor: colors.badgeBg,
                padding: '0.2rem 0.5rem',
                borderRadius: 8,
              }}
            >
              Tailored
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {relatedVideos.map((item) => (
              <VideoCard
                key={item.id}
                video={item}
                layout="horizontal"
                onToast={onToast}
              />
            ))}

            {hasMoreRelated && relatedVideos.length > 0 && (
              <button
                onClick={handleLoadMoreRelated}
                disabled={loadingMoreRelated}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceVariant,
                  color: colors.primary,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: loadingMoreRelated ? 'wait' : 'pointer',
                  width: '100%',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {loadingMoreRelated ? 'Loading More Related Songs...' : 'Load More Related Songs'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Tab Modal */}
      {video && (
        <AddSavedTabModal
          visible={showSaveTabModal}
          onClose={() => setShowSaveTabModal(false)}
          initialUrl={`https://www.youtube.com/watch?v=${video.id}`}
          initialTitle={video.title}
          onSave={async (u, t, n) => {
            await addSavedTab(video, t, n);
            onToast('Saved tab to workspace!');
          }}
        />
      )}

      {/* Download Modal */}
      {video && (
        <DownloadModal
          visible={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          video={{
            id: video.id,
            title: video.title,
            channelTitle: video.channelTitle,
            thumbnailUrl: video.thumbnailUrl,
          }}
          onSuccess={(msg) => onToast(msg)}
        />
      )}
    </div>
  );
};
