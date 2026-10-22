import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface SadduTubeBrandProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export const SadduTubeBrand: React.FC<SadduTubeBrandProps> = ({
  size = 'medium',
  showTagline = false,
  tagline = 'Dedicated YouTube Experience',
  className = '',
  layout = 'horizontal',
}) => {
  const { colors } = useTheme();

  const iconSizes = {
    small: 28,
    medium: 36,
    large: 54,
  }[size];

  const fontSizes = {
    small: { title: '1rem', sub: '0.65rem' },
    medium: { title: '1.25rem', sub: '0.75rem' },
    large: { title: '1.75rem', sub: '0.85rem' },
  }[size];

  return (
    <div
      className={`brand-container ${layout === 'vertical' ? 'brand-vertical' : 'brand-horizontal'} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: layout === 'vertical' ? '0.5rem' : '0.65rem',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <img
        src="./assets/AppIcon.png"
        alt="SadduTube Logo"
        style={{
          width: iconSizes,
          height: iconSizes,
          borderRadius: size === 'large' ? 14 : 9,
          boxShadow: '0 4px 12px rgba(255, 30, 56, 0.35)',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: layout === 'vertical' ? 'center' : 'flex-start',
          lineHeight: 1.15,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: fontSizes.title,
            letterSpacing: '-0.02em',
            color: colors.textPrimary,
          }}
        >
          Saddu<span style={{ color: colors.primary }}>Tube</span>
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: fontSizes.sub,
              color: colors.textMuted,
              fontWeight: 500,
              marginTop: '0.15rem',
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
