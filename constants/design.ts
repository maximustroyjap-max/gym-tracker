/**
 * DESIGN TOKENS
 * Centralized design system for consistent spacing, radius, typography,
 * shadows, and animation values across the entire app.
 *
 * Use these tokens instead of hardcoded values to maintain visual consistency.
 */

import { Platform, StyleSheet } from 'react-native';

// ─── Spacing Scale ───
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

// ─── Border Radius Scale ───
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Typography Scale ───
export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

// ─── Touch Targets ───
export const touch = {
  minHeight: 44,
  minWidth: 44,
  iconContainer: 36,
} as const;

// ─── Animation Values ───
export const animation = {
  pressScale: 0.97,
  springFriction: 8,
  springTension: 40,
  microDuration: 150,
  standardDuration: 250,
  complexDuration: 400,
} as const;

// ─── Active Opacity Standard ───
export const activeOpacity = {
  card: 0.7,
  button: 0.8,
  row: 0.6,
} as const;

// ─── Shadow Presets ───
// Returns shadow styles based on theme shadow color
export function getShadows(shadowColor: string) {
  return {
    /** Subtle shadow for cards — default elevation */
    card: Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
    /** Elevated shadow for modals, popups, featured cards */
    elevated: Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
    }),
    /** Shadow for bottom bars, tab bars */
    bottomBar: Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {
        shadowColor,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
    }),
    /** Strong shadow for modals and overlays */
    modal: Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      default: {
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
    }),
  } as const;
}

// Convenience: combine shadow with StyleSheet.flatten
export function shadowStyle(shadowColor: string, level: keyof ReturnType<typeof getShadows>) {
  return StyleSheet.flatten(getShadows(shadowColor)[level]);
}
