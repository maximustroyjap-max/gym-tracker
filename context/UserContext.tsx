/**
 * USER CONTEXT — "The Brain" of the App
 *
 * All user data is now stored in Supabase (PostgreSQL) instead of AsyncStorage.
 * The profiles table holds everything: scalars, JSONB settings, and JSONB arrays
 * for workouts, templates, exercises, and weekly history.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { User, DEFAULT_USER, createEmptyUser } from '@/types/user';
import { calculateFitnessScore, getTierForScore, checkStreakExpiry } from '@/constants/ranks';

interface UserContextType {
  user: User;
  updateUser: (updates: Partial<User>) => void;
  resetUser: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function generateFriendCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Map camelCase User field names to snake_case DB column names */
const FIELD_MAP: Record<string, string> = {
  username: 'username',
  avatar: 'avatar',
  theme: 'theme',
  level: 'level',
  xp: 'xp',
  xpToNextLevel: 'xp_to_next_level',
  rank: 'rank',
  rankCredits: 'rank_credits',
  rankCreditsToNext: 'rank_credits_to_next',
  totalWorkouts: 'total_workouts',
  currentStreak: 'current_streak',
  bestStreak: 'best_streak',
  lastWorkoutDate: 'last_workout_date',
  totalHours: 'total_hours',
  weeklyTarget: 'weekly_target',
  monthlyVolumeGoal: 'monthly_volume_goal',
  personalGoal: 'personal_goal',
  fitnessScore: 'fitness_score',
  fitnessBreakdown: 'fitness_breakdown',
  bodyMeasurements: 'body_measurements',
  notificationSettings: 'notification_settings',
  advancedSettings: 'advanced_settings',
  restTimerSettings: 'rest_timer_settings',
  hiddenExerciseIds: 'hidden_exercise_ids',
  myTemplates: 'templates',
  templateFolders: 'template_folders',
  customExercises: 'custom_exercises',
  workoutHistory: 'workout_history',
  weeklyHistory: 'weekly_history',
  friendCode: 'friend_code',
};

/** Convert a Supabase profiles row into our app's User object */
function profileToUser(profile: any): User {
  return {
    username: profile.username ?? 'GymNewbie',
    avatar: profile.avatar ?? '',
    theme: profile.theme ?? 'dark',
    level: profile.level ?? 1,
    xp: profile.xp ?? 0,
    xpToNextLevel: profile.xp_to_next_level ?? 100,
    rank: profile.rank ?? 'Bronze 1',
    rankCredits: profile.rank_credits ?? 0,
    rankCreditsToNext: profile.rank_credits_to_next ?? 500,
    totalWorkouts: profile.total_workouts ?? 0,
    currentStreak: profile.current_streak ?? 0,
    bestStreak: profile.best_streak ?? 0,
    lastWorkoutDate: profile.last_workout_date ?? '',
    totalHours: profile.total_hours ?? 0,
    weeklyTarget: profile.weekly_target ?? 5,
    monthlyVolumeGoal: profile.monthly_volume_goal ?? 1000,
    personalGoal: profile.personal_goal ?? 'Build muscle and stay consistent',
    fitnessScore: profile.fitness_score ?? 0,
    fitnessBreakdown: profile.fitness_breakdown ?? { consistency: 0, volume: 0, progression: 0, variety: 0 },
    bodyMeasurements: profile.body_measurements ?? { heightCm: 175, weightKg: 70, age: 25, gender: 'male' },
    notificationSettings: profile.notification_settings ?? { unfinishedWorkoutAlert: true, unfinishedWorkoutDelayMinutes: 15 },
    advancedSettings: profile.advanced_settings ?? { soundEffects: true, disableSleep: false },
    restTimerSettings: profile.rest_timer_settings ?? { durationSeconds: 120, soundEffect: 'boxing-bell', mode: 'simple' },
    hiddenExerciseIds: profile.hidden_exercise_ids ?? [],
    myTemplates: profile.templates ?? [],
    templateFolders: profile.template_folders ?? [],
    customExercises: profile.custom_exercises ?? [],
    workoutHistory: profile.workout_history ?? [],
    weeklyHistory: profile.weekly_history ?? [],
    friendCode: profile.friend_code ?? '',
  };
}

/** Convert Partial<User> updates into a snake_case object for Supabase */
function userUpdatesToProfile(updates: Partial<User>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = FIELD_MAP[key];
    if (dbKey) {
      result[dbKey] = value;
    }
  }
  return result;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    // Skip during SSR/static export
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // Fetch profile row (all user data lives here)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        // Profile missing despite trigger — create a default one as safety net
        await supabase.from('profiles').insert({ id: userId });
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (newProfile) {
          setUser(profileToUser(newProfile));
        }
        setIsLoading(false);
        return;
      }

      let mergedUser = profileToUser(profile);

      // Check if streak has expired since last workout, then recalculate fitness score
      const correctStreak = checkStreakExpiry(
        mergedUser.currentStreak,
        mergedUser.lastWorkoutDate,
        mergedUser.weeklyTarget
      );

      const { score, breakdown } = calculateFitnessScore(mergedUser);
      const computedRank = getTierForScore(score);

      if (
        mergedUser.fitnessScore === undefined ||
        mergedUser.fitnessBreakdown === undefined ||
        mergedUser.currentStreak !== correctStreak
      ) {
        mergedUser = {
          ...mergedUser,
          currentStreak: correctStreak,
          fitnessScore: score,
          fitnessBreakdown: breakdown,
          rank: computedRank,
        };

        // Push corrections back to Supabase silently
        await supabase
          .from('profiles')
          .update({
            current_streak: correctStreak,
            best_streak: Math.max(mergedUser.bestStreak, correctStreak),
            fitness_score: score,
            fitness_breakdown: breakdown,
            rank: computedRank,
          })
          .eq('id', userId);
      }

      // Generate friend_code for users who don't have one yet
      if (!profile.friend_code) {
        const code = generateFriendCode();
        await supabase.from('profiles').update({ friend_code: code }).eq('id', userId);
        mergedUser = { ...mergedUser, friendCode: code };
      }

      setUser(mergedUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUser(updates: Partial<User>) {
    const newUser = { ...user, ...updates };
    setUser(newUser);

    // Skip during SSR/static export
    if (Platform.OS === 'web' && typeof window === 'undefined') return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const dbUpdates = userUpdatesToProfile(updates);
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', session.user.id);

        if (error) {
          console.error('Failed to save user to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  async function resetUser() {
    const emptyUser = createEmptyUser();
    setUser(emptyUser);

    // Skip during SSR/static export
    if (Platform.OS === 'web' && typeof window === 'undefined') return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const dbUpdates = userUpdatesToProfile(emptyUser);
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', session.user.id);

      if (error) {
        console.error('Failed to reset user:', error);
      }
    } catch (error) {
      console.error('Failed to reset user:', error);
    }
  }

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used inside a UserProvider');
  }
  return context;
}
