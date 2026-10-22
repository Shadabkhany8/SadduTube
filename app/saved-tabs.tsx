import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAppData } from '../src/context/AppDataContext';
import { Header } from '../src/components/Header';
import { EmptyState } from '../src/components/EmptyState';
import { AddSavedTabModal } from '../src/components/AddSavedTabModal';
import { ConfirmModal } from '../src/components/ConfirmModal';
import { formatRelativeTime } from '../src/utils/formatters';
import { router } from 'expo-router';

export default function SavedTabsScreen() {
  const { theme } = useTheme();
  const { savedTabs, addSavedTab, removeSavedTab, clearSavedTabs } = useAppData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleOpenTab = (tab: any) => {
    if (tab.videoId) {
      router.push(`/video/${tab.videoId}` as any);
    }
  };

  const handleShareTab = async (tab: any) => {
    try {
      await Share.share({
        message: `Check out this YouTube tab: ${tab.title} - ${tab.url}`,
        url: tab.url,
      });
    } catch (e) {
      console.warn('Share tab error:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Header
        showBack={true}
        showSearch={false}
        title={`Saved Tabs (${savedTabs.length})`}
        rightAction={
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addBtnText}>New Tab</Text>
            </TouchableOpacity>

            {savedTabs.length > 0 && (
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}
                onPress={() => setShowClearModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <View style={styles.content}>
        {savedTabs.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="No Saved Tabs"
            description="Vidyo Pro allows you to save YouTube video tabs for quick access later. Save tabs from video cards or add a custom YouTube URL."
            buttonTitle="Add First Saved Tab"
            onButtonPress={() => setShowAddModal(true)}
          />
        ) : (
          <FlatList
            data={savedTabs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tabCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                onPress={() => handleOpenTab(item)}
                activeOpacity={0.85}
              >
                <View style={styles.thumbWrapper}>
                  {item.thumbnailUrl ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumbPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Ionicons name="logo-youtube" size={28} color={theme.colors.primary} />
                    </View>
                  )}
                  <View style={styles.playBadge}>
                    <Ionicons name="play" size={12} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.tabInfo}>
                  <Text numberOfLines={2} style={[styles.tabTitle, { color: theme.colors.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={[styles.tabUrl, { color: theme.colors.accent }]}>
                    {item.url}
                  </Text>

                  {item.note ? (
                    <View style={[styles.noteContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Ionicons name="document-text-outline" size={12} color={theme.colors.textSecondary} />
                      <Text numberOfLines={1} style={[styles.noteText, { color: theme.colors.textSecondary }]}>
                        {item.note}
                      </Text>
                    </View>
                  ) : null}

                  <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
                    Saved {formatRelativeTime(item.createdAt)}
                  </Text>
                </View>

                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    onPress={() => handleShareTab(item)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="share-social-outline" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => removeSavedTab(item.id)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <AddSavedTabModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={async (url, title, note) => {
          await addSavedTab(url, title, note);
        }}
      />

      <ConfirmModal
        visible={showClearModal}
        title="Clear Saved Tabs?"
        message="Are you sure you want to delete all saved YouTube tabs?"
        confirmText="Clear All Tabs"
        isDanger={true}
        onConfirm={async () => {
          await clearSavedTabs();
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  tabCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbWrapper: {
    width: 90,
    height: 65,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  tabUrl: {
    fontSize: 12,
    marginTop: 2,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  noteText: {
    fontSize: 11,
  },
  dateText: {
    fontSize: 11,
    marginTop: 4,
  },
  actionColumn: {
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  actionBtn: {
    padding: 4,
  },
});
