/**
 * WORKOUTS PER WEEK WIDGET
 *
 * A swipeable animated bar chart showing workouts per week.
 * Each week is a distinct visual block with clear separation.
 * A prominent dashed target line shows the weekly workout goal.
 *
 * Visual states:
 * - Below target line  → muted bar color
 * - On target line     → primary color, aligned with line
 * - Above target line  → primary color, bold count
 *
 * Animations: staggered spring bar growth, fade-in target line, count labels.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/components/GlassCard';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 160;
const BAR_WIDTH = 36;
const WEEK_BLOCK_WIDTH = 52;
const BLOCK_GAP = 10;
const BLOCK_PADDING_H = 8;
const BAR_BORDER_RADIUS = 8;
const MIN_BAR_HEIGHT = 4;

export function WorkoutsPerWeekWidget() {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const [targetInput, setTargetInput] = useState(user.weeklyTarget.toString());

  // ── Animation refs ──
  const barAnimsRef = useRef<Animated.Value[]>([]);
  const targetLineOpacityRef = useRef(new Animated.Value(0));
  const countFadeRef = useRef(new Animated.Value(0));
  const animControllerRef = useRef<Animated.CompositeAnimation | null>(null);

  // Max count with headroom: ensure at least 1, and add 10% headroom so bars
  // don't hit the very top edge
  const dataMax = Math.max(1, ...user.weeklyHistory.map((w) => w.count));
  const maxCount = Math.max(user.weeklyTarget, dataMax) * 1.1;

  const totalContentWidth =
    user.weeklyHistory.length * (WEEK_BLOCK_WIDTH + BLOCK_GAP) + 40;

  // Target line position in pixels from bottom
  const targetLineY = (user.weeklyTarget / maxCount) * CHART_HEIGHT;

  // Build animation values fresh for current data
  barAnimsRef.current = user.weeklyHistory.map(() => new Animated.Value(0));

  const runEntranceAnimation = useCallback(() => {
    // Stop any in-flight animation
    animControllerRef.current?.stop();

    // Reset to initial hidden state
    barAnimsRef.current.forEach((anim) => anim.setValue(0));
    targetLineOpacityRef.current.setValue(0);
    countFadeRef.current.setValue(0);

    const barCount = user.weeklyHistory.length;

    // Bar grow animations — staggered spring from bottom
    const barAnimations = barAnimsRef.current.map((anim, i) =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
        delay: i * 45,
      })
    );

    // Target line fades in after first few bars start
    const targetLineAnim = Animated.timing(targetLineOpacityRef.current, {
      toValue: 1,
      duration: 350,
      delay: Math.min(barCount * 30, 300),
      useNativeDriver: true,
    });

    // Count labels fade in slightly after bars
    const countAnim = Animated.timing(countFadeRef.current, {
      toValue: 1,
      duration: 300,
      delay: Math.min(barCount * 35, 350),
      useNativeDriver: true,
    });

    animControllerRef.current = Animated.parallel([
      Animated.stagger(25, barAnimations),
      targetLineAnim,
      countAnim,
    ]);

    animControllerRef.current.start();
  }, [user.weeklyHistory, user.weeklyTarget]);

  // Only animate when the Profile screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Small delay to let the screen transition settle
      const timeout = setTimeout(() => {
        runEntranceAnimation();
      }, 80);

      return () => {
        clearTimeout(timeout);
        animControllerRef.current?.stop();
      };
    }, [runEntranceAnimation])
  );

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  function saveTarget() {
    const num = parseInt(targetInput, 10);
    if (!isNaN(num) && num > 0) {
      updateUser({ weeklyTarget: num });
    }
    setMenuVisible(false);
  }

  // Determine bar color based on target relationship
  const getBarColor = useCallback(
    (count: number) => {
      if (count >= user.weeklyTarget) {
        return Colors.primary;
      }
      return Colors.textSecondary + '44'; // muted
    },
    [Colors.primary, Colors.textSecondary, user.weeklyTarget]
  );

  // Determine count label style
  const getCountStyle = useCallback(
    (count: number) => {
      if (count > user.weeklyTarget) {
        return { color: Colors.primary, fontWeight: 'bold' as const };
      }
      if (count === user.weeklyTarget) {
        return { color: Colors.primary, fontWeight: '600' as const };
      }
      return { color: Colors.textSecondary, fontWeight: '500' as const };
    },
    [Colors.primary, Colors.textSecondary, user.weeklyTarget]
  );

  // Pre-compute count label entrance animation (shared across all bars)
  const countLabelTranslateY = countFadeRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });

  return (
    <GlassCard
      intensity={40}
      borderRadius={radius.xl}
      style={styles.widget}
      contentStyle={styles.widgetContent}>
      {/* ── Header Row ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: Colors.text }]}>
            Workouts Per Week
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Activity
          </Text>
        </View>
        <View style={styles.headerButtons}>
          {/* Target indicator pill */}
          <View
            style={[
              styles.targetPill,
              {
                backgroundColor: Colors.primary + '18',
                borderColor: Colors.primary + '40',
              },
            ]}>
            <View
              style={[styles.targetDot, { backgroundColor: Colors.primary }]}
            />
            <Text style={[styles.targetPillText, { color: Colors.primary }]}>
              Target: {user.weeklyTarget}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: Colors.border + '80' }]}
            onPress={() => setMenuVisible(true)}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="more-vert" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chart Area ── */}
      <View style={styles.chartWrapper}>
        {/* Y-axis labels (0 and max rounded) */}
        <View style={styles.yAxisLabels}>
          <Text style={[styles.yAxisMaxLabel, { color: Colors.textSecondary }]}>
            {Math.ceil(maxCount)}
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.yAxisZeroLabel, { color: Colors.textSecondary }]}>
            0
          </Text>
        </View>

        {/* Scrollable chart */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { width: Math.max(totalContentWidth, SCREEN_WIDTH - 72) },
          ]}>
          {/* Background grid lines (subtle horizontal guides) */}
          <View style={[styles.gridLine, { bottom: CHART_HEIGHT * 0.75, backgroundColor: Colors.border + '40' }]} />
          <View style={[styles.gridLine, { bottom: CHART_HEIGHT * 0.5, backgroundColor: Colors.border + '40' }]} />
          <View style={[styles.gridLine, { bottom: CHART_HEIGHT * 0.25, backgroundColor: Colors.border + '40' }]} />

          {/* ── Target Line ── */}
          <Animated.View
            style={[
              styles.targetLineWrapper,
              {
                bottom: targetLineY,
                opacity: targetLineOpacityRef.current,
              },
            ]}>
            {/* Dashed line segments */}
            <View style={styles.dashedLineTrack}>
              {Array.from({ length: 24 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dashSegment,
                    { backgroundColor: Colors.primary + 'AA' },
                  ]}
                />
              ))}
            </View>
            {/* Target badge at right end */}
            <View
              style={[
                styles.targetBadge,
                {
                  backgroundColor: Colors.primary + '20',
                  borderColor: Colors.primary + '66',
                },
              ]}>
              <Text style={[styles.targetBadgeText, { color: Colors.primary }]}>
                {user.weeklyTarget}
              </Text>
            </View>
          </Animated.View>

          {/* ── Week Blocks ── */}
          <View style={styles.blocksRow}>
            {user.weeklyHistory.map((week, index) => {
              const barHeightPx =
                week.count === 0
                  ? MIN_BAR_HEIGHT
                  : Math.max(
                      (week.count / maxCount) * CHART_HEIGHT,
                      MIN_BAR_HEIGHT
                    );

              const barAnim = barAnimsRef.current[index];
              const translateY = barAnim?.interpolate({
                inputRange: [0, 1],
                outputRange: [barHeightPx, 0],
              }) ?? barHeightPx;

              const countStyle = getCountStyle(week.count);

              return (
                <View
                  key={index}
                  style={[
                    styles.weekBlock,
                    {
                      width: WEEK_BLOCK_WIDTH,
                      marginRight: BLOCK_GAP,
                      backgroundColor: Colors.border + '28',
                      borderColor: Colors.border + '50',
                    },
                  ]}>
                  {/* Workout count — above bar */}
                  <Animated.View
                    style={{
                      opacity: countFadeRef.current,
                      transform: [{ translateY: countLabelTranslateY }],
                    }}>
                    <Text
                      style={[
                        styles.countLabel,
                        { color: countStyle.color, fontWeight: countStyle.fontWeight },
                      ]}>
                      {week.count}
                    </Text>
                  </Animated.View>

                  {/* Bar track */}
                  <View
                    style={[
                      styles.barTrack,
                      { height: CHART_HEIGHT },
                    ]}>
                    {/* Animated bar — grows from bottom */}
                    <View
                      style={{
                        height: barHeightPx,
                        overflow: 'hidden',
                        justifyContent: 'flex-end',
                        borderRadius: BAR_BORDER_RADIUS,
                      }}>
                      <Animated.View
                        style={{
                          transform: [{ translateY }],
                        }}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: barHeightPx,
                              backgroundColor: getBarColor(week.count),
                            },
                          ]}
                        />
                      </Animated.View>
                    </View>
                  </View>

                  {/* Date label */}
                  <Text
                    style={[styles.dateLabel, { color: Colors.textSecondary }]}>
                    {formatDate(week.weekStart)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Bottom axis line */}
          <View
            style={[styles.bottomAxis, { backgroundColor: Colors.border }]}
          />
        </ScrollView>
      </View>

      {/* Swipe hint */}
      <Text style={[styles.swipeHint, { color: Colors.textSecondary }]}>
        ← Swipe to see more weeks →
      </Text>

      {/* ── Settings Modal ── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: Colors.card,
                borderColor: Colors.border,
                shadowColor: Colors.shadow,
              },
            ]}>
            <Text style={[styles.modalTitle, { color: Colors.text }]}>
              Weekly Target
            </Text>
            <Text style={[styles.modalDesc, { color: Colors.textSecondary }]}>
              How many workouts do you aim for per week?
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors.background,
                  color: Colors.text,
                  borderColor: Colors.border,
                },
              ]}
              value={targetInput}
              onChangeText={setTargetInput}
              keyboardType="number-pad"
              maxLength={2}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: Colors.primary }]}
              onPress={saveTarget}
              activeOpacity={activeOpacity.button}>
              <Text
                style={[styles.saveButtonText, { color: Colors.background }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  widget: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  widgetContent: {
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: typography.base,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  targetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 4,
  },
  targetDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  targetPillText: {
    fontSize: typography.xs,
    fontWeight: '600',
  },
  iconButton: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  yAxisLabels: {
    width: 28,
    height: CHART_HEIGHT + 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
    paddingTop: 18,
    paddingBottom: 16,
  },
  yAxisMaxLabel: {
    fontSize: typography.xs,
    fontWeight: '600',
  },
  yAxisZeroLabel: {
    fontSize: typography.xs,
  },
  scrollContent: {
    paddingRight: spacing.lg,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    zIndex: 0,
  },
  // ── Target Line ──
  targetLineWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  dashedLineTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 2,
    overflow: 'hidden',
  },
  dashSegment: {
    width: 8,
    height: 2,
    borderRadius: 1,
    marginRight: 4,
  },
  targetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginLeft: 4,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // ── Week Blocks ──
  blocksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
    zIndex: 1,
  },
  weekBlock: {
    alignItems: 'center',
    paddingHorizontal: BLOCK_PADDING_H,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  countLabel: {
    fontSize: typography.sm,
    marginBottom: 4,
    textAlign: 'center',
  },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_BORDER_RADIUS,
  },
  dateLabel: {
    fontSize: typography.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  bottomAxis: {
    height: 1,
    marginTop: 2,
  },
  swipeHint: {
    fontSize: typography.xs,
    textAlign: 'center',
    marginTop: spacing.md,
    opacity: 0.6,
  },
  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  modalDesc: {
    fontSize: typography.base,
    marginBottom: spacing.xl,
  },
  input: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: typography.xl,
    textAlign: 'center',
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    minHeight: touch.minHeight,
  },
  saveButtonText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
});
