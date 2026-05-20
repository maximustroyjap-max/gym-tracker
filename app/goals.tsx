/**
 * GOALS SCREEN — Premium Redesign
 * Lets the user set and track their fitness goals.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { calculateWeeklyStreak } from '@/constants/ranks';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';

const WEEKLY_OPTIONS = [2, 3, 4, 5, 6, 7];

export default function GoalsScreen() {
  const Colors = useTheme();
  const { user, updateUser } = useUser();

  const [weeklyTarget, setWeeklyTarget] = useState(user.weeklyTarget);
  const [monthlyVolume, setMonthlyVolume] = useState(
    user.monthlyVolumeGoal > 0 ? user.monthlyVolumeGoal.toString() : ''
  );

  const currentVolume = parseInt(monthlyVolume || '0', 10);
  const hasChanges =
    weeklyTarget !== user.weeklyTarget || currentVolume !== user.monthlyVolumeGoal;

  const saveGoals = useCallback(() => {
    const validVolume = Math.max(0, Math.min(100000, currentVolume));
    // Recalculate streak when target changes — same history, new threshold
    const newStreak = calculateWeeklyStreak(user.weeklyHistory, weeklyTarget);
    updateUser({
      weeklyTarget,
      monthlyVolumeGoal: validVolume,
      currentStreak: newStreak,
    });
    router.back();
  }, [weeklyTarget, currentVolume, updateUser, user.weeklyHistory]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Goals', headerShown: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
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
        <Text style={[styles.pageTitle, { color: Colors.text }]}>Goals</Text>

        {/* Weekly Workout Target */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>
          Weekly Workout Target
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <Text style={[styles.cardDescription, { color: Colors.textSecondary }]}>
            How many workouts do you want to complete each week? Hitting this target maximizes your
            Consistency score (40% of Fitness Score).
          </Text>

          <View style={styles.chipRow}>
            {WEEKLY_OPTIONS.map((num) => {
              const isSelected = weeklyTarget === num;
              return (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? Colors.primary + '15' : Colors.background,
                      borderColor: isSelected ? Colors.primary : Colors.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => setWeeklyTarget(num)}
                  activeOpacity={activeOpacity.button}>
                  <Text
                    style={[
                      styles.chipNumber,
                      { color: isSelected ? Colors.primary : Colors.text },
                    ]}>
                    {num}
                  </Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: isSelected ? Colors.primary : Colors.textSecondary },
                    ]}>
                    {num === 1 ? 'day' : 'days'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.infoRow, { backgroundColor: Colors.background }]}>
            <MaterialIcons name="emoji-events" size={18} color={Colors.secondary} />
            <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
              Missing a week applies escalating penalties (-5 × consecutive missed weeks) that can
              drop your tier.
            </Text>
          </View>
        </View>

        {/* Monthly Volume Goal */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>
          Monthly Volume Goal
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <Text style={[styles.cardDescription, { color: Colors.textSecondary }]}>
            Set a target for total reps across all exercises in a month. This tracks your work
            capacity and helps you push for progressive overload.
          </Text>

          <View style={styles.volumeInputRow}>
            <TextInput
              style={[
                styles.volumeInput,
                { backgroundColor: Colors.background, color: Colors.text, borderColor: Colors.border },
              ]}
              value={monthlyVolume}
              onChangeText={(text) => setMonthlyVolume(text.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="1000"
              placeholderTextColor={Colors.textSecondary}
              maxLength={6}
            />
            <Text style={[styles.volumeUnit, { color: Colors.textSecondary }]}>reps / month</Text>
          </View>

          <View style={styles.presetRow}>
            {[500, 1000, 1500, 2000, 3000].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor:
                      currentVolume === preset ? Colors.secondary + '15' : Colors.background,
                    borderColor:
                      currentVolume === preset ? Colors.secondary : Colors.border,
                    borderWidth: currentVolume === preset ? 1.5 : 1,
                  },
                ]}
                onPress={() => setMonthlyVolume(preset.toString())}
                activeOpacity={activeOpacity.button}>
                <Text
                  style={[
                    styles.presetText,
                    {
                      color: currentVolume === preset ? Colors.secondary : Colors.textSecondary,
                      fontWeight: currentVolume === preset ? '700' : '600',
                    },
                  ]}>
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spacer for save button */}
        {hasChanges && <View style={{ height: 80 }} />}
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.saveButtonContainer, { backgroundColor: Colors.background + 'EE' }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors.primary }]}
            onPress={saveGoals}
            activeOpacity={activeOpacity.button}>
            <Text style={[styles.saveButtonText, { color: Colors.background }]}>Save Goals</Text>
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
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDescription: {
    fontSize: typography.base,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    minHeight: 80,
    justifyContent: 'center',
  },
  chipNumber: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
  },
  chipLabel: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sm,
    lineHeight: 18,
  },
  volumeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  volumeInput: {
    flex: 1,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  volumeUnit: {
    fontSize: typography.base,
    fontWeight: '500',
    width: 100,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minHeight: 40,
    justifyContent: 'center',
  },
  presetText: {
    fontSize: typography.base,
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
