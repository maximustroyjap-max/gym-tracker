/**
 * EXERCISE DETAIL POPUP
 * Sheet-style floating card showing exercise details with tabbed navigation:
 * About, History, Charts, Records.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Exercise } from '@/constants/exercises';
import { getExerciseInstructions, generateGenericInstructions, ExerciseInstructions } from '@/constants/exerciseInstructions';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';
import { WorkoutHistoryEntry, HistoryExercise } from '@/types/user';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 72;
const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Tab Types ───
type TabType = 'about' | 'history' | 'charts' | 'records';

interface ExerciseHistoryItem {
  entry: WorkoutHistoryEntry;
  historyExercise: HistoryExercise;
  parsed: ParsedSet | null;
}

interface RecordsData {
  maxWeight: { value: number; date: string; set: string };
  maxReps: { value: number; date: string; set: string };
  maxVolume: { value: number; date: string; set: string };
  maxOneRM: { value: number; date: string; set: string };
}

const TABS: { key: TabType; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'history', label: 'History' },
  { key: 'charts', label: 'Charts' },
  { key: 'records', label: 'Records' },
];

// ─── Helpers ───

interface ParsedSet {
  kg: number;
  reps: number;
}

function parseBestSet(bestSet: string): ParsedSet | null {
  const match = bestSet.match(/([\d.]+)\s*kg\s*×\s*(\d+)/);
  if (!match) return null;
  return { kg: parseFloat(match[1]), reps: parseInt(match[2], 10) };
}

/** Epley formula for 1RM estimation */
function estimateOneRM(kg: number, reps: number): number {
  if (reps <= 1) return kg;
  return kg * (1 + reps / 30);
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateMedium(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Props ───

interface ExerciseDetailPopupProps {
  exercise: Exercise;
  onClose: () => void;
}

// ─── Main Component ───

export function ExerciseDetailPopup({ exercise, onClose }: ExerciseDetailPopupProps) {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(exercise.name);
  const [isExiting, setIsExiting] = useState(false);

  const isCustom = exercise.id.startsWith('custom-');

  // ─── Animation values ───
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;

  // Entrance animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get instructions
  const specificInstructions = useMemo(() => getExerciseInstructions(exercise.id), [exercise.id]);
  const instructionsData: ExerciseInstructions | null = useMemo(() => {
    if (isCustom) return null;
    return specificInstructions ?? generateGenericInstructions(exercise);
  }, [isCustom, specificInstructions, exercise]);

  // Filter history for this exercise
  const exerciseHistory = useMemo(() => {
    const results: {
      entry: WorkoutHistoryEntry;
      historyExercise: HistoryExercise;
      parsed: ParsedSet | null;
    }[] = [];

    for (const entry of user.workoutHistory) {
      for (const he of entry.exercises) {
        if (he.exerciseId === exercise.id || he.exerciseName === exercise.name) {
          const parsed = parseBestSet(he.bestSet);
          results.push({ entry, historyExercise: he, parsed });
        }
      }
    }

    // Sort oldest first for charts, but we reverse for display
    return results.reverse();
  }, [user.workoutHistory, exercise]);

  // Compute records
  const records = useMemo(() => {
    let maxWeight = { value: 0, date: '', set: '' };
    let maxReps = { value: 0, date: '', set: '' };
    let maxVolume = { value: 0, date: '', set: '' };
    let maxOneRM = { value: 0, date: '', set: '' };

    for (const { entry, parsed } of exerciseHistory) {
      if (!parsed) continue;
      const { kg, reps } = parsed;
      const volume = kg * reps;
      const oneRM = estimateOneRM(kg, reps);
      const dateStr = formatDateShort(entry.date);
      const setStr = `${kg} kg × ${reps}`;

      if (kg > maxWeight.value) {
        maxWeight = { value: kg, date: dateStr, set: setStr };
      }
      if (reps > maxReps.value) {
        maxReps = { value: reps, date: dateStr, set: setStr };
      }
      if (volume > maxVolume.value) {
        maxVolume = { value: volume, date: dateStr, set: setStr };
      }
      if (oneRM > maxOneRM.value) {
        maxOneRM = { value: Math.round(oneRM * 10) / 10, date: dateStr, set: setStr };
      }
    }

    return { maxWeight, maxReps, maxVolume, maxOneRM };
  }, [exerciseHistory]);

  // Chart data (last 12 entries max)
  const chartData = useMemo(() => {
    const lastEntries = exerciseHistory.slice(-12);
    return lastEntries.map(({ entry, parsed }) => ({
      date: formatDateShort(entry.date),
      weight: parsed?.kg ?? 0,
      reps: parsed?.reps ?? 0,
      volume: parsed ? parsed.kg * parsed.reps : 0,
      oneRM: parsed ? estimateOneRM(parsed.kg, parsed.reps) : 0,
    }));
  }, [exerciseHistory]);

  const handleEditSave = useCallback(() => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Exercise name cannot be empty');
      return;
    }
    if (isCustom) {
      const updated = user.customExercises.map((ex) =>
        ex.id === exercise.id ? { ...ex, name: editName.trim() } : ex
      );
      updateUser({ customExercises: updated });
    }
    setIsEditing(false);
  }, [editName, exercise.id, isCustom, updateUser, user.customExercises]);

  const handleEditCancel = useCallback(() => {
    setEditName(exercise.name);
    setIsEditing(false);
  }, [exercise.name]);

  const handleClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.97,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [isExiting, onClose, backdropOpacity, cardTranslateY, cardOpacity, cardScale]);

  const popupBottom = TAB_BAR_HEIGHT + insets.bottom + 12;
  const popupTop = insets.top + 16;

  const cardAnimatedStyle = {
    opacity: cardOpacity,
    transform: [
      { translateY: cardTranslateY },
      { scale: cardScale },
    ],
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        onPress={handleClose}
        activeOpacity={1}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.65)' },
          ]}
        />
      </TouchableOpacity>

      {/* Popup Card */}
      <Animated.View
        style={[
          styles.popupCard,
          {
            backgroundColor: Colors.background,
            borderColor: Colors.border,
            top: popupTop,
            bottom: popupBottom,
            shadowColor: Colors.shadow,
          },
          cardAnimatedStyle,
        ]}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
            onPress={handleClose}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="xmark" size={18} color={Colors.text} />
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              style={[
                styles.editInput,
                { color: Colors.text, borderColor: Colors.border, backgroundColor: Colors.card },
              ]}
              value={editName}
              onChangeText={setEditName}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <Text style={[styles.headerTitle, { color: Colors.text }]} numberOfLines={1}>
              {exercise.name}
            </Text>
          )}

          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleEditCancel} activeOpacity={activeOpacity.button}>
                <Text style={[styles.editActionText, { color: Colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditSave} activeOpacity={activeOpacity.button}>
                <Text style={[styles.editActionText, { color: Colors.primary }]}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : isCustom ? (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: Colors.card, borderColor: Colors.border }]}
              onPress={() => setIsEditing(true)}
              activeOpacity={activeOpacity.button}>
              <IconSymbol name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButtonPlaceholder} />
          )}
        </View>

        {/* ─── Tab Bar ─── */}
        <View style={[styles.tabBar, { borderBottomColor: Colors.border }]}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  isActive && { backgroundColor: Colors.card, borderColor: Colors.border },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={activeOpacity.row}>
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? Colors.text : Colors.textSecondary },
                    isActive && { fontWeight: '700' },
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Content ─── */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}>
          {activeTab === 'about' && (
            <AboutTab
              exercise={exercise}
              instructionsData={instructionsData}
              isCustom={isCustom}
              Colors={Colors}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab exerciseHistory={exerciseHistory} Colors={Colors} />
          )}
          {activeTab === 'charts' && <ChartsTab data={chartData} Colors={Colors} />}
          {activeTab === 'records' && <RecordsTab records={records} Colors={Colors} />}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── About Tab ───

function AboutTab({
  exercise,
  instructionsData,
  isCustom,
  Colors,
}: {
  exercise: Exercise;
  instructionsData: ExerciseInstructions | null;
  isCustom: boolean;
  Colors: ReturnType<typeof useTheme>;
}) {
  const hasInstructions = instructionsData && instructionsData.instructions.length > 0;

  // Icon mapping for body part
  const bodyPartIcon = useMemo(() => {
    switch (exercise.bodyPart) {
      case 'Chest':
        return 'figure.strengthtraining.traditional';
      case 'Back':
        return 'figure.strengthtraining.functional';
      case 'Legs':
        return 'figure.run';
      case 'Shoulders':
        return 'figure.arms.open';
      case 'Arms':
        return 'figure.archery';
      case 'Core':
        return 'figure.core.training';
      case 'Cardio':
        return 'heart.fill';
      case 'Full Body':
        return 'figure.mind.and.body';
      case 'Olympic':
        return 'trophy.fill';
      default:
        return 'dumbbell.fill';
    }
  }, [exercise.bodyPart]);

  return (
    <View style={styles.tabContent}>
      {/* Demo Video Placeholder */}
      <View
        style={[
          styles.demoCard,
          {
            backgroundColor: Colors.card,
            borderColor: Colors.border,
            shadowColor: Colors.shadow,
          },
        ]}>
        <View style={[styles.demoPlaceholder, { backgroundColor: Colors.border + '30' }]}>
          <IconSymbol
            name={bodyPartIcon as any}
            size={64}
            color={Colors.primary + '40'}
          />
          <Text style={[styles.demoPlaceholderText, { color: Colors.textSecondary }]}>
            Demo video coming soon
          </Text>
        </View>
        {/* Play button overlay */}
        <View style={[styles.playButton, { backgroundColor: Colors.primary }]}>
          <IconSymbol name="play.fill" size={16} color={Colors.background} />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Instructions</Text>

        {!hasInstructions ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: Colors.card, borderColor: Colors.border },
            ]}>
            <IconSymbol name="doc.text" size={28} color={Colors.textSecondary + '50'} />
            <Text style={[styles.emptyCardText, { color: Colors.textSecondary }]}>
              We don&apos;t have any instructions for this exercise.
            </Text>
          </View>
        ) : (
          <>
            {instructionsData!.instructions.map((step, index) => (
              <View key={index} style={styles.instructionRow}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '30' },
                  ]}>
                  <Text style={[styles.stepNumberText, { color: Colors.primary }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.instructionText, { color: Colors.text }]}>{step}</Text>
              </View>
            ))}

            {instructionsData!.tips && instructionsData!.tips.length > 0 && (
              <View
                style={[
                  styles.tipsCard,
                  { backgroundColor: Colors.primary + '08', borderColor: Colors.primary + '20' },
                ]}>
                <IconSymbol name="lightbulb.fill" size={16} color={Colors.primary} />
                <View style={styles.tipsContent}>
                  {instructionsData!.tips.map((tip, i) => (
                    <Text key={i} style={[styles.tipText, { color: Colors.textSecondary }]}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

// ─── History Tab ───

function HistoryTab({
  exerciseHistory,
  Colors,
}: {
  exerciseHistory: ExerciseHistoryItem[];
  Colors: ReturnType<typeof useTheme>;
}) {
  if (exerciseHistory.length === 0) {
    return (
      <View style={styles.tabContent}>
        <View style={[styles.emptyCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
          <IconSymbol name="clock" size={32} color={Colors.textSecondary + '50'} />
          <Text style={[styles.emptyCardText, { color: Colors.textSecondary }]}>
            No history yet for this exercise.
          </Text>
          <Text style={[styles.emptyCardSubtext, { color: Colors.textSecondary + '80' }]}>
            Complete a workout with this exercise to see your history here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {exerciseHistory
        .slice()
        .reverse()
        .map(({ entry, historyExercise, parsed }, index) => (
          <View
            key={`${entry.id}-${index}`}
            style={[
              styles.historyCard,
              {
                backgroundColor: Colors.card,
                borderColor: Colors.border,
                shadowColor: Colors.shadow,
              },
            ]}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={[styles.historyDate, { color: Colors.text }]}>
                  {formatDateMedium(entry.date)}
                </Text>
                <Text style={[styles.historyTemplate, { color: Colors.textSecondary }]}>
                  {entry.templateName}
                </Text>
              </View>
              <View style={[styles.setsBadge, { backgroundColor: Colors.primary + '12' }]}>
                <Text style={[styles.setsBadgeText, { color: Colors.primary }]}>
                  {historyExercise.sets} sets
                </Text>
              </View>
            </View>

            <View style={[styles.historyDivider, { backgroundColor: Colors.border }]} />

            <View style={styles.historyStats}>
              <View style={styles.historyStat}>
                <Text style={[styles.historyStatLabel, { color: Colors.textSecondary }]}>
                  Best Set
                </Text>
                <Text style={[styles.historyStatValue, { color: Colors.text }]}>
                  {historyExercise.bestSet}
                </Text>
              </View>
              {parsed && (
                <View style={styles.historyStat}>
                  <Text style={[styles.historyStatLabel, { color: Colors.textSecondary }]}>
                    Est. 1RM
                  </Text>
                  <Text style={[styles.historyStatValue, { color: Colors.primary }]}>
                    {Math.round(estimateOneRM(parsed.kg, parsed.reps) * 10) / 10} kg
                  </Text>
                </View>
              )}
              {parsed && (
                <View style={styles.historyStat}>
                  <Text style={[styles.historyStatLabel, { color: Colors.textSecondary }]}>
                    Volume
                  </Text>
                  <Text style={[styles.historyStatValue, { color: Colors.text }]}>
                    {parsed.kg * parsed.reps} kg
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
    </View>
  );
}

// ─── Charts Tab ───

function ChartsTab({
  data,
  Colors,
}: {
  data: { date: string; weight: number; reps: number; volume: number; oneRM: number }[];
  Colors: ReturnType<typeof useTheme>;
}) {
  if (data.length === 0) {
    return (
      <View style={styles.tabContent}>
        <View style={[styles.emptyCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
          <IconSymbol name="chart.bar" size={32} color={Colors.textSecondary + '50'} />
          <Text style={[styles.emptyCardText, { color: Colors.textSecondary }]}>
            No data to chart yet.
          </Text>
          <Text style={[styles.emptyCardSubtext, { color: Colors.textSecondary + '80' }]}>
            Log some workouts to see your progress visualized.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* Weight Progression */}
      <ChartCard
        title="Weight Progression"
        subtitle="Best set weight over time"
        data={data.map((d) => ({ label: d.date, value: d.weight }))}
        color={Colors.primary}
        unit="kg"
        Colors={Colors}
      />

      {/* Estimated 1RM */}
      <ChartCard
        title="Estimated 1RM"
        subtitle="One-rep max trend (Epley formula)"
        data={data.map((d) => ({ label: d.date, value: Math.round(d.oneRM * 10) / 10 }))}
        color={Colors.secondary}
        unit="kg"
        Colors={Colors}
      />

      {/* Volume Trend */}
      <ChartCard
        title="Volume per Workout"
        subtitle="Weight × Reps for best set"
        data={data.map((d) => ({ label: d.date, value: d.volume }))}
        color={Colors.gold}
        unit="kg"
        Colors={Colors}
      />
    </View>
  );
}

function ChartCard({
  title,
  subtitle,
  data,
  color,
  unit,
  Colors,
}: {
  title: string;
  subtitle: string;
  data: { label: string; value: number }[];
  color: string;
  unit: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minDisplayValue = Math.min(...data.map((d) => d.value));
  // Show max 8 bars
  const displayData = data.length > 8 ? data.slice(-8) : data;

  return (
    <View
      style={[
        styles.chartCard,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.border,
          shadowColor: Colors.shadow,
        },
      ]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: Colors.text }]}>{title}</Text>
        <Text style={[styles.chartSubtitle, { color: Colors.textSecondary }]}>{subtitle}</Text>
      </View>

      <View style={styles.chartArea}>
        {displayData.map((item, i) => {
          const pct = item.value / maxValue;
          const barHeight = Math.max(pct * 100, 4);
          return (
            <View key={i} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${barHeight}%`,
                      backgroundColor: color,
                      opacity: 0.7 + (pct * 0.3),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: Colors.text }]} numberOfLines={1}>
                {item.value}
              </Text>
              <Text style={[styles.barLabel, { color: Colors.textSecondary }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.chartFooter, { borderTopColor: Colors.border }]}>
        <Text style={[styles.chartFooterText, { color: Colors.textSecondary }]}>
          Max: <Text style={{ color: color, fontWeight: '700' }}>{maxValue} {unit}</Text>
          {'  ·  '}
          Min: <Text style={{ color: Colors.text, fontWeight: '600' }}>{minDisplayValue} {unit}</Text>
        </Text>
      </View>
    </View>
  );
}

// ─── Records Tab ───

function RecordsTab({
  records,
  Colors,
}: {
  records: RecordsData;
  Colors: ReturnType<typeof useTheme>;
}) {
  const hasRecords = records.maxWeight.value > 0;

  if (!hasRecords) {
    return (
      <View style={styles.tabContent}>
        <View style={[styles.emptyCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
          <IconSymbol name="trophy" size={32} color={Colors.textSecondary + '50'} />
          <Text style={[styles.emptyCardText, { color: Colors.textSecondary }]}>
            No personal records yet.
          </Text>
          <Text style={[styles.emptyCardSubtext, { color: Colors.textSecondary + '80' }]}>
            Keep training to set new PRs!
          </Text>
        </View>
      </View>
    );
  }

  const recordCards = [
    {
      title: 'Max Weight',
      value: `${records.maxWeight.value} kg`,
      sub: records.maxWeight.set,
      date: records.maxWeight.date,
      color: Colors.primary,
      icon: 'scalemass.fill' as const,
    },
    {
      title: 'Max Reps',
      value: `${records.maxReps.value} reps`,
      sub: records.maxReps.set,
      date: records.maxReps.date,
      color: Colors.secondary,
      icon: 'number' as const,
    },
    {
      title: 'Max Volume',
      value: `${records.maxVolume.value} kg`,
      sub: records.maxVolume.set,
      date: records.maxVolume.date,
      color: Colors.gold,
      icon: 'chart.bar.fill' as const,
    },
    {
      title: 'Est. 1RM',
      value: `${records.maxOneRM.value} kg`,
      sub: records.maxOneRM.set,
      date: records.maxOneRM.date,
      color: Colors.primary,
      icon: 'bolt.fill' as const,
    },
  ];

  return (
    <View style={styles.tabContent}>
      <View style={styles.recordsGrid}>
        {recordCards.map((card, i) => (
          <View
            key={i}
            style={[
              styles.recordCard,
              {
                backgroundColor: Colors.card,
                borderColor: Colors.border,
                shadowColor: Colors.shadow,
              },
            ]}>
            <View style={[styles.recordIconWrap, { backgroundColor: card.color + '12' }]}>
              <IconSymbol name={card.icon} size={20} color={card.color} />
            </View>
            <Text style={[styles.recordTitle, { color: Colors.textSecondary }]}>{card.title}</Text>
            <Text style={[styles.recordValue, { color: Colors.text }]}>{card.value}</Text>
            <Text style={[styles.recordSub, { color: card.color }]}>{card.sub}</Text>
            <Text style={[styles.recordDate, { color: Colors.textSecondary + '90' }]}>{card.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popupCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPlaceholder: {
    width: touch.iconContainer,
    height: touch.iconContainer,
  },
  editInput: {
    flex: 1,
    fontSize: typography.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  editActionText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: touch.minHeight - 4,
  },
  tabText: {
    fontSize: typography.sm,
    fontWeight: '500',
  },
  contentScroll: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // Demo
  demoCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  demoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  demoPlaceholderText: {
    fontSize: typography.sm,
    fontWeight: '500',
  },
  playButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Instructions
  instructionsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: 'bold',
  },
  instructionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: typography.sm,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: typography.base,
    lineHeight: 22,
    fontWeight: '400',
  },
  tipsCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  tipsContent: {
    flex: 1,
    gap: spacing.xs,
  },
  tipText: {
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  emptyCardText: {
    fontSize: typography.base,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCardSubtext: {
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  // History
  historyCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyDate: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  historyTemplate: {
    fontSize: typography.sm,
    marginTop: 2,
  },
  setsBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  setsBadgeText: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  historyDivider: {
    height: StyleSheet.hairlineWidth,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStat: {
    alignItems: 'center',
    flex: 1,
  },
  historyStatLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  historyStatValue: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },

  // Charts
  chartCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: spacing.md,
  },
  chartHeader: {
    gap: 2,
  },
  chartTitle: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    fontSize: typography.sm,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barWrapper: {
    width: '70%',
    height: 100,
    justifyContent: 'flex-end',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  barValue: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  barLabel: {
    fontSize: 10,
  },
  chartFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  chartFooterText: {
    fontSize: typography.sm,
    textAlign: 'center',
  },

  // Records
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  recordCard: {
    width: (SCREEN_WIDTH - 24 - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  recordIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recordTitle: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordValue: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
  },
  recordSub: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  recordDate: {
    fontSize: typography.xs,
  },
});
