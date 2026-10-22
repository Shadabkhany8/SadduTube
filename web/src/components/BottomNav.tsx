import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import {
  IoHome,
  IoHomeOutline,
  IoCompass,
  IoCompassOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoTime,
  IoTimeOutline,
  IoFolderOpen,
  IoFolderOpenOutline,
} from 'react-icons/io5';

export const BottomNav: React.FC = () => {
  const { colors } = useTheme();
  const { bookmarks, history, savedTabs } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const validHistoryCount = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  ).length;

  const tabs = [
    {
      label: 'Home',
      path: '/',
      activeIcon: <IoHome size={22} />,
      inactiveIcon: <IoHomeOutline size={22} />,
    },
    {
      label: 'Explore',
      path: '/youtube',
      activeIcon: <IoCompass size={22} />,
      inactiveIcon: <IoCompassOutline size={22} />,
    },
    {
      label: 'Bookmarks',
      path: '/bookmarks',
      count: bookmarks.length,
      activeIcon: <IoBookmark size={22} />,
      inactiveIcon: <IoBookmarkOutline size={22} />,
    },
    {
      label: 'History',
      path: '/history',
      count: validHistoryCount,
      activeIcon: <IoTime size={22} />,
      inactiveIcon: <IoTimeOutline size={22} />,
    },
    {
      label: 'Saved Tabs',
      path: '/saved-tabs',
      count: savedTabs.length,
      activeIcon: <IoFolderOpen size={22} />,
      inactiveIcon: <IoFolderOpenOutline size={22} />,
    },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              color: isActive ? colors.primary : colors.textMuted,
              cursor: 'pointer',
              padding: '4px 0',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              {isActive ? tab.activeIcon : tab.inactiveIcon}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    borderRadius: 8,
                    padding: '0.05rem 0.3rem',
                    minWidth: 14,
                    textAlign: 'center',
                  }}
                >
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 700 : 500 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
