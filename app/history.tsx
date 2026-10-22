import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useAppData } from '../src/context/AppDataContext';
import { BrowserItemCard } from '../src/components/BrowserItemCard';
import { EmptyState } from '../src/components/EmptyState';
import { ConfirmModal } from '../src/components/ConfirmModal';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { history, removeFromHistory, clearHistory, isBookmarked, toggleBookmark } = useAppData();
  const [filterQuery, setFilterQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Strictly filter to actual videos only
  const validVideos = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  );

  const filteredHistory = validVideos.filter((item) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.channelTitle && item.channelTitle.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Watch History ({validVideos.length})
          </Text>
        </View>

        {validVideos.length > 0 ? (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}
            onPress={() => setShowClearModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>

      {/* Filter Bar */}
      {validVideos.length > 0 && (
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search history..."
              placeholderTextColor={theme.colors.textMuted}
              value={filterQuery}
              onChangeText={setFilterQuery}
            />
            {filterQuery.length > 0 && (
              <TouchableOpacity onPress={() => setFilterQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Content Area */}
      <View style={styles.content}>
        {validVideos.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No Watch History"
            description="Videos you watch in SadduTube will automatically be saved here and stay available after restarts."
            buttonTitle="Explore Videos"
            onButtonPress={() => router.push('/youtube' as any)}
          />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon="filter-outline"
            title="No Matching History"
            description={`No history entries match "${filterQuery}".`}
            buttonTitle="Clear Filter"
            onButtonPress={() => setFilterQuery('')}
          />
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <BrowserItemCard
                id={item.id}
                url={item.url}
                title={item.title}
                timestamp={item.watchedAt}
                thumbnailUrl={item.thumbnailUrl}
                isBookmarked={isBookmarked(item.url)}
                onBookmarkToggle={() => toggleBookmark(item.url, item.title)}
                onDelete={() => removeFromHistory(item.id)}
                layout="list"
              />
            )}
          />
        )}
      </View>

      <ConfirmModal
        visible={showClearModal}
        title="Clear Watch History?"
        message="Are you sure you want to clear your local watch and browsing history? This action cannot be undone."
        confirmText="Clear History"
        isDanger={true}
        onConfirm={async () => {
          await clearHistory();
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
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
});
