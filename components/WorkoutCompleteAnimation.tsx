/**
 * WORKOUT COMPLETE ANIMATION
 *
 * Full-screen celebratory overlay shown when the user finishes a workout.
 *
 * Layout (top→bottom):
 *   - Scattered confetti dots (static, no animation)
 *   - Glowing gradient ring (primary→secondary) + "Workout Complete!" + streak pill
 *   - 3-card stat grid (duration, exercises, sets)
 *   - PR row (conditional — only when prAchieved)
 *   - XP + level progress bar (fills on entrance, 600ms)
 *   - Fitness score + 4-pillar mini breakdown bars
 *   - Rank change banner (conditional — only when rankChanged)
 *   - 6s countdown drain bar + "tap anywhere to dismiss"
 *
 * Dismiss: auto after 6s OR tap anywhere → 400ms fade-out → onComplete()
 *
 * Animation driver notes:
 *   - All opacity/transform: useNativeDriver: true
 *   - XP bar width + countdown bar width: useNativeDriver: false (width-based)
 *   - Non-native animations are started as side-effects alongside native ones,
 *     never mixed inside the same Animated.parallel() call.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { RankIcon } from '@/components/RankIcon';
import { FitnessBreakdown, getTierColor } from '@/constants/ranks';
import { spacing, radius, typography } from '@/constants/design';

interface WorkoutCompleteAnimationProps {
  durationSeconds: number;
  exerciseCount: number;
  setCount: number;
  xpGained: number;
  leveledUp: boolean;
  fitnessScore: number;
  fitnessBreakdown: FitnessBreakdown;
  rankChanged: boolean;
  newRank: string;
  oldRank: string;
  prAchieved: boolean;
  /** e.g. "Bench Press: 100kg × 5  ·  Squat: 140kg × 3" */
  prDetails: string;
  newLevel: number;
  /** XP total after this workout */
  newXp: number;
  /** XP required to reach next level */
  newXpToNextLevel: number;
  /** Current streak after this workout */
  currentStreak: number;
  onComplete: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConfettiDots({ Colors }: { Colors: ReturnType<typeof useTheme> }) {
  const dots = [
    { top: '3%',  left: '10%', w: 5, h: 5, color: Colors.primary,       opacity: 0.45, br: radius.full },
    { top: '7%',  left: '83%', w: 6, h: 6, color: Colors.secondary,     opacity: 0.40, br: radius.full },
    { top: '2%',  left: '52%', w: 4, h: 4, color: Colors.gold,          opacity: 0.55, br: radius.full },
    { top: '13%', left: '91%', w: 3, h: 3, color: Colors.primary,       opacity: 0.30, br: radius.full },
    { top: '17%', left: '5%',  w: 6, h: 6, color: Colors.secondary,     opacity: 0.30, br: 2 },
    { top: '10%', left: '68%', w: 4, h: 3, color: Colors.gold,          opacity: 0.30, br: 1 },
    { top: '22%', left: '25%', w: 3, h: 3, color: Colors.primary,       opacity: 0.20, br: radius.full },
    { top: '19%', left: '74%', w: 5, h: 3, color: Colors.secondary,     opacity: 0.25, br: 1 },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: d.top as any,
            left: d.left as any,
            width: d.w,
            height: d.h,
            borderRadius: d.br,
            backgroundColor: d.color,
            opacity: d.opacity,
          }}
        />
      ))}
    </>
  );
}

function StatCard({
  label,
  value,
  Colors,
}: {
  label: string;
  value: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
      <Text style={[styles.statValue, { color: Colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.miniBar}>
      <Text style={[styles.miniBarLabel, { color }]}>{label}</Text>
      <View style={[styles.miniBarTrack, { backgroundColor: color + '33' }]}>
        <View
          style={[
            styles.miniBarFill,
            { width: `${Math.min(Math.round(value), 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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
  prAchieved,
  prDetails,
  newLevel,
  newXp,
  newXpToNextLevel,
  currentStreak,
  onComplete,
}: WorkoutCompleteAnimationProps) {
  const Colors = useTheme();
  const isDismissedRef = useRef(false);

  // ── Native-driver animations (opacity + transform) ──
  const backdropOpacity   = useRef(new Animated.Value(0)).current;
  const ringScale         = useRef(new Animated.Value(0)).current;
  const headerOpacity     = useRef(new Animated.Value(0)).current;
  const statsTranslateY   = useRef(new Animated.Value(20)).current;
  const statsOpacity      = useRef(new Animated.Value(0)).current;
  const xpOpacity         = useRef(new Animated.Value(0)).current;
  const fitnessTranslateY = useRef(new Animated.Value(20)).current;
  const fitnessOpacity    = useRef(new Animated.Value(0)).current;
  const rankScale         = useRef(new Animated.Value(0.85)).current;
  const rankOpacity       = useRef(new Animated.Value(0)).current;

  // ── Non-native-driver animations (width-based) ──
  const xpBarAnim     = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  const xpProgress = newXpToNextLevel > 0
    ? Math.min(newXp / newXpToNextLevel, 1)
    : 0;

  const rankColor   = getTierColor(newRank);
  const isPromotion = rankChanged && fitnessScore > 0;

  // Width interpolations for the two non-native bars
  const xpBarWidth = xpBarAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });
  const countdownWidth = countdownAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ── Dismiss handler ──────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (isDismissedRef.current) return;
    isDismissedRef.current = true;
    countdownAnim.stopAnimation();
    xpBarAnim.stopAnimation();
    Animated.parallel([
      Animated.timing(backdropOpacity,   { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(headerOpacity,     { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(statsOpacity,      { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(xpOpacity,         { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fitnessOpacity,    { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(rankOpacity,       { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onComplete());
  }, [onComplete]);

  // ── Entrance animation sequence ──────────────────────────────────────────
  useEffect(() => {
    // Phase 1 — backdrop (300ms)
    Animated.timing(backdropOpacity, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start(() => {

      // Phase 2 — ring springs in + header fades in
      Animated.parallel([
        Animated.spring(ringScale,         { toValue: 1,  friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(headerOpacity,     { toValue: 1,  duration: 350, useNativeDriver: true }),
      ]).start(() => {

        // Phase 3 — stat cards (+ PR row) slide up
        Animated.parallel([
          Animated.timing(statsOpacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(statsTranslateY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start(() => {

          // Phase 4 — XP bar fills (non-native, started separately) + XP/fitness fade in (native)
          Animated.timing(xpBarAnim, {
            toValue: xpProgress, duration: 600, useNativeDriver: false,
          }).start();

          Animated.parallel([
            Animated.timing(xpOpacity,         { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(fitnessOpacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(fitnessTranslateY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
          ]).start(() => {

            // Phase 5 — rank banner (conditional), then countdown
            const startCountdown = () => {
              Animated.timing(countdownAnim, {
                toValue: 0, duration: 6000, useNativeDriver: false,
              }).start(({ finished }) => {
                if (finished) dismiss();
              });
            };

            if (rankChanged) {
              Animated.parallel([
                Animated.spring(rankScale,   { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
                Animated.timing(rankOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
              ]).start(startCountdown);
            } else {
              startCountdown();
            }
          });
        });
      });
    });

    return () => {
      countdownAnim.stopAnimation();
      xpBarAnim.stopAnimation();
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <TouchableWithoutFeedback onPress={dismiss}>
      <View style={styles.container} pointerEvents="auto">

        {/* Dark backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

        {/* Confetti (position: absolute, renders behind content) */}
        <ConfettiDots Colors={Colors} />

        {/* Scrollable content */}
        <View style={styles.content}>

          {/* ── Header: ring + title + streak pill ── */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <Animated.View
              style={[styles.ringWrapper, { transform: [{ scale: ringScale }] }]}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ring}>
                <Text style={styles.ringCheck}>✓</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={[styles.title, { color: Colors.text }]}>Workout Complete!</Text>

            {currentStreak > 0 && (
              <View
                style={[
                  styles.streakPill,
                  { backgroundColor: Colors.gold + '20', borderColor: Colors.gold + '55' },
                ]}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[styles.streakText, { color: Colors.gold }]}>
                  {currentStreak}-Day Streak
                </Text>
              </View>
            )}

            {leveledUp && (
              <View
                style={[
                  styles.levelUpBadge,
                  { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
                ]}>
                <Text style={[styles.levelUpText, { color: Colors.secondary }]}>LEVEL UP!</Text>
              </View>
            )}
          </Animated.View>

          {/* ── Stat cards ── */}
          <Animated.View
            style={[
              styles.statCards,
              { opacity: statsOpacity, transform: [{ translateY: statsTranslateY }] },
            ]}>
            <StatCard label="Duration"  value={formatDuration(durationSeconds)} Colors={Colors} />
            <StatCard label="Exercises" value={exerciseCount.toString()}         Colors={Colors} />
            <StatCard label="Sets"      value={setCount.toString()}              Colors={Colors} />
          </Animated.View>

          {/* ── PR row (conditional) ── */}
          {prAchieved && (
            <Animated.View
              style={[
                styles.prRow,
                {
                  opacity:         statsOpacity,
                  transform:       [{ translateY: statsTranslateY }],
                  backgroundColor: Colors.gold + '14',
                  borderColor:     Colors.gold + '55',
                },
              ]}>
              <View style={styles.prHeader}>
                <Text style={styles.prEmoji}>🎯</Text>
                <Text style={[styles.prTitle, { color: Colors.gold }]}>
                  Personal Record{prDetails.includes('·') ? 's' : ''}!
                </Text>
              </View>
              {!!prDetails && (
                <Text style={[styles.prDetails, { color: Colors.gold + 'CC' }]}>
                  {prDetails}
                </Text>
              )}
            </Animated.View>
          )}

          {/* ── XP + level bar ── */}
          <Animated.View
            style={[
              styles.xpSection,
              {
                opacity:         xpOpacity,
                backgroundColor: Colors.primary + '10',
                borderColor:     Colors.primary + '33',
              },
            ]}>
            <View style={styles.xpTop}>
              <View>
                <Text style={[styles.xpEarned, { color: Colors.primary }]}>+{xpGained} XP</Text>
                <Text style={[styles.xpEarnedLbl, { color: Colors.textSecondary }]}>
                  Earned this session
                </Text>
              </View>
              <View style={styles.xpLevelInfo}>
                <Text style={[styles.xpLevelNum, { color: Colors.text }]}>Level {newLevel}</Text>
                <Text style={[styles.xpLevelSub, { color: Colors.textSecondary }]}>
                  {newXp} / {newXpToNextLevel} to Lvl {newLevel + 1}
                </Text>
              </View>
            </View>
            <View style={[styles.xpBarTrack, { backgroundColor: Colors.border }]}>
              <Animated.View style={[styles.xpBarFill, { width: xpBarWidth }]}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <View style={styles.xpBarLabels}>
              <Text style={[styles.xpBarLbl, { color: Colors.textSecondary }]}>
                Lvl {newLevel}
              </Text>
              <Text style={[styles.xpBarLbl, { color: Colors.textSecondary }]}>
                Lvl {newLevel + 1}
              </Text>
            </View>
          </Animated.View>

          {/* ── Fitness score ── */}
          <Animated.View
            style={[
              styles.fitnessRow,
              {
                opacity:         fitnessOpacity,
                transform:       [{ translateY: fitnessTranslateY }],
                backgroundColor: rankColor + '12',
                borderColor:     rankColor + '38',
              },
            ]}>
            <View style={styles.fitnessLeft}>
              <Text style={[styles.fitnessLabel, { color: Colors.textSecondary }]}>
                Fitness Score
              </Text>
              <View style={styles.fitnessBars}>
                <MiniBar label="C" value={fitnessBreakdown.consistency} color={Colors.primary} />
                <MiniBar label="V" value={fitnessBreakdown.volume}      color={Colors.secondary} />
                <MiniBar label="P" value={fitnessBreakdown.progression} color={Colors.gold} />
                <MiniBar label="R" value={fitnessBreakdown.variety}     color={Colors.textSecondary} />
              </View>
            </View>
            <Text style={[styles.fitnessScore, { color: rankColor }]}>{fitnessScore}</Text>
          </Animated.View>

          {/* ── Rank change banner (conditional) ── */}
          {rankChanged && (
            <Animated.View
              style={[
                styles.rankRow,
                {
                  opacity:         rankOpacity,
                  transform:       [{ scale: rankScale }],
                  backgroundColor: isPromotion ? rankColor + '18' : Colors.danger + '18',
                  borderColor:     isPromotion ? rankColor + '66' : Colors.danger + '66',
                },
              ]}>
              <RankIcon rank={newRank} size={20} glow glowColor={rankColor} glowIntensity="medium" />
              <View>
                <Text style={[styles.rankText, { color: isPromotion ? rankColor : Colors.danger }]}>
                  {isPromotion ? `⬆ RANK UP — ${newRank}!` : `⬇ Rank Drop: ${newRank}`}
                </Text>
                <Text style={[styles.rankSub, { color: Colors.textSecondary }]}>
                  Previous: {oldRank}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* ── Countdown drain bar ── */}
          <View style={styles.countdownWrap}>
            <View style={[styles.countdownTrack, { backgroundColor: Colors.border }]}>
              <Animated.View style={[styles.countdownFill, { width: countdownWidth }]}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <Text style={[styles.countdownLbl, { color: Colors.textSecondary }]}>
              Auto-closing · tap anywhere to dismiss
            </Text>
          </View>

        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ringWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: spacing.md,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringCheck: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '900',
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: typography.sm,
    fontWeight: '800',
  },
  levelUpBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  levelUpText: {
    fontSize: typography.sm,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ── Stat cards ──
  statCards: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  statValue: {
    fontSize: typography.xl,
    fontWeight: '900',
    fontFamily: Fonts.mono,
  },
  statLabel: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },

  // ── PR row ──
  prRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  prEmoji: {
    fontSize: 14,
  },
  prTitle: {
    fontSize: typography.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prDetails: {
    fontSize: typography.xs,
    lineHeight: 18,
  },

  // ── XP section ──
  xpSection: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  xpTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  xpEarned: {
    fontSize: typography['2xl'],
    fontWeight: '900',
  },
  xpEarnedLbl: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  xpLevelInfo: {
    alignItems: 'flex-end',
  },
  xpLevelNum: {
    fontSize: typography.base,
    fontWeight: '900',
  },
  xpLevelSub: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  xpBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  xpBarLbl: {
    fontSize: typography.xs,
  },

  // ── Fitness row ──
  fitnessRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fitnessLeft: {
    flex: 1,
  },
  fitnessLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  fitnessBars: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fitnessScore: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: Fonts.mono,
  },
  miniBar: {
    width: 28,
    alignItems: 'center',
    gap: spacing.xs,
  },
  miniBarLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  miniBarTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Rank row ──
  rankRow: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rankText: {
    fontSize: typography.sm,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rankSub: {
    fontSize: typography.xs,
    marginTop: 2,
  },

  // ── Countdown ──
  countdownWrap: {
    marginTop: spacing.md,
  },
  countdownTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  countdownFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  countdownLbl: {
    fontSize: typography.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
