import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface NeonCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  borderRadius?: number;
  /** Pass a color (e.g. rankColor) to get a glowing hero-style border. */
  glowColor?: string;
}

export function NeonCard({
  children,
  style,
  contentStyle,
  onPress,
  activeOpacity = 0.7,
  borderRadius = 16,
  glowColor,
}: NeonCardProps) {
  const Colors = useTheme();

  const borderColor = glowColor
    ? `${glowColor}40`
    : Colors.border;

  const shadowStyle = glowColor
    ? Platform.select({
        ios: {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        android: { elevation: 6 },
        default: {},
      })
    : Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
        default: {},
      });

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      backgroundColor: Colors.card,
      borderColor,
      borderRadius,
    },
    shadowStyle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
  },
});
