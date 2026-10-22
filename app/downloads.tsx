import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useTheme } from '../src/context/ThemeContext';
import { DownloadService, DownloadItem } from '../src/services/download.service';

export default function DownloadsScreen() {
  const { theme, isDark } = useTheme();

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'video' | 'audio'>('all');

  // Offline player modal state
  const [playingItem, setPlayingItem] = useState<DownloadItem | null>(null);

  const loadDownloads = async () => {
    setLoading(true);
    const items = await DownloadService.getDownloads();
    setDownloads(items);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadDownloads();
    }, [])
  );

  const handleDelete = (item: DownloadItem) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete "${item.title}" from your offline storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await DownloadService.deleteDownload(item.id);
            await loadDownloads();
          },
        },
      ]
    );
  };

  const handleShare = async (item: DownloadItem) => {
    try {
      await Share.share({
        title: item.title,
        message: `Watch/Listen offline: ${item.title}`,
        url: item.localUri,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return 'Offline';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalStorage = downloads.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

  const filteredDownloads = downloads.filter((item) => {
    if (filter === 'all') return true;
    return item.format === filter;
  });

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => {
    const isVideo = item.format === 'video';

    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.thumbnailContainer}
          onPress={() => setPlayingItem(item)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.thumbnailUrl || 'https://i.ytimg.com/vi/placeholder/hqdefault.jpg' }}
            style={styles.thumbnail}
          />
          <View style={styles.playOverlay}>
            <View style={[styles.playCircle, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.quality.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.itemInfo}>
          <TouchableOpacity onPress={() => setPlayingItem(item)} activeOpacity={0.8}>
            <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
              {item.title}
            </Text>
          </TouchableOpacity>

          <Text numberOfLines={1} style={[styles.itemChannel, { color: theme.colors.textMuted }]}>
            {item.channelTitle || 'Offline Media'}
          </Text>

          <View style={styles.itemMetaRow}>
            <View style={[styles.formatTag, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Ionicons
                name={isVideo ? 'videocam-outline' : 'musical-notes-outline'}
                size={12}
                color={isVideo ? '#FF375F' : '#30D158'}
              />
              <Text
                style={[
                  styles.formatText,
                  { color: isVideo ? '#FF375F' : '#30D158' },
                ]}
              >
                {isVideo ? 'MP4' : 'MP3'}
              </Text>
            </View>

            <Text style={[styles.fileSizeText, { color: theme.colors.textSecondary }]}>
              {formatFileSize(item.fileSize)}
            </Text>
          </View>

          <View style={styles.itemActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setPlayingItem(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={14} color={theme.colors.textPrimary} />
              <Text style={[styles.actionBtnText, { color: theme.colors.textPrimary }]}>Play Offline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconActionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => handleShare(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={16} color={theme.colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconActionBtn, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Offline Library</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textMuted }]}>
            {downloads.length} {downloads.length === 1 ? 'item' : 'items'} • {formatFileSize(totalStorage)}
          </Text>
        </View>

        {downloads.length > 0 && (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}
            onPress={() => {
              Alert.alert('Clear All Downloads', 'Delete all downloaded offline files?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: async () => {
                    await DownloadService.clearAllDownloads();
                    await loadDownloads();
                  },
                },
              ]);
            }}
          >
            <Ionicons name="trash-bin-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {downloads.length > 0 && (
        <View style={[styles.filterBar, { backgroundColor: theme.colors.background }]}>
          {(['all', 'video', 'audio'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                { backgroundColor: theme.colors.surfaceVariant },
                filter === tab && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setFilter(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filter === tab ? '#FFFFFF' : theme.colors.textSecondary },
                  filter === tab && { fontWeight: '700' },
                ]}
              >
                {tab === 'all' ? 'All Files' : tab === 'video' ? 'Videos (MP4)' : 'Audio (MP3)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content List */}
      {filteredDownloads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="cloud-download-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No Offline Downloads</Text>
          <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
            {filter === 'all'
              ? 'Download your favorite videos and audio tracks to watch and listen offline without any internet connection.'
              : `No offline ${filter}s found.`}
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>Browse Videos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDownloads}
          keyExtractor={(item) => item.id}
          renderItem={renderDownloadItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Built-in Offline Media Player Modal */}
      {playingItem && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setPlayingItem(null)}>
          <SafeAreaView style={styles.playerContainer} edges={['top', 'bottom']}>
            <StatusBar hidden={false} style="light" />
            {/* Player Header */}
            <View style={styles.playerHeader}>
              <TouchableOpacity onPress={() => setPlayingItem(null)} style={styles.playerCloseBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.playerHeaderTextContainer}>
                <Text numberOfLines={1} style={styles.playerHeaderTitle}>
                  {playingItem.title}
                </Text>
                <Text numberOfLines={1} style={styles.playerHeaderSub}>
                  Playing Offline ({playingItem.quality.toUpperCase()})
                </Text>
              </View>
            </View>

            {/* Offline HTML5 Player via WebView */}
            <View style={styles.offlineMediaWrapper}>
              <WebView
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                      <style>
                        body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
                        video, audio { width: 100%; max-height: 100%; outline: none; }
                        .audio-card { text-align: center; color: #fff; padding: 20px; }
                        .audio-card img { width: 180px; height: 180px; border-radius: 16px; margin-bottom: 20px; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
                      </style>
                    </head>
                    <body>
                      ${
                        playingItem.format === 'video'
                          ? `<video src="${playingItem.localUri}" controls autoplay playsinline></video>`
                          : `
                          <div class="audio-card">
                            <img src="${playingItem.thumbnailUrl}" />
                            <audio src="${playingItem.localUri}" controls autoplay></audio>
                          </div>
                        `
                      }
                    </body>
                    </html>
                  `,
                }}
                style={styles.offlineWebView}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  filterTabText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  itemInfo: {
    padding: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  itemChannel: {
    fontSize: 12,
    marginBottom: 10,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  formatTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  formatText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fileSizeText: {
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#121216',
    gap: 12,
  },
  playerCloseBtn: {
    padding: 4,
  },
  playerHeaderTextContainer: {
    flex: 1,
  },
  playerHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  playerHeaderSub: {
    color: '#8E8E93',
    fontSize: 12,
  },
  offlineMediaWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  offlineWebView: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
