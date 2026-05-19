/**
 * TEMPLATE BUILDER
 * Full-screen UI for creating a new workout template.
 * Rendered conditionally inside the WorkoutScreen.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExercisePicker } from '@/components/ExercisePicker';
import { CreateCustomExercise } from '@/components/CreateCustomExercise';
import { WorkoutTemplate } from '@/types/user';

interface TemplateBuilderProps {
  onClose: () => void;
  onSave: (template: WorkoutTemplate) => void;
}

export function TemplateBuilder({ onClose, onSave }: TemplateBuilderProps) {
  const Colors = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<string[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCreateCustomExercise, setShowCreateCustomExercise] = useState(false);

  const canSave = name.trim().length > 0 && exercises.length > 0;

  const handleAddExercise = useCallback((exercise: { name: string }) => {
    setExercises((prev) => [...prev, exercise.name]);
  }, []);

  const handleRemoveExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCancel = () => {
    if (name.trim().length > 0 || exercises.length > 0) {
      Alert.alert(
        'Discard Template?',
        'Your template will not be saved. Are you sure?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (!canSave) return;

    const newTemplate: WorkoutTemplate = {
      id: `template-${Date.now()}`,
      name: name.trim(),
      exercises: [...exercises],
    };

    onSave(newTemplate);
    onClose();
  };

  // ─── Conditional sub-views ───
  if (showCreateCustomExercise) {
    return (
      <CreateCustomExercise
        onClose={() => setShowCreateCustomExercise(false)}
      />
    );
  }

  // ─── Conditional sub-views ───
  if (showCreateCustomExercise) {
    return (
      <CreateCustomExercise
        onClose={() => setShowCreateCustomExercise(false)}
      />
    );
  }

  if (showExercisePicker) {
    return (
      <ExercisePicker
        hideSelection
        onClose={() => setShowExercisePicker(false)}
        onSelectExercise={handleAddExercise}
        onCreateExercise={() => setShowCreateCustomExercise(true)}
      />
    );
  }

  // ─── Main builder UI ───
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: Colors.background, zIndex: 100 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
          onPress={handleCancel}
          activeOpacity={activeOpacity.button}>
          <Text style={[styles.closeButtonText, { color: Colors.text }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>New Template</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Template Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.text }]}>Template Name</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: Colors.card, color: Colors.text, borderColor: Colors.border },
            ]}
            placeholder="e.g. Push Day"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Exercises List */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.text }]}>
            Exercises ({exercises.length})
          </Text>

          {exercises.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
              <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>
                No exercises added yet
              </Text>
            </View>
          )}

          {exercises.map((exerciseName, index) => (
            <View
              key={`${exerciseName}-${index}`}
              style={[styles.exerciseRow, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
              <Text style={[styles.exerciseRowText, { color: Colors.text }]} numberOfLines={1}>
                {exerciseName}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveExercise(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={activeOpacity.button}>
                <IconSymbol name="trash" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={[styles.addExerciseButton, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '40' }]}
          onPress={() => setShowExercisePicker(true)}
          activeOpacity={activeOpacity.button}>
          <IconSymbol name="dumbbell.fill" size={18} color={Colors.primary} />
          <Text style={[styles.addExerciseText, { color: Colors.primary }]}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: Colors.background + 'EE', borderTopColor: Colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
          onPress={handleCancel}
          activeOpacity={activeOpacity.button}>
          <Text style={[styles.cancelButtonText, { color: Colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !canSave && [styles.saveButtonDisabled, { backgroundColor: Colors.card, borderColor: Colors.border }],
            canSave && { backgroundColor: Colors.primary },
          ]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={activeOpacity.button}>
          <Text
            style={[
              styles.saveButtonText,
              !canSave && [styles.saveButtonTextDisabled, { color: Colors.textSecondary }],
              canSave && { color: Colors.background },
            ]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.xl,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  textInput: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    borderWidth: 1,
  },
  emptyState: {
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.base,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  exerciseRowText: {
    fontSize: typography.base,
    fontWeight: '500',
    flex: 1,
  },
  removeButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: touch.minHeight,
  },
  addExerciseText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  cancelButtonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonDisabled: {
    borderWidth: 1,
  },
  saveButtonText: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
  },
});
