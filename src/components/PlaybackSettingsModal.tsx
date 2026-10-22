import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface PlaybackSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  currentSpeed: number;
  currentQuality: string;
  onSelectSpeed: (speed: number) => void;
  onSelectQuality: (quality: string) => void;
}

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const QUALITIES = [
  { id: 'hd1080', label: '1080p (Full HD)' },
  { id: 'hd720', label: '720p (HD)' },
  { id: 'large', label: '480p (Standard)' },
  { id: 'medium', label: '360p (Data Saver)' },
  { id: 'auto', label: 'Auto (Recommended)' },
];

export const PlaybackSettingsModal: React.FC<PlaybackSettingsModalProps> = ({
  visible,
  onClose,
  currentSpeed,
  currentQuality,
  onSelectSpeed,
  onSelectQuality,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'speed' | 'quality'>('speed');

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Playback Settings</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Tab Selector */}
              <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'speed' && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setActiveTab('speed')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="speedometer-outline"
                    size={16}
                    color={activeTab === 'speed' ? '#FFFFFF' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === 'speed' ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    Speed ({currentSpeed}x)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, activeTab === 'quality' && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setActiveTab('quality')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="options-outline"
                    size={16}
                    color={activeTab === 'quality' ? '#FFFFFF' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === 'quality' ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    Quality
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                {activeTab === 'speed' &&
                  SPEEDS.map((speed) => {
                    const isSelected = Math.abs(currentSpeed - speed) < 0.01;
                    return (
                      <TouchableOpacity
                        key={speed}
                        style={[
                          styles.optionItem,
                          isSelected && { backgroundColor: 'rgba(255, 30, 56, 0.12)' },
                        ]}
                        onPress={() => {
                          onSelectSpeed(speed);
                          onClose();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: isSelected ? theme.colors.primary : theme.colors.textPrimary },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {speed === 1.0 ? '1.0x (Normal)' : `${speed}x`}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}

                {activeTab === 'quality' &&
                  QUALITIES.map((q) => {
                    const isSelected = currentQuality === q.id;
                    return (
                      <TouchableOpacity
                        key={q.id}
                        style={[
                          styles.optionItem,
                          isSelected && { backgroundColor: 'rgba(255, 30, 56, 0.12)' },
                        ]}
                        onPress={() => {
                          onSelectQuality(q.id);
                          onClose();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: isSelected ? theme.colors.primary : theme.colors.textPrimary },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {q.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 460,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    margin: 14,
    borderRadius: 12,
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionsList: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 15,
  },
});
