import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { EmptyState } from '../components/EmptyState';
import { AddSavedTabModal } from '../components/AddSavedTabModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatRelativeTime } from '../utils/formatters';
import {
  IoArrowBack,
  IoAdd,
  IoTrashOutline,
  IoShareSocialOutline,
  IoPlay,
  IoDocumentTextOutline,
  IoLogoYoutube,
} from 'react-icons/io5';

interface SavedTabsScreenProps {
  onToast: (msg: string) => void;
}

export const SavedTabsScreen: React.FC<SavedTabsScreenProps> = ({ onToast }) => {
  const { colors } = useTheme();
  const { savedTabs, addSavedTab, removeSavedTab, clearSavedTabs } = useAppData();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleOpenTab = (tab: any) => {
    if (tab.videoId) {
      navigate(`/video/${tab.videoId}`, {
        state: {
          video: {
            id: tab.videoId,
            title: tab.title,
            thumbnailUrl: tab.thumbnailUrl || `https://i.ytimg.com/vi/${tab.videoId}/hqdefault.jpg`,
            channelTitle: '',
          },
        },
      });
    } else if (tab.url) {
      navigate(`/youtube?url=${encodeURIComponent(tab.url)}`);
    }
  };

  const handleShareTab = async (e: React.MouseEvent, tab: any) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: tab.title,
          text: `Check out this YouTube tab: ${tab.title}`,
          url: tab.url,
        });
        return;
      } catch {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(tab.url);
      onToast('Tab link copied to clipboard!');
    } catch {
      onToast('Tab URL: ' + tab.url);
    }
  };

  const handleDeleteTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeSavedTab(id);
    onToast('Removed saved tab');
  };

  const handleClearAll = () => {
    clearSavedTabs();
    setShowClearModal(false);
    onToast('Cleared all saved tabs');
  };

  return (
    <div
      className="saved-tabs-screen-container"
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
          marginBottom: '1.5rem',
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

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
          Saved Tabs ({savedTabs.length})
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 18,
              padding: '0.45rem 0.95rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <IoAdd size={18} />
            New Tab
          </button>

          {savedTabs.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              title="Clear All Tabs"
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
          )}
        </div>
      </div>

      {/* Content */}
      {savedTabs.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No Saved Tabs"
          description="SadduTube allows you to save YouTube video tabs with personal notes for quick access later."
          buttonTitle="Add First Saved Tab"
          onButtonPress={() => setShowAddModal(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {savedTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleOpenTab(tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: colors.card,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 16,
                padding: '0.85rem 1rem',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="saved-tab-card"
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: 100,
                  height: 68,
                  borderRadius: 10,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: colors.surfaceVariant,
                  flexShrink: 0,
                }}
              >
                {tab.thumbnailUrl ? (
                  <img src={tab.thumbnailUrl} alt={tab.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IoLogoYoutube size={28} color={colors.primary} />
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

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h4
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                    lineHeight: 1.35,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tab.title}
                </h4>

                <span
                  style={{
                    fontSize: '0.78rem',
                    color: colors.accent,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tab.url}
                </span>

                {tab.note && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: colors.surfaceVariant,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      color: colors.textSecondary,
                      width: 'fit-content',
                      maxWidth: '100%',
                    }}
                  >
                    <IoDocumentTextOutline size={12} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tab.note}
                    </span>
                  </div>
                )}

                <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>
                  Saved {formatRelativeTime(tab.createdAt)}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={(e) => handleShareTab(e, tab)}
                  title="Share Tab"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textSecondary,
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 4,
                  }}
                >
                  <IoShareSocialOutline size={18} />
                </button>

                <button
                  onClick={(e) => handleDeleteTab(e, tab.id)}
                  title="Delete Tab"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.danger,
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 4,
                  }}
                >
                  <IoTrashOutline size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Tab Modal */}
      <AddSavedTabModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(url, title, note) => {
          addSavedTab(url, title, note);
          onToast('Saved new tab to workspace!');
        }}
      />

      {/* Confirm Clear Modal */}
      <ConfirmModal
        visible={showClearModal}
        title="Clear All Saved Tabs?"
        message="Are you sure you want to delete all saved YouTube tabs?"
        confirmText="Clear All Tabs"
        isDanger={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};
