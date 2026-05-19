/**
 * WORKOUT CONTEXT
 *
 * This is a lightweight global context that controls whether the
 * workout overlay is visible. The overlay itself lives at the ROOT
 * level (outside the tab navigator) so it always renders ON TOP
 * of everything — including the bottom tab bar.
 *
 * Why not put the overlay inside the Workout tab screen?
 * Because in React Native, zIndex only works within the same
 * parent stacking context. The tab navigator creates its own
 * stacking context, so the overlay would always be BEHIND the tabs.
 * By rendering at the root level, we guarantee it's above everything.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface WorkoutContextType {
  /** Is the workout overlay currently visible? */
  workoutActive: boolean;
  /** Show the workout overlay (empty workout) */
  startWorkout: () => void;
  /** Show the workout overlay pre-filled with template exercises */
  startWorkoutFromTemplate: (exerciseNames: string[]) => void;
  /** Hide the workout overlay */
  closeWorkout: () => void;
  /** Exercise names to pre-populate when starting from a template */
  pendingTemplateExercises: string[] | null;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workoutActive, setWorkoutActive] = useState(false);
  const pendingTemplateExercisesRef = useRef<string[] | null>(null);

  const startWorkout = useCallback(() => {
    pendingTemplateExercisesRef.current = null;
    setWorkoutActive(true);
  }, []);

  const startWorkoutFromTemplate = useCallback((exerciseNames: string[]) => {
    pendingTemplateExercisesRef.current = exerciseNames;
    setWorkoutActive(true);
  }, []);

  const closeWorkout = useCallback(() => {
    setWorkoutActive(false);
    pendingTemplateExercisesRef.current = null;
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        workoutActive,
        startWorkout,
        startWorkoutFromTemplate,
        closeWorkout,
        pendingTemplateExercises: pendingTemplateExercisesRef.current,
      }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used inside a WorkoutProvider');
  }
  return context;
}
