/**
 * HOME SCREEN — Premium Redesign
 *
 * Clean, professional dashboard with the rank icon as the visual centerpiece.
 * Hero card with tinted glow, spring-animated progress, and premium pill breakdown.
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { router } from 'expo-router';
import { getTierColor, getTierProgress, getNextTier } from '@/constants/ranks';
import { RankIcon } from '@/components/RankIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/components/GlassCard';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';
import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';

export default function HomeScreen() {
  const Colors = useTheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const currentRank = user.rank as import('@/constants/ranks').SubTier;
  const rankColor = getTierColor(currentRank, user.theme);
  const tierProgress = getTierProgress(user.fitnessScore, currentRank);
  const nextTier = getNextTier(currentRank);
  const progressPercent = Math.max(tierProgress * 100, 3);

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercent,
      friction: 8,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Platform.OS === 'web' ? Colors.background : 'transparent' }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {/* ── Minimal Header ── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greetingLabel, { color: Colors.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[styles.greetingName, { color: Colors.text }]}>
              {user.username}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsPill, { backgroundColor: Colors.card, borderColor: Colors.border }]}
            onPress={() => router.push('/settings')}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="gear" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Background Gradient Orbs (for glassmorphism depth) ── */}
        <View style={styles.gradientOrbs} pointerEvents="none">
          <LinearGradient
            colors={[rankColor + '18', 'transparent']}
            style={[styles.orb, styles.orbTop]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <LinearGradient
            colors={[Colors.primary + '10', 'transparent']}
            style={[styles.orb, styles.orbBottom]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          />
        </View>

        {/* ── Hero Rank Card (Glassmorphism) ── */}
        <GlassCard
          intensity={60}
          borderColor={rankColor + '30'}
          borderRadius={radius['2xl']}
          onPress={() => router.push('/rank-details')}
          activeOpacity={activeOpacity.card}
          style={styles.heroCard}
          contentStyle={styles.heroCardContent}>
          {/* Soft glow orb behind the icon */}
          <View style={[styles.glowOrb, { backgroundColor: rankColor + '10' }]} />

          <View style={styles.heroContent}>
            {/* Icon Ring */}
            <View
              style={[
                styles.iconRing,
                {
                  backgroundColor: rankColor + '12',
                  borderColor: rankColor + '25',
                },
              ]}>
              <RankIcon
                rank={user.rank}
                size={56}
                glow
                glowColor={rankColor}
                glowIntensity="strong"
                animated
              />
            </View>

            {/* Rank Name */}
            <Text style={[styles.rankName, { color: rankColor }]}>{user.rank}</Text>

            {/* Fitness Score */}
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreNumber, { color: Colors.text }]}>
                {user.fitnessScore}
              </Text>
              <Text style={[styles.scoreTotal, { color: Colors.textSecondary }]}>
                / 100
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: Colors.border + '80' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth, backgroundColor: rankColor },
                ]}
              />
              <Animated.View
                style={[styles.progressGloss, { width: progressWidth }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'transparent']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </Animated.View>
            </View>

            {/* Next tier text */}
            <Text style={[styles.nextTierText, { color: Colors.textSecondary }]}>
              {Math.round(tierProgress * 100)}% to {nextTier ?? 'Max Rank'}
            </Text>
          </View>
        </GlassCard>

        {/* ── Fitness Breakdown Card (Glassmorphism) ── */}
        <GlassCard
          intensity={40}
          borderRadius={radius.xl}
          style={styles.breakdownCard}
          contentStyle={styles.breakdownCardContent}>
          <Text style={[styles.breakdownTitle, { color: Colors.text }]}>
            Score Breakdown
          </Text>
          <BreakdownBar
            label="Consistency"
            value={user.fitnessBreakdown.consistency}
            color={Colors.primary}
            Colors={Colors}
          />
          <BreakdownBar
            label="Volume"
            value={user.fitnessBreakdown.volume}
            color={Colors.secondary}
            Colors={Colors}
          />
          <BreakdownBar
            label="Progression"
            value={user.fitnessBreakdown.progression}
            color={Colors.gold}
            Colors={Colors}
          />
          <BreakdownBar
            label="Variety"
            value={user.fitnessBreakdown.variety}
            color={Colors.bronze}
            Colors={Colors}
          />
        </GlassCard>

        {/* ── Quick Stats Row ── */}
        <View style={styles.statsRow}>
          <StatItem
            icon="dumbbell.fill"
            label="Workouts"
            value={user.totalWorkouts.toString()}
            Colors={Colors}
          />
          <StatItem
            icon="flame.fill"
            label="Streak"
            value={`${user.currentStreak}w`}
            Colors={Colors}
          />
          <StatItem
            icon="clock.fill"
            label="Hours"
            value={user.totalHours.toString()}
            Colors={Colors}
          />
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.actionsColumn}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/(tabs)/workout')}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="dumbbell.fill" size={18} color={Colors.background} />
            <Text style={[styles.primaryButtonText, { color: Colors.background }]}>
              Start Workout
            </Text>
          </TouchableOpacity>

          <GlassCard
            intensity={25}
            borderRadius={radius.lg}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={activeOpacity.button}
            style={styles.secondaryButton}
            contentStyle={styles.secondaryButtonContent}>
            <Text style={[styles.secondaryButtonText, { color: Colors.text }]}>
              View Profile
            </Text>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Mini horizontal breakdown bar */
function BreakdownBar({
  label,
  value,
  color,
  Colors,
}: {
  label: string;
  value: number;
  color: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  const pct = Math.min(value, 100);
  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownLabelRow}>
        <Text style={[styles.breakdownLabel, { color: Colors.text }]}>{label}</Text>
        <Text style={[styles.breakdownValue, { color }]}>{Math.round(value)}</Text>
      </View>
      <View style={[styles.breakdownTrack, { backgroundColor: Colors.border }]}>
        <View style={[styles.breakdownFill, { width: `${pct}%`, backgroundColor: color }]} />
        <View style={[styles.breakdownGloss, { width: `${pct}%`, backgroundColor: Colors.gloss }]} />
      </View>
    </View>
  );
}

/** Quick stat item with icon */
function StatItem({
  icon,
  label,
  value,
  Colors,
}: {
  icon: string;
  label: string;
  value: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <GlassCard intensity={30} borderRadius={radius.xl} style={styles.statItem} contentStyle={styles.statItemContent}>
      <View style={[styles.statIconBox, { backgroundColor: Colors.primary + '18' }]}>
        <IconSymbol name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: Colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
  },

  /* ── Header ── */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  greetingLabel: {
    fontSize: typography.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
  },
  settingsPill: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Background Gradient Orbs ── */
  gradientOrbs: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  orbTop: {
    top: 80,
    alignSelf: 'center',
  },
  orbBottom: {
    bottom: 100,
    alignSelf: 'center',
    width: 250,
    height: 250,
    borderRadius: 125,
  },

  /* ── Hero Rank Card ── */
  heroCard: {
    overflow: 'hidden',
    position: 'relative',
  },
  heroCardContent: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    alignSelf: 'center',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rankName: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  scoreNumber: {
    fontSize: typography['4xl'],
    fontWeight: 'bold',
  },
  scoreTotal: {
    fontSize: typography.xl,
    marginLeft: spacing.xs,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '50%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  nextTierText: {
    fontSize: typography.sm,
    fontWeight: '500',
  },

  /* ── Breakdown Card ── */
  breakdownCard: {
    overflow: 'hidden',
  },
  breakdownCardContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  breakdownTitle: {
    fontSize: typography.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
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
  breakdownValue: {
    fontSize: typography.sm,
    fontWeight: 'bold',
  },
  breakdownTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '50%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  /* ── Quick Stats ── */
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    overflow: 'hidden',
  },
  statItemContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* ── Actions ── */
  actionsColumn: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  secondaryButton: {
    overflow: 'hidden',
  },
  secondaryButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  secondaryButtonText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
});
