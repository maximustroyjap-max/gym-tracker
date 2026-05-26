/**
 * This file is a "blueprint" that describes what a User looks like.
 */

import { Exercise } from '@/constants/exercises';

export interface WeeklyWorkout {
  /** Start date of the week (e.g., "2024-03-16") */
  weekStart: string;
  /** How many workouts completed that week */
  count: number;
}

export interface HistoryExercise {
  /** Exercise ID */
  exerciseId: string;
  /** Exercise name */
  exerciseName: string;
  /** Body part targeted */
  bodyPart: string;
  /** Number of sets performed */
  sets: number;
  /** Best set formatted as "100 kg × 10" */
  bestSet: string;
}

export interface WorkoutHistoryEntry {
  /** Unique ID for this workout session */
  id: string;
  /** ISO date string when the workout was completed */
  date: string;
  /** Name of the template used, or "Quick Workout" */
  templateName: string;
  /** Exercises performed in this workout */
  exercises: HistoryExercise[];
  /** Duration in seconds */
  duration: number;
  /** Whether a new PR was achieved in this workout */
  prAchieved: boolean;
  /** Formatted PR details, e.g. "Bench Press: 120 kg × 8" */
  prDetails: string;
}

export interface WorkoutTemplate {
  /** Unique ID for the template */
  id: string;
  /** Display name */
  name: string;
  /** List of exercise names in this template */
  exercises: string[];
}

export interface TemplateFolder {
  /** Unique ID for the folder */
  id: string;
  /** Display name */
  name: string;
  /** IDs of templates organized in this folder */
  templateIds: string[];
}

export interface NotificationSettings {
  unfinishedWorkoutAlert: boolean;
  unfinishedWorkoutDelayMinutes: number;
}

export interface AdvancedSettings {
  soundEffects: boolean;
  disableSleep: boolean;
}

export interface RestTimerSettings {
  /** Rest duration in seconds (default: 120 = 2 minutes) */
  durationSeconds: number;
  /** Selected alert sound effect */
  soundEffect: string;
  /** Display mode: 'simple' (nav bar) or 'inline' (with sets) */
  mode: 'simple' | 'inline';
}

export type ThemeName = 'dark' | 'light' | 'sunset';

export interface BodyMeasurements {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: 'male' | 'female';
  bodyFatPercent?: number;
  neckCm?: number;
  waistCm?: number;
  hipsCm?: number;
}

export interface User {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: string;
  rankCredits: number;
  rankCreditsToNext: number;
  totalWorkouts: number;
  currentStreak: number;
  bestStreak: number;
  lastWorkoutDate: string;
  totalHours: number;
  /** Target workouts per week — feeds into rank system & progress tracking */
  weeklyTarget: number;
  /** Monthly training volume goal (total reps) — for progress tracking */
  monthlyVolumeGoal: number;
  /** History of workouts per week for the chart */
  weeklyHistory: WeeklyWorkout[];
  /** User's personal workout templates */
  myTemplates: WorkoutTemplate[];
  /** Personal fitness goal statement */
  personalGoal: string;
  /** Body measurements for recommendations */
  bodyMeasurements: BodyMeasurements;
  /** Notification preferences */
  notificationSettings: NotificationSettings;
  /** Advanced preferences */
  advancedSettings: AdvancedSettings;
  /** Active app theme */
  theme: ThemeName;
  /** Rest timer preferences */
  restTimerSettings: RestTimerSettings;
  /** User-created custom exercises */
  customExercises: Exercise[];
  /** User-created folders for organizing templates */
  templateFolders: TemplateFolder[];
  /** IDs of exercises the user has chosen to hide/delete from the exercises list */
  hiddenExerciseIds: string[];
  /** Complete record of every finished workout */
  workoutHistory: WorkoutHistoryEntry[];
  /** Overall fitness score 0-100 (derived from 4 pillars) */
  fitnessScore: number;
  /** Breakdown of the 4 fitness pillars */
  fitnessBreakdown: {
    consistency: number;
    volume: number;
    progression: number;
    variety: number;
  };
}

/** Generate sample weekly history for the last 16 weeks */
function generateSampleHistory(): WeeklyWorkout[] {
  const history: WeeklyWorkout[] = [];
  const today = new Date();
  // Start from 15 weeks ago
  for (let i = 15; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    // Realistic workout patterns: some weeks busy, some skipped
    const sampleCounts = [3, 5, 2, 4, 1, 5, 3, 4, 2, 5, 4, 3, 5, 2, 4, 1];
    history.push({
      weekStart: date.toISOString().split('T')[0],
      count: sampleCounts[15 - i] ?? Math.floor(Math.random() * 5) + 1,
    });
  }
  return history;
}

/** Creates a completely fresh user with no data — used for Reset All Data */
export function createEmptyUser(): User {
  return {
    username: 'GymNewbie',
    avatar: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    rank: 'Bronze 1',
    rankCredits: 0,
    rankCreditsToNext: 500,
    totalWorkouts: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastWorkoutDate: '',
    totalHours: 0,
    weeklyTarget: 5,
    monthlyVolumeGoal: 1000,
    weeklyHistory: [],
    notificationSettings: {
      unfinishedWorkoutAlert: true,
      unfinishedWorkoutDelayMinutes: 15,
    },
    advancedSettings: {
      soundEffects: true,
      disableSleep: false,
    },
    theme: 'dark',
    restTimerSettings: {
      durationSeconds: 120,
      soundEffect: 'boxing-bell',
      mode: 'simple',
    },
    personalGoal: 'Build muscle and stay consistent',
    bodyMeasurements: {
      heightCm: 175,
      weightKg: 70,
      age: 25,
      gender: 'male',
    },
    myTemplates: [],
    customExercises: [],
    templateFolders: [],
    hiddenExerciseIds: [],
    workoutHistory: [],
    fitnessScore: 0,
    fitnessBreakdown: {
      consistency: 0,
      volume: 0,
      progression: 0,
      variety: 0,
    },
  };
}

export const DEFAULT_USER: User = {
  username: 'GymNewbie',
  avatar: '',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  rank: 'Bronze 1',
  rankCredits: 0,
  rankCreditsToNext: 500,
  totalWorkouts: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastWorkoutDate: '',
  totalHours: 0,
  weeklyTarget: 5,
  monthlyVolumeGoal: 1000,
  weeklyHistory: generateSampleHistory(),
  notificationSettings: {
    unfinishedWorkoutAlert: true,
    unfinishedWorkoutDelayMinutes: 15,
  },
  advancedSettings: {
    soundEffects: true,
    disableSleep: false,
  },
  theme: 'dark',
  restTimerSettings: {
    durationSeconds: 120,
    soundEffect: 'boxing-bell',
    mode: 'simple',
  },
  personalGoal: 'Build muscle and stay consistent',
  bodyMeasurements: {
    heightCm: 175,
    weightKg: 70,
    age: 25,
    gender: 'male',
  },
  myTemplates: [
    {
      id: 'template-1',
      name: 'Morning Workout',
      exercises: [
        'Bench Press (Barbell)',
        'Incline Bench Press (Smith Machine)',
        'Chest Fly',
        'Chest Dip',
        'Push-Up',
        'Tricep Pushdown (Cable)',
        'Lateral Raise (Dumbbell)',
      ],
    },
    {
      id: 'template-2',
      name: 'Afternoon Workout',
      exercises: [
        'Hack Squat',
        'Lying Leg Curl (Machine)',
        'Seated Calf Raise (Plate Loaded)',
        'Leg Extension (Machine)',
        'Romanian Deadlift',
      ],
    },
    {
      id: 'template-3',
      name: 'Back Bicep',
      exercises: [
        'Lat Pulldown (Cable)',
        'Seated Row (Machine)',
        'Lat Pulldown (Machine)',
        'T-Bar Row',
        'Bicep Curl (Dumbbell)',
        'Hammer Curl',
      ],
    },
  ],
  customExercises: [],
  templateFolders: [],
  hiddenExerciseIds: [],
  workoutHistory: [],
  fitnessScore: 0,
  fitnessBreakdown: {
    consistency: 0,
    volume: 0,
    progression: 0,
    variety: 0,
  },
};
