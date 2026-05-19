/**
 * GYM THEME
 * Premium dark + light color system.
 * Dark = signature gym neon on charcoal.
 * Light = iOS-premium clean with deep forest accents.
 */

import { Platform } from 'react-native';
import { ThemeName } from '@/types/user';

export interface ThemeColors {
  background: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  gold: string;
  silver: string;
  bronze: string;
  primaryDark: string;
  danger: string;
  shadow: string;
  gloss: string;
  warning: string;
}

const darkTheme: ThemeColors = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  primary: '#00FF88',
  secondary: '#FF6B00',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  primaryDark: '#00CC6A',
  danger: '#FF4444',
  shadow: '#000000',
  gloss: 'rgba(255,255,255,0.15)',
  warning: '#FFB800',
};

const lightTheme: ThemeColors = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  border: '#C7C7CC',
  text: '#1C1C1E',
  textSecondary: '#6B6B73',
  primary: '#007A1A',
  secondary: '#C25E00',
  gold: '#B8860B',
  silver: '#8A8A8A',
  bronze: '#CD7F32',
  primaryDark: '#005A12',
  danger: '#D32F2F',
  shadow: 'rgba(0,0,0,0.18)',
  gloss: 'rgba(0,0,0,0.04)',
  warning: '#C25E00',
};

/** Sunset theme — deep navy, coral peach, and rich reds */
const sunsetTheme: ThemeColors = {
  background: '#1F1C2B',
  card: '#243F58',
  border: '#384358',
  text: '#FFFFFF',
  textSecondary: '#B8B4C7',
  primary: '#FFA586',
  secondary: '#B51A28',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  primaryDark: '#E08A6D',
  danger: '#FF6B6B',
  shadow: '#000000',
  gloss: 'rgba(255,255,255,0.12)',
  warning: '#FFB800',
};

export const themes: Record<ThemeName, ThemeColors> = {
  dark: darkTheme,
  light: lightTheme,
  sunset: sunsetTheme,
};

/** Get color palette for a given theme name. Falls back to dark. */
export function getThemeColors(name: ThemeName): ThemeColors {
  return themes[name] ?? darkTheme;
}

/**
 * Static Colors export — default dark theme.
 * Prefer using useTheme() from ThemeContext for dynamic theming.
 */
export const Colors = darkTheme;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
