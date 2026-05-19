/**
 * TEMPLATE PREVIEW POPUP
 * Premium full-screen overlay for previewing a template's exercises,
 * editing the exercise list, and starting a workout.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WorkoutTemplate } from '@/types/user';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 72;

interface TemplatePreviewPopupProps {
  template: WorkoutTemplate;
  isEditable: boolean;
  onClose: () => void;
  onStartWorkout: (exerciseNames: string[]) => void;
}

export function TemplatePreviewPopup({
  template,
  isEditable,
  onClose,
  onStartWorkout,
}: TemplatePreviewPopupProps) {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();

  const [exercises, setExercises] = useState<string[]>(template.exercises);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDeleteExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  }, []);

  const handleToggleEdit = () => {
    if (isEditing && hasChanges) {
      const updatedTemplates = user.myTemplates.map((t) =>
        t.id === template.id ? { ...t, exercises: [...exercises] } : t
      );
      updateUser({ myTemplates: updatedTemplates });
      setHasChanges(false);
    }
    setIsEditing((prev) => !prev);
  };

  const handleStartWorkout = () => {
    if (isEditing && hasChanges && isEditable) {
      const updatedTemplates = user.myTemplates.map((t) =>
        t.id === template.id ? { ...t, exercises: [...exercises] } : t
      );
      updateUser({ myTemplates: updatedTemplates });
    }
    onStartWorkout(exercises);
    onClose();
  };

  const handleClose = () => {
    if (isEditing && hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'Your edits to this template will not be saved.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  const canStart = exercises.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background, zIndex: 100 }]}>
      {/* ─── Top Safe Area Spacer ─── */}
      <View style={{ height: insets.top }} />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
          onPress={handleClose}
          activeOpacity={activeOpacity.button}>
          <IconSymbol name="xmark" size={18} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerLabel, { color: Colors.textSecondary }]}>TEMPLATE</Text>
          <Text style={[styles.headerTitle, { color: Colors.text }]} numberOfLines={1}>
            {template.name}
          </Text>
        </View>

        {isEditable ? (
          <TouchableOpacity
            style={[
              styles.editButton,
              isEditing
                ? { backgroundColor: Colors.primary + '20', borderColor: Colors.primary + '50' }
                : { backgroundColor: Colors.card, borderColor: Colors.border },
            ]}
            onPress={handleToggleEdit}
            activeOpacity={activeOpacity.button}>
            <Text
              style={[
                styles.editButtonText,
                { color: isEditing ? Colors.primary : Colors.textSecondary },
              ]}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      {/* ─── Info Card ─── */}
      <View style={styles.infoCardWrapper}>
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <View
            style={[
              styles.infoIconCircle,
              { backgroundColor: Colors.primary + '18' },
            ]}>
            <IconSymbol name="dumbbell.fill" size={22} color={Colors.primary} />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={[styles.infoCount, { color: Colors.text }]}>
              {exercises.length}
            </Text>
            <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>
              Exercise{exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* ─── Exercise List ─── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: spacing.xl + TAB_BAR_HEIGHT + 20 }}
        showsVerticalScrollIndicator={false}>
        {exercises.length === 0 && (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: Colors.card,
                borderColor: Colors.border,
                shadowColor: Colors.shadow,
              },
            ]}>
            <IconSymbol name="dumbbell" size={32} color={Colors.textSecondary + '60'} />
            <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>
              No exercises in this template
            </Text>
          </View>
        )}

        {exercises.map((exerciseName, index) => (
          <View
            key={`${exerciseName}-${index}`}
            style={[
              styles.exerciseCard,
              {
                backgroundColor: Colors.card,
                borderColor: Colors.border,
                shadowColor: Colors.shadow,
              },
            ]}>
            {/* Left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: Colors.primary }]} />

            {/* Number badge */}
            <View
              style={[
                styles.numberBadge,
                { backgroundColor: Colors.primary + '14' },
              ]}>
              <Text style={[styles.numberBadgeText, { color: Colors.primary }]}>
                {index + 1}
              </Text>
            </View>

            {/* Exercise name */}
            <Text style={[styles.exerciseName, { color: Colors.text }]} numberOfLines={2}>
              {exerciseName}
            </Text>

            {/* Delete button (edit mode only) */}
            {isEditing && (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  { backgroundColor: Colors.danger + '12' },
                ]}
                onPress={() => handleDeleteExercise(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={activeOpacity.button}>
                <IconSymbol name="trash" size={16} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* ─── Bottom Bar ─── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: Colors.background,
            borderTopColor: Colors.border,
            paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.md) + TAB_BAR_HEIGHT,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.startButton,
            canStart && { backgroundColor: Colors.primary },
            !canStart && {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={handleStartWorkout}
          disabled={!canStart}
          activeOpacity={activeOpacity.button}>
          <IconSymbol
            name="play.fill"
            size={20}
            color={canStart ? Colors.background : Colors.textSecondary}
          />
          <Text
            style={[
              styles.startButtonText,
              { color: canStart ? Colors.background : Colors.textSecondary },
            ]}>
            Start Workout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },

  /* ─── Header ─── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  iconButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerLabel: {
    fontSize: typography.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs / 2,
  },
  headerTitle: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },

  /* ─── Info Card ─── */
  infoCardWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  infoIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoTextBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  infoCount: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: typography.base,
    fontWeight: '500',
  },

  /* ─── ScrollView ─── */
  scrollView: {
    flex: 1,
  },

  /* ─── Empty State ─── */
  emptyState: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: typography.base,
    fontWeight: '500',
  },

  /* ─── Exercise Card ─── */
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: spacing.md,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  numberBadgeText: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  exerciseName: {
    fontSize: typography.base,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  /* ─── Bottom Bar ─── */
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.sm,
    minHeight: 60,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  startButtonText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
});
