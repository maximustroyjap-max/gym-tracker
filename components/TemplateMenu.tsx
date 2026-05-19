/**
 * TEMPLATE MENU
 * Small popup dropdown for the 3-dot menu on the Workout screen.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';

interface TemplateMenuProps {
  position: { top: number; right: number };
  onClose: () => void;
  onShowArchive: () => void;
}

export function TemplateMenu({ position, onClose, onShowArchive }: TemplateMenuProps) {
  const Colors = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
      {/* Backdrop tap-to-dismiss */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Menu card */}
      <View
        style={[
          styles.menuCard,
          {
            top: position.top,
            right: position.right,
            backgroundColor: Colors.card,
            borderColor: Colors.border,
            shadowColor: Colors.shadow,
          },
        ]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={onShowArchive}
          activeOpacity={activeOpacity.row}>
          <Text style={[styles.menuItemText, { color: Colors.text }]}>Show Archive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    position: 'absolute',
    minWidth: 160,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  menuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: typography.base,
    fontWeight: '500',
  },
});
