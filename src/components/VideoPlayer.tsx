import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTheme } from '../context/ThemeContext';
import { buildYouTubeEmbedUrl } from '../utils/validation';
import { AD_BLOCK_PRE_SCRIPT, AD_BLOCK_POST_SCRIPT } from '../utils/adblock';
import { BACKGROUND_PLAYBACK_PRE_SCRIPT, BACKGROUND_PLAYBACK_POST_SCRIPT } from '../utils/backgroundPlayback';

let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    // fallback
  }
}

interface VideoPlayerProps {
  videoId: string;
  onStateChange?: (state: string) => void;
  onFullScreenChange?: (status: boolean) => void;
  height?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onStateChange,
  onFullScreenChange,
  height = 220,
}) => {
  const { theme } = useTheme();
  const [playing, setPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useWebViewFallback, setUseWebViewFallback] = useState(false);

  const handleStateChange = (state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
    if (onStateChange) {
      onStateChange(state);
    }
  };

  const handleError = (error: string) => {
    console.warn('YouTube Player error:', error);
    setUseWebViewFallback(true);
  };

  // Web platform standard iframe renderer
  if (Platform.OS === 'web') {
    const embedUrl = buildYouTubeEmbedUrl(videoId);
    return (
      <View style={[styles.playerWrapper, { height, backgroundColor: '#000000' }]}>
        {/* @ts-ignore */}
        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.errorContainer, { height, backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          Unable to load YouTube player for this video.
        </Text>
      </View>
    );
  }

  if (useWebViewFallback && WebView) {
    return (
      <View style={[styles.playerWrapper, { height, backgroundColor: '#000000' }]}>
        <WebView
          source={{ uri: buildYouTubeEmbedUrl(videoId) }}
          style={{ flex: 1 }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsPictureInPictureMediaPlayback={true}
          allowsAirPlayForMediaPlayback={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={`${AD_BLOCK_POST_SCRIPT}\n${BACKGROUND_PLAYBACK_POST_SCRIPT}`}
          injectedJavaScriptBeforeContentLoaded={`${AD_BLOCK_PRE_SCRIPT}\n${BACKGROUND_PLAYBACK_PRE_SCRIPT}`}
          onError={() => setHasError(true)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.playerWrapper, { height, backgroundColor: '#000000' }]}>
      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      <YoutubePlayer
        height={height}
        play={playing}
        videoId={videoId}
        onChangeState={handleStateChange}
        onReady={() => setIsReady(true)}
        onError={handleError}
        onFullScreenChange={onFullScreenChange}
        initialPlayerParams={{
          preventFullScreen: false,
          showClosedCaptions: false,
          controls: true,
          rel: false,
        }}
        webViewProps={{
          allowsFullscreenVideo: true,
          allowsPictureInPictureMediaPlayback: true,
          allowsAirPlayForMediaPlayback: true,
          injectedJavaScript: `${AD_BLOCK_POST_SCRIPT}\n${BACKGROUND_PLAYBACK_POST_SCRIPT}`,
          injectedJavaScriptBeforeContentLoaded: `${AD_BLOCK_PRE_SCRIPT}\n${BACKGROUND_PLAYBACK_PRE_SCRIPT}`,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  playerWrapper: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    zIndex: 2,
  },
  errorContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
