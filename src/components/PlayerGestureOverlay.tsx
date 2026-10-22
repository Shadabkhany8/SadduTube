import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Brightness from 'expo-brightness';

interface PlayerGestureOverlayProps {
  enabled?: boolean;
  onVolumeChange?: (volume: number) => void;
  onSeekRelative?: (seconds: number) => void;
  children?: React.ReactNode;
}

export const PlayerGestureOverlay: React.FC<PlayerGestureOverlayProps> = ({
  enabled = true,
  onVolumeChange,
  onSeekRelative,
  children,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Current values (0.0 to 1.0)
  const currentBrightnessRef = useRef<number>(0.5);
  const currentVolumeRef = useRef<number>(1.0);

  // HUD state
  const [hudType, setHudType] = useState<'brightness' | 'volume' | 'seek' | null>(null);
  const [hudValue, setHudValue] = useState<number>(50); // 0 to 100 or seek seconds
  const [seekLabel, setSeekLabel] = useState<string>('');

  const hudOpacity = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Double-tap tracking
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Initialize brightness from system/app
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          const b = await Brightness.getBrightnessAsync();
          currentBrightnessRef.current = Math.max(0.1, Math.min(1.0, b));
        }
      } catch {}
    })();
  }, []);

  const showHud = (type: 'brightness' | 'volume' | 'seek', value: number, label = '') => {
    setHudType(type);
    setHudValue(value);
    setSeekLabel(label);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    Animated.timing(hudOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    hideTimeoutRef.current = setTimeout(() => {
      Animated.timing(hudOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setHudType(null);
      });
    }, 1200);
  };

  // PanResponder to intercept gestures
  const isLeftSideRef = useRef<boolean>(false);
  const startValRef = useRef<number>(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (!enabled) return false;
        // Only claim gesture if vertical drag is dominant
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: (evt, _) => {
        const touchX = evt.nativeEvent.locationX;
        const isLeft = touchX < windowWidth / 2;
        isLeftSideRef.current = isLeft;

        if (isLeft) {
          startValRef.current = currentBrightnessRef.current;
        } else {
          startValRef.current = currentVolumeRef.current;
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (!enabled) return;
        // Height factor: dragging full height changes value by 100%
        const delta = -gestureState.dy / (windowHeight * 0.75);

        if (isLeftSideRef.current) {
          // Brightness adjustment (Left half)
          const newB = Math.max(0.05, Math.min(1.0, startValRef.current + delta));
          currentBrightnessRef.current = newB;
          Brightness.setBrightnessAsync(newB).catch(() => {});
          showHud('brightness', Math.round(newB * 100));
        } else {
          // Volume adjustment (Right half)
          const newV = Math.max(0.0, Math.min(1.0, startValRef.current + delta));
          currentVolumeRef.current = newV;
          if (onVolumeChange) {
            onVolumeChange(newV);
          }
          showHud('volume', Math.round(newV * 100));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Check for double tap if very little movement
        if (Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8) {
          const now = Date.now();
          const touchX = evt.nativeEvent.locationX;
          const timeDiff = now - lastTapRef.current.time;
          const distDiff = Math.abs(touchX - lastTapRef.current.x);

          if (timeDiff < 300 && distDiff < 60) {
            // Double tap detected!
            if (touchX < windowWidth / 2) {
              // Left double tap: Rewind 10s
              if (onSeekRelative) onSeekRelative(-10);
              showHud('seek', -10, '10s Rewind');
            } else {
              // Right double tap: Forward 10s
              if (onSeekRelative) onSeekRelative(10);
              showHud('seek', 10, '10s Forward');
            }
            lastTapRef.current = { time: 0, x: 0 };
            return;
          }
          lastTapRef.current = { time: now, x: touchX };
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}

      {/* Floating Glassmorphic HUD Indicator */}
      {hudType && (
        <Animated.View style={[styles.hudWrapper, { opacity: hudOpacity }]}>
          <View style={styles.hudCard}>
            {hudType === 'brightness' && (
              <>
                <Ionicons
                  name={hudValue > 50 ? 'sunny' : 'sunny-outline'}
                  size={26}
                  color="#FFD60A"
                />
                <View style={styles.meterContainer}>
                  <View style={[styles.meterFill, { width: `${hudValue}%`, backgroundColor: '#FFD60A' }]} />
                </View>
                <Text style={styles.hudText}>{hudValue}%</Text>
              </>
            )}

            {hudType === 'volume' && (
              <>
                <Ionicons
                  name={
                    hudValue === 0
                      ? 'volume-mute'
                      : hudValue > 50
                      ? 'volume-high'
                      : 'volume-medium'
                  }
                  size={26}
                  color="#0A84FF"
                />
                <View style={styles.meterContainer}>
                  <View style={[styles.meterFill, { width: `${hudValue}%`, backgroundColor: '#0A84FF' }]} />
                </View>
                <Text style={styles.hudText}>{hudValue}%</Text>
              </>
            )}

            {hudType === 'seek' && (
              <>
                <Ionicons
                  name={hudValue < 0 ? 'play-back' : 'play-forward'}
                  size={24}
                  color="#FF375F"
                />
                <Text style={styles.seekText}>{seekLabel}</Text>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  hudWrapper: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  hudCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  meterContainer: {
    width: 110,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  hudText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 38,
    textAlign: 'right',
  },
  seekText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
