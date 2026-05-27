/**
 * WORKOUT OVERLAY
 * A draggable, minimize-able full-screen overlay for the active workout.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useUser } from '@/context/UserContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExercisePicker } from '@/components/ExercisePicker';
import { CreateCustomExercise } from '@/components/CreateCustomExercise';
import { ExerciseTracker, TrackedExercise, WorkoutSet } from '@/components/ExerciseTracker';
import { RestTimer } from '@/components/RestTimer';
import { WorkoutCompleteAnimation } from '@/components/WorkoutCompleteAnimation';
import { EXERCISES, Exercise } from '@/constants/exercises';
import { WorkoutHistoryEntry, HistoryExercise } from '@/types/user';
import { calculateFitnessScore, getTierForScore, FitnessBreakdown, calculateNewStreak } from '@/constants/ranks';
import { playAlertSound } from '@/utils/sound';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const SCREEN_HEIGHT = Dimensions.get('screen').height;
const MINIMIZED_HEIGHT = 110;
const EXPANDED_POSITION = 0;

function getCurrentWeekMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function CompactRestTimer({ seconds, Colors }: { seconds: number; Colors: ReturnType<typeof useTheme> }) {
  const isDone = seconds <= 0;
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDone ? Colors.primary + '18' : Colors.card,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: isDone ? Colors.primary : Colors.border,
        marginBottom: spacing.xs,
      }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: radius.full,
          backgroundColor: isDone ? Colors.primary : Colors.danger,
          marginRight: spacing.sm,
        }}
      />
      <Text style={{ fontSize: typography.sm, fontWeight: '700', color: isDone ? Colors.primary : Colors.text }}>
        {isDone ? 'DONE!' : `REST ${timeString}`}
      </Text>
    </View>
  );
}

function CompactRestTimerExpanded({
  active,
  seconds,
  Colors,
}: {
  active: boolean;
  seconds: number;
  Colors: ReturnType<typeof useTheme>;
}) {
  if (!active) return null;
  const isDone = seconds <= 0;
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        backgroundColor: isDone ? Colors.primary + '12' : Colors.card,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: isDone ? Colors.primary : Colors.border,
        alignSelf: 'center',
      }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: radius.full,
          backgroundColor: isDone ? Colors.primary : Colors.danger,
          marginRight: spacing.sm,
        }}
      />
      <Text style={{ fontSize: typography.lg, fontWeight: 'bold', color: isDone ? Colors.primary : Colors.text }}>
        {isDone ? 'REST COMPLETE!' : `Resting: ${timeString}`}
      </Text>
    </View>
  );
}

function RestDoneBanner({
  visible,
  onDismiss,
  topOffset,
  Colors,
}: {
  visible: boolean;
  onDismiss: () => void;
  topOffset: number;
  Colors: ReturnType<typeof useTheme>;
}) {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      progressAnim.setValue(1);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 5000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.stopAnimation();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.restDoneBanner,
        {
          top: topOffset,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.restDoneBannerGradient}>
        <View style={styles.restDoneBannerInner}>
          <View style={styles.restDoneBannerIcon}>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="rgba(0,0,0,0.72)">
              <Path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
            </Svg>
          </View>
          <View style={styles.restDoneBannerText}>
            <Text style={styles.restDoneBannerTitle}>GO — NEXT SET!</Text>
            <Text style={styles.restDoneBannerSub}>Rest complete · tap ✕ to dismiss</Text>
          </View>
          <TouchableOpacity
            onPress={onDismiss}
            activeOpacity={activeOpacity.button}
            style={styles.restDoneBannerClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.restDoneBannerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.restDoneBannerProgressTrack}>
          <Animated.View
            style={[styles.restDoneBannerProgressFill, { width: progressWidth }]}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function WorkoutOverlay() {
  const Colors = useTheme();
  const { workoutActive, closeWorkout, pendingTemplateExercises } = useWorkout();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 72;
  const TAB_BAR_OFFSET = TAB_BAR_HEIGHT + 8;
  const MINIMIZED_POSITION = SCREEN_HEIGHT - MINIMIZED_HEIGHT - TAB_BAR_OFFSET;

  const [shouldRender, setShouldRender] = useState(workoutActive);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const currentTranslateY = useRef(SCREEN_HEIGHT);
  const gestureStartY = useRef(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const isClosingRef = useRef(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionDate] = useState(() => new Date());
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCreateCustomExercise, setShowCreateCustomExercise] = useState(false);
  const [trackedExercises, setTrackedExercises] = useState<TrackedExercise[]>([]);

  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const restTimerSecondsRef = useRef(0);
  restTimerSecondsRef.current = restTimerSeconds;

  // Timestamp refs for background-safe timers
  const workoutStartTimeRef = useRef<number>(0);
  const restEndTimeRef = useRef<number>(0);
  const isActiveRef = useRef(false);
  isActiveRef.current = isActive;
  const restTimerActiveRef = useRef(false);
  restTimerActiveRef.current = restTimerActive;

  // Notification / keep-awake refs
  const pendingNotifIdRef = useRef<string | null>(null);
  const notifSettingsRef = useRef(user.notificationSettings);
  notifSettingsRef.current = user.notificationSettings;

  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({
    duration: 0,
    exerciseCount: 0,
    setCount: 0,
    xpGained: 0,
    leveledUp: false,
    fitnessScore: 0,
    fitnessBreakdown: { consistency: 0, volume: 0, progression: 0, variety: 0 } as FitnessBreakdown,
    rankChanged: false,
    newRank: 'Bronze',
    oldRank: 'Bronze',
  });

  useEffect(() => {
    const id = translateY.addListener(({ value }) => {
      currentTranslateY.current = value;
    });
    return () => translateY.removeListener(id);
  }, []);

  useEffect(() => {
    if (workoutActive) {
      isClosingRef.current = false;
      setShouldRender(true);
      setIsMinimized(false);
      setElapsedSeconds(0);
      setIsActive(true);
      setShowExercisePicker(false);
      setShowCreateCustomExercise(false);
      setRestTimerActive(false);
      setRestTimerSeconds(0);
      setShowCompleteAnimation(false);
      translateY.setValue(SCREEN_HEIGHT);
      animateTo(EXPANDED_POSITION);

      // Pre-populate exercises if starting from a template
      if (pendingTemplateExercises && pendingTemplateExercises.length > 0) {
        const allExercises = [...EXERCISES, ...user.customExercises];
        const templateTracked = pendingTemplateExercises
          .map((name) => allExercises.find((e) => e.name === name))
          .filter((e): e is Exercise => e !== undefined)
          .map((exercise, index) => ({
            id: `${exercise.id}-${Date.now()}-${index}`,
            exercise,
            sets: [
              {
                id: `set-${Date.now()}-${index}`,
                setNumber: 1,
                previous: '',
                kg: '',
                reps: '',
                completed: false,
              },
            ],
          }));
        setTrackedExercises(templateTracked);
      } else {
        setTrackedExercises([]);
      }
    } else {
      isClosingRef.current = true;
      animateTo(SCREEN_HEIGHT, () => {
        if (isClosingRef.current) {
          setShouldRender(false);
        }
      });
      setIsActive(false);
    }
  }, [workoutActive]);

  useEffect(() => {
    if (!isActive) return;
    workoutStartTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - workoutStartTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!restTimerActive) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((restEndTimeRef.current - Date.now()) / 1000));
      setRestTimerSeconds(remaining);
    }, 500);
    return () => clearInterval(interval);
  }, [restTimerActive]);

  useEffect(() => {
    if (!restTimerActive || restTimerSeconds !== 0) return;
    playAlertSound(user.restTimerSettings.soundEffect);
    const timeout = setTimeout(() => {
      setRestTimerActive(false);
    }, 2800);
    return () => clearTimeout(timeout);
  }, [restTimerActive, restTimerSeconds, user.restTimerSettings.soundEffect]);

  // Keep screen awake during active workouts when the user has enabled that setting
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isActive && user.advancedSettings.disableSleep) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => { deactivateKeepAwake(); };
  }, [isActive, user.advancedSettings.disableSleep]);

  // Correct timers on foreground resume; schedule / cancel unfinished-workout notification
  useEffect(() => {
    const cancelNotif = async () => {
      if (pendingNotifIdRef.current && Platform.OS !== 'web') {
        await Notifications.cancelScheduledNotificationAsync(pendingNotifIdRef.current).catch(() => {});
        pendingNotifIdRef.current = null;
      }
    };

    const scheduleNotif = async () => {
      if (!isActiveRef.current || Platform.OS === 'web') return;
      const ns = notifSettingsRef.current;
      if (!ns.unfinishedWorkoutAlert) return;
      await cancelNotif();
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Workout still running! 💪',
          body: 'You left a workout running. Tap to get back to it.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: ns.unfinishedWorkoutDelayMinutes * 60,
        },
      }).catch(() => null);
      if (id) pendingNotifIdRef.current = id;
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Snap timers to correct values
        if (isActiveRef.current && workoutStartTimeRef.current > 0) {
          setElapsedSeconds(Math.floor((Date.now() - workoutStartTimeRef.current) / 1000));
        }
        if (restTimerActiveRef.current && restEndTimeRef.current > 0) {
          const remaining = Math.max(0, Math.floor((restEndTimeRef.current - Date.now()) / 1000));
          setRestTimerSeconds(remaining);
        }
        cancelNotif();
      } else if (nextAppState === 'background') {
        scheduleNotif();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const animateTo = (targetY: number, callback?: () => void) => {
    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start(callback);
  };

  const restTimerDuration = user.restTimerSettings.durationSeconds;
  const startRestTimer = useCallback(() => {
    restEndTimeRef.current = Date.now() + restTimerDuration * 1000;
    setRestTimerActive(true);
    setRestTimerSeconds(restTimerDuration);
  }, [restTimerDuration]);

  const expandedPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        gestureStartY.current = currentTranslateY.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureStartY.current + gestureState.dy;
        const clampedY = Math.max(EXPANDED_POSITION, Math.min(newY, MINIMIZED_POSITION));
        translateY.setValue(clampedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SCREEN_HEIGHT * 0.25) {
          animateTo(MINIMIZED_POSITION);
          setIsMinimized(true);
        } else {
          animateTo(EXPANDED_POSITION);
        }
      },
    })
  ).current;

  const minimizedPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        gestureStartY.current = currentTranslateY.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureStartY.current + gestureState.dy;
        const clampedY = Math.max(EXPANDED_POSITION, Math.min(newY, MINIMIZED_POSITION));
        translateY.setValue(clampedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dy) < 5) {
          animateTo(EXPANDED_POSITION);
          setIsMinimized(false);
          return;
        }
        if (gestureState.dy < -50) {
          animateTo(EXPANDED_POSITION);
          setIsMinimized(false);
        } else {
          animateTo(MINIMIZED_POSITION);
        }
      },
    })
  ).current;

  const handleCancel = () => {
    if (Platform.OS !== 'web' && pendingNotifIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(pendingNotifIdRef.current).catch(() => {});
      pendingNotifIdRef.current = null;
    }
    setIsActive(false);
    setElapsedSeconds(0);
    setTrackedExercises([]);
    setShowExercisePicker(false);
    setRestTimerActive(false);
    setRestTimerSeconds(0);
    closeWorkout();
  };

  function isBetterSet(a: { kg: string; reps: string }, b: { kg: string; reps: string }): boolean {
    const aWeight = parseFloat(a.kg) || 0;
    const bWeight = parseFloat(b.kg) || 0;
    const aReps = parseInt(a.reps) || 0;
    const bReps = parseInt(b.reps) || 0;
    if (aWeight > bWeight) return true;
    if (aWeight < bWeight) return false;
    return aReps > bReps;
  }

  function formatSet(kg: string, reps: string): string {
    return `${kg || '0'} kg × ${reps || '0'}`;
  }

  const handleFinish = () => {
    const exerciseCount = trackedExercises.length;
    const setCount = trackedExercises.reduce((sum, te) => sum + te.sets.length, 0);
    const completedSets = trackedExercises.reduce(
      (sum, te) => sum + te.sets.filter((s) => s.completed).length,
      0
    );

    const xpGained = 10 + exerciseCount * 5 + completedSets * 3;

    const historyExercises: HistoryExercise[] = trackedExercises.map((te) => {
      const completedSetsList = te.sets.filter((s) => s.completed && s.kg && s.reps);
      let bestSet = formatSet(te.sets[0]?.kg || '', te.sets[0]?.reps || '');
      let bestSetObj = { kg: te.sets[0]?.kg || '', reps: te.sets[0]?.reps || '' };

      for (const s of completedSetsList) {
        if (isBetterSet(s, bestSetObj)) {
          bestSetObj = { kg: s.kg, reps: s.reps };
          bestSet = formatSet(s.kg, s.reps);
        }
      }

      return {
        exerciseId: te.exercise.id,
        exerciseName: te.exercise.name,
        bodyPart: te.exercise.bodyPart,
        sets: te.sets.length,
        bestSet,
      };
    });

    let prAchieved = false;
    let prDetails = '';

    for (const he of historyExercises) {
      let prevBest = { kg: '0', reps: '0' };
      for (const entry of user.workoutHistory) {
        for (const ex of entry.exercises) {
          if (ex.exerciseId === he.exerciseId) {
            const match = ex.bestSet.match(/([\d.]+)\s*kg\s*×\s*(\d+)/);
            if (match) {
              const candidate = { kg: match[1], reps: match[2] };
              if (isBetterSet(candidate, prevBest)) {
                prevBest = candidate;
              }
            }
          }
        }
      }

      const currentBestMatch = he.bestSet.match(/([\d.]+)\s*kg\s*×\s*(\d+)/);
      if (currentBestMatch) {
        const currentBest = { kg: currentBestMatch[1], reps: currentBestMatch[2] };
        if (isBetterSet(currentBest, prevBest)) {
          prAchieved = true;
          if (prDetails) prDetails += '  ·  ';
          prDetails += `${he.exerciseName}: ${he.bestSet}`;
        }
      }
    }

    const historyEntry: WorkoutHistoryEntry = {
      id: `workout-${Date.now()}`,
      date: new Date().toISOString(),
      templateName: 'Quick Workout',
      exercises: historyExercises,
      duration: elapsedSeconds,
      prAchieved,
      prDetails,
    };

    let newXp = user.xp + xpGained;
    let newLevel = user.level;
    let newXpToNextLevel = user.xpToNextLevel;
    let leveledUp = false;

    while (newXp >= newXpToNextLevel) {
      newXp -= newXpToNextLevel;
      newLevel += 1;
      newXpToNextLevel = Math.floor(newXpToNextLevel * 1.2);
      leveledUp = true;
    }

    const currentWeekMonday = getCurrentWeekMonday();
    const newHistory = [...user.weeklyHistory];
    const currentWeekIndex = newHistory.findIndex((w) => w.weekStart === currentWeekMonday);

    if (currentWeekIndex >= 0) {
      newHistory[currentWeekIndex] = {
        ...newHistory[currentWeekIndex],
        count: newHistory[currentWeekIndex].count + 1,
      };
    } else {
      newHistory.push({ weekStart: currentWeekMonday, count: 1 });
      if (newHistory.length > 16) newHistory.shift();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newStreak = calculateNewStreak(user.currentStreak, user.lastWorkoutDate, user.weeklyTarget);
    const newBestStreak = Math.max(user.bestStreak, newStreak);
    const hoursAdded = Math.round((elapsedSeconds / 3600) * 10) / 10;
    const newTotalHours = Math.round((user.totalHours + hoursAdded) * 10) / 10;

    const projectedUser = {
      ...user,
      workoutHistory: [historyEntry, ...user.workoutHistory],
      currentStreak: newStreak,
      weeklyHistory: newHistory,
    };
    const { score: newFitnessScore, breakdown: newBreakdown } = calculateFitnessScore(projectedUser);
    const newRank = getTierForScore(newFitnessScore);
    const rankChanged = newRank !== user.rank;

    updateUser({
      totalWorkouts: user.totalWorkouts + 1,
      totalHours: newTotalHours,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel,
      rankCredits: user.rankCredits + 10,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      lastWorkoutDate: todayStr,
      weeklyHistory: newHistory,
      workoutHistory: [historyEntry, ...user.workoutHistory],
      fitnessScore: newFitnessScore,
      fitnessBreakdown: newBreakdown,
      rank: newRank,
    });

    setWorkoutStats({
      duration: elapsedSeconds,
      exerciseCount,
      setCount,
      xpGained,
      leveledUp,
      fitnessScore: newFitnessScore,
      fitnessBreakdown: newBreakdown,
      rankChanged,
      newRank,
      oldRank: user.rank,
    });

    if (Platform.OS !== 'web' && pendingNotifIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(pendingNotifIdRef.current).catch(() => {});
      pendingNotifIdRef.current = null;
    }
    setIsActive(false);
    setRestTimerActive(false);
    setShowCompleteAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowCompleteAnimation(false);
    setElapsedSeconds(0);
    setTrackedExercises([]);
    setShowExercisePicker(false);
    setShowCreateCustomExercise(false);
    setRestTimerSeconds(0);
    closeWorkout();
  };

  const handleAddExercise = () => {
    setShowExercisePicker(true);
  };

  const handleExerciseSelected = (exercise: Exercise) => {
    const newExercise: TrackedExercise = {
      id: `${exercise.id}-${Date.now()}`,
      exercise,
      sets: [
        {
          id: `set-${Date.now()}`,
          setNumber: 1,
          previous: '',
          kg: '',
          reps: '',
          completed: false,
        },
      ],
    };
    setTrackedExercises((prev) => [...prev, newExercise]);
  };

  const handleAddSet = (exerciseId: string) => {
    setTrackedExercises((prev) =>
      prev.map((te) => {
        if (te.id !== exerciseId) return te;
        const lastSet = te.sets[te.sets.length - 1];
        const newSetNumber = te.sets.length + 1;
        const previousText =
          lastSet && lastSet.completed ? `${lastSet.kg} kg × ${lastSet.reps}` : '';
        return {
          ...te,
          sets: [
            ...te.sets,
            {
              id: `set-${Date.now()}`,
              setNumber: newSetNumber,
              previous: previousText,
              kg: lastSet?.kg || '',
              reps: lastSet?.reps || '',
              completed: false,
            },
          ],
        };
      })
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => {
    setTrackedExercises((prev) =>
      prev.map((te) => {
        if (te.id !== exerciseId) return te;
        return {
          ...te,
          sets: te.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
        };
      })
    );
  };

  const handleToggleComplete = (exerciseId: string, setId: string) => {
    setTrackedExercises((prev) =>
      prev.map((te) => {
        if (te.id !== exerciseId) return te;
        return {
          ...te,
          sets: te.sets.map((s) => {
            if (s.id !== setId) return s;
            const newCompleted = !s.completed;
            if (newCompleted) {
              const nextSetIndex = te.sets.findIndex((set) => set.id === setId) + 1;
              if (nextSetIndex < te.sets.length) {
                te.sets[nextSetIndex] = {
                  ...te.sets[nextSetIndex],
                  previous: `${s.kg} kg × ${s.reps}`,
                };
              }
              startRestTimer();
            }
            return { ...s, completed: newCompleted };
          }),
        };
      })
    );
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setTrackedExercises((prev) => prev.filter((te) => te.id !== exerciseId));
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setTrackedExercises((prev) =>
      prev.map((te) => {
        if (te.id !== exerciseId) return te;
        const updatedSets = te.sets
          .filter((s) => s.id !== setId)
          .map((s, index) => ({ ...s, setNumber: index + 1 }));
        return { ...te, sets: updatedSets };
      })
    );
  };

  if (!shouldRender) return null;

  const pointerEvents = isMinimized ? 'box-none' : 'auto';

  return (
    <>
      <Animated.View
        pointerEvents={pointerEvents}
        style={[
          styles.overlay,
          {
            transform: [{ translateY }],
            height: SCREEN_HEIGHT,
          },
        ]}>
        {showCreateCustomExercise ? (
          <CreateCustomExercise onClose={() => setShowCreateCustomExercise(false)} />
        ) : showExercisePicker ? (
          <ExercisePicker
            onClose={() => setShowExercisePicker(false)}
            onSelectExercise={handleExerciseSelected}
            onCreateExercise={() => setShowCreateCustomExercise(true)}
          />
        ) : isMinimized ? (
          <View
            style={[
              styles.minimizedBar,
              { backgroundColor: Colors.background, borderTopColor: Colors.border, shadowColor: Colors.shadow },
            ]}
            {...minimizedPanResponder.panHandlers}>
            <View style={[styles.dragPill, { backgroundColor: Colors.textSecondary }]} />
            {user.restTimerSettings.mode === 'simple' && restTimerActive && (
              <CompactRestTimer seconds={restTimerSeconds} Colors={Colors} />
            )}
            <Text style={[styles.minimizedTimer, { color: Colors.primary }]}>
              {formatTime(elapsedSeconds)}
            </Text>
            <Text style={[styles.minimizedDate, { color: Colors.textSecondary }]}>
              {formatFullDate(sessionDate)}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.expandedContainer,
              { paddingTop: insets.top, backgroundColor: Colors.background },
            ]}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} {...expandedPanResponder.panHandlers}>
              <View style={[styles.dragPill, { backgroundColor: Colors.textSecondary }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <TouchableOpacity
                style={[styles.finishButton, { backgroundColor: Colors.primary }]}
                onPress={handleFinish}
                activeOpacity={activeOpacity.button}>
                <Text style={[styles.finishButtonText, { color: Colors.background }]}>
                  Finish Workout
                </Text>
                <IconSymbol name="checkmark" size={18} color={Colors.background} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={{ paddingBottom: insets.bottom + spacing['3xl'] }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Timer */}
              <View style={styles.timerSection}>
                <Text style={[styles.timerLabel, { color: Colors.textSecondary }]}>
                  WORKOUT TIME
                </Text>
                <Text style={[styles.timerDisplay, { color: Colors.primary }]}>
                  {formatTime(elapsedSeconds)}
                </Text>
                <Text style={[styles.dateDisplay, { color: Colors.textSecondary }]}>
                  {formatFullDate(sessionDate)}
                </Text>
                {user.restTimerSettings.mode === 'simple' && (
                  <CompactRestTimerExpanded
                    active={restTimerActive}
                    seconds={restTimerSeconds}
                    Colors={Colors}
                  />
                )}
              </View>

              {/* Inline mode: full RestTimer */}
              {user.restTimerSettings.mode === 'inline' && (
                <RestTimer
                  active={restTimerActive}
                  secondsRemaining={restTimerSeconds}
                  totalSeconds={restTimerDuration}
                />
              )}

              {/* Exercise Trackers */}
              {trackedExercises.map((te) => (
                <ExerciseTracker
                  key={te.id}
                  trackedExercise={te}
                  onAddSet={handleAddSet}
                  onUpdateSet={handleUpdateSet}
                  onToggleComplete={handleToggleComplete}
                  onRemoveExercise={handleRemoveExercise}
                  onDeleteSet={handleDeleteSet}
                />
              ))}

              {/* Action Buttons */}
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={[
                    styles.addExerciseButton,
                    { backgroundColor: Colors.card, borderColor: Colors.primary + '44' },
                  ]}
                  onPress={handleAddExercise}
                  activeOpacity={activeOpacity.button}>
                  <IconSymbol name="dumbbell.fill" size={22} color={Colors.primary} />
                  <Text style={[styles.addExerciseText, { color: Colors.primary }]}>
                    Add Exercise
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { backgroundColor: Colors.card, borderColor: Colors.danger + '44' },
                  ]}
                  onPress={handleCancel}
                  activeOpacity={activeOpacity.button}>
                  <IconSymbol name="xmark" size={20} color={Colors.danger} />
                  <Text style={[styles.cancelButtonText, { color: Colors.danger }]}>
                    Cancel Workout
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Workout Complete Animation */}
      {showCompleteAnimation && (
        <WorkoutCompleteAnimation
          durationSeconds={workoutStats.duration}
          exerciseCount={workoutStats.exerciseCount}
          setCount={workoutStats.setCount}
          xpGained={workoutStats.xpGained}
          leveledUp={workoutStats.leveledUp}
          fitnessScore={workoutStats.fitnessScore}
          fitnessBreakdown={workoutStats.fitnessBreakdown}
          rankChanged={workoutStats.rankChanged}
          newRank={workoutStats.newRank}
          oldRank={workoutStats.oldRank}
          onComplete={handleAnimationComplete}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  expandedContainer: {
    flex: 1,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dragPill: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerSpacer: {
    flex: 1,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    minHeight: touch.minHeight,
  },
  finishButtonText: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  timerLabel: {
    fontSize: typography.sm,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: Fonts.mono,
    letterSpacing: 2,
  },
  dateDisplay: {
    fontSize: typography.base,
    marginTop: spacing.sm,
  },
  actionsSection: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    minHeight: 56,
  },
  addExerciseText: {
    fontSize: typography.lg,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  minimizedBar: {
    height: MINIMIZED_HEIGHT,
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  minimizedTimer: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    fontFamily: Fonts.mono,
    marginTop: spacing.xs,
  },
  minimizedDate: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  restDoneBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },
  restDoneBannerGradient: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  restDoneBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  restDoneBannerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restDoneBannerText: {
    flex: 1,
  },
  restDoneBannerTitle: {
    fontSize: typography.base,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.82)',
    letterSpacing: 0.5,
  },
  restDoneBannerSub: {
    fontSize: typography.xs,
    color: 'rgba(0,0,0,0.55)',
    marginTop: 2,
  },
  restDoneBannerClose: {
    padding: spacing.xs,
  },
  restDoneBannerCloseText: {
    fontSize: typography.base,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
  },
  restDoneBannerProgressTrack: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  restDoneBannerProgressFill: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
