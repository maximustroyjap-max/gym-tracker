/**
 * AMBIENT BACKGROUND — Global Theme-Adaptive Dynamic Background
 *
 * Ultra-soft diffused light orbs that drift slowly along the screen edges.
 * Uses SVG radial gradients for perfectly smooth edges (no hard circles).
 * Colors auto-adapt to the active theme.
 *
 * Motion: each blob follows an organic Lissajous-style path by animating
 * X and Y on independent cycles, so the movement never feels repetitive.
 */

import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface BlobDef {
  colorKey: 'primary' | 'secondary' | 'primaryDark';
  size: number;
  /** Base position (where the blob is anchored) */
  baseX: number;
  baseY: number;
  /** Horizontal travel range in px */
  tx: [number, number];
  /** Vertical travel range in px */
  ty: [number, number];
  /** Rotation range in degrees */
  rot: [number, number];
  /** Scale range */
  scale: [number, number];
  /** Opacity range */
  opacity: [number, number];
  /** X animation duration (ms) */
  dx: number;
  /** Y animation duration (ms) */
  dy: number;
  /** Rotation duration (ms) */
  dr: number;
  /** Stagger delay before animation starts (ms) */
  delay: number;
}

const BLOBS: BlobDef[] = [
  {
    colorKey: 'primary',
    size: Math.max(SCREEN_W, SCREEN_H) * 0.65,
    baseX: SCREEN_W * 0.85,
    baseY: -Math.max(SCREEN_W, SCREEN_H) * 0.2,
    tx: [-SCREEN_W * 0.7, SCREEN_W * 0.15],
    ty: [0, SCREEN_H * 0.55],
    rot: [-18, 14],
    scale: [0.9, 1.35],
    opacity: [0.2, 0.65],
    dx: 15000,
    dy: 11000,
    dr: 22000,
    delay: 0,
  },
  {
    colorKey: 'secondary',
    size: Math.max(SCREEN_W, SCREEN_H) * 0.6,
    baseX: -Math.max(SCREEN_W, SCREEN_H) * 0.25,
    baseY: SCREEN_H * 0.6,
    tx: [0, SCREEN_W * 0.7],
    ty: [-SCREEN_H * 0.45, SCREEN_H * 0.25],
    rot: [12, -20],
    scale: [0.85, 1.3],
    opacity: [0.15, 0.55],
    dx: 18000,
    dy: 14000,
    dr: 26000,
    delay: 2500,
  },
  {
    colorKey: 'primaryDark',
    size: Math.max(SCREEN_W, SCREEN_H) * 0.55,
    baseX: SCREEN_W * 0.65,
    baseY: SCREEN_H * 0.9,
    tx: [-SCREEN_W * 0.6, SCREEN_W * 0.2],
    ty: [-SCREEN_H * 0.5, 0],
    rot: [-10, 16],
    scale: [0.8, 1.25],
    opacity: [0.18, 0.6],
    dx: 13000,
    dy: 17000,
    dr: 20000,
    delay: 5000,
  },
  {
    colorKey: 'primary',
    size: Math.max(SCREEN_W, SCREEN_H) * 0.5,
    baseX: SCREEN_W * 0.05,
    baseY: SCREEN_H * 0.15,
    tx: [SCREEN_W * 0.15, -SCREEN_W * 0.2],
    ty: [SCREEN_H * 0.2, -SCREEN_H * 0.15],
    rot: [8, -12],
    scale: [0.75, 1.15],
    opacity: [0.12, 0.45],
    dx: 16000,
    dy: 12000,
    dr: 24000,
    delay: 7500,
  },
];

function SoftBlob({
  def,
  color,
}: {
  def: BlobDef;
  color: string;
}) {
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      px.value = withRepeat(
        withTiming(1, { duration: def.dx, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      py.value = withRepeat(
        withTiming(1, { duration: def.dy, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      rot.value = withRepeat(
        withTiming(1, { duration: def.dr, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }, def.delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: def.baseX + interpolate(px.value, [0, 1], def.tx),
      },
      {
        translateY: def.baseY + interpolate(py.value, [0, 1], def.ty),
      },
      {
        scale: interpolate(px.value, [0, 1], def.scale),
      },
      {
        rotate: `${interpolate(rot.value, [0, 1], def.rot)}deg`,
      },
    ],
    opacity: interpolate(
      py.value,
      [0, 0.5, 1],
      [def.opacity[0], def.opacity[1], def.opacity[0]]
    ),
  }));

  const gradientId = `grad-${def.colorKey}-${def.size}`;
  const half = def.size / 2;

  return (
    <Animated.View
      style={[
        styles.blobWrap,
        { width: def.size, height: def.size },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Svg width={def.size} height={def.size} viewBox={`0 0 ${def.size} ${def.size}`}>
        <Defs>
          <RadialGradient
            id={gradientId}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <Stop offset="30%" stopColor={color} stopOpacity={0.28} />
            <Stop offset="65%" stopColor={color} stopOpacity={0.07} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={half} cy={half} r={half} fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

export function AmbientBackground() {
  const Colors = useTheme();

  return (
    <View
      style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.background }]}
      pointerEvents="none"
    >
      {BLOBS.map((def, index) => (
        <SoftBlob
          key={index}
          def={def}
          color={Colors[def.colorKey]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blobWrap: {
    position: 'absolute',
  },
});
