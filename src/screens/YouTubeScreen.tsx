import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Animated,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import {
  YouTubeWebView,
  YouTubeWebViewRef,
  YouTubeNavigationState,
} from '../components/YouTubeWebView';
import { PlayerGestureOverlay } from '../components/PlayerGestureOverlay';
import { PlaybackSettingsModal } from '../components/PlaybackSettingsModal';
import { DownloadModal } from '../components/DownloadModal';
import { SponsorBlockService } from '../services/sponsorblock.service';
import { normalizeYouTubeUrl, cleanYouTubeTitle, isYouTubeUrl, extractYouTubeVideoId } from '../utils/validation';

interface YouTubeScreenProps {
  initialUrl?: string;
}

export function YouTubeScreen({ initialUrl = 'https://www.youtube.com' }: YouTubeScreenProps) {
  const { theme, isDark } = useTheme();
  const { isBookmarked, toggleBookmark, addToHistory, updateHistoryTitle } = useAppData();

  const webViewRef = useRef<YouTubeWebViewRef>(null);
  const [navState, setNavState] = useState<YouTubeNavigationState>({
    url: initialUrl,
    title: 'YouTube',
    canGoBack: false,
    canGoForward: false,
    loading: true,
    progress: 0,
  });

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQueryInput, setSearchQueryInput] = useState('');
  const [progressAnim] = useState(new Animated.Value(0));

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<(() => void) | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bookmarked = isBookmarked(navState.url);

  // Fullscreen state tracking
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Pro feature states
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [playbackSettingsVisible, setPlaybackSettingsVisible] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string; channelTitle?: string } | null>(null);

  // Smooth orientation handler for Full Screen button
  const handleFullScreenChange = useCallback(async (fullScreen: boolean) => {
    setIsFullScreen(fullScreen);
    try {
      if (fullScreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    } catch (e) {
      console.warn('ScreenOrientation lock error:', e);
    }
  }, []);

  // Guarantee return to portrait orientation when unmounting / navigating away
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Animate loading bar
  useEffect(() => {
    if (navState.loading) {
      Animated.timing(progressAnim, {
        toValue: Math.max(0.1, navState.progress),
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start(() => {
        progressAnim.setValue(0);
      });
    }
  }, [navState.loading, navState.progress, progressAnim]);

  // Handle hardware back button on Android: exit full screen first, then navigate back
  useEffect(() => {
    const onBackPress = () => {
      if (isFullScreen) {
        if (webViewRef.current) {
          webViewRef.current.exitFullScreen();
        }
        handleFullScreenChange(false);
        return true;
      }
      if (webViewRef.current && navState.canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isFullScreen, navState.canGoBack, handleFullScreenChange]);

  const handleNavigationChange = useCallback((state: YouTubeNavigationState) => {
    setNavState(state);
  }, []);

  const handleVideoWatched = useCallback(
    async (watched: { videoId: string; url: string; title: string; channelTitle?: string }) => {
      addToHistory(watched.url, watched.title, watched.channelTitle);
      setActiveVideo({
        id: watched.videoId,
        title: watched.title,
        channelTitle: watched.channelTitle,
      });

      // Query and apply SponsorBlock segments
      try {
        const segments = await SponsorBlockService.getSegmentsForVideo(watched.videoId);
        if (segments && segments.length > 0) {
          webViewRef.current?.updateSponsorBlockSegments(segments);
        }
      } catch {}
    },
    [addToHistory]
  );

  const handleSponsorSkipped = useCallback(
    (seconds: number, category: string) => {
      const catLabel =
        category === 'intro'
          ? 'intro'
          : category === 'outro'
          ? 'outro'
          : category === 'interaction'
          ? 'reminder'
          : 'sponsor segment';

      setToastMessage(`⚡ Skipped ${catLabel} (${seconds}s saved)`);
      setToastAction(null);

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();

      toastTimerRef.current = setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToastMessage(null));
      }, 2500);
    },
    [toastAnim]
  );

  const handleTriggerPiP = () => {
    if (webViewRef.current) {
      webViewRef.current.triggerPiP();
    }
  };

  const handleOpenDownload = () => {
    const videoId = activeVideo?.id || extractYouTubeVideoId(navState.url);
    if (!videoId) {
      setToastMessage('Play a video first to download');
      return;
    }
    setActiveVideo((prev) => prev || { id: videoId, title: navState.title });
    setDownloadModalVisible(true);
  };

  const handleSelectSpeed = (speed: number) => {
    setCurrentSpeed(speed);
    webViewRef.current?.setPlaybackSpeed(speed);
  };

  const handleSelectQuality = (quality: string) => {
    setCurrentQuality(quality);
    webViewRef.current?.setVideoQuality(quality);
  };

  const handleTitleChange = useCallback(
    (title: string, url: string) => {
      setNavState((prev) => ({ ...prev, title: cleanYouTubeTitle(title) }));
      if (url && title) {
        updateHistoryTitle(url, title);
      }
    },
    [updateHistoryTitle]
  );

  const handleToggleBookmark = async () => {
    if (!navState.url) return;
    const willBeBookmarked = !bookmarked;
    await toggleBookmark(navState.url, navState.title);

    // Show toast feedback
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(willBeBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
    setToastAction(willBeBookmarked ? () => router.push('/bookmarks' as any) : null);

    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    toastTimerRef.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setToastMessage(null);
        setToastAction(null);
      });
    }, 2400);
  };

  const handleShare = async () => {
    if (!navState.url) return;
    try {
      await Share.share({
        message: `Watch on YouTube: ${navState.title} - ${navState.url}`,
        url: navState.url,
        title: navState.title,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQueryInput.trim()) return;
    const targetUrl = normalizeYouTubeUrl(searchQueryInput);
    if (webViewRef.current) {
      webViewRef.current.loadUrl(targetUrl);
    }
    setSearchModalVisible(false);
    setSearchQueryInput('');
    Keyboard.dismiss();
  };

  const handleQuickJump = (url: string) => {
    if (webViewRef.current) {
      webViewRef.current.loadUrl(url);
    }
    setSearchModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isFullScreen ? '#000000' : theme.colors.background }]}
      edges={isFullScreen ? [] : ['top', 'bottom']}
    >
      <StatusBar hidden={isFullScreen} style={isDark ? 'light' : 'dark'} />
      {/* Top Header Chrome (hidden during full screen for immersive landscape view) */}
      {!isFullScreen && (
        <View style={[styles.headerBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => {
            if (navState.canGoBack && webViewRef.current) {
              webViewRef.current.goBack();
            } else {
              router.push('/' as any);
            }
          }}
          activeOpacity={0.7}
          accessibilityLabel={navState.canGoBack ? 'Back' : 'Home'}
        >
          <Ionicons
            name={navState.canGoBack ? 'arrow-back' : 'home-outline'}
            size={20}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Title & URL indicator chip */}
        <TouchableOpacity
          style={[styles.addressChip, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
          onPress={() => {
            setSearchQueryInput('');
            setSearchModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-youtube" size={16} color={theme.colors.primary} />
          <View style={styles.chipTextContainer}>
            <Text numberOfLines={1} style={[styles.chipTitle, { color: theme.colors.textPrimary }]}>
              {navState.title || 'YouTube'}
            </Text>
            <Text numberOfLines={1} style={[styles.chipUrl, { color: theme.colors.textMuted }]}>
              {navState.url ? navState.url.replace(/^https?:\/\/(www\.)?/, '') : 'youtube.com'}
            </Text>
          </View>
          <Ionicons name="search" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>

        {/* Playback Speed / Quality Button */}
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => setPlaybackSettingsVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Speed and Quality"
        >
          <Ionicons name="speedometer-outline" size={17} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        {/* Download Button */}
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handleOpenDownload}
          onLongPress={() => router.push('/downloads' as any)}
          activeOpacity={0.7}
          accessibilityLabel="Download Video"
        >
          <Ionicons name="cloud-download-outline" size={18} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        {/* PiP Button */}
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handleTriggerPiP}
          activeOpacity={0.7}
          accessibilityLabel="Picture-in-Picture"
        >
          <Ionicons name="open-outline" size={17} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        {/* Bookmark Option Button */}
        <TouchableOpacity
          style={[
            styles.headerBtn,
            {
              backgroundColor: bookmarked ? 'rgba(255, 30, 56, 0.16)' : theme.colors.surfaceVariant,
              borderColor: bookmarked ? theme.colors.primary : 'transparent',
              borderWidth: bookmarked ? 1 : 0,
            },
          ]}
          onPress={handleToggleBookmark}
          onLongPress={() => router.push('/bookmarks' as any)}
          activeOpacity={0.7}
          accessibilityLabel={bookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={bookmarked ? theme.colors.primary : theme.colors.textPrimary}
          />
        </TouchableOpacity>

          {navState.canGoBack && (
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => router.push('/' as any)}
              activeOpacity={0.7}
              accessibilityLabel="Home"
            >
              <Ionicons name="home-outline" size={19} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Floating Bookmark Feedback Toast */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
              ],
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name={toastMessage.includes('Saved') ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.toastText, { color: theme.colors.textPrimary }]}>{toastMessage}</Text>
          {toastAction && (
            <TouchableOpacity
              onPress={() => {
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                setToastMessage(null);
                toastAction();
              }}
              style={styles.toastActionBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.toastActionText, { color: theme.colors.primary }]}>View</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Loading Progress Bar */}
      {navState.loading && (
        <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: theme.colors.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}

      {/* Main YouTube WebView wrapped in Gesture Overlay */}
      <View style={[styles.webViewContainer, isFullScreen && styles.webViewContainerFullScreen]}>
        <PlayerGestureOverlay
          enabled={true}
          onVolumeChange={(vol) => webViewRef.current?.setVolume(vol)}
          onSeekRelative={(sec) => webViewRef.current?.seekRelative(sec)}
        >
          <YouTubeWebView
            ref={webViewRef}
            initialUrl={initialUrl}
            onNavigationChange={handleNavigationChange}
            onTitleChange={handleTitleChange}
            onVideoWatched={handleVideoWatched}
            onFullScreenChange={handleFullScreenChange}
            onSponsorSkipped={handleSponsorSkipped}
          />
        </PlayerGestureOverlay>
      </View>

      {/* Quick Search & URL Jump Modal */}
      <Modal
        visible={searchModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.searchModalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Ionicons name="logo-youtube" size={20} color={theme.colors.primary} />
                    <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Search YouTube</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                    <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                    placeholder="Search query or enter YouTube URL..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={searchQueryInput}
                    onChangeText={setSearchQueryInput}
                    onSubmitEditing={handleSearchSubmit}
                    autoFocus={true}
                    returnKeyType="go"
                  />
                  {searchQueryInput.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQueryInput('')}>
                      <Ionicons name="close" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.searchSubmitBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSearchSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.searchSubmitBtnText}>Go to YouTube</Text>
                </TouchableOpacity>

                {/* Quick Navigation: Bookmarks & History */}
                <View style={styles.quickNavRow}>
                  <TouchableOpacity
                    style={[styles.quickNavBtn, { backgroundColor: 'rgba(255, 149, 0, 0.12)', borderColor: 'rgba(255, 149, 0, 0.25)' }]}
                    onPress={() => {
                      setSearchModalVisible(false);
                      router.push('/bookmarks' as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="bookmark" size={16} color="#FF9500" />
                    <Text style={[styles.quickNavBtnText, { color: theme.colors.textPrimary }]}>Saved Bookmarks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickNavBtn, { backgroundColor: 'rgba(0, 122, 255, 0.12)', borderColor: 'rgba(0, 122, 255, 0.25)' }]}
                    onPress={() => {
                      setSearchModalVisible(false);
                      router.push('/history' as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time" size={16} color="#007AFF" />
                    <Text style={[styles.quickNavBtnText, { color: theme.colors.textPrimary }]}>Watch History</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.quickJumpHeading, { color: theme.colors.textSecondary }]}>Quick Destinations</Text>
                <View style={styles.quickJumpGrid}>
                  {[
                    { label: 'YouTube Home', url: 'https://www.youtube.com', icon: 'home' },
                    { label: 'Trending', url: 'https://www.youtube.com/feed/trending', icon: 'flame' },
                    { label: 'Music', url: 'https://www.youtube.com/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ', icon: 'musical-notes' },
                    { label: 'Gaming', url: 'https://www.youtube.com/gaming', icon: 'game-controller' },
                    { label: 'Subscriptions', url: 'https://www.youtube.com/feed/subscriptions', icon: 'albums' },
                    { label: 'Library', url: 'https://www.youtube.com/feed/library', icon: 'library' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[styles.quickJumpChip, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
                      onPress={() => handleQuickJump(item.url)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={item.icon as any} size={15} color={theme.colors.primary} />
                      <Text style={[styles.quickJumpText, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Download Options Modal */}
      <DownloadModal
        visible={downloadModalVisible}
        onClose={() => setDownloadModalVisible(false)}
        video={
          activeVideo || {
            id: extractYouTubeVideoId(navState.url) || '',
            title: navState.title,
          }
        }
      />

      {/* Playback Settings Modal (Speed & Quality) */}
      <PlaybackSettingsModal
        visible={playbackSettingsVisible}
        onClose={() => setPlaybackSettingsVisible(false)}
        currentSpeed={currentSpeed}
        currentQuality={currentQuality}
        onSelectSpeed={handleSelectSpeed}
        onSelectQuality={handleSelectQuality}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webViewContainerFullScreen: {
    backgroundColor: '#000000',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  chipTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  chipTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipUrl: {
    fontSize: 10,
  },
  progressBarContainer: {
    height: 2.5,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  webViewContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  searchModalCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  searchSubmitBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  quickJumpHeading: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  quickJumpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickJumpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  quickJumpText: {
    fontSize: 13,
    fontWeight: '500',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toastActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  toastActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  quickNavBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
