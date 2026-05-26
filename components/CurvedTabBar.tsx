/**
 * CURVED TAB BAR — Spring-animated bubble with visual notch effect
 *
 * Safe implementation:
 * - Static SVG bar (no path animation — crash-safe)
 * - Animated View for bubble position + scale
 * - Spring physics with bouncy, visible motion
 * - Shadow + border create a "socket" visual without risky SVG path morphing
 */

import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Dimensions ──
const TAB_H = 72;
const BUBBLE_R = 30;
const BUBBLE_RISE = 16;
const BAR_TOP = BUBBLE_R + BUBBLE_RISE; // 46
const TOTAL_H = BAR_TOP + TAB_H;        // 118
export const TAB_BAR_TOTAL_HEIGHT = TOTAL_H;
const CORNER_R = 20;

// Static bar path
const BAR_PATH_D = [
  `M 0,${TAB_H}`,
  `L 0,${CORNER_R}`,
  `Q 0,0 ${CORNER_R},0`,
  `L ${SCREEN_W - CORNER_R},0`,
  `Q ${SCREEN_W},0 ${SCREEN_W},${CORNER_R}`,
  `L ${SCREEN_W},${TAB_H}`,
  `Z`,
].join(' ');

// Tab positions
const TAB_W = SCREEN_W / 5;
const TAB_POSITIONS: number[] = Array.from(
  { length: 5 },
  (_, i) => TAB_W * (i + 0.5)
);

export function CurvedTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const Colors = useTheme();

  // ── Entrance animation ──
  const entranceY = useSharedValue(40);
  const entranceOpacity = useSharedValue(0);

  useEffect(() => {
    entranceY.value = withSpring(0, { damping: 14, stiffness: 120 });
    entranceOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: entranceY.value }],
    opacity: entranceOpacity.value,
  }));

  // ── Bubble position — spring on EVERY tab change ──
  const currentX = useSharedValue(TAB_POSITIONS[state.index]);
  const bubbleScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const prevIndex = useRef(state.index);

  useEffect(() => {
    if (state.index !== prevIndex.current) {
      // Snappy spring slide
      currentX.value = withSpring(TAB_POSITIONS[state.index], {
        damping: 14,
        stiffness: 220,
        mass: 0.85,
      });

      // Dramatic pop
      bubbleScale.value = withSequence(
        withTiming(0.82, { duration: 60 }),
        withSpring(1.18, { damping: 10, stiffness: 320 }),
        withSpring(1, { damping: 13, stiffness: 200 })
      );

      // Subtle icon rotation for playfulness
      iconRotate.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(4, { duration: 100 }),
        withSpring(0, { damping: 12, stiffness: 200 })
      );

      prevIndex.current = state.index;
    }
  }, [state.index]);

  // ── Bubble style: translateX + scale ──
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: currentX.value - BUBBLE_R },
      { scale: bubbleScale.value },
    ],
  }));

  // ── Icon style: scale + rotate ──
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bubbleScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const activeRoute = state.routes[state.index];
  const activeDescriptor = descriptors[activeRoute.key];

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          height: TOTAL_H + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}>
      {/* ── Static bar SVG ── */}
      <View style={[styles.barLayer, { bottom: insets.bottom }]} pointerEvents="none">
        <Svg width={SCREEN_W} height={TAB_H} viewBox={`0 0 ${SCREEN_W} ${TAB_H}`}>
          <Path d={BAR_PATH_D} fill={Colors.card} />
        </Svg>
      </View>

      {/* ── Subtle socket shadow under bubble ── */}
      <Animated.View
        style={[
          styles.socketShadow,
          bubbleStyle,
          { top: BAR_TOP - 4 },
        ]}
        pointerEvents="none">
        <View style={[styles.socketInner, { backgroundColor: Colors.shadow }]} />
      </Animated.View>

      {/* ── Bubble with border + icon ── */}
      <Animated.View
        style={[
          styles.bubble,
          bubbleStyle,
          {
            top: BAR_TOP - BUBBLE_R - BUBBLE_RISE,
            backgroundColor: Colors.card,
            borderColor: Colors.primary + '80',
          },
        ]}
        pointerEvents="none">
        <Animated.View style={iconStyle}>
          {activeDescriptor.options.tabBarIcon?.({
            color: Colors.primary,
            size: 24,
            focused: true,
          })}
        </Animated.View>
      </Animated.View>

      {/* ── Inactive icons ── */}
      <View style={[styles.buttonsLayer, { bottom: insets.bottom }]} pointerEvents="box-none">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          if (isFocused) return null;

          return (
            <TabButton
              key={route.key}
              route={route}
              descriptors={descriptors}
              navigation={navigation}
              positionX={TAB_POSITIONS[index]}
              Colors={Colors}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

/* ── Inactive tab button ── */
function TabButton({
  route,
  descriptors,
  navigation,
  positionX,
  Colors,
}: {
  route: any;
  descriptors: any;
  navigation: any;
  positionX: number;
  Colors: ReturnType<typeof useTheme>;
}) {
  const { options } = descriptors[route.key];

  const onPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate(route.name);
  }, [navigation, route.name]);

  return (
    <TouchableOpacity
      style={[styles.tabButton, { left: positionX - TAB_W / 2, width: TAB_W }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={options.title ?? route.name}>
      <View style={{ opacity: 0.35 }}>
        {options.tabBarIcon?.({
          color: Colors.textSecondary,
          size: 22,
          focused: false,
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  barLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TAB_H,
  },
  socketShadow: {
    position: 'absolute',
    left: 0,
    width: BUBBLE_R * 2,
    height: BUBBLE_R * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socketInner: {
    width: BUBBLE_R * 1.6,
    height: BUBBLE_R * 1.6,
    borderRadius: BUBBLE_R * 0.8,
    opacity: 0.15,
  },
  bubble: {
    position: 'absolute',
    left: 0,
    width: BUBBLE_R * 2,
    height: BUBBLE_R * 2,
    borderRadius: BUBBLE_R,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonsLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TAB_H,
    flexDirection: 'row',
  },
  tabButton: {
    position: 'absolute',
    top: 0,
    height: TAB_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
