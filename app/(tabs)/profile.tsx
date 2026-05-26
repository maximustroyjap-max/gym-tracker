/**
 * PROFILE SCREEN
 *
 * Layout (top to bottom):
 * 1. Profile Header (avatar, name, rank badge)
 * 2. Stats Grid (Level, Workouts, Streak, Hours)
 * 3. Dashboard Section (+ Widget button)
 * 4. Workouts Per Week Widget (bar chart with target line)
 * 5. Fitness Score Section (animated breakdown bars + rank progress)
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProfileHeader } from '@/components/ProfileHeader';
import { WorkoutsPerWeekWidget } from '@/components/WorkoutsPerWeekWidget';
import { NeonCard } from '@/components/NeonCard';
import { AppText } from '@/components/ui/AppText';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { getTierColor, getTierProgress, getNextTier, getDaysUntilStreakDies } from '@/constants/ranks';
import { RankIcon } from '@/components/RankIcon';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';



export default function ProfileScreen() {
  const Colors = useTheme();
  const { user, isLoading } = useUser();
  const insets = useSafeAreaInsets();

  // ── Animation values for Fitness Score section ──
  const consistencyAnim = useRef(new Animated.Value(0)).current;
  const volumeAnim = useRef(new Animated.Value(0)).current;
  const progressionAnim = useRef(new Animated.Value(0)).current;
  const varietyAnim = useRef(new Animated.Value(0)).current;
  const rankProgressAnim = useRef(new Animated.Value(0)).current;

  const xpProgress = Math.min(user.xp / user.xpToNextLevel, 1);
  const daysUntilStreakDies = getDaysUntilStreakDies(user.lastWorkoutDate, user.weeklyTarget);
  const streakWarning = user.currentStreak > 0 && daysUntilStreakDies <= 1
    ? (daysUntilStreakDies === 0 ? 'Streak gone!' : 'Work out today!')
    : undefined;
  const rankColor = getTierColor(user.rank, user.theme);
  const tierProgress = getTierProgress(
    user.fitnessScore,
    user.rank as import('@/constants/ranks').SubTier
  );
  const nextTier = getNextTier(user.rank as import('@/constants/ranks').SubTier);
  const progressPercent = Math.round(tierProgress * 100);

  // Targets for animation (0-100 scale)
  const consistencyTarget = Math.min(user.fitnessBreakdown.consistency, 100);
  const volumeTarget = Math.min(user.fitnessBreakdown.volume, 100);
  const progressionTarget = Math.min(user.fitnessBreakdown.progression, 100);
  const varietyTarget = Math.min(user.fitnessBreakdown.variety, 100);
  // Ensure rank progress bar always shows at least 3% so the color is visible
  const rankProgressTarget = Math.max(tierProgress * 100, 3);

  // Synchronized spring animation for all 5 bars
  const runFitnessAnimations = useCallback(() => {
    // Reset all to 0
    consistencyAnim.setValue(0);
    volumeAnim.setValue(0);
    progressionAnim.setValue(0);
    varietyAnim.setValue(0);
    rankProgressAnim.setValue(0);

    Animated.parallel([
      Animated.spring(consistencyAnim, {
        toValue: consistencyTarget,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(volumeAnim, {
        toValue: volumeTarget,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(progressionAnim, {
        toValue: progressionTarget,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(varietyAnim, {
        toValue: varietyTarget,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(rankProgressAnim, {
        toValue: rankProgressTarget,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    consistencyTarget,
    volumeTarget,
    progressionTarget,
    varietyTarget,
    rankProgressTarget,
    consistencyAnim,
    volumeAnim,
    progressionAnim,
    varietyAnim,
    rankProgressAnim,
  ]);

  // Only animate when Profile tab gains focus
  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        runFitnessAnimations();
      }, 80);
      return () => clearTimeout(timeout);
    }, [runFitnessAnimations])
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: Colors.background },
        ]}>
        <AppText style={[styles.loadingText, { color: Colors.textSecondary }]}>
          Loading...
        </AppText>
      </View>
    );
  }

  // Interpolated width strings for Animated.View
  const rankProgressWidth = rankProgressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Platform.OS === 'web' ? Colors.background : 'transparent' }]}
      edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl, flexGrow: 1 },
        ]}>
        {/* Settings gear — top right */}
        <View style={styles.settingsHeader}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[
              styles.settingsButton,
              { backgroundColor: Colors.card, borderColor: Colors.border },
            ]}
            onPress={() => router.push('/settings')}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="settings" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Top Section: Avatar, Name, Rank */}
        <ProfileHeader />

        {/* Background Gradient Orbs */}
        <View style={styles.gradientOrbs} pointerEvents="none">
          <LinearGradient
            colors={[rankColor + '14', 'transparent']}
            style={[styles.orb, styles.orbTop]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <LinearGradient
            colors={[Colors.primary + '0C', 'transparent']}
            style={[styles.orb, styles.orbMid]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          />
        </View>

        {/* Personal Goal */}
        {user.personalGoal ? (
          <NeonCard
            borderRadius={radius.lg}
            style={styles.goalCard}
            contentStyle={styles.goalCardContent}>
            <MaterialIcons name="flag" size={16} color={Colors.secondary} />
            <AppText
              style={[styles.goalText, { color: Colors.textSecondary }]}
              numberOfLines={2}>
              {user.personalGoal}
            </AppText>
          </NeonCard>
        ) : null}

        {/* Stats Grid - 2 explicit rows for consistent heights */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Level"
              value={user.level.toString()}
              subtext={`${user.xp} / ${user.xpToNextLevel} XP`}
              showProgress
              progress={xpProgress}
              color={Colors.primary}
              Colors={Colors}
              highlight
            />
            <StatCard
              label="Workouts"
              value={user.totalWorkouts.toString()}
              subtext="completed"
              Colors={Colors}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Streak"
              value={user.currentStreak.toString()}
              subtext="day streak"
              note={
                streakWarning
                  ? { text: streakWarning, danger: true }
                  : user.bestStreak > user.currentStreak
                  ? { text: `Best: ${user.bestStreak}d`, danger: false }
                  : undefined
              }
              highlight
              Colors={Colors}
            />
            <StatCard
              label="Hours"
              value={user.totalHours.toString()}
              subtext="total"
              Colors={Colors}
            />
          </View>
        </View>

        {/* Dashboard Section */}
        <View style={styles.dashboardHeader}>
          <AppText weight="bold" style={[styles.dashboardTitle, { color: Colors.text }]}>
            Dashboard
          </AppText>
          <TouchableOpacity
            style={[
              styles.addWidgetButton,
              {
                backgroundColor: Colors.secondary + '1A',
                borderColor: Colors.secondary + '33',
              },
            ]}
            activeOpacity={activeOpacity.button}>
            <AppText weight="semibold" style={[styles.addWidgetText, { color: Colors.secondary }]}>
              + Widget
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Workouts Per Week Widget */}
        <WorkoutsPerWeekWidget />

        {/* ── Fitness Score Section ── */}
        <NeonCard
          borderRadius={radius.xl}
          glowColor={rankColor}
          onPress={() => router.push('/rank-details')}
          activeOpacity={activeOpacity.card}
          style={styles.rankSection}
          contentStyle={styles.rankSectionContent}>
          <View style={styles.fitnessHeader}>
            <View>
              <AppText weight="bold" style={[styles.sectionTitle, { color: Colors.text }]}>
                Fitness Score
              </AppText>
              <AppText
                style={[styles.rankSubtext, { color: Colors.textSecondary }]}>
                {user.fitnessScore} / 100 · {user.rank}
              </AppText>
            </View>
            <View
              style={[
                styles.rankBadgeLarge,
                { backgroundColor: rankColor + '1A' },
              ]}>
              <RankIcon rank={user.rank} size={22} glow glowColor={rankColor} glowIntensity="medium" />
              <AppText weight="bold" style={[styles.rankBadgeText, { color: rankColor }]}>
                {user.rank}
              </AppText>
            </View>
          </View>

          {/* Tier progress bar — animated */}
          <View
            style={[
              styles.progressBarBackground,
              { backgroundColor: Colors.border },
            ]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: rankProgressWidth, backgroundColor: rankColor },
              ]}
            />
          </View>

          {/* Progress percentage label */}
          <View style={styles.progressLabelRow}>
            <AppText
              weight="medium"
              style={[
                styles.progressLabel,
                { color: Colors.textSecondary },
              ]}>
              {progressPercent}% to {nextTier ?? 'Max Rank'}
            </AppText>
          </View>

          {/* 4 Breakdown Bars — animated */}
          <View style={styles.breakdownContainer}>
            <BreakdownBar
              label="Consistency"
              value={user.fitnessBreakdown.consistency}
              weight={40}
              color={Colors.primary}
              Colors={Colors}
              animatedWidth={consistencyAnim}
            />
            <BreakdownBar
              label="Volume"
              value={user.fitnessBreakdown.volume}
              weight={30}
              color={Colors.secondary}
              Colors={Colors}
              animatedWidth={volumeAnim}
            />
            <BreakdownBar
              label="Progression"
              value={user.fitnessBreakdown.progression}
              weight={20}
              color={Colors.primary}
              Colors={Colors}
              animatedWidth={progressionAnim}
            />
            <BreakdownBar
              label="Variety"
              value={user.fitnessBreakdown.variety}
              weight={10}
              color={Colors.secondary}
              Colors={Colors}
              animatedWidth={varietyAnim}
            />
          </View>

          <View style={styles.tapHintRow}>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors.textSecondary}
            />
            <AppText weight="medium" style={[styles.tapHint, { color: Colors.textSecondary }]}>
              View Rank Details
            </AppText>
          </View>
        </NeonCard>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Reusable stat card used in the 2x2 grid */
function StatCard({
  label,
  value,
  subtext,
  note,
  showProgress,
  progress,
  color,
  highlight,
  Colors,
}: {
  label: string;
  value: string;
  subtext: string;
  note?: { text: string; danger: boolean };
  showProgress?: boolean;
  progress?: number;
  color?: string;
  highlight?: boolean;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <NeonCard
      borderRadius={radius.lg}
      glowColor={highlight ? Colors.primary : undefined}
      style={styles.statCard}
      contentStyle={styles.statCardContent}>
      <AppText weight="semibold" style={[styles.statLabel, { color: Colors.textSecondary }]}>
        {label}
      </AppText>
      <AppText
        weight="bold"
        style={[styles.statValue, { color: highlight ? Colors.primary : Colors.text }]}>
        {value}
      </AppText>
      {showProgress && progress !== undefined && (
        <View style={styles.miniProgressContainer}>
          <View style={[styles.miniProgressBackground, { backgroundColor: Colors.border + '80' }]}>
            <View
              style={[
                styles.miniProgressFill,
                { width: `${progress * 100}%`, backgroundColor: color || Colors.primary },
              ]}
            />
          </View>
        </View>
      )}
      <AppText style={[styles.statSubtext, { color: Colors.textSecondary }]}>
        {subtext}
      </AppText>
      {note && (
        <AppText weight="semibold" style={[styles.statNote, { color: note.danger ? Colors.danger : Colors.textSecondary }]}>
          {note.text}
        </AppText>
      )}
    </NeonCard>
  );
}

/** Breakdown bar for each of the 4 fitness pillars — animated width */
function BreakdownBar({
  label,
  value,
  weight,
  color,
  Colors,
  animatedWidth,
}: {
  label: string;
  value: number;
  weight: number;
  color: string;
  Colors: ReturnType<typeof useTheme>;
  animatedWidth: Animated.Value;
}) {
  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownLabelRow}>
        <AppText
          weight="semibold"
          style={[styles.breakdownLabel, { color: Colors.textSecondary }]}>
          {label}
        </AppText>
        <AppText
          style={[styles.breakdownWeight, { color: Colors.textSecondary }]}>
          {weight}%
        </AppText>
      </View>
      <View
        style={[
          styles.breakdownTrack,
          { backgroundColor: Colors.border },
        ]}>
        <Animated.View
          style={[styles.breakdownFill, { width, backgroundColor: color }]}
        />
      </View>
      <AppText weight="bold" style={[styles.breakdownValue, { color }]}>
        {Math.round(value)}
      </AppText>
    </View>
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
    // paddingBottom is set dynamically via inline style
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  settingsButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.base,
  },
  gradientOrbs: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  orbTop: {
    top: 60,
    right: -40,
  },
  orbMid: {
    top: 350,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  statsGrid: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    overflow: 'hidden',
  },
  statCardContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
    minHeight: 110,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: typography['2xl'],
  },
  miniProgressContainer: {
    alignSelf: 'stretch',
    marginVertical: spacing.xs,
  },
  miniProgressBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statSubtext: {
    fontSize: typography.xs,
  },
  statNote: {
    fontSize: typography.xs,
    letterSpacing: 0.5,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.xs,
  },
  dashboardTitle: {
    fontSize: typography.xl,
  },
  addWidgetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  addWidgetText: {
    fontSize: typography.sm,
  },
  rankSection: {
    marginTop: 'auto',
    overflow: 'hidden',
  },
  rankSectionContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.lg,
    marginBottom: spacing.xs,
  },
  rankSubtext: {
    fontSize: typography.sm,
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.xs,
  },
  goalCard: {
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  goalText: {
    flex: 1,
    fontSize: typography.base,
    fontStyle: 'italic',
  },
  fitnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  rankBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.sm,
  },
  rankBadgeText: {
    fontSize: typography.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  breakdownContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  breakdownRow: {
    gap: spacing.xs,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: typography.sm,
  },
  breakdownWeight: {
    fontSize: typography.xs,
  },
  breakdownTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownValue: {
    fontSize: typography.sm,
    textAlign: 'right',
  },
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  tapHint: {
    fontSize: typography.sm,
  },
});
