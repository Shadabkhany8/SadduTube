import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import {
  IoHome,
  IoHomeOutline,
  IoCompass,
  IoCompassOutline,
  IoTime,
  IoTimeOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoFolderOpen,
  IoFolderOpenOutline,
  IoCloudDownload,
  IoCloudDownloadOutline,
  IoSettings,
  IoSettingsOutline,
  IoShieldCheckmark,
} from 'react-icons/io5';

export const Sidebar: React.FC = () => {
  const { colors } = useTheme();
  const { bookmarks, history, savedTabs } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const validHistoryCount = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  ).length;

  const navItems = [
    {
      label: 'Home',
      path: '/',
      activeIcon: <IoHome size={20} />,
      inactiveIcon: <IoHomeOutline size={20} />,
    },
    {
      label: 'YouTube',
      path: '/youtube',
      activeIcon: <IoCompass size={20} />,
      inactiveIcon: <IoCompassOutline size={20} />,
    },
    {
      label: 'History',
      path: '/history',
      count: validHistoryCount,
      activeIcon: <IoTime size={20} />,
      inactiveIcon: <IoTimeOutline size={20} />,
    },
    {
      label: 'Bookmarks',
      path: '/bookmarks',
      count: bookmarks.length,
      activeIcon: <IoBookmark size={20} />,
      inactiveIcon: <IoBookmarkOutline size={20} />,
    },
    {
      label: 'Saved Tabs',
      path: '/saved-tabs',
      count: savedTabs.length,
      activeIcon: <IoFolderOpen size={20} />,
      inactiveIcon: <IoFolderOpenOutline size={20} />,
    },
    {
      label: 'Downloads',
      path: '/downloads',
      activeIcon: <IoCloudDownload size={20} />,
      inactiveIcon: <IoCloudDownloadOutline size={20} />,
    },
    {
      label: 'Settings',
      path: '/settings',
      activeIcon: <IoSettings size={20} />,
      inactiveIcon: <IoSettingsOutline size={20} />,
    },
  ];

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: 240,
        backgroundColor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0.75rem',
        gap: '0.35rem',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: colors.textMuted,
          padding: '0.35rem 0.75rem',
          marginBottom: '0.25rem',
        }}
      >
        Menu
      </span>

      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.7rem 0.85rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: isActive ? colors.badgeBg : 'transparent',
              color: isActive ? colors.primary : colors.textPrimary,
              cursor: 'pointer',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.9rem',
              transition: 'all 0.18s ease',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: isActive ? colors.primary : colors.textMuted }}>
                {isActive ? item.activeIcon : item.inactiveIcon}
              </span>
              <span>{item.label}</span>
            </div>

            {item.count !== undefined && item.count > 0 && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 10,
                  backgroundColor: isActive ? colors.primary : colors.surfaceVariant,
                  color: isActive ? '#FFFFFF' : colors.textSecondary,
                }}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <div
          style={{
            backgroundColor: colors.surfaceVariant,
            borderRadius: 14,
            padding: '0.85rem',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <IoShieldCheckmark size={18} color={colors.success} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.textPrimary }}>
              Shield Active
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: colors.textSecondary, margin: 0, lineHeight: 1.4 }}>
            Ad-shielding and persistent watch history are active in your browser.
          </p>
        </div>
      </div>
    </aside>
  );
};
