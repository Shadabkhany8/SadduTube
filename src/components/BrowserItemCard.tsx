import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from '../utils/formatters';
import { router } from 'expo-router';

interface BrowserItemCardProps {
  id: string;
  url: string;
  title: string;
  timestamp?: string;
  thumbnailUrl?: string;
  onDelete?: () => void;
  onBookmarkToggle?: () => void;
  isBookmarked?: boolean;
  layout?: 'list' | 'compact';
}

export const BrowserItemCard: React.FC<BrowserItemCardProps> = ({
  url,
  title,
  timestamp,
  thumbnailUrl,
  onDelete,
  onBookmarkToggle,
  isBookmarked = false,
  layout = 'list',
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: '/youtube',
      params: { url },
    } as any);
  };

  const domain = url ? url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : 'youtube.com';

  if (layout === 'compact') {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
        ]}
        onPress={handlePress}
        activeOpacity={0.82}
      >
        <View style={[styles.compactThumbWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={styles.compactThumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Ionicons name="logo-youtube" size={26} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.playBadge}>
            <Ionicons name="play" size={10} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.compactInfo}>
          <Text numberOfLines={2} style={[styles.compactTitle, { color: theme.colors.textPrimary }]}>
            {title || 'YouTube Page'}
          </Text>
          {timestamp && (
            <View style={styles.timestampRow}>
              <Ionicons name="time-outline" size={11} color={theme.colors.textMuted} />
              <Text style={[styles.compactTimestamp, { color: theme.colors.textMuted }]}>
                {formatRelativeTime(timestamp)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.listContainer,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
      ]}
      onPress={handlePress}
      activeOpacity={0.82}
    >
      <View style={[styles.listThumbWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.listThumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="logo-youtube" size={28} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.listPlayOverlay}>
          <Ionicons name="play" size={10} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.listContent}>
        <Text numberOfLines={2} style={[styles.listTitle, { color: theme.colors.textPrimary }]}>
          {title || 'YouTube Page'}
        </Text>
        <View style={styles.domainRow}>
          <Ionicons name="link-outline" size={12} color={theme.colors.textMuted} />
          <Text numberOfLines={1} style={[styles.listUrl, { color: theme.colors.textMuted }]}>
            {domain}
          </Text>
          {timestamp && (
            <>
              <Text style={[styles.dot, { color: theme.colors.textMuted }]}>•</Text>
              <Text style={[styles.listTimestamp, { color: theme.colors.textMuted }]}>
                {formatRelativeTime(timestamp)}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.actionsRow}>
        {onBookmarkToggle && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isBookmarked ? 'rgba(255, 30, 56, 0.16)' : theme.colors.surfaceVariant,
              },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onBookmarkToggle();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            accessibilityLabel={isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={15}
              color={isBookmarked ? theme.colors.primary : theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            accessibilityLabel="Delete"
          >
            <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  listThumbWrapper: {
    width: 104,
    height: 66,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  listThumb: {
    width: '100%',
    height: '100%',
  },
  listPlayOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listUrl: {
    fontSize: 11,
    fontWeight: '500',
  },
  dot: {
    fontSize: 10,
  },
  listTimestamp: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContainer: {
    width: 164,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
  },
  compactThumbWrapper: {
    width: '100%',
    height: 94,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactThumb: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    padding: 10,
    gap: 6,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactTimestamp: {
    fontSize: 11,
  },
});

