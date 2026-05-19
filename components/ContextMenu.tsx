/**
 * CONTEXT MENU
 * Generic dropdown menu that anchors to a measured screen position.
 * Used for per-template and per-folder action menus.
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

export interface ContextMenuItem {
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  position: { top: number; left?: number; right?: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ visible, position, items, onClose }: ContextMenuProps) {
  const Colors = useTheme();

  if (!visible || items.length === 0) return null;

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
            backgroundColor: Colors.card,
            borderColor: Colors.border,
            shadowColor: Colors.shadow,
            ...(position.left !== undefined ? { left: position.left } : {}),
            ...(position.right !== undefined ? { right: position.right } : {}),
          },
        ]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              item.onPress();
              onClose();
            }}
            activeOpacity={activeOpacity.row}>
            <Text
              style={[
                styles.menuItemText,
                { color: item.danger ? Colors.danger : Colors.text },
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
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
