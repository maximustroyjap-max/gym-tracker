/**
 * EXERCISE PICKER
 * Full-screen exercise selector with Huashu-style premium polish:
 * spring entrance animation, gloss-layer selected cards, premium filter chips,
 * focused search bar with icon, and press-scale tactile feedback.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';
import {
  EXERCISES,
  BODY_PARTS,
  CATEGORIES,
  Exercise,
  BodyPart,
  Category,
} from '@/constants/exercises';

interface ExercisePickerProps {
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  onCreateExercise: () => void;
  /** When true, tapping an exercise immediately selects it without checkmark/ADD UI */
  hideSelection?: boolean;
}

export function ExercisePicker({ onClose, onSelectExercise, onCreateExercise, hideSelection }: ExercisePickerProps) {
  const Colors = useTheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isImmediateMode = !!hideSelection;

  // ── Entrance animation ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Combine built-in exercises with user's custom exercises
  const allExercises = useMemo(() => {
    const combined = [...EXERCISES, ...user.customExercises];
    return combined.sort((a, b) => a.name.localeCompare(b.name));
  }, [user.customExercises]);

  // Filter exercises based on search + body part + category
  const filteredExercises = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allExercises.filter((exercise) => {
      const matchesSearch =
        query.length === 0 || exercise.name.toLowerCase().includes(query);
      const matchesBodyPart =
        !selectedBodyPart || exercise.bodyPart === selectedBodyPart;
      const matchesCategory =
        !selectedCategory || exercise.category === selectedCategory;
      return matchesSearch && matchesBodyPart && matchesCategory;
    });
  }, [searchQuery, selectedBodyPart, selectedCategory, allExercises]);

  const toggleBodyPart = useCallback((part: BodyPart) => {
    setSelectedBodyPart((prev) => (prev === part ? null : part));
  }, []);

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategory((prev) => (prev === cat ? null : cat));
  }, []);

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    if (isImmediateMode) {
      onSelectExercise(exercise);
      onClose();
      return;
    }
    setSelectedExerciseId(exercise.id);
  }, [isImmediateMode, onSelectExercise, onClose]);

  const handleAdd = () => {
    if (selectedExerciseId) {
      const exercise = allExercises.find((e) => e.id === selectedExerciseId);
      if (exercise) {
        onSelectExercise(exercise);
      }
    }
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: Colors.background,
          zIndex: 100,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.newButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
          onPress={onCreateExercise}
          activeOpacity={activeOpacity.button}>
          <Text style={[styles.newButtonText, { color: Colors.textSecondary }]}>NEW</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Add Exercise</Text>
        {!isImmediateMode && (
          <TouchableOpacity
            style={[
              styles.addButton,
              !selectedExerciseId && [styles.addButtonDisabled, { backgroundColor: Colors.card, borderColor: Colors.border }],
              selectedExerciseId && { backgroundColor: Colors.primary },
            ]}
            onPress={handleAdd}
            disabled={!selectedExerciseId}
            activeOpacity={activeOpacity.button}>
            <Text
              style={[
                styles.addButtonText,
                !selectedExerciseId && [styles.addButtonTextDisabled, { color: Colors.textSecondary }],
                selectedExerciseId && { color: Colors.background },
              ]}>
              ADD
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar with icon + focus state */}
      <View
        style={[
          styles.searchRow,
          {
            backgroundColor: Colors.card,
            borderColor: isSearchFocused ? Colors.primary : Colors.border,
          },
        ]}>
        <IconSymbol
          name="search"
          size={18}
          color={isSearchFocused ? Colors.primary : Colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: Colors.text }]}
          placeholder="Search exercises..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>

      {/* Body Part Filters */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: Colors.textSecondary }]}>Body Part</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {BODY_PARTS.map((part) => (
            <FilterChip
              key={part}
              label={part}
              isSelected={selectedBodyPart === part}
              onPress={() => toggleBodyPart(part)}
              Colors={Colors}
            />
          ))}
        </ScrollView>
      </View>

      {/* Category Filters */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: Colors.textSecondary }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              isSelected={selectedCategory === cat}
              onPress={() => toggleCategory(cat)}
              Colors={Colors}
            />
          ))}
        </ScrollView>
      </View>

      {/* Exercise List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.resultCount, { color: Colors.textSecondary }]}>
          {filteredExercises.length} exercise
          {filteredExercises.length !== 1 ? 's' : ''}
        </Text>
        {filteredExercises.map((exercise) => {
          const isSelected = selectedExerciseId === exercise.id;
          return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseItem,
                { backgroundColor: Colors.card, borderColor: Colors.border },
                isSelected && {
                  borderColor: Colors.primary,
                  backgroundColor: Colors.primary + '0D',
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => handleSelectExercise(exercise)}
              activeOpacity={activeOpacity.row}>
              {/* Huashu gloss layer on selected cards */}
              {isSelected && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    backgroundColor: Colors.gloss,
                    borderTopLeftRadius: radius.md,
                    borderTopRightRadius: radius.md,
                  }}
                />
              )}
              <View style={styles.exerciseInfo}>
                <Text
                  style={[
                    styles.exerciseName,
                    { color: Colors.text },
                    isSelected && { color: Colors.primary, fontWeight: '700' },
                  ]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.exerciseMeta, { color: Colors.textSecondary }]}>
                  {exercise.bodyPart} · {exercise.category}
                </Text>
              </View>
              {!isImmediateMode && isSelected && (
                <View style={[styles.checkmark, { backgroundColor: Colors.primary }]}>
                  <IconSymbol name="checkmark" size={14} color={Colors.background} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: Colors.card, borderColor: Colors.border },
              ]}>
              <IconSymbol name="search" size={32} color={Colors.textSecondary} />
            </View>
            <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>
              No exercises match your filters
            </Text>
            <TouchableOpacity
              style={[
                styles.clearFiltersButton,
                { backgroundColor: Colors.card, borderColor: Colors.border },
              ]}
              onPress={() => {
                setSearchQuery('');
                setSelectedBodyPart(null);
                setSelectedCategory(null);
              }}
              activeOpacity={activeOpacity.button}>
              <Text style={[styles.clearFiltersText, { color: Colors.primary }]}>
                Clear all filters
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

/** Reusable filter chip button with premium active states */
function FilterChip({
  label,
  isSelected,
  onPress,
  Colors,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: Colors.card, borderColor: Colors.border },
        isSelected && {
          backgroundColor: Colors.primary + '15',
          borderColor: Colors.primary,
          borderWidth: 1.5,
        },
      ]}
      onPress={onPress}
      activeOpacity={activeOpacity.button}>
      <Text
        style={[
          styles.chipText,
          { color: Colors.textSecondary },
          isSelected && { color: Colors.primary, fontWeight: '700' },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  newButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  newButtonText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  addButtonDisabled: {
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: typography.sm,
    fontWeight: 'bold',
  },
  addButtonTextDisabled: {
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: touch.minHeight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.base,
  },
  filterSection: {
    marginTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: typography.sm,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  resultCount: {
    fontSize: typography.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.base,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  exerciseMeta: {
    fontSize: typography.xs,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  emptyStateText: {
    fontSize: typography.base,
    marginBottom: spacing.md,
  },
  clearFiltersButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  clearFiltersText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
});
