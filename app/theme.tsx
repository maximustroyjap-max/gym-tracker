/**
 * THEME SELECTION SCREEN — Premium Redesign
 * Lets the user pick from 5 themes with rich preview cards.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { ThemeName } from '@/types/user';
import { themes, ThemeColors } from '@/constants/theme';

import { spacing, radius, typography, activeOpacity } from '@/constants/design';

interface ThemeOption {
  name: ThemeName;
  label: string;
  subtitle: string;
  colors: ThemeColors;
}

const THEME_OPTIONS: ThemeOption[] = [
  { name: 'dark', label: 'Dark', subtitle: 'Charcoal with neon green accents', colors: themes.dark },
  { name: 'light', label: 'Light', subtitle: 'Clean light with forest green accents', colors: themes.light },
  { name: 'sunset', label: 'Sunset', subtitle: 'Deep navy with coral and crimson', colors: themes.sunset },
];

export default function ThemeScreen() {
  const { user, updateUser } = useUser();
  const Colors = useTheme();

  const [selected, setSelected] = useState<ThemeName>(user.theme);

  const hasChanges = selected !== user.theme;

  const saveTheme = useCallback(() => {
    updateUser({ theme: selected });
    router.back();
  }, [selected, updateUser]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'App Theme', headerShown: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={activeOpacity.row}>
            <MaterialIcons name="chevron-left" size={28} color={Colors.primary} />
            <Text style={[styles.backText, { color: Colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <Text style={[styles.pageTitle, { color: Colors.text }]}>App Theme</Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
          Choose the look that fits your style
        </Text>

        {/* Theme Options */}
        <View style={styles.optionsList}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = selected === option.name;
            const tc = option.colors;
            return (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: tc.card,
                    borderColor: isSelected ? Colors.primary : tc.border,
                    borderWidth: isSelected ? 2 : 1,
                    shadowColor: Colors.shadow,
                  },
                ]}
                onPress={() => setSelected(option.name)}
                activeOpacity={activeOpacity.card}>
                {/* Color Palette Strip */}
                <View style={styles.previewRow}>
                  <View style={[styles.colorSwatch, { backgroundColor: tc.background }]}>
                    <Text style={[styles.swatchLabel, { color: tc.textSecondary }]}>BG</Text>
                  </View>
                  <View style={[styles.colorSwatch, { backgroundColor: tc.card }]}>
                    <Text style={[styles.swatchLabel, { color: tc.textSecondary }]}>Card</Text>
                  </View>
                  <View style={[styles.colorSwatchAccent, { backgroundColor: tc.primary }]}>
                    <Text style={[styles.swatchLabelAccent, { color: tc.background }]}>P</Text>
                  </View>
                  <View style={[styles.colorSwatchAccent, { backgroundColor: tc.secondary }]}>
                    <Text style={[styles.swatchLabelAccent, { color: tc.background }]}>S</Text>
                  </View>
                </View>

                {/* Label + Selection */}
                <View style={styles.labelRow}>
                  <View>
                    <Text style={[styles.themeLabel, { color: tc.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.themeSubtitle, { color: tc.textSecondary }]}>
                      {option.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected ? Colors.primary : tc.border,
                        backgroundColor: isSelected ? Colors.primary : 'transparent',
                      },
                    ]}>
                    {isSelected && (
                      <MaterialIcons name="check" size={16} color={Colors.background} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer for save button */}
        {hasChanges && <View style={{ height: 80 }} />}
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.saveButtonContainer, { backgroundColor: Colors.background + 'EE' }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors.primary }]
}
            onPress={saveTheme}
            activeOpacity={activeOpacity.button}>
            <Text style={[styles.saveButtonText, { color: Colors.background }]}>
              Save Theme
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginLeft: -spacing.xs,
    minHeight: 44,
  },
  backText: {
    fontSize: typography.lg,
    fontWeight: '500',
    marginLeft: -spacing.xs,
  },
  pageTitle: {
    fontSize: typography['3xl'],
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.base,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: spacing.md,
  },
  themeCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorSwatch: {
    width: 56,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  colorSwatchAccent: {
    width: 56,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
  },
  swatchLabelAccent: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  themeSubtitle: {
    fontSize: typography.sm,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
});
