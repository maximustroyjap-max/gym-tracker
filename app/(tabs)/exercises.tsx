/**
 * EXERCISES TAB
 *
 * Displays all built-in exercises + custom exercises alphabetically.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SectionList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { CreateCustomExercise } from '@/components/CreateCustomExercise';
import { ExerciseDetailPopup } from '@/components/ExerciseDetailPopup';
import {
  EXERCISES,
  BODY_PARTS,
  CATEGORIES,
  Exercise,
  BodyPart,
  Category,
} from '@/constants/exercises';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

interface ExerciseSection {
  title: string;
  data: Exercise[];
}

const DELETE_WIDTH = 140;

export default function ExercisesScreen() {
  const Colors = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [showBodyPartPicker, setShowBodyPartPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const allExercises = useMemo(() => {
    const hiddenSet = new Set(user.hiddenExerciseIds);
    const combined = [...EXERCISES, ...user.customExercises].filter(
      (ex) => !hiddenSet.has(ex.id)
    );
    return combined;
  }, [user.customExercises, user.hiddenExerciseIds]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = allExercises.filter((exercise) => {
      const matchesSearch =
        query.length === 0 || exercise.name.toLowerCase().includes(query);
      const matchesBodyPart =
        !selectedBodyPart || exercise.bodyPart === selectedBodyPart;
      const matchesCategory =
        !selectedCategory || exercise.category === selectedCategory;
      return matchesSearch && matchesBodyPart && matchesCategory;
    });

    result.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAscending ? cmp : -cmp;
    });

    return result;
  }, [searchQuery, selectedBodyPart, selectedCategory, sortAscending, allExercises]);

  const sections: ExerciseSection[] = useMemo(() => {
    const grouped = new Map<string, Exercise[]>();
    for (const exercise of filteredExercises) {
      const firstChar = exercise.name.charAt(0).toUpperCase();
      const key = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(exercise);
    }
    const keys = Array.from(grouped.keys()).sort((a, b) =>
      sortAscending ? a.localeCompare(b) : b.localeCompare(a)
    );
    return keys.map((key) => ({
      title: key,
      data: grouped.get(key)!,
    }));
  }, [filteredExercises, sortAscending]);

  const toggleSort = () => setSortAscending((prev) => !prev);

  const clearFilters = () => {
    setSelectedBodyPart(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleDeleteExercise = useCallback(
    (exercise: Exercise) => {
      const isCustom = exercise.id.startsWith('custom-');

      if (isCustom) {
        const updatedCustom = user.customExercises.filter(
          (ex) => ex.id !== exercise.id
        );
        updateUser({
          customExercises: updatedCustom,
          hiddenExerciseIds: [...user.hiddenExerciseIds, exercise.id],
        });
      } else {
        updateUser({
          hiddenExerciseIds: [...user.hiddenExerciseIds, exercise.id],
        });
      }
    },
    [user.customExercises, user.hiddenExerciseIds, updateUser]
  );

  const showDeleteConfirmation = useCallback(
    (exercise: Exercise) => {
      Alert.alert(
        'Delete Exercise',
        `Are you sure you want to delete "${exercise.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeleteExercise(exercise),
          },
        ],
        { cancelable: true }
      );
    },
    [handleDeleteExercise]
  );

  const renderExerciseItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <SwipeableExerciseRow
        exercise={item}
        Colors={Colors}
        onDelete={handleDeleteExercise}
        onLongPress={showDeleteConfirmation}
        onPress={() => setSelectedExercise(item)}
      />
    ),
    [Colors, handleDeleteExercise, showDeleteConfirmation]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: ExerciseSection }) => (
      <View style={[styles.sectionHeader, { borderBottomColor: Colors.border }]}>
        <Text style={[styles.sectionHeaderText, { color: Colors.textSecondary }]}>
          {section.title}
        </Text>
      </View>
    ),
    [Colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: Colors.text }]}>Exercises</Text>
        <TouchableOpacity
          style={[
            styles.newButton,
            { backgroundColor: Colors.card, borderColor: Colors.border },
          ]}
          onPress={() => setShowCreateExercise(true)}
          activeOpacity={activeOpacity.card}>
          <Text style={[styles.newButtonText, { color: Colors.textSecondary }]}>NEW</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchWrapper,
            { backgroundColor: Colors.card, borderColor: Colors.border },
          ]}>
          <IconSymbol name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: Colors.text }]}
            placeholder="Search exercises"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: Colors.card,
              borderColor: selectedBodyPart ? Colors.primary : Colors.border,
            },
          ]}
          onPress={() => setShowBodyPartPicker(true)}
          activeOpacity={activeOpacity.card}>
          <Text
            style={[
              styles.filterButtonText,
              { color: selectedBodyPart ? Colors.primary : Colors.text },
            ]}>
            {selectedBodyPart ?? 'Any Body Part'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: Colors.card,
              borderColor: selectedCategory ? Colors.primary : Colors.border,
            },
          ]}
          onPress={() => setShowCategoryPicker(true)}
          activeOpacity={activeOpacity.card}>
          <Text
            style={[
              styles.filterButtonText,
              { color: selectedCategory ? Colors.primary : Colors.text },
            ]}>
            {selectedCategory ?? 'Any Category'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
          onPress={toggleSort}
          activeOpacity={activeOpacity.card}>
          <IconSymbol
            name="arrow.up.arrow.down"
            size={20}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Exercise List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!selectedExercise}
        pointerEvents={selectedExercise ? 'none' : 'auto'}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>
              No exercises found
            </Text>
            <TouchableOpacity
              style={[
                styles.clearFiltersButton,
                { backgroundColor: Colors.card, borderColor: Colors.border },
              ]}
              onPress={clearFilters}
              activeOpacity={activeOpacity.card}>
              <Text style={[styles.clearFiltersText, { color: Colors.primary }]}>
                Clear all filters
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Body Part Picker Modal */}
      <FilterPickerModal
        visible={showBodyPartPicker}
        onClose={() => setShowBodyPartPicker(false)}
        title="Body Part"
        options={BODY_PARTS}
        selected={selectedBodyPart}
        onSelect={(val) => setSelectedBodyPart(val as BodyPart | null)}
        clearLabel="Any Body Part"
        Colors={Colors}
      />

      {/* Category Picker Modal */}
      <FilterPickerModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        title="Category"
        options={CATEGORIES}
        selected={selectedCategory}
        onSelect={(val) => setSelectedCategory(val as Category | null)}
        clearLabel="Any Category"
        Colors={Colors}
      />

      {/* Create Custom Exercise Overlay */}
      {showCreateExercise && (
        <View style={styles.overlay}>
          <CreateCustomExercise onClose={() => setShowCreateExercise(false)} />
        </View>
      )}

      {/* Exercise Detail Popup */}
      {selectedExercise && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <ExerciseDetailPopup
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

interface SwipeableExerciseRowProps {
  exercise: Exercise;
  Colors: ReturnType<typeof useTheme>;
  onDelete: (exercise: Exercise) => void;
  onLongPress: (exercise: Exercise) => void;
  onPress: (exercise: Exercise) => void;
}

function SwipeableExerciseRow({
  exercise,
  Colors,
  onDelete,
  onLongPress,
  onPress,
}: SwipeableExerciseRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidthRef = useRef(0);
  const hasDeletedRef = useRef(false);
  const currentXRef = useRef(0);
  const startXRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const pressScale = useRef(new Animated.Value(1)).current;

  const callbacksRef = useRef({
    onDelete,
    exercise,
    translateX,
    rowWidthRef,
    hasDeletedRef,
    currentXRef,
    startXRef,
    setIsOpen,
  });
  callbacksRef.current = {
    onDelete,
    exercise,
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
    const { hasDeletedRef, rowWidthRef, translateX, onDelete, exercise } = callbacksRef.current;
    if (hasDeletedRef.current) return;
    hasDeletedRef.current = true;

    Animated.timing(translateX, {
      toValue: -rowWidthRef.current,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      onDelete(exercise);
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
          styles.exerciseRowForeground,
          { backgroundColor: Colors.background, transform: [{ translateX }] },
        ]}
        pointerEvents={isOpen ? 'none' : 'box-none'}>
        <TouchableOpacity
          style={styles.exerciseRowInner}
          onPressIn={() => {
            Animated.spring(pressScale, {
              toValue: 0.97,
              friction: 5,
              tension: 300,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(pressScale, {
              toValue: 1,
              friction: 5,
              tension: 300,
              useNativeDriver: true,
            }).start();
          }}
          onPress={() => onPress(exercise)}
          onLongPress={() => onLongPress(exercise)}
          delayLongPress={400}
          activeOpacity={1}>
          <Animated.View style={[styles.exerciseRowContent, { transform: [{ scale: pressScale }] }]}>
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, { color: Colors.text }]}>
                {exercise.name}
              </Text>
              <Text style={[styles.exerciseMeta, { color: Colors.textSecondary }]}>
                {exercise.bodyPart}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors.textSecondary + '60'} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function FilterPickerModal<T extends string>({
  visible,
  onClose,
  title,
  options,
  selected,
  onSelect,
  clearLabel,
  Colors,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: T[];
  selected: T | null;
  onSelect: (val: T | null) => void;
  clearLabel: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  const handleSelect = (val: T | null) => {
    onSelect(val);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: Colors.card, shadowColor: Colors.shadow },
          ]}>
          <Text style={[styles.modalTitle, { color: Colors.text }]}>{title}</Text>

          {/* Clear option */}
          <TouchableOpacity
            style={[
              styles.modalOption,
              selected === null && { backgroundColor: Colors.primary + '12' },
            ]}
            onPress={() => handleSelect(null)}
            activeOpacity={activeOpacity.row}>
            <Text
              style={[
                styles.modalOptionText,
                { color: selected === null ? Colors.primary : Colors.text },
                selected === null && { fontWeight: '700' },
              ]}>
              {clearLabel}
            </Text>
            {selected === null && (
              <IconSymbol name="checkmark" size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>

          {/* Options */}
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                selected === option && { backgroundColor: Colors.primary + '12' },
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={activeOpacity.row}>
              <Text
                style={[
                  styles.modalOptionText,
                  { color: selected === option ? Colors.primary : Colors.text },
                  selected === option && { fontWeight: '700' },
                ]}>
                {option}
              </Text>
              {selected === option && (
                <IconSymbol name="checkmark" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: typography['3xl'],
    fontWeight: 'bold',
  },
  newButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  newButtonText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.lg,
    paddingVertical: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  filterButtonText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  sortButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    // paddingBottom set dynamically via inline style
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderText: {
    fontSize: typography.xl,
    fontWeight: 'bold',
  },
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  exerciseRowForeground: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  exerciseRowInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  exerciseRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: typography.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.lg,
  },
  emptyStateText: {
    fontSize: typography.base,
    marginBottom: spacing.md,
  },
  clearFiltersButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  clearFiltersText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
    maxHeight: '70%',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: touch.minHeight,
  },
  modalOptionText: {
    fontSize: typography.lg,
    fontWeight: '500',
  },
});
