/**
 * EXAMPLE TEMPLATES
 * Pre-made workout templates that users can select and use directly.
 * These are read-only — users cannot edit or delete them.
 */

import { WorkoutTemplate } from '@/types/user';

export const EXAMPLE_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'example-1',
    name: 'Strong 5x5 - Workout A',
    exercises: [
      'Squat (Barbell)',
      'Bench Press (Barbell)',
      'Bent Over Row (Barbell)',
    ],
  },
  {
    id: 'example-2',
    name: 'Strong 5x5 - Workout B',
    exercises: [
      'Squat (Barbell)',
      'Overhead Press (Barbell)',
      'Deadlift (Conventional)',
    ],
  },
  {
    id: 'example-3',
    name: 'Push Day',
    exercises: [
      'Bench Press (Barbell)',
      'Overhead Press (Dumbbell)',
      'Incline Press (Dumbbell)',
      'Lateral Raise (Cable)',
      'Tricep Pushdown (Cable)',
    ],
  },
  {
    id: 'example-4',
    name: 'Pull Day',
    exercises: [
      'Deadlift (Conventional)',
      'Lat Pulldown - Wide Grip',
      'Seated Cable Row',
      'Face Pull',
      'Bicep Curl (Dumbbell)',
    ],
  },
  {
    id: 'example-5',
    name: 'Legs',
    exercises: [
      'Squat (Barbell)',
      'Leg Extension (Machine)',
      'Flat Leg Raise',
      'Standing Calf Raise (Dumbbell)',
      'Romanian Deadlift',
    ],
  },
];
