import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTheme } from '../../src/context/ThemeContext';
import { useAppData } from '../../src/context/AppDataContext';
import { VideoPlayer } from '../../src/components/VideoPlayer';
import { VideoCard } from '../../src/components/VideoCard';
import { DownloadModal } from '../../src/components/DownloadModal';
import { Video } from '../../src/types';
import { YouTubeService } from '../../src/services/youtube.service';
import { formatRelativeTime } from '../../src/utils/formatters';

export default function VideoScreen() {
  const { theme, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isBookmarked, toggleBookmark, addSavedTab, addToHistory } = useAppData();
  const { height: windowHeight } = useWindowDimensions();

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  const videoId = Array.isArray(id) ? id[0] : id;
  const bookmarked = videoId ? isBookmarked(videoId) : false;

  // Handle smooth orientation lock for full-screen mode
  const handleFullScreenChange = async (fullScreen: boolean) => {
    setIsFullScreen(fullScreen);
    try {
      if (fullScreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    } catch (e) {
      console.warn('ScreenOrientation lock error in VideoScreen:', e);
    }
  };

  // Ensure device returns to portrait on unmount
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  // Handle hardware back button to exit full screen first
  useEffect(() => {
    const onBackPress = () => {
      if (isFullScreen) {
        handleFullScreenChange(false);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isFullScreen]);

  useEffect(() => {
    if (!videoId) return;

    const loadVideoDetails = async () => {
      setLoading(true);
      try {
        const details = await YouTubeService.getVideoById(videoId);
        setVideo(details);

        // Automatically log video into history
        await addToHistory(details);

        // Fetch related videos
        const related = await YouTubeService.getPopularVideos(10);
        setRelatedVideos(related.filter((v: Video) => v.id !== videoId));
      } catch (e) {
        console.warn('Failed loading video details:', e);
      } finally {
        setLoading(false);
      }
    };

    loadVideoDetails();
  }, [videoId]);

  const handleToggleBookmark = async () => {
    if (video) {
      await toggleBookmark(video);
    }
  };

  const handleSaveTab = async () => {
    if (video) {
      await addSavedTab(video);
    }
  };

  const handleShare = async () => {
    if (!video) return;
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

  if (!videoId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorCenter}>
          <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>Invalid Video ID</Text>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isFullScreen ? '#000000' : theme.colors.background }]}
      edges={isFullScreen ? [] : ['top']}
    >
      <StatusBar hidden={isFullScreen} style={isDark ? 'light' : 'dark'} />

      {/* Back Header Bar (hidden in full-screen landscape) */}
      {!isFullScreen && (
        <View style={[styles.navHeader, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            {video ? video.title : 'Loading Video...'}
          </Text>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => setDownloadModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud-download-outline" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {isFullScreen ? (
        <View style={styles.fullScreenPlayerContainer}>
          <VideoPlayer
            videoId={videoId}
            height={windowHeight}
            onFullScreenChange={handleFullScreenChange}
          />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* YouTube Embedded Video Player Container */}
          <VideoPlayer
            videoId={videoId}
            height={220}
            onFullScreenChange={handleFullScreenChange}
          />

        {/* Video Info Section */}
        {video && (
          <View style={styles.infoContainer}>
            <Text style={[styles.videoTitle, { color: theme.colors.textPrimary }]}>{video.title}</Text>

            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{video.viewCount || 'YouTube Video'}</Text>
              <Text style={[styles.dot, { color: theme.colors.textMuted }]}>•</Text>
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                {formatRelativeTime(video.publishedAt)}
              </Text>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.actionPill,
                  { backgroundColor: bookmarked ? theme.colors.badgeBg : theme.colors.surfaceVariant },
                ]}
                onPress={handleToggleBookmark}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={bookmarked ? theme.colors.primary : theme.colors.textPrimary}
                />
                <Text style={[styles.actionPillText, { color: bookmarked ? theme.colors.primary : theme.colors.textPrimary }]}>
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={handleSaveTab}
                activeOpacity={0.75}
              >
                <Ionicons name="folder-open-outline" size={18} color={theme.colors.textPrimary} />
                <Text style={[styles.actionPillText, { color: theme.colors.textPrimary }]}>Save Tab</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={handleShare}
                activeOpacity={0.75}
              >
                <Ionicons name="share-social-outline" size={18} color={theme.colors.textPrimary} />
                <Text style={[styles.actionPillText, { color: theme.colors.textPrimary }]}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Channel Info Row */}
            <View style={[styles.channelBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.channelAvatar, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.channelDetails}>
                <Text style={[styles.channelTitle, { color: theme.colors.textPrimary }]}>{video.channelTitle}</Text>
                <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>YouTube Creator</Text>
              </View>
            </View>

            {/* Collapsible Video Description */}
            <TouchableOpacity
              style={[styles.descriptionBox, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setShowFullDescription(!showFullDescription)}
              activeOpacity={0.85}
            >
              <Text
                numberOfLines={showFullDescription ? undefined : 3}
                style={[styles.descriptionText, { color: theme.colors.textSecondary }]}
              >
                {video.description || 'No description provided for this YouTube video.'}
              </Text>
              <Text style={[styles.expandText, { color: theme.colors.primary }]}>
                {showFullDescription ? 'Show less' : 'Read more...'}
              </Text>
            </TouchableOpacity>

            {/* Related Videos Section */}
            <View style={styles.relatedSection}>
              <Text style={[styles.relatedTitle, { color: theme.colors.textPrimary }]}>Up Next & Related Videos</Text>
              {relatedVideos.map((item) => (
                <VideoCard key={item.id} video={item} layout="horizontal" />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    )}

    {/* Download Options Modal */}
    <DownloadModal
      visible={downloadModalVisible}
      onClose={() => setDownloadModalVisible(false)}
      video={
        video
          ? {
              id: video.id,
              title: video.title,
              channelTitle: video.channelTitle,
              thumbnailUrl: video.thumbnailUrl,
            }
          : null
      }
    />
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  infoContainer: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    marginHorizontal: 6,
  },
  metaText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  channelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  channelAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelDetails: {
    marginLeft: 12,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  descriptionBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  relatedSection: {
    marginTop: 10,
  },
  relatedTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  errorCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fullScreenPlayerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
