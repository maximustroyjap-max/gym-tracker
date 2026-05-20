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
  Text,
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
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { getTierColor, getTierProgress, getNextTier } from '@/constants/ranks';
import { RankIcon } from '@/components/RankIcon';
import { GlassCard } from '@/components/GlassCard';
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
        <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
          Loading...
        </Text>
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
      style={[styles.safeArea, { backgroundColor: Platform.OS === 'web' ? Colors.background : 'transparent' }]
      }
      edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl },
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
          <GlassCard
            intensity={35}
            borderRadius={radius.lg}
            style={styles.goalCard}
            contentStyle={styles.goalCardContent}>
            <MaterialIcons name="flag" size={16} color={Colors.secondary} />
            <Text
              style={[styles.goalText, { color: Colors.textSecondary }]}
              numberOfLines={2}>
              {user.personalGoal}
            </Text>
          </GlassCard>
        ) : null}

        {/* Stats Grid - 2x2 layout (Glassmorphism) */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Level"
            value={user.level.toString()}
            subtext={`${user.xp} / ${user.xpToNextLevel} XP`}
            showProgress
            progress={xpProgress}
            color={Colors.primary}
            Colors={Colors}
            glass
          />
          <StatCard
            label="Workouts"
            value={user.totalWorkouts.toString()}
            subtext="completed"
            Colors={Colors}
            glass
          />
          <StatCard
            label="Streak"
            value={user.currentStreak.toString()}
            subtext="weeks"
            highlight
            Colors={Colors}
            glass
          />
          <StatCard
            label="Hours"
            value={user.totalHours.toString()}
            subtext="total"
            Colors={Colors}
            glass
          />
        </View>

        {/* Dashboard Section */}
        <View style={styles.dashboardHeader}>
          <Text style={[styles.dashboardTitle, { color: Colors.text }]}>
            Dashboard
          </Text>
          <TouchableOpacity
            style={[
              styles.addWidgetButton,
              {
                backgroundColor: Colors.secondary + '1A',
                borderColor: Colors.secondary + '33',
              },
            ]}
            activeOpacity={activeOpacity.button}>
            <Text style={[styles.addWidgetText, { color: Colors.secondary }]}>
              + Widget
            </Text>
          </TouchableOpacity>
        </View>

        {/* Workouts Per Week Widget */}
        <WorkoutsPerWeekWidget />

        {/* ── Fitness Score Section (Glassmorphism) ── */}
        <GlassCard
          intensity={50}
          borderRadius={radius.xl}
          onPress={() => router.push('/rank-details')}
          activeOpacity={activeOpacity.card}
          style={styles.rankSection}
          contentStyle={styles.rankSectionContent}>
          <View style={styles.fitnessHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Fitness Score
              </Text>
              <Text
                style={[styles.rankSubtext, { color: Colors.textSecondary }]}>
                {user.fitnessScore} / 100 · {user.rank}
              </Text>
            </View>
            <View
              style={[
                styles.rankBadgeLarge,
                { backgroundColor: rankColor + '1A' },
              ]}>
              <RankIcon rank={user.rank} size={22} glow glowColor={rankColor} glowIntensity="medium" />
              <Text style={[styles.rankBadgeText, { color: rankColor }]}>
                {user.rank}
              </Text>
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
            <Text
              style={[
                styles.progressLabel,
                { color: Colors.textSecondary },
              ]}>
              {progressPercent}% to {nextTier ?? 'Max Rank'}
            </Text>
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
              color={Colors.gold}
              Colors={Colors}
              animatedWidth={progressionAnim}
            />
            <BreakdownBar
              label="Variety"
              value={user.fitnessBreakdown.variety}
              weight={10}
              color={Colors.bronze}
              Colors={Colors}
              animatedWidth={varietyAnim}
            />
          </View>

          <View style={styles.tapHintRow}>
            <MaterialIcons
              name="chevron-right"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={[styles.tapHint, { color: Colors.textSecondary }]}>
              View Rank Details
            </Text>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Reusable stat card used in the 2x2 grid */
function StatCard({
  label,
  value,
  subtext,
  showProgress,
  progress,
  color,
  highlight,
  Colors,
  glass,
}: {
  label: string;
  value: string;
  subtext: string;
  showProgress?: boolean;
  progress?: number;
  color?: string;
  highlight?: boolean;
  Colors: ReturnType<typeof useTheme>;
  glass?: boolean;
}) {
  const content = (
    <>
      <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.statValue,
          { color: highlight ? Colors.primary : Colors.text },
        ]}>
        {value}
      </Text>
      {showProgress && progress !== undefined && (
        <View style={styles.miniProgressContainer}>
          <View
            style={[
              styles.miniProgressBackground,
              { backgroundColor: Colors.border + '80' },
            ]}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: color || Colors.primary,
                },
              ]}
            />
          </View>
        </View>
      )}
      <Text style={[styles.statSubtext, { color: Colors.textSecondary }]}>
        {subtext}
      </Text>
    </>
  );

  if (glass) {
    return (
      <GlassCard
        intensity={35}
        borderRadius={radius.lg}
        borderColor={highlight ? Colors.primary : undefined}
        borderWidth={highlight ? 1.5 : 1}
        style={styles.statCard}
        contentStyle={styles.statCardContent}>
        {content}
      </GlassCard>
    );
  }

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: Colors.card,
          borderColor: highlight ? Colors.primary : Colors.border,
          shadowColor: Colors.shadow,
        },
        highlight && { borderWidth: 1.5 },
      ]}>
      {content}
    </View>
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
        <Text
          style={[styles.breakdownLabel, { color: Colors.textSecondary }]}>
          {label}
        </Text>
        <Text
          style={[styles.breakdownWeight, { color: Colors.textSecondary }]}>
          {weight}%
        </Text>
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
      <Text style={[styles.breakdownValue, { color }]}>
        {Math.round(value)}
      </Text>
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
    // paddingBottom is set dynamically via inline style
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statCard: {
    width: '47%',
    overflow: 'hidden',
  },
  statCardContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
  },
  miniProgressContainer: {
    marginVertical: spacing.sm,
  },
  miniProgressBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statSubtext: {
    fontSize: typography.xs,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
    marginBottom: spacing.xs,
  },
  dashboardTitle: {
    fontSize: typography.xl,
    fontWeight: 'bold',
  },
  addWidgetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  addWidgetText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  rankSection: {
    marginTop: spacing['2xl'],
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  rankSectionContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
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
    fontWeight: '500',
  },
  goalCard: {
    marginHorizontal: spacing.lg,
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
  rankDotLarge: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  rankBadgeText: {
    fontSize: typography.sm,
    fontWeight: 'bold',
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
    fontWeight: '600',
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
    fontWeight: 'bold',
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
    fontWeight: '500',
  },
});
