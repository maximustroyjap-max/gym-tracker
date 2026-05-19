/**
 * CREATE CUSTOM EXERCISE
 * A full-screen form for creating a new custom exercise.
 * Rendered conditionally inside the WorkoutOverlay.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { spacing, radius, typography, touch } from '@/constants/design';
import {
  BODY_PARTS,
  CATEGORIES,
  BodyPart,
  Category,
  Exercise,
} from '@/constants/exercises';

interface CreateCustomExerciseProps {
  onClose: () => void;
}

export function CreateCustomExercise({ onClose }: CreateCustomExerciseProps) {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const canSave = name.trim().length > 0 && selectedBodyPart !== null && selectedCategory !== null;

  const toggleBodyPart = useCallback((part: BodyPart) => {
    setSelectedBodyPart((prev) => (prev === part ? null : part));
  }, []);

  const handleSelectCategory = useCallback((cat: Category) => {
    setSelectedCategory(cat);
    setShowCategoryPicker(false);
  }, []);

  const handleSave = () => {
    if (!canSave) return;

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      bodyPart: selectedBodyPart!,
      category: selectedCategory!,
    };

    const updatedCustomExercises = [...user.customExercises, newExercise];
    updateUser({ customExercises: updatedCustomExercises });
    onClose();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
          onPress={onClose}>
          <Text style={[styles.closeButtonText, { color: Colors.text }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Create New Exercise</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !canSave && [styles.saveButtonDisabled, { backgroundColor: Colors.card, borderColor: Colors.border }],
            canSave && { backgroundColor: Colors.primary },
          ]}
          onPress={handleSave}
          disabled={!canSave}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Name Field */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.text }]}>Name</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: Colors.card, color: Colors.text, borderColor: Colors.border },
            ]}
            placeholder="Add Name"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Body Part Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.text }]}>Body Part</Text>
          <View style={styles.chipsWrap}>
            {BODY_PARTS.map((part) => (
              <TouchableOpacity
                key={part}
                style={[
                  styles.chip,
                  { backgroundColor: Colors.card, borderColor: Colors.border },
                  selectedBodyPart === part && [
                    styles.chipSelected,
                    { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
                  ],
                ]}
                onPress={() => toggleBodyPart(part)}>
                <Text
                  style={[
                    styles.chipText,
                    { color: Colors.textSecondary },
                    selectedBodyPart === part && [styles.chipTextSelected, { color: Colors.primary }],
                  ]}>
                  {part}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.text }]}>Category</Text>
          <TouchableOpacity
            style={[
              styles.categoryRow,
              { backgroundColor: Colors.card, borderColor: Colors.border },
            ]}
            onPress={() => setShowCategoryPicker((prev) => !prev)}>
            <Text
              style={[
                styles.categoryRowText,
                !selectedCategory && { color: Colors.textSecondary },
                selectedCategory && { color: Colors.text },
              ]}>
              {selectedCategory ?? 'Select an Option'}
            </Text>
            <Text style={[styles.chevron, { color: Colors.textSecondary }]}>
              {showCategoryPicker ? '⌃' : '⌄'}
            </Text>
          </TouchableOpacity>

          {/* Expanded Category Options */}
          {showCategoryPicker && (
            <View
              style={[
                styles.categoryList,
                { backgroundColor: Colors.card, borderColor: Colors.border },
              ]}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    selectedCategory === cat && { backgroundColor: Colors.primary + '15' },
                  ]}
                  onPress={() => handleSelectCategory(cat)}>
                  <Text
                    style={[
                      styles.categoryOptionText,
                      { color: Colors.text },
                      selectedCategory === cat && { color: Colors.primary, fontWeight: '700' },
                    ]}>
                    {cat}
                  </Text>
                  {selectedCategory === cat && (
                    <Text style={[styles.checkmark, { color: Colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  saveButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  saveButtonDisabled: {
    borderWidth: 1,
  },
  saveButtonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipSelected: {
  },
  chipText: {
    fontSize: typography.base,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
  },
  categoryRowText: {
    fontSize: typography.base,
    fontWeight: '500',
  },
  chevron: {
    fontSize: typography.xl,
    fontWeight: 'bold',
  },
  categoryList: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  categoryOptionText: {
    fontSize: typography.base,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
});
