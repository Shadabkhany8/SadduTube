import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DownloadService } from '../services/download.service';
import { IoCloudDownloadOutline, IoClose, IoVideocamOutline, IoMusicalNotesOutline, IoCheckmarkCircle } from 'react-icons/io5';

interface DownloadModalProps {
  visible: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    channelTitle?: string;
    thumbnailUrl?: string;
  } | null;
  onSuccess?: (msg: string) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  visible,
  onClose,
  video,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const [selectedFormat, setSelectedFormat] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    if (visible) {
      setDownloadComplete(false);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [visible]);

  if (!visible || !video) return null;

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(10);

    // Progressive download simulation for browser offline library
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 250);

    setTimeout(async () => {
      clearInterval(interval);
      setDownloadProgress(100);

      const downloadedItem = await DownloadService.saveDownload({
        videoId: video.id,
        title: video.title,
        channelTitle: video.channelTitle,
        thumbnailUrl: video.thumbnailUrl || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
        format: selectedFormat,
        quality: selectedFormat === 'audio' ? 'MP3' : selectedQuality,
      });

      setIsDownloading(false);
      setDownloadComplete(true);

      if (onSuccess) {
        onSuccess(`Saved "${downloadedItem.title}" to offline library!`);
      }
    }, 1500);
  };

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
          maxWidth: 480,
          backgroundColor: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(48, 209, 88, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#30D158',
              }}
            >
              <IoCloudDownloadOutline size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              Download for Offline Playback
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
            <IoClose size={22} />
          </button>
        </div>

        {/* Video preview */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: colors.surfaceVariant,
            borderRadius: 14,
            marginBottom: '1.25rem',
            alignItems: 'center',
          }}
        >
          <img
            src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
            alt=""
            style={{ width: 80, height: 50, borderRadius: 8, objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: colors.textPrimary,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {video.title}
            </h4>
            <p style={{ fontSize: '0.75rem', color: colors.textMuted, margin: '0.2rem 0 0' }}>
              {video.channelTitle || 'YouTube Video'}
            </p>
          </div>
        </div>

        {downloadComplete ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <IoCheckmarkCircle size={56} color="#30D158" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.5rem' }}>
              Download Completed!
            </h4>
            <p style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '1.5rem' }}>
              This video is now stored in your local Offline Downloads library and ready to play anytime.
            </p>
            <button
              onClick={onClose}
              style={{
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '0.75rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Format selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                Select Media Format
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('video');
                    setSelectedQuality('720p');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: 12,
                    border: `1.5px solid ${selectedFormat === 'video' ? colors.primary : colors.border}`,
                    backgroundColor: selectedFormat === 'video' ? colors.badgeBg : colors.surfaceVariant,
                    color: selectedFormat === 'video' ? colors.primary : colors.textPrimary,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  <IoVideocamOutline size={18} />
                  Video (MP4)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('audio');
                    setSelectedQuality('MP3');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: 12,
                    border: `1.5px solid ${selectedFormat === 'audio' ? colors.primary : colors.border}`,
                    backgroundColor: selectedFormat === 'audio' ? colors.badgeBg : colors.surfaceVariant,
                    color: selectedFormat === 'audio' ? colors.primary : colors.textPrimary,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  <IoMusicalNotesOutline size={18} />
                  Audio Only (MP3)
                </button>
              </div>
            </div>

            {/* Quality selection */}
            {selectedFormat === 'video' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                  Video Quality
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['1080p', '720p', '480p', '360p'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuality(q)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: 10,
                        border: `1px solid ${selectedQuality === q ? colors.primary : colors.border}`,
                        backgroundColor: selectedQuality === q ? colors.primary : colors.surfaceVariant,
                        color: selectedQuality === q ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isDownloading && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: colors.textSecondary, marginBottom: '0.35rem' }}>
                  <span>Downloading...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div style={{ height: 6, backgroundColor: colors.surfaceVariant, borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${downloadProgress}%`,
                      backgroundColor: colors.primary,
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isDownloading}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceVariant,
                  color: colors.textPrimary,
                  fontWeight: 600,
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartDownload}
                disabled={isDownloading}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: colors.primary,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <IoCloudDownloadOutline size={18} />
                {isDownloading ? 'Saving...' : 'Save Offline'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
