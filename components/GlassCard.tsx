/**
 * GLASS CARD — Frosted glassmorphism container
 *
 * Uses expo-blur BlurView for real backdrop blur on iOS/Android,
 * layered with a semi-transparent color tint and a light-reflection border.
 *
 * Pro Tips Applied:
 * - Light border on top/left simulates glass edge reflection
 * - Semi-transparent overlay ensures readability on any background
 * - Blur intensity scales with the "depth" of the card
 *
 * Usage:
 *   <GlassCard intensity={60}>
 *     <Text>Content</Text>
 *   </GlassCard>
 *
 *   <GlassCard intensity={80} borderColor={rankColor}>
 *     <Text>Highlighted content</Text>
 *   </GlassCard>
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { radius, spacing } from '@/constants/design';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number; // 0-100, default 50
  borderColor?: string; // optional accent border
  borderWidth?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  overflow?: 'hidden' | 'visible';
}

export function GlassCard({
  children,
  intensity = 50,
  borderColor,
  borderWidth = 1,
  borderRadius = radius.lg,
  style,
  contentStyle,
  onPress,
  activeOpacity = 0.7,
  overflow = 'hidden',
}: GlassCardProps) {
  const Colors = useTheme();
  const { user } = useUser();
  const isLight = user.theme === 'light';

  // BlurView tint based on theme
  const blurTint = isLight ? 'light' : 'dark';

  // Semi-transparent overlay color — ensures text readability
  // Dark themes: very subtle white tint
  // Light theme: stronger white tint for frosted glass look
  const overlayColor = isLight
    ? 'rgba(255,255,255,0.55)'
    : 'rgba(255,255,255,0.04)';

  // Glass edge reflection — lighter on top/left
  const highlightColor = isLight
    ? 'rgba(255,255,255,0.8)'
    : 'rgba(255,255,255,0.12)';

  // Shadow color from theme
  const shadowColor = Colors.shadow;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      borderRadius,
      borderWidth,
      borderColor: borderColor ?? Colors.border,
      borderTopColor: highlightColor,
      borderLeftColor: highlightColor,
      shadowColor,
      overflow,
    },
    style,
  ];

  const innerContent = (
    <>
      {/* Blur layer */}
      <BlurView
        intensity={intensity}
        tint={blurTint}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      {/* Color tint overlay — ensures text stays readable */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: overlayColor,
            borderRadius,
          },
        ]}
      />
      {/* Content */}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}>
        {innerContent}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{innerContent}</View>;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
