import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Animated, View, Text, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ExpoSplashScreen from 'expo-splash-screen';
import Svg, { Path } from 'react-native-svg';

const SPLASH_BG = '#0F0F0F';
const SPLASH_MAX_DURATION = 7000;
const FADE_OUT_DURATION = 500;

interface Props {
  onAnimationComplete: () => void;
}

/** Mountain/A logo SVG */
function BrandLogo({ size = 64, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path
        d="M256 32 L80 440 L200 440 L256 280 L312 440 L432 440 L256 32ZM256 180 L288 260 L224 260 L256 180Z"
        fill={color}
      />
    </Svg>
  );
}

/** Web splash — static branded screen with fade animation */
function WebSplashScreen({ onAnimationComplete }: Props) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss after delay
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION,
        useNativeDriver: true,
      }).start(() => onAnimationComplete());
    }, 2500);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: SPLASH_BG, opacity: containerOpacity, zIndex: 999 },
      ]}
      pointerEvents="none">
      <View style={styles.centered}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <View style={[styles.logoBg, { backgroundColor: '#00FF88' + '18' }]}>
            <BrandLogo size={64} color="#00FF88" />
          </View>
          <Text style={styles.appName}>ASCENT</Text>
          <Text style={styles.tagline}>Level Up Your Fitness</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/** Native splash — video playback */
function NativeSplashScreen({ onAnimationComplete }: Props) {
  const videoRef = useRef<Video>(null);
  const dismissed = useRef(false);
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;

    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: FADE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onAnimationComplete());
  }, [onAnimationComplete]);

  useEffect(() => {
    const timer = setTimeout(dismiss, SPLASH_MAX_DURATION);
    return () => clearTimeout(timer);
  }, [dismiss]);

  const handleReadyForDisplay = useCallback(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  const handlePlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (status?.didJustFinish) dismiss();
    },
    [dismiss]
  );

  const handleError = useCallback(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
    dismiss();
  }, [dismiss]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: SPLASH_BG, opacity: containerOpacity, zIndex: 999 },
      ]}
      pointerEvents="none">
      <Video
        ref={videoRef}
        source={require('../assets/videos/splash-screen.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onReadyForDisplay={handleReadyForDisplay}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={handleError}
      />
    </Animated.View>
  );
}

export function AnimatedSplashScreen(props: Props) {
  if (Platform.OS === 'web') {
    return <WebSplashScreen {...props} />;
  }
  return <NativeSplashScreen {...props} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});
