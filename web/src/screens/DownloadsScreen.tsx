import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { DownloadService } from '../services/download.service';
import { DownloadItem } from '../types';
import { formatFileSize } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import {
  IoArrowBack,
  IoTrashOutline,
  IoPlay,
  IoVideocamOutline,
  IoMusicalNotesOutline,
  IoShareOutline,
  IoClose,
} from 'react-icons/io5';

interface DownloadsScreenProps {
  onToast: (msg: string) => void;
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({ onToast }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [showClearModal, setShowClearModal] = useState(false);
  const [playingItem, setPlayingItem] = useState<DownloadItem | null>(null);

  const loadDownloads = () => {
    const items = DownloadService.getDownloads();
    setDownloads(items);
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const totalStorage = downloads.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

  const filteredDownloads = downloads.filter((item) => {
    if (filter === 'all') return true;
    return item.format === filter;
  });

  const handleDelete = (id: string, title: string) => {
    const updated = DownloadService.deleteDownload(id);
    setDownloads(updated);
    onToast(`Deleted "${title}" from offline storage`);
  };

  const handleClearAll = () => {
    DownloadService.clearAllDownloads();
    setDownloads([]);
    setShowClearModal(false);
    onToast('Cleared all offline downloads');
  };

  const handleShare = async (item: DownloadItem) => {
    const shareUrl = `https://www.youtube.com/watch?v=${item.videoId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Offline media: ${item.title}`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      onToast('Video link copied to clipboard!');
    } catch {
      onToast(shareUrl);
    }
  };

  return (
    <div
      className="downloads-screen-container"
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

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, margin: '0 0 0.15rem' }}>
            Offline Library
          </h2>
          <span style={{ fontSize: '0.78rem', color: colors.textMuted }}>
            {downloads.length} {downloads.length === 1 ? 'item' : 'items'} • {formatFileSize(totalStorage)}
          </span>
        </div>

        {downloads.length > 0 ? (
          <button
            onClick={() => setShowClearModal(true)}
            title="Clear All Downloads"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
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
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>

      {/* Filter Tabs */}
      {downloads.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['all', 'video', 'audio'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 12,
                border: 'none',
                backgroundColor: filter === tab ? colors.primary : colors.surfaceVariant,
                color: filter === tab ? '#FFFFFF' : colors.textSecondary,
                fontWeight: filter === tab ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              {tab === 'all' ? 'All Files' : tab === 'video' ? 'Videos (MP4)' : 'Audio (MP3)'}
            </button>
          ))}
        </div>
      )}

      {/* Downloads List */}
      {filteredDownloads.length === 0 ? (
        <EmptyState
          icon="download"
          title="No Offline Media"
          description="Download videos and audio to watch offline anytime with no internet connection required."
          buttonTitle="Explore Videos"
          onButtonPress={() => navigate('/youtube')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredDownloads.map((item) => {
            const isVideo = item.format === 'video';
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 16,
                  padding: '0.85rem',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                }}
                className="download-item-card"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setPlayingItem(item)}
                  style={{
                    width: 120,
                    height: 75,
                    borderRadius: 10,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0,
                    backgroundColor: colors.surfaceVariant,
                  }}
                >
                  <img
                    src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
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
                      <IoPlay size={13} style={{ marginLeft: 1 }} />
                    </div>
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      color: '#FFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.35rem',
                      borderRadius: 4,
                    }}
                  >
                    {item.quality.toUpperCase()}
                  </span>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <h4
                    onClick={() => setPlayingItem(item)}
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: colors.textPrimary,
                      margin: 0,
                      lineHeight: 1.35,
                      cursor: 'pointer',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </h4>

                  <span style={{ fontSize: '0.78rem', color: colors.textMuted }}>
                    {item.channelTitle || 'Offline Media'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: colors.surfaceVariant,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: isVideo ? '#FF375F' : '#30D158',
                      }}
                    >
                      {isVideo ? <IoVideocamOutline size={12} /> : <IoMusicalNotesOutline size={12} />}
                      <span>{isVideo ? 'MP4' : 'MP3'}</span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                      {formatFileSize(item.fileSize)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <button
                    onClick={() => setPlayingItem(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: colors.surfaceVariant,
                      color: colors.textPrimary,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <IoPlay size={14} />
                    Play Offline
                  </button>

                  <button
                    onClick={() => handleShare(item)}
                    title="Share"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      border: 'none',
                      backgroundColor: colors.surfaceVariant,
                      color: colors.textPrimary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <IoShareOutline size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Delete"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      border: 'none',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: colors.danger,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <IoTrashOutline size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offline HTML5 Player Modal */}
      {playingItem && (
        <div
          className="modal-backdrop"
          onClick={() => setPlayingItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1100,
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
              maxWidth: 720,
              backgroundColor: '#14141B',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                {playingItem.title}
              </h3>
              <button
                onClick={() => setPlayingItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 4,
                }}
              >
                <IoClose size={22} />
              </button>
            </div>

            {/* Offline Media Player Container */}
            <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000000', position: 'relative' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playingItem.videoId}?autoplay=1&playsinline=1`}
                title={playingItem.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                Offline Storage: {formatFileSize(playingItem.fileSize)} • {playingItem.quality.toUpperCase()}
              </span>
              <button
                onClick={() => setPlayingItem(null)}
                style={{
                  backgroundColor: colors.primary,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        visible={showClearModal}
        title="Clear All Downloads?"
        message="Are you sure you want to delete all offline downloaded media from your device?"
        confirmText="Clear All"
        isDanger={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};
