import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { cleanYouTubeTitle, extractYouTubeVideoId } from '../utils/validation';
import { AD_BLOCK_PRE_SCRIPT, AD_BLOCK_POST_SCRIPT, isBlockedAdUrl } from '../utils/adblock';
import { BACKGROUND_PLAYBACK_PRE_SCRIPT, BACKGROUND_PLAYBACK_POST_SCRIPT } from '../utils/backgroundPlayback';

export interface YouTubeNavigationState {
  url: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  loading: boolean;
  progress: number;
}

export interface YouTubeWebViewRef {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  stopLoading: () => void;
  loadUrl: (url: string) => void;
  exitFullScreen: () => void;
  triggerPiP: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVideoQuality: (quality: string) => void;
  seekRelative: (seconds: number) => void;
  setVolume: (volume: number) => void;
  updateSponsorBlockSegments: (segments: any[]) => void;
}

interface YouTubeWebViewProps {
  initialUrl?: string;
  onNavigationChange?: (navState: YouTubeNavigationState) => void;
  onTitleChange?: (title: string, url: string) => void;
  onVideoWatched?: (video: { videoId: string; url: string; title: string; channelTitle?: string }) => void;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  onSponsorSkipped?: (savedSeconds: number, category: string) => void;
  onError?: (error: string) => void;
}

// Injected script to capture YouTube SPA transitions, video playback, titles, and channel metadata
const INJECTED_SPA_TRACKER = `
(function() {
  function extractVideoId(url) {
    if (!url) return null;
    var m = url.match(/(?:watch\\?v=|shorts\\/|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function getCleanTitle() {
    var rawTitle = document.title || '';
    var el = document.querySelector('h1.slim-video-metadata-title, h1.title.style-scope.ytd-watch-metadata, #title h1 yt-formatted-string, ytm-slim-video-metadata .title');
    if (el && el.textContent && el.textContent.trim()) {
      rawTitle = el.textContent.trim();
    }
    return rawTitle.replace(/\\s*-\\s*YouTube$/i, '').trim();
  }

  function getChannelTitle() {
    var el = document.querySelector('#owner-name, ytm-slim-owner-renderer .owner-name, ytd-channel-name yt-formatted-string, .slim-owner-channel-name, .ytm-channel-thumbnail-with-name .channel-name');
    return el && el.textContent ? el.textContent.trim() : '';
  }

  var lastSentVideoId = null;

  function checkAndNotify(isPlayEvent) {
    try {
      var currentUrl = window.location.href;
      var title = getCleanTitle();
      var channel = getChannelTitle();
      var videoId = extractVideoId(currentUrl);

      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        // Send navigation update
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'YT_NAVIGATION',
          url: currentUrl,
          title: title || 'YouTube',
          channelTitle: channel
        }));

        // If on a video watch page, trigger YT_VIDEO_WATCHED
        if (videoId && (videoId !== lastSentVideoId || isPlayEvent)) {
          lastSentVideoId = videoId;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'YT_VIDEO_WATCHED',
            videoId: videoId,
            url: currentUrl,
            title: title || ('YouTube Video (' + videoId + ')'),
            channelTitle: channel
          }));
        }
      }
    } catch (e) {}
  }

  // Hook YouTube SPA navigation events
  window.addEventListener('yt-navigate-finish', function() { checkAndNotify(false); });
  window.addEventListener('yt-page-data-updated', function() { checkAndNotify(false); });
  window.addEventListener('popstate', function() { checkAndNotify(false); });
  window.addEventListener('load', function() { checkAndNotify(false); });

  // Hook HTML5 video elements for play events
  function hookVideos() {
    var vids = document.querySelectorAll('video');
    vids.forEach(function(v) {
      if (!v.__saddutubeHooked) {
        v.__saddutubeHooked = true;
        v.addEventListener('playing', function() { checkAndNotify(true); });
        v.addEventListener('play', function() { checkAndNotify(true); });
      }
    });
  }
  setInterval(hookVideos, 1500);

  // Observer for document title changes
  var titleEl = document.querySelector('title');
  if (titleEl) {
    var observer = new MutationObserver(function() {
      checkAndNotify(false);
    });
    observer.observe(titleEl, { subtree: true, characterData: true, childList: true });
  }

  setTimeout(function() { checkAndNotify(false); }, 800);
  setTimeout(function() { checkAndNotify(false); }, 2000);
})();
true;
`;

// Injected script to detect when user taps Full Screen button in YouTube web
const FULLSCREEN_DETECTION_SCRIPT = `
(function() {
  var isCurrentlyFullScreen = false;

  function isDocFullScreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        return true;
      }
      var player = document.querySelector('#movie_player, .html5-video-player, ytm-watch, ytm-media-item');
      if (player && (player.classList.contains('ytp-fullscreen') || player.classList.contains('fullscreen'))) {
        return true;
      }
      var exitBtn = document.querySelector('button[aria-label*="Exit full screen" i], button[aria-label*="Exit fullscreen" i], .ytp-fullscreen-button[aria-label*="Exit" i]');
      if (exitBtn) {
        return true;
      }
      var videos = document.querySelectorAll('video');
      for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        if (v && (v.webkitDisplayingFullscreen || v.webkitPresentationMode === 'fullscreen')) {
          return true;
        }
      }
    } catch(e) {}
    return false;
  }

  function notifyFullscreen(isFs) {
    if (isCurrentlyFullScreen === isFs) return;
    isCurrentlyFullScreen = isFs;
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'YT_FULLSCREEN_CHANGE',
          isFullScreen: isFs
        }));
      }
    } catch(e) {}
  }

  function check() {
    var fs = isDocFullScreen();
    notifyFullscreen(fs);
  }

  // Document fullscreen event listeners
  document.addEventListener('fullscreenchange', check);
  document.addEventListener('webkitfullscreenchange', check);
  document.addEventListener('mozfullscreenchange', check);
  document.addEventListener('MSFullscreenChange', check);

  // Hook all video elements
  function hookVideos() {
    var vids = document.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i];
      if (!v.__saddutubeFsHooked) {
        v.__saddutubeFsHooked = true;
        v.addEventListener('webkitbeginfullscreen', function() { notifyFullscreen(true); });
        v.addEventListener('webkitendfullscreen', function() { notifyFullscreen(false); });
      }
    }
  }

  // Hook user click on fullscreen buttons
  document.addEventListener('click', function(e) {
    var target = e.target;
    var btn = target && target.closest ? target.closest('.ytp-fullscreen-button, button.fullscreen-icon, button[aria-label*="ull screen" i], button[aria-label*="ullscreen" i]') : null;
    if (btn) {
      setTimeout(check, 100);
      setTimeout(check, 300);
      setTimeout(check, 600);
      setTimeout(check, 1000);
    }
  }, true);

  // MutationObserver for player class changes
  try {
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && m.attributeName === 'class') {
          check();
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });
  } catch(e) {}

  setInterval(function() {
    hookVideos();
    check();
  }, 400);

  window.__sadduTubeExitFullScreen = function() {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      var exitBtn = document.querySelector('button[aria-label*="Exit full screen" i], button[aria-label*="Exit fullscreen" i], .ytp-fullscreen-button');
      if (exitBtn) {
        exitBtn.click();
      }
    } catch(e) {}
    notifyFullscreen(false);
  };
})();
true;
`;

// Injected script for Pro Features: PiP, Speed, Quality, Volume, and SponsorBlock
const PRO_FEATURES_SCRIPT = `
(function() {
  // PiP Controller
  window.__sadduTubeTriggerPiP = function() {
    try {
      var video = document.querySelector('video');
      if (video) {
        if (video.requestPictureInPicture) {
          video.requestPictureInPicture().catch(function(){});
        } else if (video.webkitSetPresentationMode) {
          video.webkitSetPresentationMode('picture-in-picture');
        }
      }
    } catch(e) {}
  };

  // Speed Controller
  window.__sadduTubeSetSpeed = function(speed) {
    try {
      var vids = document.querySelectorAll('video');
      vids.forEach(function(v) { v.playbackRate = speed; });
      var p = document.getElementById('movie_player');
      if (p && p.setPlaybackRate) { p.setPlaybackRate(speed); }
    } catch(e) {}
  };

  // Quality Controller
  window.__sadduTubeSetQuality = function(quality) {
    try {
      var p = document.getElementById('movie_player');
      if (p) {
        if (p.setPlaybackQualityRange) { p.setPlaybackQualityRange(quality, quality); }
        if (p.setPlaybackQuality) { p.setPlaybackQuality(quality); }
      }
    } catch(e) {}
  };

  // Relative Seek
  window.__sadduTubeSeek = function(seconds) {
    try {
      var video = document.querySelector('video');
      if (video) {
        video.currentTime = Math.max(0, video.currentTime + seconds);
      }
    } catch(e) {}
  };

  // Volume Controller
  window.__sadduTubeSetVolume = function(vol) {
    try {
      var vids = document.querySelectorAll('video');
      vids.forEach(function(v) {
        v.volume = Math.max(0, Math.min(1, vol));
        v.muted = (vol === 0);
      });
    } catch(e) {}
  };

  // SponsorBlock Controller
  window.__sadduTubeSponsorSegments = [];
  window.__sadduTubeUpdateSegments = function(segs) {
    window.__sadduTubeSponsorSegments = Array.isArray(segs) ? segs : [];
  };

  var lastSkippedEnd = -1;
  function checkSponsorSegments() {
    try {
      var segs = window.__sadduTubeSponsorSegments;
      if (!segs || segs.length === 0) return;
      var video = document.querySelector('video');
      if (!video || video.paused || video.ended) return;

      var cur = video.currentTime;
      for (var i = 0; i < segs.length; i++) {
        var s = segs[i];
        if (s.segment && cur >= s.segment[0] && cur < (s.segment[1] - 0.2)) {
          if (lastSkippedEnd !== s.segment[1]) {
            lastSkippedEnd = s.segment[1];
            video.currentTime = s.segment[1] + 0.1;
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SPONSORBLOCK_SKIPPED',
                category: s.category || 'sponsor',
                savedSeconds: Math.round(s.segment[1] - s.segment[0])
              }));
            }
          }
          break;
        }
      }
    } catch(e) {}
  }

  setInterval(checkSponsorSegments, 250);
})();
true;
`;

// Clean mobile User-Agent: uses standard mobile Safari / Firefox UA without custom identifiers
// to ensure Google's accounts.google.com does not block with "403: disallowed_useragent"
const CLEAN_MOBILE_USER_AGENT =
  Platform.OS === 'android'
    ? 'Mozilla/5.0 (Linux; Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

export const YouTubeWebView = forwardRef<YouTubeWebViewRef, YouTubeWebViewProps>(
  (
    {
      initialUrl = 'https://www.youtube.com',
      onNavigationChange,
      onTitleChange,
      onVideoWatched,
      onFullScreenChange,
      onSponsorSkipped,
      onError,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const webViewRef = useRef<WebView>(null);
    const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
    const [pageTitle, setPageTitle] = useState<string>('YouTube');
    const [canGoBack, setCanGoBack] = useState<boolean>(false);
    const [canGoForward, setCanGoForward] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [hasError, setHasError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Expose browser controls via ref
    useImperativeHandle(ref, () => ({
      goBack: () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
        }
      },
      goForward: () => {
        if (webViewRef.current) {
          webViewRef.current.goForward();
        }
      },
      reload: () => {
        setHasError(false);
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
      },
      stopLoading: () => {
        if (webViewRef.current) {
          webViewRef.current.stopLoading();
        }
      },
      loadUrl: (newUrl: string) => {
        setHasError(false);
        setCurrentUrl(newUrl);
      },
      exitFullScreen: () => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(
            '(function(){ if(window.__sadduTubeExitFullScreen){ window.__sadduTubeExitFullScreen(); } else { if(document.exitFullscreen){ document.exitFullscreen(); } else if(document.webkitExitFullscreen){ document.webkitExitFullscreen(); } } })(); true;'
          );
        }
      },
      triggerPiP: () => {
        webViewRef.current?.injectJavaScript('window.__sadduTubeTriggerPiP && window.__sadduTubeTriggerPiP(); true;');
      },
      setPlaybackSpeed: (speed: number) => {
        webViewRef.current?.injectJavaScript(`window.__sadduTubeSetSpeed && window.__sadduTubeSetSpeed(${speed}); true;`);
      },
      setVideoQuality: (quality: string) => {
        webViewRef.current?.injectJavaScript(`window.__sadduTubeSetQuality && window.__sadduTubeSetQuality('${quality}'); true;`);
      },
      seekRelative: (seconds: number) => {
        webViewRef.current?.injectJavaScript(`window.__sadduTubeSeek && window.__sadduTubeSeek(${seconds}); true;`);
      },
      setVolume: (volume: number) => {
        webViewRef.current?.injectJavaScript(`window.__sadduTubeSetVolume && window.__sadduTubeSetVolume(${volume}); true;`);
      },
      updateSponsorBlockSegments: (segments: any[]) => {
        webViewRef.current?.injectJavaScript(`window.__sadduTubeUpdateSegments && window.__sadduTubeUpdateSegments(${JSON.stringify(segments)}); true;`);
      },
    }));

    const updateNavState = useCallback(
      (url: string, title: string, back: boolean, forward: boolean, loading: boolean, progress = 1) => {
        if (onNavigationChange) {
          onNavigationChange({
            url,
            title: cleanYouTubeTitle(title),
            canGoBack: back,
            canGoForward: forward,
            loading,
            progress,
          });
        }
      },
      [onNavigationChange]
    );

    const handleNavigationStateChange = (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack);
      setCanGoForward(navState.canGoForward);
      setIsLoading(navState.loading);

      const navUrl = navState.url;
      if (navUrl && !navUrl.startsWith('about:')) {
        setCurrentUrl(navUrl);
      }

      if (navState.title) {
        const cleaned = cleanYouTubeTitle(navState.title);
        setPageTitle(cleaned);
        if (onTitleChange) {
          onTitleChange(cleaned, navUrl);
        }
      }

      updateNavState(
        navUrl,
        navState.title || pageTitle,
        navState.canGoBack,
        navState.canGoForward,
        navState.loading,
        loadProgress
      );
    };

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'YT_NAVIGATION') {
          if (data.url && !data.url.startsWith('about:')) {
            setCurrentUrl(data.url);
          }
          if (data.title) {
            const cleaned = cleanYouTubeTitle(data.title);
            setPageTitle(cleaned);
            if (onTitleChange && data.url) {
              onTitleChange(cleaned, data.url);
            }
          }
          updateNavState(data.url || currentUrl, data.title || pageTitle, canGoBack, canGoForward, isLoading, 1);
        }

        // Automatic video watch logging
        if (data.type === 'YT_VIDEO_WATCHED' && data.videoId) {
          if (onVideoWatched) {
            onVideoWatched({
              videoId: data.videoId,
              url: data.url,
              title: cleanYouTubeTitle(data.title),
              channelTitle: data.channelTitle,
            });
          }
        }

        // Fullscreen state change
        if (data.type === 'YT_FULLSCREEN_CHANGE') {
          if (onFullScreenChange) {
            onFullScreenChange(Boolean(data.isFullScreen));
          }
        }

        // SponsorBlock segment skipped notification
        if (data.type === 'SPONSORBLOCK_SKIPPED') {
          if (onSponsorSkipped) {
            onSponsorSkipped(data.savedSeconds || 0, data.category || 'sponsor');
          }
        }
      } catch {
        // Non-JSON message, safely ignored
      }
    };

    const handleLoadProgress = ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      setLoadProgress(nativeEvent.progress);
      if (onNavigationChange) {
        onNavigationChange({
          url: currentUrl,
          title: pageTitle,
          canGoBack,
          canGoForward,
          loading: nativeEvent.progress < 1,
          progress: nativeEvent.progress,
        });
      }
    };

    const handleShouldStartLoadWithRequest = (request: any) => {
      const targetUrl = request.url;
      if (!targetUrl || targetUrl.startsWith('about:') || targetUrl.startsWith('data:')) {
        return true;
      }

      // Block any known ad tracking and ad network URLs
      if (isBlockedAdUrl(targetUrl)) {
        return false;
      }

      // Allow official YouTube and Google login authentication URLs
      if (
        targetUrl.includes('youtube.com') ||
        targetUrl.includes('youtu.be') ||
        targetUrl.includes('accounts.google.com') ||
        targetUrl.includes('gstatic.com') ||
        targetUrl.includes('google.com') ||
        targetUrl.includes('googleusercontent.com') ||
        targetUrl.includes('ytimg.com') ||
        targetUrl.includes('googlevideo.com')
      ) {
        return true;
      }

      // Keep user inside YouTube domain
      return false;
    };

    const handleLoadError = (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent;
      setIsLoading(false);
      // Ignore abort errors caused by rapid user navigation
      if (nativeEvent.description && nativeEvent.description.includes('net::ERR_ABORTED')) {
        return;
      }
      setHasError(true);
      const msg = nativeEvent.description || 'Unable to connect to YouTube. Please check your internet connection.';
      setErrorMessage(msg);
      if (onError) {
        onError(msg);
      }
    };

    if (hasError) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.errorIconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>Connection Error</Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>{errorMessage}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setHasError(false);
              if (webViewRef.current) {
                webViewRef.current.reload();
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <View style={styles.webFallbackContainer}>
          {/* @ts-ignore */}
          <iframe
            src={currentUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="SadduTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef as any}
          source={{ uri: currentUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          allowsPictureInPictureMediaPlayback={true}
          allowsAirPlayForMediaPlayback={true}
          androidLayerType="hardware"
          injectedJavaScript={`${INJECTED_SPA_TRACKER}\n${AD_BLOCK_POST_SCRIPT}\n${BACKGROUND_PLAYBACK_POST_SCRIPT}\n${FULLSCREEN_DETECTION_SCRIPT}\n${PRO_FEATURES_SCRIPT}`}
          injectedJavaScriptBeforeContentLoaded={`${AD_BLOCK_PRE_SCRIPT}\n${BACKGROUND_PLAYBACK_PRE_SCRIPT}\n${INJECTED_SPA_TRACKER}\n${FULLSCREEN_DETECTION_SCRIPT}\n${PRO_FEATURES_SCRIPT}`}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          onLoadProgress={handleLoadProgress}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={handleLoadError}
          onHttpError={handleLoadError}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          setSupportMultipleWindows={false}
          userAgent={CLEAN_MOBILE_USER_AGENT}
        />
      </View>
    );
  }
);

YouTubeWebView.displayName = 'YouTubeWebView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webFallbackContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
