/**
 * WORKOUT COMPLETE ANIMATION
 *
 * A celebratory full-screen overlay that appears when the user
 * finishes a workout. Shows:
 * - Animated checkmark
 * - "Workout Complete!" text
 * - Workout stats (duration, exercises, sets)
 * - XP gained + level up banner
 * - Fitness Score with 4-pillar breakdown
 * - Rank promotion / demotion banner
 *
 * Fades in, stays visible for ~3s, then fades out and calls onComplete.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RankIcon } from '@/components/RankIcon';
import { FitnessBreakdown, getTierColor } from '@/constants/ranks';
import { spacing, radius, typography } from '@/constants/design';

interface WorkoutCompleteAnimationProps {
  /** Workout duration in seconds */
  durationSeconds: number;
  /** Number of exercises performed */
  exerciseCount: number;
  /** Number of sets completed */
  setCount: number;
  /** XP gained from this workout */
  xpGained: number;
  /** Did the user level up? */
  leveledUp: boolean;
  /** Current fitness score after this workout */
  fitnessScore: number;
  /** Breakdown of the 4 pillars */
  fitnessBreakdown: FitnessBreakdown;
  /** Did rank change? */
  rankChanged: boolean;
  /** New rank (if changed) */
  newRank: string;
  /** Old rank (if changed) */
  oldRank: string;
  /** Called when the animation finishes and should be dismissed */
  onComplete: () => void;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function WorkoutCompleteAnimation({
  durationSeconds,
  exerciseCount,
  setCount,
  xpGained,
  leveledUp,
  fitnessScore,
  fitnessBreakdown,
  rankChanged,
  newRank,
  oldRank,
  onComplete,
}: WorkoutCompleteAnimationProps) {
  const Colors = useTheme();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(20)).current;
  const rankBannerOpacity = useRef(new Animated.Value(0)).current;
  const rankBannerScale = useRef(new Animated.Value(0.8)).current;

  const isPromotion = rankChanged && fitnessScore > 0;
  const rankColor = getTierColor(newRank);

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Backdrop fades in
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Card scales up and fades in
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Checkmark pops in
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      // Stats slide up and fade in
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(statsTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Rank banner pops in (if rank changed)
      ...(rankChanged
        ? [
            Animated.parallel([
              Animated.timing(rankBannerOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(rankBannerScale, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
              }),
            ]),
          ]
        : []),
      // Hold for 2 seconds so user can read stats
      Animated.delay(2200),
      // Exit: fade everything out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="auto">
      {/* Dark backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      {/* Centered card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
            backgroundColor: Colors.card,
            borderColor: Colors.border,
            shadowColor: Colors.shadow,
          },
        ]}>
        {/* Checkmark circle */}
        <Animated.View
          style={[
            styles.checkCircle,
            { transform: [{ scale: checkScale }], backgroundColor: Colors.primary },
          ]}>
          <IconSymbol name="checkmark" size={40} color={Colors.background} />
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, { color: Colors.text }]}>Workout Complete!</Text>

        {leveledUp && (
          <View style={[styles.levelUpBadge, { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary }]}>
            <Text style={[styles.levelUpText, { color: Colors.secondary }]}>LEVEL UP!</Text>
          </View>
        )}

        {/* Stats grid */}
        <Animated.View
          style={[
            styles.statsGrid,
            {
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }],
            },
          ]}>
          <StatBox label="Duration" value={formatDuration(durationSeconds)} Colors={Colors} />
          <StatBox label="Exercises" value={exerciseCount.toString()} Colors={Colors} />
          <StatBox label="Sets" value={setCount.toString()} Colors={Colors} />
        </Animated.View>

        {/* XP gained */}
        <Animated.View
          style={[
            styles.xpRow,
            {
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }],
              backgroundColor: Colors.primary + '15',
              borderColor: Colors.primary + '33',
            },
          ]}>
          <Text style={[styles.xpLabel, { color: Colors.textSecondary }]}>XP Earned</Text>
          <Text style={[styles.xpValue, { color: Colors.primary }]}>+{xpGained}</Text>
        </Animated.View>

        {/* Fitness Score */}
        <Animated.View
          style={[
            styles.fitnessRow,
            {
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }],
              backgroundColor: rankColor + '12',
              borderColor: rankColor + '33',
            },
          ]}>
          <View style={styles.fitnessHeader}>
            <Text style={[styles.fitnessLabel, { color: Colors.textSecondary }]}>Fitness Score</Text>
            <Text style={[styles.fitnessValue, { color: rankColor }]}>{fitnessScore}</Text>
          </View>
          {/* 4 mini breakdown bars */}
          <View style={styles.breakdownRow}>
            <MiniBar label="C" value={fitnessBreakdown.consistency} color={Colors.primary} />
            <MiniBar label="V" value={fitnessBreakdown.volume} color={Colors.secondary} />
            <MiniBar label="P" value={fitnessBreakdown.progression} color={Colors.gold} />
            <MiniBar label="R" value={fitnessBreakdown.variety} color={Colors.bronze} />
          </View>
        </Animated.View>

        {/* Rank Change Banner */}
        {rankChanged && (
          <Animated.View
            style={[
              styles.rankBanner,
              {
                opacity: rankBannerOpacity,
                transform: [{ scale: rankBannerScale }],
                backgroundColor: isPromotion ? rankColor + '22' : Colors.danger + '22',
                borderColor: isPromotion ? rankColor : Colors.danger,
              },
            ]}>
            <View style={styles.rankBannerInner}>
              <RankIcon rank={newRank} size={18} glow glowColor={rankColor} glowIntensity="medium" />
              <Text
                style={[
                  styles.rankBannerText,
                  { color: isPromotion ? rankColor : Colors.danger },
                ]}>
                {isPromotion ? `RANK UP! ${oldRank} → ${newRank}` : `RANK DROP: ${newRank}`}
              </Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

function StatBox({ label, value, Colors }: { label: string; value: string; Colors: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: Colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.miniBarContainer}>
      <Text style={[styles.miniBarLabel, { color }]}>{label}</Text>
      <View style={[styles.miniBarTrack, { backgroundColor: color + '33' }]}>
        <View style={[styles.miniBarFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.miniBarValue, { color }]}>{Math.round(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  card: {
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    width: 320,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  levelUpBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  levelUpText: {
    fontSize: typography.sm,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 70,
  },
  statValue: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    fontFamily: Fonts.mono,
  },
  statLabel: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  xpLabel: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  xpValue: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  fitnessRow: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fitnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fitnessLabel: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  fitnessValue: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Fonts.mono,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  miniBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  miniBarLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  miniBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  miniBarValue: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
  rankBanner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginTop: spacing.xs,
  },
  rankBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankBannerText: {
    fontSize: typography.base,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
