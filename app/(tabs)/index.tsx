import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { router } from 'expo-router';
import { getTierColor, getTierProgress, getNextTier, getDaysUntilStreakDies } from '@/constants/ranks';
import { RankIcon } from '@/components/RankIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NeonCard } from '@/components/NeonCard';
import { AppText } from '@/components/ui/AppText';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';
import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';

export default function HomeScreen() {
  const Colors = useTheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const daysUntilStreakDies = getDaysUntilStreakDies(user.lastWorkoutDate, user.weeklyTarget);
  const showStreakWarning = user.currentStreak > 0 && daysUntilStreakDies <= 1;

  const currentRank = user.rank as import('@/constants/ranks').SubTier;
  const rankColor = getTierColor(currentRank, user.theme);
  const tierProgress = getTierProgress(user.fitnessScore, currentRank);
  const nextTier = getNextTier(currentRank);
  const progressPercent = Math.max(tierProgress * 100, 3);

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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl, flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <AppText weight="medium" style={[styles.greetingLabel, { color: Colors.textSecondary }]}>
              Welcome back
            </AppText>
            <AppText weight="bold" style={[styles.greetingName, { color: Colors.text }]}>
              {user.username}
            </AppText>
          </View>
          <TouchableOpacity
            style={[styles.settingsPill, { backgroundColor: Colors.card, borderColor: Colors.border }]}
            onPress={() => router.push('/settings')}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="gear" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Rank Card */}
        <NeonCard
          glowColor={rankColor}
          borderRadius={radius['2xl']}
          onPress={() => router.push('/rank-details')}
          activeOpacity={activeOpacity.card}
          style={styles.heroCard}
          contentStyle={styles.heroCardContent}>

          <View style={[styles.orbTopRight, { backgroundColor: rankColor + '25' }]} pointerEvents="none" />
          <View style={[styles.orbBottomLeft, { backgroundColor: Colors.primary + '15' }]} pointerEvents="none" />

          <View style={styles.heroBody}>
            <View style={styles.heroLeft}>
              <AppText weight="medium" style={[styles.rankLabel, { color: Colors.textSecondary }]}>
                Current Rank
              </AppText>
              <AppText weight="bold" style={[styles.rankName, { color: Colors.text }]}>
                {user.rank.split(' ')[0]}{' '}
                <AppText weight="bold" style={{ color: rankColor }}>
                  {user.rank.split(' ')[1] ?? ''}
                </AppText>
              </AppText>
            </View>

            <View style={[styles.iconRing, { backgroundColor: rankColor + '14', borderColor: rankColor + '58' }]}>
              <RankIcon
                rank={user.rank}
                size={32}
                glow
                glowColor={rankColor}
                glowIntensity="strong"
                animated
              />
            </View>
          </View>

          <View style={styles.scoreRow}>
            <AppText weight="medium" style={[styles.scoreLabel, { color: Colors.textSecondary }]}>
              Fitness Score
            </AppText>
            <AppText weight="bold" style={[styles.scoreNumber, { color: Colors.text }]}>
              {user.fitnessScore}
              <AppText weight="regular" style={[styles.scoreTotal, { color: Colors.border }]}> / 100</AppText>
            </AppText>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: Colors.border }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.progressGloss} />
            </Animated.View>
          </View>

          <AppText weight="medium" style={[styles.nextTierText, { color: Colors.textSecondary }]}>
            {Math.round(tierProgress * 100)}% to {nextTier ?? 'Max Rank'}
          </AppText>
        </NeonCard>

        {/* Score Breakdown */}
        <NeonCard borderRadius={radius.xl} style={styles.breakdownCard} contentStyle={styles.breakdownCardContent}>
          <AppText weight="semibold" style={[styles.sectionLabel, { color: Colors.textSecondary }]}>
            Score Breakdown
          </AppText>
          <BreakdownBar label="Consistency" value={user.fitnessBreakdown.consistency} color={Colors.primary} Colors={Colors} />
          <BreakdownBar label="Volume" value={user.fitnessBreakdown.volume} color={Colors.secondary} Colors={Colors} />
          <BreakdownBar label="Progression" value={user.fitnessBreakdown.progression} color={Colors.primary} Colors={Colors} />
          <BreakdownBar label="Variety" value={user.fitnessBreakdown.variety} color={Colors.secondary} Colors={Colors} />
        </NeonCard>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatItem label="Workouts" value={user.totalWorkouts.toString()} Colors={Colors} />
          <StatItem
            label="Streak"
            value={`${user.currentStreak}d`}
            warning={showStreakWarning ? (daysUntilStreakDies === 0 ? 'Gone!' : 'Last day!') : undefined}
            Colors={Colors}
          />
          <StatItem label="Hours" value={user.totalHours.toString()} Colors={Colors} />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsColumn}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workout')}
            activeOpacity={activeOpacity.button}
            style={styles.primaryButtonWrapper}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}>
              <AppText weight="bold" style={[styles.primaryButtonText, { color: '#08080f' }]}>
                Start Workout
              </AppText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: Colors.border }]}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={activeOpacity.button}>
            <AppText weight="semibold" style={[styles.secondaryButtonText, { color: Colors.textSecondary }]}>
              View Profile
            </AppText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

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
        <AppText weight="medium" style={[styles.breakdownLabel, { color: Colors.text }]}>{label}</AppText>
        <AppText weight="semibold" style={[styles.breakdownValue, { color }]}>{Math.round(value)}%</AppText>
      </View>
      <View style={[styles.breakdownTrack, { backgroundColor: Colors.border }]}>
        <View style={[styles.breakdownFill, { width: `${pct}%`, backgroundColor: color }]} />
        <View style={styles.breakdownGloss} />
      </View>
    </View>
  );
}

function StatItem({
  label,
  value,
  warning,
  Colors,
}: {
  label: string;
  value: string;
  warning?: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <NeonCard borderRadius={radius.xl} style={styles.statItem} contentStyle={styles.statItemContent}>
      <AppText weight="bold" style={[styles.statValue, { color: Colors.text }]}>{value}</AppText>
      <AppText weight="semibold" style={[styles.statLabel, { color: Colors.textSecondary }]}>{label}</AppText>
      {warning && (
        <AppText weight="bold" style={[styles.statWarning, { color: Colors.danger }]}>{warning}</AppText>
      )}
    </NeonCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: spacing.lg },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  greetingLabel: { fontSize: typography.xs, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  greetingName: { fontSize: typography['2xl'] },
  settingsPill: { width: 40, height: 40, borderRadius: radius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  heroCard: { overflow: 'hidden', position: 'relative' },
  heroCardContent: { padding: spacing['2xl'], gap: spacing.md },
  orbTopRight: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70 },
  orbBottomLeft: { position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50 },
  heroBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLeft: { flex: 1 },
  rankLabel: { fontSize: typography.xs, letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.xs },
  rankName: { fontSize: typography['3xl'] },
  iconRing: { width: 56, height: 56, borderRadius: radius.lg, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  scoreLabel: { fontSize: typography.xs, letterSpacing: 2, textTransform: 'uppercase' },
  scoreNumber: { fontSize: typography['2xl'] },
  scoreTotal: { fontSize: typography.sm },

  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  progressGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.15)', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  nextTierText: { fontSize: typography.xs, letterSpacing: 1 },

  breakdownCard: {},
  breakdownCardContent: { padding: spacing.xl, gap: spacing.md },
  sectionLabel: { fontSize: typography.xs, letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.xs },
  breakdownRow: { gap: spacing.xs },
  breakdownLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { fontSize: typography.sm },
  breakdownValue: { fontSize: typography.sm },
  breakdownTrack: { height: 4, borderRadius: 2, overflow: 'hidden', position: 'relative' },
  breakdownFill: { height: '100%', borderRadius: 2 },
  breakdownGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.15)' },

  statsRow: { flexDirection: 'row', gap: spacing.md },
  statItem: { flex: 1 },
  statItemContent: { alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, gap: spacing.xs },
  statValue: { fontSize: typography.lg },
  statLabel: { fontSize: typography.xs, textTransform: 'uppercase', letterSpacing: 2 },
  statWarning: { fontSize: typography.xs, letterSpacing: 1, marginTop: 2 },

  actionsColumn: { gap: spacing.md, marginTop: 'auto' },
  primaryButtonWrapper: { borderRadius: radius.lg, overflow: 'hidden' },
  primaryButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, minHeight: 52 },
  primaryButtonText: { fontSize: typography.base, letterSpacing: 1, textTransform: 'uppercase' },
  secondaryButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, minHeight: 52, borderRadius: radius.lg, borderWidth: 1 },
  secondaryButtonText: { fontSize: typography.base, letterSpacing: 1, textTransform: 'uppercase' },
});
