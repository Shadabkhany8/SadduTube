import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useAppData } from '../src/context/AppDataContext';
import { ConfirmModal } from '../src/components/ConfirmModal';
import { SadduTubeBrand } from '../src/components/SadduTubeBrand';
import { ThemeMode } from '../src/types';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const {
    history,
    bookmarks,
    clearHistory,
    clearBookmarks,
    clearAllData,
  } = useAppData();

  const [activeModal, setActiveModal] = useState<'history' | 'bookmarks' | 'all' | 'about' | 'privacy' | null>(null);

  // Filter to actual video count
  const validVideosCount = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  ).length;

  const themeOptions: { mode: ThemeMode; label: string; icon: any }[] = [
    { mode: 'dark', label: 'Dark', icon: 'moon' },
    { mode: 'light', label: 'Light', icon: 'sunny' },
    { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* App Info Card */}
        <View style={[styles.brandCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <SadduTubeBrand size="medium" />
          <View style={[styles.versionBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>v1.0.0</Text>
          </View>
        </View>

        {/* Playback & Shield Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>PLAYBACK & SHIELD</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Ad-Free Shield</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                    Active • Video ads, banners & popups blocked
                  </Text>
                </View>
              </View>
              <View style={[styles.versionBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.colors.success }}>
                  ACTIVE
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="musical-notes" size={20} color="#007AFF" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Background Playback</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                    Active • Lock-screen & background audio enabled
                  </Text>
                </View>
              </View>
              <View style={[styles.versionBadge, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#007AFF' }}>
                  ACTIVE
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="flash-outline" size={20} color="#FF9500" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>SponsorBlock Auto-Skip</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                    Active • Auto-skips sponsor segments & intros
                  </Text>
                </View>
              </View>
              <View style={[styles.versionBadge, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF9500' }}>
                  ACTIVE
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="open-outline" size={20} color="#AF52DE" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Picture-in-Picture (PiP)</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                    Active • Floating player on home press & button
                  </Text>
                </View>
              </View>
              <View style={[styles.versionBadge, { backgroundColor: 'rgba(175, 82, 222, 0.15)' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#AF52DE' }}>
                  ACTIVE
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>THEME</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.themeSelectorRow}>
              {themeOptions.map((opt) => {
                const isSelected = themeMode === opt.mode;
                return (
                  <TouchableOpacity
                    key={opt.mode}
                    style={[
                      styles.themeTab,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => setThemeMode(opt.mode)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={17}
                      color={isSelected ? '#FFFFFF' : theme.colors.textPrimary}
                    />
                    <Text
                      style={[
                        styles.themeTabText,
                        { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Data & Storage Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>DATA & STORAGE</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/downloads' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelRow}>
                <Ionicons name="cloud-download-outline" size={19} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Offline Downloads</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setActiveModal('history')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelRow}>
                <Ionicons name="time-outline" size={19} color={theme.colors.textPrimary} />
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Clear Watch History</Text>
              </View>
              <Text style={[styles.badgeCount, { color: theme.colors.textMuted }]}>
                {validVideosCount} {validVideosCount === 1 ? 'video' : 'videos'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setActiveModal('bookmarks')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelRow}>
                <Ionicons name="bookmark-outline" size={19} color={theme.colors.textPrimary} />
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Clear Bookmarks</Text>
              </View>
              <Text style={[styles.badgeCount, { color: theme.colors.textMuted }]}>
                {bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setActiveModal('all')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelRow}>
                <Ionicons name="trash-outline" size={19} color={theme.colors.danger} />
                <Text style={[styles.settingLabel, { color: theme.colors.danger }]}>Clear All App Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About & Legal Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setActiveModal('about')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelRow}>
                <Ionicons name="information-circle-outline" size={19} color={theme.colors.textPrimary} />
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>About SadduTube</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setActiveModal('privacy')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelRow}>
                <Ionicons name="shield-checkmark-outline" size={19} color={theme.colors.textPrimary} />
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modals */}
      <ConfirmModal
        visible={activeModal === 'history'}
        title="Clear Watch History?"
        message="This will delete all saved viewing history from your device. This action cannot be undone."
        confirmText="Clear History"
        isDanger={true}
        onConfirm={async () => {
          await clearHistory();
          setActiveModal(null);
        }}
        onCancel={() => setActiveModal(null)}
      />

      <ConfirmModal
        visible={activeModal === 'bookmarks'}
        title="Clear All Bookmarks?"
        message="This will remove all saved bookmarks. This action cannot be undone."
        confirmText="Clear Bookmarks"
        isDanger={true}
        onConfirm={async () => {
          await clearBookmarks();
          setActiveModal(null);
        }}
        onCancel={() => setActiveModal(null)}
      />

      <ConfirmModal
        visible={activeModal === 'all'}
        title="Reset All SadduTube Data?"
        message="This will permanently delete all watch history and saved bookmarks from your device."
        confirmText="Erase All Data"
        isDanger={true}
        onConfirm={async () => {
          await clearAllData();
          setActiveModal(null);
        }}
        onCancel={() => setActiveModal(null)}
      />

      {/* Information Modal */}
      <Modal
        visible={activeModal === 'about' || activeModal === 'privacy'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.infoModalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                <Text style={[styles.modalHeading, { color: theme.colors.textPrimary }]}>
                  {activeModal === 'about' ? 'About SadduTube' : 'Privacy Policy'}
                </Text>
                <ScrollView style={styles.modalScroll}>
                  <Text style={[styles.modalBodyText, { color: theme.colors.textSecondary }]}>
                    {activeModal === 'about'
                      ? 'SadduTube is a modern dedicated YouTube app designed for smooth ad-free video discovery and reliable watch history that persists across app restarts.\n\nSadduTube values your privacy. All your history and bookmarks are stored exclusively on your device.'
                      : 'SadduTube values your privacy. Your watch history and saved bookmarks are stored exclusively on your device using local storage.\n\nNo personal data, watch history, or private credentials are collected, extracted, or transmitted to third-party servers.'}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setActiveModal(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnPlaceholder: {
    width: 38,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
    gap: 18,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  themeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  themeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoModalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalScroll: {
    maxHeight: 250,
  },
  modalBodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalCloseBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
