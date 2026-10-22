import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  IoBookmarkOutline,
  IoTimeOutline,
  IoFilterOutline,
  IoFolderOpenOutline,
  IoCloudDownloadOutline,
  IoSearchOutline,
} from 'react-icons/io5';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'bookmark',
  title,
  description,
  buttonTitle,
  onButtonPress,
}) => {
  const { colors } = useTheme();

  const renderIcon = () => {
    const size = 44;
    const color = colors.primary;
    if (icon.includes('time')) return <IoTimeOutline size={size} color={color} />;
    if (icon.includes('filter')) return <IoFilterOutline size={size} color={color} />;
    if (icon.includes('folder')) return <IoFolderOpenOutline size={size} color={color} />;
    if (icon.includes('download') || icon.includes('cloud')) return <IoCloudDownloadOutline size={size} color={color} />;
    if (icon.includes('search')) return <IoSearchOutline size={size} color={color} />;
    return <IoBookmarkOutline size={size} color={color} />;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        maxWidth: 440,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: 'rgba(255, 30, 56, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        {renderIcon()}
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: colors.textPrimary,
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.9rem',
          color: colors.textSecondary,
          lineHeight: 1.5,
          marginBottom: buttonTitle ? '1.5rem' : 0,
        }}
      >
        {description}
      </p>

      {buttonTitle && onButtonPress && (
        <button
          onClick={onButtonPress}
          className="btn-primary"
          style={{
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {buttonTitle}
        </button>
      )}
    </div>
  );
};
