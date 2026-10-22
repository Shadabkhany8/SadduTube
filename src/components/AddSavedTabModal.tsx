import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { extractYouTubeVideoId } from '../utils/validation';

interface AddSavedTabModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (url: string, title?: string, note?: string) => Promise<void>;
}

export const AddSavedTabModal: React.FC<AddSavedTabModalProps> = ({ visible, onClose, onSave }) => {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    if (!url.trim()) {
      setError('Please enter a YouTube video URL or Video ID');
      return;
    }

    const videoId = extractYouTubeVideoId(url.trim());
    if (!videoId) {
      setError('Invalid YouTube link or ID. Please check your URL.');
      return;
    }

    setLoading(true);
    try {
      await onSave(url.trim(), title.trim(), note.trim());
      setUrl('');
      setTitle('');
      setNote('');
      onClose();
    } catch (e) {
      setError('Failed to save tab');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Save YouTube Tab</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                  <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                </View>
              ) : null}

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>YouTube Video URL or ID *</Text>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Custom Title (Optional)</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Favorite React Native Tutorial"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Note (Optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Watch chapter 3 later"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.inputBg, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSave}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Tab'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  saveBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
