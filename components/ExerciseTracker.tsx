/**
 * EXERCISE TRACKER
 * Displays an added exercise with its sets.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  PanResponder,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Exercise } from '@/constants/exercises';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  previous: string;
  kg: string;
  reps: string;
  completed: boolean;
}

export interface TrackedExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface ExerciseTrackerProps {
  trackedExercise: TrackedExercise;
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
}

export function ExerciseTracker({
  trackedExercise,
  onAddSet,
  onUpdateSet,
  onToggleComplete,
  onRemoveExercise,
  onDeleteSet,
}: ExerciseTrackerProps) {
  const Colors = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const exercise = trackedExercise.exercise;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.border,
          shadowColor: Colors.shadow,
        },
      ]}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={[styles.exerciseName, { color: Colors.text }]}>{exercise.name}</Text>
        <View style={styles.headerActions}>
          <View style={[styles.linkIcon, { backgroundColor: Colors.primary + '12' }]}>
            <IconSymbol name="dumbbell.fill" size={16} color={Colors.primary} />
          </View>
          <View style={styles.menuWrapper}>
            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: Colors.border + '80' }]}
              onPress={() => setMenuOpen(!menuOpen)}
              activeOpacity={activeOpacity.button}>
              <IconSymbol name="more-vert" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            {menuOpen && (
              <View
                style={[
                  styles.menuDropdown,
                  { backgroundColor: Colors.card, borderColor: Colors.border, shadowColor: Colors.shadow },
                ]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    onRemoveExercise(trackedExercise.id);
                  }}
                  activeOpacity={activeOpacity.row}>
                  <Text style={[styles.menuItemText, { color: Colors.danger }]}>Remove Exercise</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Column Headers */}
      <View style={styles.columnHeaders}>
        <Text style={[styles.colHeader, styles.colSet, { color: Colors.textSecondary }]}>Set</Text>
        <Text style={[styles.colHeader, styles.colPrevious, { color: Colors.textSecondary }]}>
          Previous
        </Text>
        <Text style={[styles.colHeader, styles.colKg, { color: Colors.textSecondary }]}>kg</Text>
        <Text style={[styles.colHeader, styles.colReps, { color: Colors.textSecondary }]}>
          Reps
        </Text>
        <Text style={[styles.colHeader, styles.colCheck, { color: Colors.textSecondary }]}>
          <IconSymbol name="checkmark" size={12} color={Colors.textSecondary} />
        </Text>
      </View>

      {/* Set Rows */}
      {trackedExercise.sets.map((set) => (
        <SwipeableSetRow
          key={set.id}
          set={set}
          exerciseId={trackedExercise.id}
          Colors={Colors}
          onUpdateSet={onUpdateSet}
          onToggleComplete={onToggleComplete}
          onDeleteSet={onDeleteSet}
        />
      ))}

      {/* Add Set Button */}
      <TouchableOpacity
        style={[
          styles.addSetButton,
          { backgroundColor: Colors.background, borderColor: Colors.border },
        ]}
        onPress={() => onAddSet(trackedExercise.id)}
        activeOpacity={activeOpacity.button}>
        <Text style={[styles.addSetText, { color: Colors.primary }]}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

interface SwipeableSetRowProps {
  set: WorkoutSet;
  exerciseId: string;
  Colors: ReturnType<typeof useTheme>;
  onUpdateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
}

const DELETE_WIDTH = 140;

function SwipeableSetRow({
  set,
  exerciseId,
  Colors,
  onUpdateSet,
  onToggleComplete,
  onDeleteSet,
}: SwipeableSetRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidthRef = useRef(0);
  const hasDeletedRef = useRef(false);
  const currentXRef = useRef(0);
  const startXRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);

  const callbacksRef = useRef({
    onDeleteSet,
    exerciseId,
    setId: set.id,
    translateX,
    rowWidthRef,
    hasDeletedRef,
    currentXRef,
    startXRef,
    setIsOpen,
  });
  callbacksRef.current = {
    onDeleteSet,
    exerciseId,
    setId: set.id,
    translateX,
    rowWidthRef,
    hasDeletedRef,
    currentXRef,
    startXRef,
    setIsOpen,
  };

  const snapOpen = useCallback(() => {
    const { translateX, currentXRef, setIsOpen } = callbacksRef.current;
    currentXRef.current = -DELETE_WIDTH;
    setIsOpen(true);
    Animated.timing(translateX, {
      toValue: -DELETE_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, []);

  const snapClosed = useCallback(() => {
    const { translateX, currentXRef, setIsOpen } = callbacksRef.current;
    currentXRef.current = 0;
    setIsOpen(false);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, []);

  const decideSnap = useCallback(() => {
    const { currentXRef, startXRef } = callbacksRef.current;
    const dx = currentXRef.current - startXRef.current;
    if (dx < 0 && Math.abs(dx) > 20) {
      snapOpen();
    } else if (dx > 20) {
      snapClosed();
    } else if (currentXRef.current < -DELETE_WIDTH * 0.5) {
      snapOpen();
    } else {
      snapClosed();
    }
  }, []);

  const handleDeletePress = useCallback(() => {
    const { hasDeletedRef, rowWidthRef, translateX, onDeleteSet, exerciseId, setId } = callbacksRef.current;
    if (hasDeletedRef.current) return;
    hasDeletedRef.current = true;

    Animated.timing(translateX, {
      toValue: -rowWidthRef.current,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      onDeleteSet(exerciseId, setId);
    }, 220);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dy) < 60;
        },
        onPanResponderGrant: () => {
          const { currentXRef, startXRef } = callbacksRef.current;
          startXRef.current = currentXRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const { hasDeletedRef, translateX, currentXRef, startXRef } = callbacksRef.current;
          if (hasDeletedRef.current) return;
          let newX = startXRef.current + gestureState.dx;
          newX = Math.min(0, Math.max(newX, -DELETE_WIDTH));
          currentXRef.current = newX;
          translateX.setValue(newX);
        },
        onPanResponderRelease: () => {
          const { hasDeletedRef } = callbacksRef.current;
          if (hasDeletedRef.current) return;
          decideSnap();
        },
        onPanResponderTerminate: () => {
          const { hasDeletedRef } = callbacksRef.current;
          if (!hasDeletedRef.current) {
            decideSnap();
          }
        },
        onShouldBlockNativeResponder: () => true,
      }),
    []
  );

  return (
    <View
      style={styles.swipeContainer}
      onLayout={(event) => {
        rowWidthRef.current = event.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}>
      {/* Delete background layer */}
      <View style={[styles.deleteBackground, { backgroundColor: Colors.danger }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
          activeOpacity={activeOpacity.button}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <IconSymbol name="trash" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      {/* Foreground row content */}
      <Animated.View
        style={[
          styles.setRow,
          { backgroundColor: Colors.card, transform: [{ translateX }] },
        ]}
        pointerEvents={isOpen ? 'none' : 'box-none'}>
        {/* Set Number */}
        <View style={[styles.setNumberBox, { backgroundColor: Colors.border + '60' }]}>
          <Text style={[styles.setNumberText, { color: Colors.text }]}>{set.setNumber}</Text>
        </View>

        {/* Previous */}
        <Text style={[styles.previousText, { color: Colors.textSecondary }]}>
          {set.previous || '-'}
        </Text>

        {/* KG Input */}
        <TextInput
          style={[
            styles.input,
            { backgroundColor: Colors.background, borderColor: Colors.border, color: Colors.text },
          ]}
          value={set.kg}
          onChangeText={(text) => onUpdateSet(exerciseId, set.id, { kg: text })}
          keyboardType="numeric"
          placeholder="-"
          placeholderTextColor={Colors.textSecondary}
          maxLength={5}
        />

        {/* Reps Input */}
        <TextInput
          style={[
            styles.input,
            { backgroundColor: Colors.background, borderColor: Colors.border, color: Colors.text },
          ]}
          value={set.reps}
          onChangeText={(text) => onUpdateSet(exerciseId, set.id, { reps: text })}
          keyboardType="numeric"
          placeholder="-"
          placeholderTextColor={Colors.textSecondary}
          maxLength={3}
        />

        {/* Check Button */}
        <TouchableOpacity
          style={[
            styles.checkButton,
            { backgroundColor: Colors.background, borderColor: Colors.border },
            set.completed && [
              styles.checkButtonActive,
              { backgroundColor: Colors.primary, borderColor: Colors.primary },
            ],
          ]}
          onPress={() => onToggleComplete(exerciseId, set.id)}
          activeOpacity={activeOpacity.button}>
          {set.completed && (
            <IconSymbol name="checkmark" size={14} color={Colors.background} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkIcon: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuWrapper: {
    position: 'relative',
  },
  menuButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    minWidth: 160,
    zIndex: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: touch.minHeight,
  },
  menuItemText: {
    fontSize: typography.base,
    fontWeight: '500',
  },
  columnHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  colHeader: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colSet: {
    width: 36,
    textAlign: 'center',
  },
  colPrevious: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  colKg: {
    width: 64,
    textAlign: 'center',
  },
  colReps: {
    width: 56,
    textAlign: 'center',
  },
  colCheck: {
    width: 40,
    textAlign: 'center',
  },
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderRadius: radius.sm,
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteButton: {
    width: DELETE_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    width: '100%',
  },
  setNumberBox: {
    width: 40,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
  previousText: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sm,
  },
  input: {
    width: 64,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    fontSize: typography.base,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 2,
  },
  checkButton: {
    width: 44,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  checkButtonActive: {},
  addSetButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 48,
  },
  addSetText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
});
