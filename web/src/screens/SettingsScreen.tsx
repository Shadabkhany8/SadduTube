import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { SadduTubeBrand } from '../components/SadduTubeBrand';
import { ConfirmModal } from '../components/ConfirmModal';
import { ThemeMode } from '../types';
import {
  IoArrowBack,
  IoShieldCheckmark,
  IoMusicalNotes,
  IoFlash,
  IoOpenOutline,
  IoMoon,
  IoSunny,
  IoPhonePortraitOutline,
  IoCloudDownloadOutline,
  IoTimeOutline,
  IoBookmarkOutline,
  IoTrashOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoChevronForward,
  IoClose,
} from 'react-icons/io5';

interface SettingsScreenProps {
  onToast: (msg: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onToast }) => {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { history, bookmarks, clearHistory, clearBookmarks, clearAllData } = useAppData();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<'history' | 'bookmarks' | 'all' | 'about' | 'privacy' | null>(null);

  const validVideosCount = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  ).length;

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'dark', label: 'Dark', icon: <IoMoon size={16} /> },
    { mode: 'light', label: 'Light', icon: <IoSunny size={16} /> },
    { mode: 'system', label: 'System', icon: <IoPhonePortraitOutline size={16} /> },
  ];

  return (
    <div
      className="settings-screen-container"
      style={{
        maxWidth: 720,
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
          Settings
        </h2>

        <div style={{ width: 60 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Brand Version Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.15rem',
            borderRadius: 18,
            backgroundColor: colors.card,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <SadduTubeBrand size="medium" showTagline={true} />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: 12,
              backgroundColor: colors.surfaceVariant,
              color: colors.textMuted,
            }}
          >
            v1.0.0 (Web)
          </span>
        </div>

        {/* Playback & Shield Status */}
        <section>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: colors.textSecondary,
              display: 'block',
              marginBottom: '0.5rem',
              paddingLeft: '0.35rem',
            }}
          >
            PLAYBACK & SHIELD
          </span>

          <div
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            {/* Ad-Free Shield */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                borderBottom: `1px solid ${colors.divider}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoShieldCheckmark size={22} color={colors.success} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.15rem' }}>
                    Ad-Free Shield
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: colors.textSecondary, margin: 0 }}>
                    Active • Video ads, banners & overlays suppressed
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: colors.success,
                  padding: '0.25rem 0.6rem',
                  borderRadius: 10,
                }}
              >
                ACTIVE
              </span>
            </div>

            {/* Background Playback */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                borderBottom: `1px solid ${colors.divider}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoMusicalNotes size={22} color="#007AFF" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.15rem' }}>
                    Background Playback
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: colors.textSecondary, margin: 0 }}>
                    Active • Web Audio & background tab streaming enabled
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(0, 122, 255, 0.15)',
                  color: '#007AFF',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 10,
                }}
              >
                ACTIVE
              </span>
            </div>

            {/* SponsorBlock Auto-Skip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                borderBottom: `1px solid ${colors.divider}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoFlash size={22} color="#FF9500" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.15rem' }}>
                    SponsorBlock Auto-Skip
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: colors.textSecondary, margin: 0 }}>
                    Active • Auto-skips sponsor segments & intros
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(255, 149, 0, 0.15)',
                  color: '#FF9500',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 10,
                }}
              >
                ACTIVE
              </span>
            </div>

            {/* Picture in Picture */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoOpenOutline size={22} color="#AF52DE" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 0.15rem' }}>
                    Picture-in-Picture (PiP)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: colors.textSecondary, margin: 0 }}>
                    Active • Floating video window support in modern browsers
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(175, 82, 222, 0.15)',
                  color: '#AF52DE',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 10,
                }}
              >
                ACTIVE
              </span>
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: colors.textSecondary,
              display: 'block',
              marginBottom: '0.5rem',
              paddingLeft: '0.35rem',
            }}
          >
            THEME
          </span>

          <div
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: '0.5rem',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  onClick={() => setThemeMode(opt.mode)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.75rem',
                    borderRadius: 14,
                    border: 'none',
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Data & Storage Management */}
        <section>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: colors.textSecondary,
              display: 'block',
              marginBottom: '0.5rem',
              paddingLeft: '0.35rem',
            }}
          >
            DATA & STORAGE
          </span>

          <div
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            {/* Offline Downloads Link */}
            <div
              onClick={() => navigate('/downloads')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                borderBottom: `1px solid ${colors.divider}`,
                cursor: 'pointer',
              }}
              className="settings-action-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoCloudDownloadOutline size={20} color={colors.primary} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: colors.textPrimary }}>
                  Offline Downloads
                </span>
              </div>
              <IoChevronForward size={18} color={colors.textMuted} />
            </div>

            {/* Clear Watch History */}
            <div
              onClick={() => setActiveModal('history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                borderBottom: `1px solid ${colors.divider}`,
                cursor: 'pointer',
              }}
              className="settings-action-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoTimeOutline size={20} color={colors.textPrimary} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: colors.textPrimary }}>
                  Clear Watch History
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', color: colors.textMuted }}>
                {validVideosCount} {validVideosCount === 1 ? 'video' : 'videos'}
              </span>
            </div>

            {/* Clear Bookmarks */}
            <div
              onClick={() => setActiveModal('bookmarks')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                borderBottom: `1px solid ${colors.divider}`,
                cursor: 'pointer',
              }}
              className="settings-action-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoBookmarkOutline size={20} color={colors.textPrimary} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: colors.textPrimary }}>
                  Clear Bookmarks
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', color: colors.textMuted }}>
                {bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Clear All App Data */}
            <div
              onClick={() => setActiveModal('all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                cursor: 'pointer',
              }}
              className="settings-action-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoTrashOutline size={20} color={colors.danger} />
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: colors.danger }}>
                  Clear All App Data
                </span>
              </div>
              <IoChevronForward size={18} color={colors.danger} />
            </div>
          </div>
        </section>

        {/* About & Legal Section */}
        <section>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: colors.textSecondary,
              display: 'block',
              marginBottom: '0.5rem',
              paddingLeft: '0.35rem',
            }}
          >
            ABOUT
          </span>

          <div
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setActiveModal('about')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                borderBottom: `1px solid ${colors.divider}`,
                cursor: 'pointer',
              }}
              className="settings-action-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoInformationCircleOutline size={20} color={colors.textPrimary} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: colors.textPrimary }}>
                  About SadduTube
                </span>
              </div>
              <IoChevronForward size={18} color={colors.textMuted} />
            </div>

            <div
              onClick={() => setActiveModal('privacy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.15rem',
                cursor: 'pointer',
              }}
              className="settings-action-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <IoShieldCheckmarkOutline size={20} color={colors.textPrimary} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: colors.textPrimary }}>
                  Privacy Policy
                </span>
              </div>
              <IoChevronForward size={18} color={colors.textMuted} />
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        visible={activeModal === 'history'}
        title="Clear Watch History?"
        message="This will delete all saved viewing history from your browser. This action cannot be undone."
        confirmText="Clear History"
        isDanger={true}
        onConfirm={() => {
          clearHistory();
          setActiveModal(null);
          onToast('Cleared watch history');
        }}
        onCancel={() => setActiveModal(null)}
      />

      <ConfirmModal
        visible={activeModal === 'bookmarks'}
        title="Clear All Bookmarks?"
        message="This will remove all saved bookmarks. This action cannot be undone."
        confirmText="Clear Bookmarks"
        isDanger={true}
        onConfirm={() => {
          clearBookmarks();
          setActiveModal(null);
          onToast('Cleared all bookmarks');
        }}
        onCancel={() => setActiveModal(null)}
      />

      <ConfirmModal
        visible={activeModal === 'all'}
        title="Reset All SadduTube Data?"
        message="This will permanently delete all watch history, bookmarks, and saved tabs from your browser."
        confirmText="Erase All Data"
        isDanger={true}
        onConfirm={() => {
          clearAllData();
          setActiveModal(null);
          onToast('Erased all app data');
        }}
        onCancel={() => setActiveModal(null)}
      />

      {/* About & Privacy Modals */}
      {(activeModal === 'about' || activeModal === 'privacy') && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveModal(null)}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                {activeModal === 'about' ? 'About SadduTube' : 'Privacy Policy'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
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

            <div style={{ fontSize: '0.9rem', color: colors.textSecondary, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {activeModal === 'about' ? (
                <>
                  <p style={{ margin: '0 0 0.85rem' }}>
                    <strong>SadduTube</strong> is a modern dedicated YouTube web experience designed for smooth ad-free video discovery, persistent watch history across browser sessions, and quick tab workspaces.
                  </p>
                  <p style={{ margin: 0 }}>
                    SadduTube values your privacy. All your history, bookmarks, and saved tabs are stored strictly on your local device.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 0.85rem' }}>
                    SadduTube values your privacy. Your watch history, bookmarks, and saved preferences are stored exclusively on your device using client-side local storage.
                  </p>
                  <p style={{ margin: 0 }}>
                    No personal data, watch history, or private credentials are collected, extracted, or transmitted to any third-party servers.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
