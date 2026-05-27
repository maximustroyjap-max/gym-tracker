/**
 * REST TIMER
 *
 * An eye-catching rest timer that appears when a set is completed.
 * Features:
 * - Large glowing countdown display
 * - Circular progress ring that shrinks as time passes
 * - Pulsing glow effect while active
 * - Color shifts: green → yellow → red as time runs out
 * - Quick burst + fast-fade when timer finishes (banner in WorkoutOverlay handles the "GO!" signal)
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { spacing, typography } from '@/constants/design';

interface RestTimerProps {
  /** Seconds remaining */
  secondsRemaining: number;
  /** Total seconds the timer started with */
  totalSeconds: number;
  /** Is the timer currently active? */
  active: boolean;
}

export function RestTimer({ secondsRemaining, totalSeconds, active }: RestTimerProps) {
  const Colors = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  const isDone = active && secondsRemaining <= 0;

  // Fade in when activated
  useEffect(() => {
    if (active && !isDone) {
      flashAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [active, isDone]);

  // "Done" burst animation — quick scale pop + flash, then fast fade out
  useEffect(() => {
    if (!isDone) return;
    Animated.sequence([
      // Scale burst + flash in
      Animated.parallel([
        Animated.spring(ringScaleAnim, {
          toValue: 1.15,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Snap back + flash out
      Animated.parallel([
        Animated.spring(ringScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Brief hold — lets the banner begin sliding in
      Animated.delay(100),
      // Fade out the entire timer component
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDone]);

  // Pulsing glow animation while active and counting down
  useEffect(() => {
    if (!active || isDone) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [active, isDone]);

  if (!active) return null;

  // Calculate progress (1.0 = full time, 0.0 = finished)
  const progress = Math.max(0, Math.min(1, secondsRemaining / totalSeconds));

  // Format time as MM:SS
  const minutes = Math.floor(Math.max(0, secondsRemaining) / 60);
  const seconds = Math.floor(Math.max(0, secondsRemaining) % 60);
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Color shifts from green (full) to orange (half) to red (empty)
  const getTimerColor = () => {
    if (isDone) return Colors.primary;
    if (progress > 0.5) return Colors.primary;
    if (progress > 0.25) return Colors.warning;
    return Colors.danger;
  };

  const timerColor = getTimerColor();
  const ringSize = 150;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      {/* Flash overlay on done */}
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            backgroundColor: Colors.primary,
          },
        ]}
      />

      {/* Background glow */}
      {!isDone && (
        <Animated.View
          style={[
            styles.glow,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: timerColor + '12',
            },
          ]}
        />
      )}

      {/* Main ring + content */}
      <Animated.View
        style={[
          styles.ringContainer,
          {
            width: ringSize,
            height: ringSize,
            transform: [{ scale: ringScaleAnim }],
          },
        ]}>
        {/* Background ring */}
        <View
          style={[
            styles.ringBackground,
            { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderColor: Colors.border },
          ]}
        />

        {/* Progress arc */}
        <View
          style={[
            styles.progressRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderColor: timerColor,
              opacity: isDone ? 0.6 : 0.3 + progress * 0.7,
            },
          ]}
        />

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.restLabel, { color: Colors.textSecondary }]}>REST</Text>
          <Text style={[styles.timeText, { color: timerColor }]}>
            {timeString}
          </Text>
          <Text style={[styles.secondsLabel, { color: Colors.textSecondary }]}>seconds</Text>
        </View>
      </Animated.View>

      {/* Progress bar below ring */}
      {!isDone && (
        <View style={styles.bottomProgressBar}>
          <View style={[styles.bottomProgressTrack, { backgroundColor: Colors.border }]}>
            <Animated.View
              style={[
                styles.bottomProgressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: timerColor,
                },
              ]}
            />
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    height: 200,
  },
  flashOverlay: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBackground: {
    position: 'absolute',
    borderWidth: 4,
  },
  progressRing: {
    position: 'absolute',
    borderWidth: 4,
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  restLabel: {
    fontSize: typography.xs,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: Fonts.mono,
    letterSpacing: 1,
  },
  secondsLabel: {
    fontSize: typography.xs,
    marginTop: 2,
    letterSpacing: 1,
  },
  bottomProgressBar: {
    marginTop: spacing.lg,
    width: 200,
  },
  bottomProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bottomProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
