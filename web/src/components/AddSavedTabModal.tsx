import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IoFolderOpen, IoClose, IoLink, IoDocumentTextOutline } from 'react-icons/io5';

interface AddSavedTabModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (url: string, title?: string, note?: string) => void;
  initialUrl?: string;
  initialTitle?: string;
}

export const AddSavedTabModal: React.FC<AddSavedTabModalProps> = ({
  visible,
  onClose,
  onSave,
  initialUrl = '',
  initialTitle = '',
}) => {
  const { colors } = useTheme();
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a YouTube video URL or Video ID');
      return;
    }
    setError('');
    onSave(url.trim(), title.trim() || undefined, note.trim() || undefined);
    setUrl('');
    setTitle('');
    setNote('');
    onClose();
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
          maxWidth: 460,
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
                backgroundColor: 'rgba(255, 30, 56, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary,
              }}
            >
              <IoFolderOpen size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              Save YouTube Tab
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.35rem' }}>
              YouTube URL or Video ID *
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: colors.surfaceVariant,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '0 0.75rem',
                gap: '0.5rem',
              }}
            >
              <IoLink size={18} color={colors.textMuted} />
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=... or Video ID"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  padding: '0.75rem 0',
                  color: colors.textPrimary,
                  fontSize: '0.9rem',
                }}
                autoFocus
              />
            </div>
            {error && <span style={{ fontSize: '0.8rem', color: colors.danger, marginTop: '0.25rem', display: 'block' }}>{error}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.35rem' }}>
              Custom Tab Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. My Favorite Coding Tutorial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: colors.surfaceVariant,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '0.75rem',
                color: colors.textPrimary,
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.35rem' }}>
              Personal Note (Optional)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                backgroundColor: colors.surfaceVariant,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '0.5rem 0.75rem',
                gap: '0.5rem',
              }}
            >
              <IoDocumentTextOutline size={18} color={colors.textMuted} style={{ marginTop: '0.25rem' }} />
              <textarea
                placeholder="Add notes, timestamp markers, or thoughts..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: colors.textPrimary,
                  fontSize: '0.9rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
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
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: 12,
                border: 'none',
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Save Tab
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
