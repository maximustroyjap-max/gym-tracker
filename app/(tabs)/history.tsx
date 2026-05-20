/**
 * HISTORY SCREEN
 *
 * Displays a chronological list of every completed workout, newest first.
 * Top-right Calendar button opens a scrollable month-view calendar.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WorkoutHistoryEntry, HistoryExercise } from '@/types/user';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_GAP = 6;
const AVAILABLE_WIDTH = SCREEN_WIDTH - 64;
const DAY_CELL_SIZE = Math.floor((AVAILABLE_WIDTH - 6 * DAY_GAP) / 7);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatWeekday(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs > 0) {
    return `${hrs}h ${remainingMins}m`;
  }
  return `${remainingMins} min`;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayOffset(year: number, month: number): number {
  const dayOfWeek = new Date(year, month, 1).getDay();
  return (dayOfWeek + 6) % 7;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  workoutHistory: WorkoutHistoryEntry[];
  Colors: ReturnType<typeof useTheme>;
}

function CalendarModal({ visible, onClose, workoutHistory, Colors }: CalendarModalProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const scrollViewRef = useRef<ScrollView>(null);
  const monthPositions = useRef<Map<string, number>>(new Map());

  const workoutDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const entry of workoutHistory) {
      set.add(toDateKey(new Date(entry.date)));
    }
    return set;
  }, [workoutHistory]);

  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    let start = new Date(today.getFullYear(), today.getMonth() - 24, 1);
    let end = new Date(today.getFullYear(), today.getMonth() + 24, 1);

    if (workoutHistory.length > 0) {
      const dates = workoutHistory.map((h) => new Date(h.date).getTime());
      const earliest = new Date(Math.min(...dates));
      const latest = new Date(Math.max(...dates));
      const earliestMonth = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
      const latestMonth = new Date(latest.getFullYear(), latest.getMonth(), 1);
      if (earliestMonth < start) start = earliestMonth;
      if (latestMonth > end) end = latestMonth;
    }

    const cursor = new Date(start);
    while (cursor <= end) {
      result.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return result;
  }, [workoutHistory, today]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;
        const y = monthPositions.current.get(currentMonthKey);
        if (y !== undefined && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y, animated: false });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visible, today]);

  const handleMonthLayout = (year: number, month: number, y: number) => {
    monthPositions.current.set(`${year}-${month}`, y);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: Colors.background, shadowColor: Colors.shadow },
          ]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.card, borderColor: Colors.border },
              ]}
              onPress={onClose}
              activeOpacity={activeOpacity.button}>
              <IconSymbol name="xmark" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: Colors.text }]}>Calendar</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Calendar Scroll */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.calendarScroll}
            contentContainerStyle={styles.calendarScrollContent}
            showsVerticalScrollIndicator={false}>
            {months.map(({ year, month }) => (
              <MonthGrid
                key={`${year}-${month}`}
                year={year}
                month={month}
                workoutDateSet={workoutDateSet}
                todayKey={todayKey}
                Colors={Colors}
                onLayout={(y) => handleMonthLayout(year, month, y)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function MonthGrid({
  year,
  month,
  workoutDateSet,
  todayKey,
  Colors,
  onLayout,
}: {
  year: number;
  month: number;
  workoutDateSet: Set<string>;
  todayKey: string;
  Colors: ReturnType<typeof useTheme>;
  onLayout?: (y: number) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const startOffset = getMondayOffset(year, month);
  const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;

  return (
    <View style={styles.monthContainer} onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      <Text style={[styles.monthTitle, { color: Colors.text }]}>
        {MONTH_NAMES[month]} {year}
      </Text>

      {/* Day of week headers */}
      <View style={[styles.dayHeaderRow, { gap: DAY_GAP }]}>
        {DAY_HEADERS.map((day, i) => (
          <Text
            key={i}
            style={[
              styles.dayHeaderText,
              { color: Colors.textSecondary, width: DAY_CELL_SIZE },
            ]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.dayGrid}>
        {Array.from({ length: totalCells }).map((_, index) => {
          const dayNumber = index - startOffset + 1;
          if (dayNumber < 1 || dayNumber > daysInMonth) {
            return <View key={index} style={styles.dayCell} />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
          const hasWorkout = workoutDateSet.has(dateKey);
          const isToday = dateKey === todayKey;

          return (
            <View key={index} style={styles.dayCell}>
              {hasWorkout ? (
                <View
                  style={[
                    styles.workoutDayCircle,
                    { backgroundColor: Colors.primary },
                  ]}>
                  <Text style={[styles.workoutDayText, { color: Colors.background }]}>
                    {dayNumber}
                  </Text>
                  <View style={[styles.workoutDot, { backgroundColor: Colors.background }]}>
                    <IconSymbol name="checkmark" size={8} color={Colors.primary} />
                  </View>
                </View>
              ) : isToday ? (
                <View
                  style={[
                    styles.todayCircle,
                    { borderColor: Colors.text },
                  ]}>
                  <Text style={[styles.todayText, { color: Colors.text }]}>
                    {dayNumber}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.dayText, { color: Colors.textSecondary }]}>
                  {dayNumber}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const Colors = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useUser();
  const [showCalendar, setShowCalendar] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const history = user.workoutHistory;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Platform.OS === 'web' ? Colors.background : 'transparent' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>History</Text>
        <TouchableOpacity
          style={[
            styles.calendarButton,
            { backgroundColor: Colors.card, borderColor: Colors.border },
          ]}
          onPress={() => setShowCalendar(true)}
          activeOpacity={activeOpacity.button}>
          <IconSymbol name="calendar" size={18} color={Colors.textSecondary} />
          <Text style={[styles.calendarButtonText, { color: Colors.textSecondary }]}>
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: Colors.card, borderColor: Colors.border },
            ]}>
            <IconSymbol name="clock.fill" size={40} color={Colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: Colors.text }]}>No Workouts Yet</Text>
          <Text style={[styles.emptySubtitle, { color: Colors.textSecondary }]}>
            Complete your first workout and it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HistoryCard entry={item} Colors={Colors} />}
        />
      )}

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        workoutHistory={history}
        Colors={Colors}
      />
    </SafeAreaView>
  );
}

function HistoryCard({
  entry,
  Colors,
}: {
  entry: WorkoutHistoryEntry;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.border,
          shadowColor: Colors.shadow,
        },
      ]}>
      {/* Card Header: Date + PR badge */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.weekday, { color: Colors.textSecondary }]}>
            {formatWeekday(entry.date)}
          </Text>
          <Text style={[styles.date, { color: Colors.text }]}>{formatDate(entry.date)}</Text>
        </View>
        {entry.prAchieved && (
          <View
            style={[
              styles.prBadge,
              { backgroundColor: Colors.gold + '15', borderColor: Colors.gold + '44' },
            ]}>
            <IconSymbol name="checkmark" size={12} color={Colors.gold} />
            <Text style={[styles.prBadgeText, { color: Colors.gold }]}>PR</Text>
          </View>
        )}
      </View>

      {/* Workout Name + Duration */}
      <View style={styles.workoutMeta}>
        <Text style={[styles.templateName, { color: Colors.text }]}>{entry.templateName}</Text>
        <View style={[styles.durationBadge, { backgroundColor: Colors.background }]}>
          <IconSymbol name="clock.fill" size={12} color={Colors.textSecondary} />
          <Text style={[styles.durationText, { color: Colors.textSecondary }]}>
            {formatDuration(entry.duration)}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: Colors.border }]} />

      {/* Exercise List */}
      <View style={styles.exerciseList}>
        {entry.exercises.map((ex, index) => (
          <ExerciseRow
            key={`${ex.exerciseId}-${index}`}
            exercise={ex}
            isLast={index === entry.exercises.length - 1}
            Colors={Colors}
          />
        ))}
      </View>

      {/* PR Details */}
      {entry.prAchieved && entry.prDetails && (
        <View
          style={[
            styles.prDetailsBox,
            { backgroundColor: Colors.gold + '0D', borderColor: Colors.gold + '33' },
          ]}>
          <IconSymbol name="checkmark" size={14} color={Colors.gold} />
          <Text style={[styles.prDetailsText, { color: Colors.gold }]} numberOfLines={2}>
            {entry.prDetails}
          </Text>
        </View>
      )}
    </View>
  );
}

function ExerciseRow({
  exercise,
  isLast,
  Colors,
}: {
  exercise: HistoryExercise;
  isLast: boolean;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={[
        styles.exerciseRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: Colors.border + '44' },
      ]}>
      <View style={styles.exerciseLeft}>
        <Text style={[styles.exerciseName, { color: Colors.text }]} numberOfLines={1}>
          {exercise.exerciseName}
        </Text>
        <Text style={[styles.exerciseMeta, { color: Colors.textSecondary }]}>
          {exercise.sets} set{exercise.sets !== 1 ? 's' : ''} · {exercise.bodyPart}
        </Text>
      </View>
      <View style={styles.exerciseRight}>
        <Text style={[styles.bestSetLabel, { color: Colors.textSecondary }]}>Best</Text>
        <Text style={[styles.bestSetValue, { color: Colors.primary }]}>{exercise.bestSet}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: 'bold',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  calendarButtonText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  weekday: {
    fontSize: typography.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  date: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  prBadgeText: {
    fontSize: typography.xs,
    fontWeight: 'bold',
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  templateName: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  durationText: {
    fontSize: typography.sm,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginBottom: spacing.sm,
  },
  exerciseList: {
    gap: 0,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  exerciseLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  exerciseName: {
    fontSize: typography.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: typography.xs,
  },
  exerciseRight: {
    alignItems: 'flex-end',
  },
  bestSetLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  bestSetValue: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
  prDetailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  prDetailsText: {
    flex: 1,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Calendar Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalSheet: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: touch.iconContainer,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
  calendarScroll: {
    maxHeight: 480,
  },
  calendarScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // ── Month Grid ──
  monthContainer: {
    marginBottom: spacing.xl,
  },
  monthTitle: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  dayHeaderText: {
    textAlign: 'center',
    fontSize: typography.sm,
    fontWeight: '600',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: DAY_GAP,
  },
  dayCell: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: typography.base,
    fontWeight: '500',
  },
  workoutDayCircle: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE,
    borderRadius: DAY_CELL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  workoutDayText: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
  workoutDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE,
    borderRadius: DAY_CELL_SIZE / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayText: {
    fontSize: typography.base,
    fontWeight: 'bold',
  },
});
