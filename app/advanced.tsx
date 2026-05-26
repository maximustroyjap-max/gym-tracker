/**
 * ADVANCED SETTINGS SCREEN — Premium Redesign
 * Controls advanced app preferences like sound effects and screen sleep.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppText } from '@/components/ui/AppText';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

export default function AdvancedScreen() {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const settings = user.advancedSettings;

  const toggleSoundEffects = (value: boolean) => {
    updateUser({
      advancedSettings: {
        ...settings,
        soundEffects: value,
      },
    });
  };

  const toggleDisableSleep = (value: boolean) => {
    updateUser({
      advancedSettings: {
        ...settings,
        disableSleep: value,
      },
    });
  };

  const options = [
    {
      icon: 'volume-up' as const,
      label: 'Sound Effects',
      description: 'Play timer alert sounds when a set is finished',
      value: settings.soundEffects,
      onChange: toggleSoundEffects,
    },
    {
      icon: 'brightness-high' as const,
      label: 'Disable Sleep',
      description: 'Keep the screen awake during workouts',
      value: settings.disableSleep,
      onChange: toggleDisableSleep,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Advanced', headerShown: false }} />

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
            <IconSymbol name="chevron.left" size={28} color={Colors.primary} />
            <AppText weight="medium" style={[styles.backText, { color: Colors.primary }]}>Back</AppText>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>Advanced</AppText>

        {/* Toggle Options */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          {options.map((option, index) => (
            <View key={option.label}>
              <View style={styles.toggleRow}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '18' }]}>
                  <MaterialIcons name={option.icon} size={22} color={Colors.primary} />
                </View>
                <View style={styles.toggleInfo}>
                  <AppText weight="semibold" style={[styles.toggleLabel, { color: Colors.text }]}>{option.label}</AppText>
                  <AppText style={[styles.toggleDesc, { color: Colors.textSecondary }]}>
                    {option.description}
                  </AppText>
                </View>
                <Switch
                  value={option.value}
                  onValueChange={option.onChange}
                  trackColor={{ false: Colors.border, true: Colors.primary + '66' }}
                  thumbColor={option.value ? Colors.primary : Colors.textSecondary}
                  ios_backgroundColor={Colors.border}
                />
              </View>
              {index < options.length - 1 && (
                <View style={[styles.divider, { backgroundColor: Colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: spacing['4xl'],
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
    marginLeft: -spacing.xs,
  },
  pageTitle: {
    fontSize: typography['3xl'],
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleRow: {
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
  toggleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: typography.lg,
  },
  toggleDesc: {
    fontSize: typography.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
});
