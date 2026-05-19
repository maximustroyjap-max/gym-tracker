/**
 * RANK ICON — Premium Edition
 *
 * Displays a custom rank icon image for any of the 16 sub-tiers.
 * Supports premium Huashu-style effects: colored glow shadow,
 * gloss overlay, and spring entrance animation.
 *
 * Place your custom PNG icons here (they will replace the placeholders):
 *   assets/images/ranks/bronze1.png  … bronze3.png
 *   assets/images/ranks/silver1.png  … silver3.png
 *   assets/images/ranks/gold1.png    … gold3.png
 *   assets/images/ranks/platinum1.png… platinum3.png
 *   assets/images/ranks/diamond1.png … diamond3.png
 *   assets/images/ranks/immortal.png
 */

import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { type SubTier, getTierColor } from '@/constants/ranks';

const RANK_SOURCES: Record<SubTier, any> = {
  'Bronze 1': require('@/assets/images/ranks/bronze1.png'),
  'Bronze 2': require('@/assets/images/ranks/bronze2.png'),
  'Bronze 3': require('@/assets/images/ranks/bronze3.png'),
  'Silver 1': require('@/assets/images/ranks/silver1.png'),
  'Silver 2': require('@/assets/images/ranks/silver2.png'),
  'Silver 3': require('@/assets/images/ranks/silver3.png'),
  'Gold 1': require('@/assets/images/ranks/gold1.png'),
  'Gold 2': require('@/assets/images/ranks/gold2.png'),
  'Gold 3': require('@/assets/images/ranks/gold3.png'),
  'Platinum 1': require('@/assets/images/ranks/platinum1.png'),
  'Platinum 2': require('@/assets/images/ranks/platinum2.png'),
  'Platinum 3': require('@/assets/images/ranks/platinum3.png'),
  'Diamond 1': require('@/assets/images/ranks/diamond1.png'),
  'Diamond 2': require('@/assets/images/ranks/diamond2.png'),
  'Diamond 3': require('@/assets/images/ranks/diamond3.png'),
  'Immortal': require('@/assets/images/ranks/immortal.png'),
};

/** Map a main-tier name to its default sub-tier for icon lookup */
const MAIN_TIER_DEFAULTS: Record<string, SubTier> = {
  Bronze: 'Bronze 1',
  Silver: 'Silver 1',
  Gold: 'Gold 1',
  Platinum: 'Platinum 1',
  Diamond: 'Diamond 1',
  Immortal: 'Immortal',
};

function normalizeRankToSubTier(rank: string): SubTier {
  if (RANK_SOURCES[rank as SubTier]) {
    return rank as SubTier;
  }
  return MAIN_TIER_DEFAULTS[rank] ?? 'Bronze 1';
}

export interface RankIconProps {
  /** Any rank string — sub-tier ("Gold 2"), main tier ("Gold"), or legacy rank */
  rank: string;
  /** Size in logical pixels (default 24) */
  size?: number;
  /** Optional extra styles for the image */
  style?: any;
  /** Colored glow shadow behind the icon */
  glow?: boolean;
  /** Custom glow color (defaults to rank color) */
  glowColor?: string;
  /** Glow intensity: subtle = 0.12, medium = 0.22, strong = 0.35 */
  glowIntensity?: 'subtle' | 'medium' | 'strong';
  /** Semi-transparent white gloss overlay on top half */
  gloss?: boolean;
  /** Spring scale-in animation on mount */
  animated?: boolean;
}

const GLOW_OPACITY = {
  subtle: 0.12,
  medium: 0.22,
  strong: 0.35,
};

const GLOW_RADIUS = {
  subtle: 6,
  medium: 10,
  strong: 16,
};

export function RankIcon({
  rank,
  size = 24,
  style,
  glow = false,
  glowColor,
  glowIntensity = 'medium',
  gloss = false,
  animated = false,
}: RankIconProps) {
  const Colors = useTheme();
  const subTier = normalizeRankToSubTier(rank);
  const source = RANK_SOURCES[subTier];
  const resolvedGlowColor = glowColor ?? getTierColor(subTier);

  const scaleAnim = useRef(new Animated.Value(animated ? 0.5 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [animated, scaleAnim]);

  const shadowStyle = glow
    ? {
        shadowColor: resolvedGlowColor,
        shadowOffset: { width: 0, height: 0 } as const,
        shadowOpacity: GLOW_OPACITY[glowIntensity],
        shadowRadius: GLOW_RADIUS[glowIntensity],
        elevation: glowIntensity === 'strong' ? 8 : glowIntensity === 'medium' ? 6 : 4,
      }
    : {};

  const image = (
    <Image
      source={source}
      style={[{ width: size, height: size }, styles.icon, style]}
      resizeMode="contain"
    />
  );

  const content = gloss ? (
    <View style={[{ width: size, height: size }, styles.iconWrapper]}>
      {image}
      {/* Huashu gloss layer — theme-aware on top half */}
      <View
        style={[
          styles.gloss,
          {
            width: size,
            height: size / 2,
            borderTopLeftRadius: size * 0.2,
            borderTopRightRadius: size * 0.2,
            backgroundColor: Colors.gloss,
          },
        ]}
      />
    </View>
  ) : (
    image
  );

  if (animated) {
    return (
      <Animated.View
        style={[
          { width: size, height: size },
          glow && shadowStyle,
          { transform: [{ scale: scaleAnim }] },
        ]}>
        {content}
      </Animated.View>
    );
  }

  if (glow) {
    return (
      <View style={[{ width: size, height: size }, shadowStyle]}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  icon: {
    // crisp rendering on all DPIs
  },
  iconWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});
