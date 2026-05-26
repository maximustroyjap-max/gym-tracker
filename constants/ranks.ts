/**
 * RANK SYSTEM — Solo League Tier System with Sub-Tiers
 *
 * Fitness Score (0-100) determines sub-tier. Computed from 4 pillars:
 *   Consistency 40% | Volume 30% | Progression 20% | Variety 10%
 *
 * Tiers: Bronze 1-3 → Silver 1-3 → Gold 1-3 → Platinum 1-3 → Diamond 1-3 → Immortal
 *
 * Thresholds are exponentially spaced — early tiers are close,
 * later tiers require significantly more points.
 */

import { User, WeeklyWorkout, ThemeName } from '@/types/user';

export const SUB_TIERS = [
  'Bronze 1',
  'Bronze 2',
  'Bronze 3',
  'Silver 1',
  'Silver 2',
  'Silver 3',
  'Gold 1',
  'Gold 2',
  'Gold 3',
  'Platinum 1',
  'Platinum 2',
  'Platinum 3',
  'Diamond 1',
  'Diamond 2',
  'Diamond 3',
  'Immortal',
] as const;

export type SubTier = (typeof SUB_TIERS)[number];

export type MainTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Immortal';

/** Minimum score required to enter each sub-tier.
 *  Gaps increase from Bronze → Gold, then compress at Diamond for elite difficulty.
 */
export const TIER_THRESHOLDS: Record<SubTier, number> = {
  'Bronze 1': 0,
  'Bronze 2': 5,
  'Bronze 3': 10,
  'Silver 1': 16,
  'Silver 2': 23,
  'Silver 3': 31,
  'Gold 1': 40,
  'Gold 2': 50,
  'Gold 3': 61,
  'Platinum 1': 72,
  'Platinum 2': 82,
  'Platinum 3': 91,
  'Diamond 1': 96,
  'Diamond 2': 98,
  'Diamond 3': 99,
  'Immortal': 100,
};

/** Dark-mode rank colors */
const DARK_TIER_COLORS: Record<MainTier, string> = {
  Bronze: '#b46432',
  Silver: '#b0b8c4',
  Gold: '#ffb900',
  Platinum: '#00dcc8',
  Diamond: '#64a0ff',
  Immortal: '#ff3c78',
};

/** Light-mode rank colors (darker variants for white-card readability) */
const LIGHT_TIER_COLORS: Record<MainTier, string> = {
  Bronze: '#CD7F32',
  Silver: '#8A8A8A',
  Gold: '#B8860B',
  Platinum: '#9E9E9E',
  Diamond: '#00A8E8',
  Immortal: '#FF0040',
};

/** Sunset-mode rank colors (warm coral + red palette) */
const SUNSET_TIER_COLORS: Record<MainTier, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#FFCBA4',
  Diamond: '#FFA586',
  Immortal: '#FF2D55',
};

/** Get the appropriate tier color map for a theme */
function getTierColorMap(theme: ThemeName = 'dark'): Record<MainTier, string> {
  if (theme === 'light') return LIGHT_TIER_COLORS;
  if (theme === 'sunset') return SUNSET_TIER_COLORS;
  return DARK_TIER_COLORS;
}

/** Extract the main tier from a sub-tier name, e.g. "Gold 2" → "Gold" */
export function getMainTier(subTier: SubTier | string): MainTier {
  if (subTier === 'Immortal') return 'Immortal';
  const main = subTier.split(' ')[0] as MainTier;
  return DARK_TIER_COLORS[main] ? main : 'Bronze';
}

/** Get the color for any sub-tier (uses its main tier's color) */
export function getTierColor(subTier: SubTier | string, theme?: ThemeName): string {
  const map = getTierColorMap(theme);
  return map[getMainTier(subTier)] || '#CD7F32';
}

/** Get the sub-tier for a given fitness score */
export function getTierForScore(score: number): SubTier {
  for (let i = SUB_TIERS.length - 1; i >= 0; i--) {
    if (score >= TIER_THRESHOLDS[SUB_TIERS[i]]) {
      return SUB_TIERS[i];
    }
  }
  return 'Bronze 1';
}

/** Get the next sub-tier above the given one, or null if maxed */
export function getNextTier(subTier: SubTier): SubTier | null {
  const idx = SUB_TIERS.indexOf(subTier);
  return idx < SUB_TIERS.length - 1 ? SUB_TIERS[idx + 1] : null;
}

/** Get the previous sub-tier below the given one, or null if at bottom */
export function getPreviousTier(subTier: SubTier): SubTier | null {
  const idx = SUB_TIERS.indexOf(subTier);
  return idx > 0 ? SUB_TIERS[idx - 1] : null;
}

/** Progress within current sub-tier: 0-1 */
export function getTierProgress(score: number, subTier: SubTier): number {
  const threshold = TIER_THRESHOLDS[subTier];
  const nextTier = getNextTier(subTier);
  if (!nextTier) return 1;
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  const range = nextThreshold - threshold;
  return Math.min(Math.max((score - threshold) / range, 0), 1);
}

/** Points needed to reach the NEXT sub-tier from current score */
export function getPointsToNextTier(score: number, subTier: SubTier): number {
  const next = getNextTier(subTier);
  if (!next) return 0;
  return Math.max(0, TIER_THRESHOLDS[next] - score);
}

/** Migrate old rank names (e.g. "Bronze") to new sub-tier names (e.g. "Bronze 1") */
export function migrateOldRank(oldRank: string): SubTier {
  const mapping: Record<string, SubTier> = {
    Bronze: 'Bronze 1',
    Silver: 'Silver 1',
    Gold: 'Gold 1',
    Platinum: 'Platinum 1',
    Diamond: 'Diamond 1',
    Immortal: 'Immortal',
  };
  return mapping[oldRank] || 'Bronze 1';
}

/**
 * Calculate the current weekly streak.
 *
 * A "successful streak week" = the user completed at least `weeklyTarget` workouts.
 * Streak = consecutive successful weeks going backwards from the current week.
 * If the current week hasn't met the target yet, it's NOT counted (ongoing weeks
 * don't break the streak — they just don't extend it yet).
 *
 * @param weeklyHistory  Array of { weekStart, count } entries
 * @param weeklyTarget   Target workouts per week
 * @returns              Number of consecutive successful weeks
 */
export function calculateWeeklyStreak(
  weeklyHistory: WeeklyWorkout[],
  weeklyTarget: number
): number {
  if (weeklyTarget <= 0) return 0;

  const historyMap = new Map(weeklyHistory.map((w) => [w.weekStart, w.count]));

  // Current week's Monday
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const currentMonday = new Date(today);
  currentMonday.setDate(diff);

  let streak = 0;

  // Check current week — only counts if target is already met
  const currentWeekKey = currentMonday.toISOString().split('T')[0];
  const currentCount = historyMap.get(currentWeekKey) || 0;
  if (currentCount >= weeklyTarget) {
    streak++;
  }

  // Check past weeks going backwards
  for (let i = 1; i < 52; i++) {
    const pastMonday = new Date(currentMonday);
    pastMonday.setDate(pastMonday.getDate() - i * 7);
    const weekKey = pastMonday.toISOString().split('T')[0];
    const count = historyMap.get(weekKey) || 0;

    if (count >= weeklyTarget) {
      streak++;
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

// ───────────────────────────────────────────────
// 4 PILLAR SCORE CALCULATIONS (unchanged)
// ───────────────────────────────────────────────

/** Parse "100 kg × 10" → { kg: 100, reps: 10 } */
function parseBestSet(bestSet: string): { kg: number; reps: number } {
  const match = bestSet.match(/([\d.]+)\s*kg\s*×\s*(\d+)/);
  if (match) {
    return { kg: parseFloat(match[1]) || 0, reps: parseInt(match[2]) || 0 };
  }
  return { kg: 0, reps: 0 };
}

/** Get the start of current month as YYYY-MM */
function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Get month key for a date */
function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Get month key for N months ago */
function getMonthKeyOffset(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Build a full 4-week history including empty weeks */
function buildFourWeekHistory(weeklyHistory: WeeklyWorkout[]): WeeklyWorkout[] {
  const result: WeeklyWorkout[] = [];
  const today = new Date();

  for (let i = 3; i >= 0; i--) {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - i * 7);
    const day = weekDate.getDay();
    const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(weekDate);
    monday.setDate(diff);
    const key = monday.toISOString().split('T')[0];

    const existing = weeklyHistory.find((w) => w.weekStart === key);
    result.push(existing || { weekStart: key, count: 0 });
  }
  return result;
}

// ─── Consistency (40%) ───
function calculateConsistency(user: User): number {
  const { currentStreak, weeklyTarget, weeklyHistory } = user;

  const streakPoints = Math.min(currentStreak, 10) * 5;

  const fourWeeks = buildFourWeekHistory(weeklyHistory);
  let weeklyPoints = 0;
  for (const week of fourWeeks) {
    if (weeklyTarget <= 0) continue;
    const ratio = Math.min(week.count / weeklyTarget, 1);
    weeklyPoints += ratio * 12.5;
  }

  let missedWeekPenalty = 0;
  let consecutiveMissed = 0;
  for (const week of fourWeeks) {
    if (weeklyTarget > 0 && week.count === 0) {
      consecutiveMissed += 1;
      missedWeekPenalty += 5 * consecutiveMissed;
    } else {
      consecutiveMissed = 0;
    }
  }

  return Math.max(0, Math.min(100, streakPoints + weeklyPoints - missedWeekPenalty));
}

// ─── Volume (30%) ───
function calculateVolume(user: User): number {
  const { workoutHistory, monthlyVolumeGoal, weeklyTarget } = user;
  const currentMonth = getCurrentMonthKey();

  const monthWorkouts = workoutHistory.filter((w) => getMonthKey(w.date) === currentMonth);

  let thisMonthReps = 0;
  for (const workout of monthWorkouts) {
    for (const ex of workout.exercises) {
      const parsed = parseBestSet(ex.bestSet);
      thisMonthReps += parsed.reps * ex.sets;
    }
  }
  const repsGoal = monthlyVolumeGoal > 0 ? monthlyVolumeGoal : 1000;
  const repsScore = Math.min(thisMonthReps / repsGoal, 1) * 60;

  const thisMonthMinutes = monthWorkouts.reduce((sum, w) => sum + w.duration / 60, 0);
  const expectedMonthlyMinutes = weeklyTarget * 4 * 45;
  const timeScore =
    expectedMonthlyMinutes > 0
      ? Math.min(thisMonthMinutes / expectedMonthlyMinutes, 1) * 40
      : 0;

  return Math.min(100, repsScore + timeScore);
}

// ─── Progression (20%) ───
function calculateProgression(user: User): number {
  const { workoutHistory } = user;

  const totalPRs = workoutHistory.filter((w) => w.prAchieved).length;
  const prScore = Math.min(totalPRs / 15, 1) * 60;

  const thisMonth = getCurrentMonthKey();
  const lastMonth = getMonthKeyOffset(1);

  const thisMonthWorkouts = workoutHistory.filter((w) => getMonthKey(w.date) === thisMonth);
  const lastMonthWorkouts = workoutHistory.filter((w) => getMonthKey(w.date) === lastMonth);

  const thisMonthWeights: number[] = [];
  for (const w of thisMonthWorkouts) {
    for (const ex of w.exercises) {
      const parsed = parseBestSet(ex.bestSet);
      if (parsed.kg > 0) thisMonthWeights.push(parsed.kg);
    }
  }

  const lastMonthWeights: number[] = [];
  for (const w of lastMonthWorkouts) {
    for (const ex of w.exercises) {
      const parsed = parseBestSet(ex.bestSet);
      if (parsed.kg > 0) lastMonthWeights.push(parsed.kg);
    }
  }

  let trendScore = 0;
  const thisAvg =
    thisMonthWeights.length > 0
      ? thisMonthWeights.reduce((a, b) => a + b, 0) / thisMonthWeights.length
      : 0;
  const lastAvg =
    lastMonthWeights.length > 0
      ? lastMonthWeights.reduce((a, b) => a + b, 0) / lastMonthWeights.length
      : 0;

  if (lastAvg > 0) {
    const trend = (thisAvg - lastAvg) / lastAvg;
    trendScore = Math.max(-20, Math.min(trend * 200, 40));
  } else if (thisAvg > 0) {
    trendScore = Math.min(thisAvg / 100, 1) * 20;
  }

  return Math.max(0, Math.min(100, prScore + trendScore));
}

// ─── Variety (10%) ───
function calculateVariety(user: User): number {
  const { workoutHistory } = user;

  const uniqueExercises = new Set<string>();
  const uniqueBodyParts = new Set<string>();

  for (const workout of workoutHistory) {
    for (const ex of workout.exercises) {
      uniqueExercises.add(ex.exerciseId);
      uniqueBodyParts.add(ex.bodyPart);
    }
  }

  const exerciseScore = Math.min(uniqueExercises.size / 25, 1) * 50;
  const bodyPartScore = Math.min(uniqueBodyParts.size / 10, 1) * 50;

  return Math.min(100, exerciseScore + bodyPartScore);
}

// ───────────────────────────────────────────────
// MAIN ENTRY POINT
// ───────────────────────────────────────────────

/** Breakdown of the 4 sub-scores */
export interface FitnessBreakdown {
  consistency: number;
  volume: number;
  progression: number;
  variety: number;
}

/** Result of a full fitness score calculation */
export interface FitnessResult {
  score: number;
  breakdown: FitnessBreakdown;
}

/** Calculate full Fitness Score + breakdown for a user */
export function calculateFitnessScore(user: User): FitnessResult {
  const consistency = calculateConsistency(user);
  const volume = calculateVolume(user);
  const progression = calculateProgression(user);
  const variety = calculateVariety(user);

  const score = Math.round(
    consistency * 0.4 + volume * 0.3 + progression * 0.2 + variety * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: { consistency, volume, progression, variety },
  };
}
