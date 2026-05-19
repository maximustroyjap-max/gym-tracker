/**
 * CONFIRMATION POPUP
 * Premium centered modal for destructive confirmations.
 * Backdrop fade + card spring scale animation.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ConfirmationPopupProps {
  /** Whether the popup is visible */
  visible: boolean;
  /** Icon name (SF Symbol) displayed in the warning circle */
  icon?: string;
  /** Popup title */
  title: string;
  /** Descriptive message */
  message: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Called when cancel is tapped or backdrop is pressed */
  onCancel: () => void;
  /** Called when confirm is tapped */
  onConfirm: () => void;
}

export function ConfirmationPopup({
  visible,
  icon = 'exclamationmark.triangle.fill',
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
}: ConfirmationPopupProps) {
  const Colors = useTheme();
  const insets = useSafeAreaInsets();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const isExiting = useRef(false);

  const animateIn = useCallback(() => {
    isExiting.current = false;
    backdropOpacity.setValue(0);
    cardScale.setValue(0.92);
    cardOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, cardScale, cardOpacity]);

  const animateOut = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.94,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onCancel();
      isExiting.current = false;
    });
  }, [backdropOpacity, cardScale, cardOpacity, onCancel]);

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible, animateIn]);

  const handleConfirm = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onConfirm();
      isExiting.current = false;
    });
  }, [backdropOpacity, cardOpacity, onConfirm]);

  if (!visible) return null;

  const cardAnimatedStyle = {
    opacity: cardOpacity,
    transform: [{ scale: cardScale }],
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 200 }]} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={animateOut}
        activeOpacity={1}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.65)' },
          ]}
        />
      </TouchableOpacity>

      {/* Centered Card */}
      <View style={[styles.centerWrapper, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
            cardAnimatedStyle,
          ]}>
          {/* Warning Icon */}
          <View
            style={[
              styles.iconRing,
              { backgroundColor: Colors.danger + '12', borderColor: Colors.danger + '25' },
            ]}>
            <IconSymbol name={icon as any} size={32} color={Colors.danger} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: Colors.text }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: Colors.textSecondary }]}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: Colors.border },
              ]}
              onPress={animateOut}
              activeOpacity={activeOpacity.button}>
              <Text style={[styles.cancelButtonText, { color: Colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: Colors.danger },
              ]}
              onPress={handleConfirm}
              activeOpacity={activeOpacity.button}>
              <Text style={[styles.confirmButtonText, { color: Colors.background }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - spacing.lg * 2, 340),
    borderRadius: radius['2xl'],
    borderWidth: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  confirmButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: typography.base,
    fontWeight: '700',
  },
});
