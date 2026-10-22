import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { router } from 'expo-router';
import { formatRelativeTime } from '../utils/formatters';

interface VideoCardProps {
  video: Video;
  layout?: 'card' | 'compact' | 'horizontal';
  onRemove?: () => void;
  removeIcon?: string;
  watchedAt?: string;
  bookmarkedAt?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  layout = 'card',
  onRemove,
  removeIcon = 'trash-outline',
  watchedAt,
  bookmarkedAt,
}) => {
  const { theme } = useTheme();
  const { isBookmarked, toggleBookmark, addSavedTab, addToHistory } = useAppData();

  const bookmarked = isBookmarked(video.id);

  const handlePress = async () => {
    await addToHistory(video);
    router.push(`/video/${video.id}` as any);
  };

  const handleToggleBookmark = async () => {
    await toggleBookmark(video);
  };

  const handleSaveTab = async () => {
    await addSavedTab(video);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Watch "${video.title}" on YouTube: https://www.youtube.com/watch?v=${video.id}`,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        title: video.title,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  if (layout === 'horizontal') {
    return (
      <TouchableOpacity
        style={[styles.horizontalContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.horizontalThumbWrapper}>
          <Image source={{ uri: video.thumbnailUrl }} style={styles.horizontalThumb} resizeMode="cover" />
          {video.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          )}
        </View>
        <View style={styles.horizontalContent}>
          <Text numberOfLines={2} style={[styles.title, { color: theme.colors.textPrimary }]}>
            {video.title}
          </Text>
          <Text numberOfLines={1} style={[styles.channel, { color: theme.colors.textSecondary }]}>
            {video.channelTitle}
          </Text>

          <View style={styles.metaRow}>
            {video.viewCount && (
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                {video.viewCount}
              </Text>
            )}
            {watchedAt && (
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                • {formatRelativeTime(watchedAt)}
              </Text>
            )}
            {bookmarkedAt && (
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                • Saved {formatRelativeTime(bookmarkedAt)}
              </Text>
            )}
          </View>
        </View>

        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={removeIcon as any} size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  if (layout === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.compactThumbWrapper}>
          <Image source={{ uri: video.thumbnailUrl }} style={styles.compactThumb} resizeMode="cover" />
          {video.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          )}
        </View>
        <View style={styles.compactContent}>
          <Text numberOfLines={2} style={[styles.compactTitle, { color: theme.colors.textPrimary }]}>
            {video.title}
          </Text>
          <Text numberOfLines={1} style={[styles.channel, { color: theme.colors.textSecondary }]}>
            {video.channelTitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.thumbWrapper}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
        {video.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text numberOfLines={2} style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            {video.title}
          </Text>
        </View>

        <View style={styles.cardMetaRow}>
          <Text numberOfLines={1} style={[styles.channelText, { color: theme.colors.textSecondary }]}>
            {video.channelTitle}
          </Text>
          <Text style={[styles.dotMeta, { color: theme.colors.textMuted }]}>•</Text>
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
            {video.viewCount || 'YouTube'}
          </Text>
          {video.publishedAt && (
            <>
              <Text style={[styles.dotMeta, { color: theme.colors.textMuted }]}>•</Text>
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                {formatRelativeTime(video.publishedAt)}
              </Text>
            </>
          )}
        </View>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleToggleBookmark}
            activeOpacity={0.7}
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={bookmarked ? theme.colors.primary : theme.colors.textPrimary}
            />
            <Text style={[styles.actionBtnText, { color: bookmarked ? theme.colors.primary : theme.colors.textPrimary }]}>
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleSaveTab}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-open-outline" size={16} color={theme.colors.textPrimary} />
            <Text style={[styles.actionBtnText, { color: theme.colors.textPrimary }]}>Save Tab</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          {onRemove && (
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}
              onPress={onRemove}
              activeOpacity={0.7}
            >
              <Ionicons name={removeIcon as any} size={16} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbWrapper: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#000000',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    flex: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  channelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dotMeta: {
    marginHorizontal: 5,
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Horizontal variant
  horizontalContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  horizontalThumbWrapper: {
    width: 120,
    height: 75,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  horizontalThumb: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  channel: {
    fontSize: 12,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  removeBtn: {
    padding: 8,
  },

  // Compact Carousel variant
  compactContainer: {
    width: 200,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
  },
  compactThumbWrapper: {
    width: '100%',
    height: 115,
    position: 'relative',
  },
  compactThumb: {
    width: '100%',
    height: '100%',
  },
  compactContent: {
    padding: 10,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
});
