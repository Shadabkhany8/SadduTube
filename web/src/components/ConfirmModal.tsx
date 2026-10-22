import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { IoWarningOutline, IoClose } from 'react-icons/io5';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onCancel}
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
          maxWidth: 420,
          backgroundColor: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 30, 56, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDanger ? colors.danger : colors.primary,
              }}
            >
              <IoWarningOutline size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
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

        <p style={{ fontSize: '0.9rem', color: colors.textSecondary, lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceVariant,
              color: colors.textPrimary,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: isDanger ? colors.danger : colors.primary,
              color: '#FFFFFF',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
