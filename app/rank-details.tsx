/**
 * RANK DETAILS SCREEN
 *
 * Premium breakdown of the Fitness Score system.
 * Hero rank card, animated progress, 4 pillars, formula, tier roadmap.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import {
  SUB_TIERS,
  TIER_THRESHOLDS,
  getTierColor,
  getMainTier,
  getTierProgress,
  getNextTier,
  getPointsToNextTier,
  type SubTier,
  type MainTier,
} from '@/constants/ranks';
import { RankIcon } from '@/components/RankIcon';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

const MAIN_TIERS: MainTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal'];

export default function RankDetailsScreen() {
  const Colors = useTheme();
  const { user } = useUser();

  const currentSubTier = user.rank as SubTier;
  const currentMainTier = getMainTier(currentSubTier);
  const rankColor = getTierColor(currentSubTier, user.theme);
  const tierProgress = getTierProgress(user.fitnessScore, currentSubTier);
  const nextSubTier = getNextTier(currentSubTier);
  const pointsToNext = nextSubTier ? getPointsToNextTier(user.fitnessScore, currentSubTier) : 0;

  // ── Animated progress bar ──
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressPercent = Math.max(tierProgress * 100, 3);

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

  // (No per-element animations on this screen)

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Back Button */}
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
        <Text style={[styles.pageTitle, { color: Colors.text }]}>Rank System</Text>

        {/* ── Hero Rank Card ── */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: Colors.card,
              borderColor: rankColor + '35',
              shadowColor: rankColor,
            },
          ]}>
          {/* Soft glow behind rank */}
          <View style={[styles.glowOrb, { backgroundColor: rankColor + '10' }]} />

          <View style={styles.heroInner}>
            <View style={[styles.tierBadge, { backgroundColor: rankColor + '18' }]}>
              <RankIcon
                rank={currentSubTier}
                size={36}
                glow
                glowColor={rankColor}
                glowIntensity="strong"
                gloss
                animated
              />
              <Text style={[styles.tierName, { color: rankColor }]}>{currentSubTier}</Text>
            </View>

            <View style={styles.scoreRow}>
              <Text style={[styles.scoreNumber, { color: Colors.text }]}>{user.fitnessScore}</Text>
              <Text style={[styles.scoreTotal, { color: Colors.textSecondary }]}>/ 100</Text>
            </View>

            {nextSubTier ? (
              <Text style={[styles.nextTierText, { color: Colors.textSecondary }]}>
                {pointsToNext} point{pointsToNext !== 1 ? 's' : ''} to{' '}
                <Text style={{ color: rankColor, fontWeight: 'bold' }}>{nextSubTier}</Text>
              </Text>
            ) : (
              <Text style={[styles.nextTierText, { color: rankColor }]}>Maximum rank achieved</Text>
            )}

            {/* Progress to next sub-tier — animated */}
            <View style={[styles.tierProgressTrack, { backgroundColor: Colors.border }]}>
              <Animated.View
                style={[
                  styles.tierProgressFill,
                  { width: progressWidth, backgroundColor: rankColor },
                ]}
              />
              <Animated.View
                style={[styles.tierProgressGloss, { width: progressWidth, backgroundColor: Colors.gloss }]}
              />
            </View>

            <Text style={[styles.progressPercentLabel, { color: Colors.textSecondary }]}>
              {Math.round(tierProgress * 100)}% to next rank
            </Text>
          </View>
        </View>

        {/* ── 4 Pillars Section ── */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Score Breakdown</Text>

        <PillarCard
          label="Consistency"
          value={user.fitnessBreakdown.consistency}
          weight={40}
          color={Colors.primary}
          icon="repeat"
          description="Weekly streaks & workout days."
          penalty="Miss a week = -5 × consecutive missed weeks."
          Colors={Colors}
        />
        <PillarCard
          label="Volume"
          value={user.fitnessBreakdown.volume}
          weight={30}
          color={Colors.secondary}
          icon="fitness-center"
          description="Total reps & minutes this month."
          penalty="Low volume directly lowers your score."
          Colors={Colors}
        />
        <PillarCard
          label="Progression"
          value={user.fitnessBreakdown.progression}
          weight={20}
          color={Colors.gold}
          icon="trending-up"
          description="PRs & weight increases month over month."
          penalty="Plateaus slow your climb."
          Colors={Colors}
        />
        <PillarCard
          label="Variety"
          value={user.fitnessBreakdown.variety}
          weight={10}
          color={Colors.bronze}
          icon="category"
          description="Unique exercises & muscle groups used."
          penalty="Repeating the same lifts caps this."
          Colors={Colors}
        />

        {/* ── Formula Card ── */}
        <View
          style={[
            styles.formulaCard,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <View style={styles.formulaHeader}>
            <View style={[styles.formulaIconBox, { backgroundColor: Colors.primary + '18' }]}>
              <MaterialIcons name="functions" size={18} color={Colors.primary} />
            </View>
            <Text style={[styles.formulaTitle, { color: Colors.text }]}>Formula</Text>
          </View>
          <View style={[styles.formulaCodeBlock, { backgroundColor: Colors.background }]}>
            <Text style={[styles.formulaCode, { color: Colors.textSecondary }]}>
              Fitness Score = (Consistency × 0.40) + (Volume × 0.30) + (Progression × 0.20) + (Variety × 0.10)
            </Text>
          </View>
        </View>

        {/* ── Weekly Target Connection ── */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <View style={styles.infoHeader}>
            <View style={[styles.infoIconBox, { backgroundColor: Colors.primary + '18' }]}>
              <MaterialIcons name="fitness-center" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={[styles.infoTitle, { color: Colors.text }]}>Weekly Target</Text>
              <Text style={[styles.infoSubtitle, { color: Colors.textSecondary }]}>
                {user.weeklyTarget} workouts / week
              </Text>
            </View>
          </View>
          <Text style={[styles.infoBody, { color: Colors.textSecondary }]}>
            Hitting this maximizes your Consistency score (40% of your total). Missing weeks applies
            escalating penalties that can drop your sub-tier.
          </Text>
        </View>

        {/* ── All Tiers ── */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>All Tiers</Text>

        {MAIN_TIERS.map((mainTier) => {
          const mainColor = getTierColor(mainTier + ' 1', user.theme);
          const subTiersInGroup = SUB_TIERS.filter((st) => getMainTier(st) === mainTier);
          const isCurrentMainTier = mainTier === currentMainTier;

          return (
            <View
              key={mainTier}
              style={[
                styles.tierGroup,
                {
                  backgroundColor: Colors.card,
                  borderColor: isCurrentMainTier ? mainColor + '40' : Colors.border,
                  shadowColor: Colors.shadow,
                },
                isCurrentMainTier && styles.tierGroupActive,
              ]}>
              {/* Left accent bar for current tier */}
              {isCurrentMainTier && (
                <View style={[styles.tierAccentBar, { backgroundColor: mainColor }]} />
              )}

              <View style={{ flex: 1 }}>
                {/* Main tier header */}
                <View style={[styles.tierGroupHeader, { borderBottomColor: Colors.border }]}>
                  <View style={styles.tierGroupTitleRow}>
                    <RankIcon rank={mainTier} size={20} glow glowColor={mainColor} glowIntensity="subtle" />
                    <Text
                      style={[
                        styles.tierGroupName,
                        { color: isCurrentMainTier ? mainColor : Colors.text },
                      ]}>
                      {mainTier}
                    </Text>
                  </View>
                  {isCurrentMainTier && (
                    <View style={[styles.currentBadge, { backgroundColor: mainColor + '18' }]}>
                      <Text style={[styles.currentBadgeText, { color: mainColor }]}>Current</Text>
                    </View>
                  )}
                </View>

                {/* Sub-tiers */}
                {subTiersInGroup.map((subTier, index) => {
                  const isUnlocked = user.fitnessScore >= TIER_THRESHOLDS[subTier];
                  const isCurrent = subTier === currentSubTier;
                  const threshold = TIER_THRESHOLDS[subTier];

                  return (
                    <View
                      key={subTier}
                      style={[
                        styles.subTierRow,
                        index < subTiersInGroup.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: Colors.border + '30',
                        },
                        isCurrent && { backgroundColor: mainColor + '08' },
                      ]}>
                      <View style={styles.subTierLeft}>
                        <Text
                          style={[
                            styles.subTierName,
                            {
                              color: isCurrent
                                ? mainColor
                                : isUnlocked
                                  ? Colors.text
                                  : Colors.textSecondary,
                            },
                          ]}>
                          {subTier}
                        </Text>
                        <Text style={[styles.subTierThreshold, { color: Colors.textSecondary }]}>
                          {threshold}+ pts
                        </Text>
                      </View>
                      <View style={styles.subTierRight}>
                        {isCurrent ? (
                          <MaterialIcons name="radio-button-checked" size={22} color={mainColor} />
                        ) : isUnlocked ? (
                          <MaterialIcons name="check-circle" size={22} color={Colors.primary} />
                        ) : (
                          <MaterialIcons name="lock" size={20} color={Colors.textSecondary + '80'} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function PillarCard({
  label,
  value,
  weight,
  color,
  icon,
  description,
  penalty,
  Colors,
}: {
  label: string;
  value: number;
  weight: number;
  color: string;
  icon: string;
  description: string;
  penalty: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={[
        styles.pillarCard,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.border,
          shadowColor: Colors.shadow,
        },
      ]}>
      {/* Top row: icon + label/weight/description on left, big value on right */}
      <View style={styles.pillarTopRow}>
        <View style={styles.pillarTopLeft}>
          <View style={[styles.pillarIconBox, { backgroundColor: color + '18' }]}>
            {/* @ts-ignore — MaterialIcons name is dynamic */}
            <MaterialIcons name={icon} size={18} color={color} />
          </View>
          <View style={styles.pillarInfo}>
            <View style={styles.pillarLabelRow}>
              <Text style={[styles.pillarLabel, { color: Colors.text }]}>{label}</Text>
              <View style={[styles.weightBadge, { backgroundColor: color + '15' }]}>
                <Text style={[styles.weightText, { color }]}>{weight}%</Text>
              </View>
            </View>
            <Text style={[styles.pillarDescription, { color: Colors.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          </View>
        </View>
        <Text style={[styles.pillarValue, { color }]}>{Math.round(value)}</Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.pillarTrack, { backgroundColor: Colors.border }]}>
        <View style={[styles.pillarFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
        <View style={[styles.pillarFillGloss, { width: `${Math.min(value, 100)}%`, backgroundColor: Colors.gloss }]} />
      </View>

      {/* Penalty tip */}
      <Text style={[styles.pillarPenalty, { color: Colors.danger + 'CC' }]}>{penalty}</Text>
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
    minHeight: touch.minHeight,
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

  /* ── Hero Rank Card ── */
  heroCard: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.xs,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -40,
    alignSelf: 'center',
  },
  heroInner: {
    width: '100%',
    padding: spacing['2xl'],
    alignItems: 'center',
    zIndex: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tierDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  tierName: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  scoreNumber: {
    fontSize: typography['4xl'],
    fontWeight: 'bold',
  },
  scoreTotal: {
    fontSize: typography.xl,
    marginLeft: spacing.xs,
  },
  nextTierText: {
    fontSize: typography.base,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  tierProgressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  tierProgressGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '50%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  progressPercentLabel: {
    fontSize: typography.xs,
    fontWeight: '500',
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },

  /* ── Pillar Card ── */
  pillarCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pillarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  pillarTopLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: spacing.md,
  },
  pillarIconBox: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: spacing.md,
  },
  pillarInfo: {
    flex: 1,
  },
  pillarLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  pillarLabel: {
    fontSize: typography.lg,
    fontWeight: '600',
  },
  pillarDescription: {
    fontSize: typography.sm,
    lineHeight: 18,
  },
  pillarValue: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
    marginTop: 2,
  },
  weightBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  weightText: {
    fontSize: typography.xs,
    fontWeight: 'bold',
  },
  pillarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  pillarFill: {
    height: '100%',
    borderRadius: 4,
  },
  pillarFillGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '50%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  pillarPenalty: {
    fontSize: typography.xs,
    lineHeight: 16,
  },

  /* ── Formula Card ── */
  formulaCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  formulaIconBox: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formulaTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  formulaCodeBlock: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  formulaCode: {
    fontSize: typography.sm,
    lineHeight: 22,
  },

  /* ── Info Card ── */
  infoCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  infoIconBox: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    fontSize: typography.sm,
    marginTop: 2,
  },
  infoBody: {
    fontSize: typography.sm,
    lineHeight: 20,
    marginLeft: touch.iconContainer + spacing.md,
  },

  /* ── Tier Groups ── */
  tierGroup: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
  },
  tierGroupActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  tierAccentBar: {
    width: 4,
  },
  tierGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  tierGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tierGroupDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  tierGroupName: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  currentBadgeText: {
    fontSize: typography.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  subTierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  subTierName: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  subTierThreshold: {
    fontSize: typography.xs,
  },
  subTierRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    overflow: 'visible',
  },
  // (Current tier uses MaterialIcons radio-button-checked instead of custom ring)
});
