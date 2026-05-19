/**
 * TOGGLE ROW
 * Reusable settings row with a label and a native toggle switch.
 */

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch } from '@/constants/design';

interface ToggleRowProps {
  /** MaterialIcons icon name */
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Row label */
  label: string;
  /** Current toggle state */
  value: boolean;
  /** Called when toggle changes */
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ icon, label, value, onValueChange }: ToggleRowProps) {
  const Colors = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.iconContainer, { backgroundColor: Colors.border + '80' }]}>
        <MaterialIcons name={icon} size={22} color={Colors.primary} />
      </View>
      <Text style={[styles.label, { color: Colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary + '66' }}
        thumbColor={value ? Colors.primary : Colors.textSecondary}
        ios_backgroundColor={Colors.border}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
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
});
