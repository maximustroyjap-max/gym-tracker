/**
 * SETTINGS ROW
 * Reusable tappable row for the Settings screen.
 * Shows an icon, label, optional value text, and a chevron.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

interface SettingsRowProps {
  /** MaterialIcons icon name */
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Row label */
  label: string;
  /** Optional right-side value text (e.g. "v1.0.0", "5 min") */
  value?: string;
  /** If true, renders label in danger/red color */
  danger?: boolean;
  /** If true, hides the right chevron (useful for static rows like version) */
  hideChevron?: boolean;
  /** Tap handler */
  onPress?: () => void;
}

export function SettingsRow({
  icon,
  label,
  value,
  danger,
  hideChevron,
  onPress,
}: SettingsRowProps) {
  const Colors = useTheme();

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={activeOpacity.row}
      disabled={!onPress && !hideChevron}>
      {/* Left Icon */}
      <View style={[styles.iconContainer, { backgroundColor: Colors.border + '80' }]}>
        <MaterialIcons
          name={icon}
          size={22}
          color={danger ? Colors.danger : Colors.primary}
        />
      </View>

      {/* Label */}
      <Text style={[styles.label, { color: danger ? Colors.danger : Colors.text }]}>
        {label}
      </Text>

      {/* Right side: value + chevron */}
      <View style={styles.right}>
        {value && <Text style={[styles.valueText, { color: Colors.textSecondary }]}>{value}</Text>}
        {!hideChevron && (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={Colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: touch.minHeight,
  },
  iconContainer: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: typography.lg,
    fontWeight: '400',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  valueText: {
    fontSize: typography.base,
  },
});
