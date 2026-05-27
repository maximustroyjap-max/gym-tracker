import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as ExpoSplashScreen from 'expo-splash-screen';

// ─── Colors (hardcoded — useTheme() not available during splash) ───
const SPLASH_BG      = '#0F0F0F';
const SPLASH_PRIMARY = '#00FF88';
const SPLASH_TRAIL   = '#00FF8870';
const SPLASH_GLOW    = '#00FF8840';
const SPLASH_TEXT    = '#FFFFFF';
const SPLASH_TAGLINE = '#00FF8870';

// ─── SVG ───
const LOGO_PATH   = 'M256 32 L80 440 L200 440 L256 280 L312 440 L432 440 L256 32Z M256 180 L288 260 L224 260 Z';
const PATH_LENGTH  = 950;  // approximate total stroke length of the path
const SPARK_LENGTH = 60;   // length of the bright traveling spark

// Wrap Path so Animated.Value can be passed as strokeDashoffset
const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── Letters ───
const LETTERS = ['A', 'S', 'C', 'E', 'N', 'T'] as const;

interface Props {
  onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ onAnimationComplete }: Props) {
  // Remove the native OS splash image immediately — our animation takes over
  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  // ── SVG prop animations (useNativeDriver: false) ──
  const trailOffset = useRef(new Animated.Value(PATH_LENGTH)).current;
  const sparkOffset = useRef(new Animated.Value(SPARK_LENGTH)).current;

  // ── Native-driver animations ──
  const fillOpacity  = useRef(new Animated.Value(0)).current;
  const fillScale    = useRef(new Animated.Value(1.08)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;
  const glowScale    = useRef(new Animated.Value(0.6)).current;
  const letterAnims  = useRef(
    LETTERS.map(() => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(10),
    }))
  ).current;
  const taglineOpacity    = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(8)).current;
  const containerOpacity  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const TRACE_DELAY    = 500;   // dark hold before spark starts
    const TRACE_DURATION = 2000;  // how long the spark takes to trace the full path
    const IGNITE_AT      = TRACE_DELAY + TRACE_DURATION; // 2500ms

    // ── Group A: SVG prop animations ──
    // MUST be a separate parallel from Group B — different useNativeDriver value.
    Animated.parallel([
      // Trail draws from full-offset (invisible) → 0 (fully drawn), stays permanently
      Animated.timing(trailOffset, {
        toValue: 0,
        duration: TRACE_DURATION,
        delay: TRACE_DELAY,
        useNativeDriver: false,
      }),
      // Spark: short 60px dash travels from start (offset=60) to end (offset=-950)
      Animated.timing(sparkOffset, {
        toValue: -PATH_LENGTH,
        duration: TRACE_DURATION,
        delay: TRACE_DELAY,
        useNativeDriver: false,
      }),
    ]).start();

    // ── Group B: All native-driver animations (sequenced after ignite) ──
    Animated.sequence([
      Animated.delay(IGNITE_AT),

      // Logo snap-in + glow ring burst (run together)
      Animated.parallel([
        Animated.timing(fillOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(fillScale,   { toValue: 1.0, duration: 300, useNativeDriver: true }),
        // Glow ring: expand + fade out
        Animated.sequence([
          Animated.parallel([
            Animated.timing(glowOpacity, { toValue: 0.9, duration: 200, useNativeDriver: true }),
            Animated.timing(glowScale,   { toValue: 1.5, duration: 700, useNativeDriver: true }),
          ]),
          Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]),

      Animated.delay(100),

      // Staggered letters — each slides up and fades in, 50ms apart
      Animated.stagger(
        50,
        letterAnims.map(({ opacity, translateY }) =>
          Animated.parallel([
            Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, friction: 8, tension: 120, useNativeDriver: true }),
          ])
        )
      ),

      Animated.delay(50),

      // Tagline fades up
      Animated.parallel([
        Animated.timing(taglineOpacity,    { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),

      // Hold so the complete logo+text can register
      Animated.delay(500),

      // Fade entire screen to transparent → fire callback
      Animated.timing(containerOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onAnimationComplete());
  }, [onAnimationComplete]);

  return (
    <Animated.View
      style={[styles.container, { opacity: containerOpacity }]}
      pointerEvents="none"
    >
      <View style={styles.centered}>

        {/* ── Logo ── */}
        <View style={styles.logoWrap}>

          {/* Glow ring expands outward on ignite */}
          <Animated.View
            style={[
              styles.glowRing,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          />

          {/* SVG trace: trail (permanent) + spark (traveling) */}
          <Svg
            width={90}
            height={90}
            viewBox="0 0 512 512"
            style={StyleSheet.absoluteFill}
          >
            {/* Trail — dimmer, draws permanently as spark moves */}
            <AnimatedPath
              d={LOGO_PATH}
              fill="none"
              stroke={SPLASH_TRAIL}
              strokeWidth={20}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={`${PATH_LENGTH}`}
              strokeDashoffset={trailOffset as any}
            />
            {/* Spark — bright 60px head that travels ahead of trail */}
            <AnimatedPath
              d={LOGO_PATH}
              fill="none"
              stroke={SPLASH_PRIMARY}
              strokeWidth={22}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={`${SPARK_LENGTH} 10000`}
              strokeDashoffset={sparkOffset as any}
            />
          </Svg>

          {/* Filled logo — hidden until ignite, then snaps in */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity: fillOpacity, transform: [{ scale: fillScale }] },
            ]}
          >
            <Svg width={90} height={90} viewBox="0 0 512 512">
              <Path d={LOGO_PATH} fill={SPLASH_PRIMARY} />
            </Svg>
          </Animated.View>

        </View>

        {/* ── ASCENT — one Animated.Text per letter ── */}
        <View style={styles.titleRow}>
          {LETTERS.map((letter, i) => (
            <Animated.Text
              key={`${letter}-${i}`}
              style={[
                styles.titleLetter,
                {
                  opacity:   letterAnims[i].opacity,
                  transform: [{ translateY: letterAnims[i].translateY }],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        {/* ── Tagline ── */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity:   taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          LEVEL UP YOUR FITNESS
        </Animated.Text>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    zIndex: 999,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  // Sits behind the SVG, expands outward on ignite
  glowRing: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,  // makes it 122×122, borderRadius=61 → circle
    borderRadius: 61,
    borderWidth: 1,
    borderColor: SPLASH_GLOW,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 2,
  },
  titleLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: SPLASH_TEXT,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 3,
    color: SPLASH_TAGLINE,
    marginTop: 12,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
});
