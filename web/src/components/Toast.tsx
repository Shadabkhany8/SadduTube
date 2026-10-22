import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { IoBookmark, IoBookmarkOutline, IoFlash, IoCheckmarkCircle } from 'react-icons/io5';

export interface ToastProps {
  message: string | null;
  actionText?: string;
  onAction?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, actionText, onAction }) => {
  const { colors } = useTheme();

  if (!message) return null;

  const renderIcon = () => {
    if (message.includes('⚡') || message.includes('Skipped')) {
      return <IoFlash size={16} color="#FF9500" />;
    }
    if (message.includes('Saved to Bookmarks')) {
      return <IoBookmark size={16} color={colors.primary} />;
    }
    if (message.includes('Removed from Bookmarks')) {
      return <IoBookmarkOutline size={16} color={colors.primary} />;
    }
    return <IoCheckmarkCircle size={16} color={colors.primary} />;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 30,
        padding: '0.65rem 1.15rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        animation: 'slideDownFade 0.25s ease forwards',
        maxWidth: '90vw',
      }}
    >
      {renderIcon()}
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.textPrimary }}>
        {message}
      </span>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            color: colors.primary,
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            padding: '0.15rem 0.4rem',
            borderRadius: 6,
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
