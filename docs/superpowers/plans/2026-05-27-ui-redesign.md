# ASCENT UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current green-on-charcoal glassmorphism UI with a neon cyan/purple gaming aesthetic using Space Grotesk typography and solid neon-border cards across all screens.

**Architecture:** Update the dark theme colors in `constants/theme.ts` so they cascade automatically. Create a `NeonCard` component to replace `GlassCard`. Create an `AppText` wrapper for Space Grotesk. Then apply these to all screens systematically.

**Tech Stack:** React Native, Expo 54, TypeScript, `@expo-google-fonts/space-grotesk`, `expo-linear-gradient` (already installed)

**Spec:** `docs/superpowers/specs/2026-05-27-ui-redesign-design.md`

---

## Task 1: Install Space Grotesk + fontFamily constants + AppText component

**Files:**
- Run: `npx expo install @expo-google-fonts/space-grotesk`
- Modify: `constants/design.ts`
- Create: `components/ui/AppText.tsx`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Install the font package**

```bash
cd "gym-tracker" && npx expo install @expo-google-fonts/space-grotesk
```

Expected: package added to `node_modules`, no errors.

- [ ] **Step 2: Add fontFamily map to `constants/design.ts`**

Add this block after the `activeOpacity` export:

```ts
// ─── Font Family ───
export const fontFamily = {
  regular:  'SpaceGrotesk_400Regular',
  medium:   'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold:     'SpaceGrotesk_700Bold',
} as const;
```

- [ ] **Step 3: Create `components/ui/AppText.tsx`**

```tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { fontFamily } from '@/constants/design';

interface AppTextProps extends TextProps {
  weight?: keyof typeof fontFamily;
}

export function AppText({ weight = 'regular', style, ...props }: AppTextProps) {
  return (
    <Text
      style={[{ fontFamily: fontFamily[weight] }, style]}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Load fonts in `app/_layout.tsx`**

Add these imports at the top of `app/_layout.tsx`:

```tsx
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
```

Add font loading inside `AppContent()`, before the return statement:

```tsx
const [fontsLoaded] = useFonts({
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
});
```

Update the `showSplash` line to also wait for fonts:

```tsx
const showSplash = !splashComplete || authLoading || !fontsLoaded;
```

- [ ] **Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add constants/design.ts components/ui/AppText.tsx app/_layout.tsx package.json package-lock.json
git commit -m "feat: install Space Grotesk and add AppText wrapper"
```

---

## Task 2: Update dark theme colors + rank tier colors

**Files:**
- Modify: `constants/theme.ts`
- Modify: `constants/ranks.ts`

- [ ] **Step 1: Update `darkTheme` in `constants/theme.ts`**

Replace the entire `darkTheme` object:

```ts
const darkTheme: ThemeColors = {
  background: '#08080f',
  card: '#0d0d18',
  border: '#1a1a28',
  text: '#FFFFFF',
  textSecondary: '#888888',
  primary: '#00ffe0',
  secondary: '#7b2fff',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  primaryDark: '#00c8b4',
  danger: '#FF4444',
  shadow: '#000000',
  gloss: 'rgba(255,255,255,0.15)',
  warning: '#FFB800',
};
```

- [ ] **Step 2: Update `Fonts` to remove platform font splitting (Space Grotesk is loaded globally)**

Replace the `Fonts` export at the bottom of `constants/theme.ts`:

```ts
export const Fonts = {
  sans: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};
```

- [ ] **Step 3: Update `DARK_TIER_COLORS` in `constants/ranks.ts`**

Replace the `DARK_TIER_COLORS` object (around line 61):

```ts
const DARK_TIER_COLORS: Record<MainTier, string> = {
  Bronze: '#b46432',
  Silver: '#b0b8c4',
  Gold: '#ffb900',
  Platinum: '#00dcc8',
  Diamond: '#64a0ff',
  Immortal: '#ff3c78',
};
```

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. The color changes cascade to all `useTheme()` consumers automatically.

- [ ] **Step 5: Commit**

```bash
git add constants/theme.ts constants/ranks.ts
git commit -m "feat: update dark theme to cyan/purple neon palette"
```

---

## Task 3: Create NeonCard component (replaces GlassCard)

**Files:**
- Create: `components/NeonCard.tsx`

`NeonCard` is a solid dark card with a neon-style border. Pass `glowColor` to get a rank-colored hero variant. Replaces `GlassCard` across the app — removing the expensive `BlurView`.

- [ ] **Step 1: Create `components/NeonCard.tsx`**

```tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface NeonCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  borderRadius?: number;
  /** Pass a color (e.g. rankColor) to get a glowing hero-style border. */
  glowColor?: string;
}

export function NeonCard({
  children,
  style,
  contentStyle,
  onPress,
  activeOpacity = 0.7,
  borderRadius = 16,
  glowColor,
}: NeonCardProps) {
  const Colors = useTheme();

  const borderColor = glowColor
    ? `${glowColor}40`
    : Colors.border;

  const shadowStyle = glowColor
    ? Platform.select({
        ios: {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        android: { elevation: 6 },
        default: {},
      })
    : Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
        default: {},
      });

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      backgroundColor: Colors.card,
      borderColor,
      borderRadius,
    },
    shadowStyle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
  },
});
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/NeonCard.tsx
git commit -m "feat: add NeonCard component — solid dark card with neon border"
```

---

## Task 4: Update Home screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

Key changes: GlassCard → NeonCard, Text → AppText, breakdown bars use cyan/purple alternating colors, primary button becomes a gradient, progress bar uses cyan→purple gradient.

- [ ] **Step 1: Keep existing animated value setup — do not change these lines**

The following lines near the top of `HomeScreen()` stay unchanged:

```tsx
const progressAnim = useRef(new Animated.Value(0)).current;
useEffect(() => {
  Animated.spring(progressAnim, {
    toValue: progressPercent,
    friction: 8,
    tension: 50,
    useNativeDriver: false,
  }).start();
}, [progressPercent]);
const progressWidth = progressAnim.interpolate({
  inputRange: [0, 100],
  outputRange: ['0%', '100%'],
});
```

- [ ] **Step 2: Update imports in `app/(tabs)/index.tsx`**

Replace the import block at the top:

```tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { router } from 'expo-router';
import { getTierColor, getTierProgress, getNextTier } from '@/constants/ranks';
import { RankIcon } from '@/components/RankIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NeonCard } from '@/components/NeonCard';
import { AppText } from '@/components/ui/AppText';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';
import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';
```

- [ ] **Step 2: Replace the full component body (inside the return statement) in `app/(tabs)/index.tsx`**

Replace everything from `return (` to the closing `);` of the component with:

```tsx
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Platform.OS === 'web' ? Colors.background : 'transparent' }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl, flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <AppText weight="medium" style={[styles.greetingLabel, { color: Colors.textSecondary }]}>
              Welcome back
            </AppText>
            <AppText weight="bold" style={[styles.greetingName, { color: Colors.text }]}>
              {user.username}
            </AppText>
          </View>
          <TouchableOpacity
            style={[styles.settingsPill, { backgroundColor: Colors.card, borderColor: Colors.border }]}
            onPress={() => router.push('/settings')}
            activeOpacity={activeOpacity.button}>
            <IconSymbol name="gear" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Rank Card */}
        <NeonCard
          glowColor={rankColor}
          borderRadius={radius['2xl']}
          onPress={() => router.push('/rank-details')}
          activeOpacity={activeOpacity.card}
          style={styles.heroCard}
          contentStyle={styles.heroCardContent}>

          {/* Ambient orbs */}
          <View style={[styles.orbTopRight, { backgroundColor: rankColor + '25' }]} pointerEvents="none" />
          <View style={[styles.orbBottomLeft, { backgroundColor: Colors.primary + '15' }]} pointerEvents="none" />

          <View style={styles.heroBody}>
            {/* Left: rank name + score */}
            <View style={styles.heroLeft}>
              <AppText weight="medium" style={[styles.rankLabel, { color: Colors.textSecondary }]}>
                Current Rank
              </AppText>
              <AppText weight="bold" style={[styles.rankName, { color: Colors.text }]}>
                {user.rank.split(' ')[0]}{' '}
                <AppText weight="bold" style={{ color: rankColor }}>
                  {user.rank.split(' ')[1] ?? ''}
                </AppText>
              </AppText>
            </View>

            {/* Right: rank icon ring */}
            <View style={[styles.iconRing, { backgroundColor: rankColor + '14', borderColor: rankColor + '58' }]}>
              <RankIcon
                rank={user.rank}
                size={32}
                glow
                glowColor={rankColor}
                glowIntensity="strong"
                animated
              />
            </View>
          </View>

          {/* Score row */}
          <View style={styles.scoreRow}>
            <AppText weight="medium" style={[styles.scoreLabel, { color: Colors.textSecondary }]}>
              Fitness Score
            </AppText>
            <AppText weight="bold" style={[styles.scoreNumber, { color: Colors.text }]}>
              {user.fitnessScore}
              <AppText weight="regular" style={[styles.scoreTotal, { color: Colors.border }]}> / 100</AppText>
            </AppText>
          </View>

          {/* Gradient progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: Colors.border }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.progressGloss} />
            </Animated.View>
          </View>

          <AppText weight="medium" style={[styles.nextTierText, { color: Colors.textSecondary }]}>
            {Math.round(tierProgress * 100)}% to {nextTier ?? 'Max Rank'}
          </AppText>
        </NeonCard>

        {/* Score Breakdown Card */}
        <NeonCard borderRadius={radius.xl} style={styles.breakdownCard} contentStyle={styles.breakdownCardContent}>
          <AppText weight="semibold" style={[styles.sectionLabel, { color: Colors.textSecondary }]}>
            Score Breakdown
          </AppText>
          <BreakdownBar label="Consistency" value={user.fitnessBreakdown.consistency} color={Colors.primary} Colors={Colors} />
          <BreakdownBar label="Volume" value={user.fitnessBreakdown.volume} color={Colors.secondary} Colors={Colors} />
          <BreakdownBar label="Progression" value={user.fitnessBreakdown.progression} color={Colors.primary} Colors={Colors} />
          <BreakdownBar label="Variety" value={user.fitnessBreakdown.variety} color={Colors.secondary} Colors={Colors} />
        </NeonCard>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <StatItem label="Workouts" value={user.totalWorkouts.toString()} Colors={Colors} />
          <StatItem label="Streak" value={`${user.currentStreak}wk`} Colors={Colors} />
          <StatItem label="Hours" value={user.totalHours.toString()} Colors={Colors} />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsColumn}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workout')}
            activeOpacity={activeOpacity.button}
            style={styles.primaryButtonWrapper}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}>
              <AppText weight="bold" style={[styles.primaryButtonText, { color: '#08080f' }]}>
                Start Workout
              </AppText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: Colors.border }]}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={activeOpacity.button}>
            <AppText weight="semibold" style={[styles.secondaryButtonText, { color: Colors.textSecondary }]}>
              View Profile
            </AppText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
```

- [ ] **Step 3: Replace `BreakdownBar` sub-component**

Replace the existing `BreakdownBar` function:

```tsx
function BreakdownBar({
  label,
  value,
  color,
  Colors,
}: {
  label: string;
  value: number;
  color: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  const pct = Math.min(value, 100);
  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownLabelRow}>
        <AppText weight="medium" style={[styles.breakdownLabel, { color: Colors.text }]}>{label}</AppText>
        <AppText weight="semibold" style={[styles.breakdownValue, { color }]}>{Math.round(value)}%</AppText>
      </View>
      <View style={[styles.breakdownTrack, { backgroundColor: Colors.border }]}>
        <View style={[styles.breakdownFill, { width: `${pct}%`, backgroundColor: color }]} />
        <View style={styles.breakdownGloss} />
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Replace `StatItem` sub-component**

Replace the existing `StatItem` function:

```tsx
function StatItem({
  label,
  value,
  Colors,
}: {
  label: string;
  value: string;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <NeonCard borderRadius={radius.xl} style={styles.statItem} contentStyle={styles.statItemContent}>
      <AppText weight="bold" style={[styles.statValue, { color: Colors.text }]}>{value}</AppText>
      <AppText weight="semibold" style={[styles.statLabel, { color: Colors.textSecondary }]}>{label}</AppText>
    </NeonCard>
  );
}
```

- [ ] **Step 5: Replace the `StyleSheet.create` block**

Replace the entire `const styles = StyleSheet.create({ ... })` with:

```tsx
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: spacing.lg },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  greetingLabel: { fontSize: typography.xs, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  greetingName: { fontSize: typography['2xl'] },
  settingsPill: { width: 40, height: 40, borderRadius: radius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  heroCard: { overflow: 'hidden', position: 'relative' },
  heroCardContent: { padding: spacing['2xl'], gap: spacing.md },
  orbTopRight: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70 },
  orbBottomLeft: { position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50 },
  heroBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLeft: { flex: 1 },
  rankLabel: { fontSize: typography.xs, letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.xs },
  rankName: { fontSize: typography['3xl'] },
  iconRing: { width: 56, height: 56, borderRadius: radius.lg, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  scoreLabel: { fontSize: typography.xs, letterSpacing: 2, textTransform: 'uppercase' },
  scoreNumber: { fontSize: typography['2xl'] },
  scoreTotal: { fontSize: typography.sm },

  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  progressGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.15)', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  nextTierText: { fontSize: typography.xs, letterSpacing: 1 },

  breakdownCard: {},
  breakdownCardContent: { padding: spacing.xl, gap: spacing.md },
  sectionLabel: { fontSize: typography.xs, letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.xs },
  breakdownRow: { gap: spacing.xs },
  breakdownLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { fontSize: typography.sm },
  breakdownValue: { fontSize: typography.sm },
  breakdownTrack: { height: 4, borderRadius: 2, overflow: 'hidden', position: 'relative' },
  breakdownFill: { height: '100%', borderRadius: 2 },
  breakdownGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.15)' },

  statsRow: { flexDirection: 'row', gap: spacing.md },
  statItem: { flex: 1 },
  statItemContent: { alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, gap: spacing.xs },
  statValue: { fontSize: typography.lg },
  statLabel: { fontSize: typography.xs, textTransform: 'uppercase', letterSpacing: 2 },

  actionsColumn: { gap: spacing.md, marginTop: 'auto' },
  primaryButtonWrapper: { borderRadius: radius.lg, overflow: 'hidden' },
  primaryButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, minHeight: 52 },
  primaryButtonText: { fontSize: typography.base, letterSpacing: 1, textTransform: 'uppercase' },
  secondaryButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, minHeight: 52, borderRadius: radius.lg, borderWidth: 1 },
  secondaryButtonText: { fontSize: typography.base, letterSpacing: 1, textTransform: 'uppercase' },
});
```

- [ ] **Step 6: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: redesign home screen with NeonCard and Space Grotesk"
```

---

## Task 5: Update CurvedTabBar

**Files:**
- Modify: `components/CurvedTabBar.tsx`

The bubble already uses `Colors.card` and `Colors.primary` — those update automatically with the new theme. The only change needed is increasing bubble border opacity so the cyan ring is visible on the new darker card.

- [ ] **Step 1: Update bubble `borderColor` in `CurvedTabBar.tsx`**

Find this line (around line 166):

```tsx
borderColor: Colors.primary + '50',
```

Replace it with:

```tsx
borderColor: Colors.primary + '80',
```

- [ ] **Step 2: Update inactive icon opacity and size**

Find the `TabButton` component's opacity wrapper (around line 230):

```tsx
<View style={{ opacity: 0.45 }}>
```

Replace with:

```tsx
<View style={{ opacity: 0.35 }}>
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add components/CurvedTabBar.tsx
git commit -m "feat: update tab bar bubble border for new cyan palette"
```

---

## Task 6: Update Workout, Exercises, History, and Profile tab screens

**Files:**
- Modify: `app/(tabs)/workout.tsx`
- Modify: `app/(tabs)/exercises.tsx`
- Modify: `app/(tabs)/history.tsx`
- Modify: `app/(tabs)/profile.tsx`

Apply this 4-step pattern to each file:

**Pattern (repeat for each of the 4 files):**

- [ ] **Step 1: Update imports — add `NeonCard` + `AppText`, remove `GlassCard`**

In each file, find the import for `GlassCard`:
```tsx
import { GlassCard } from '@/components/GlassCard';
```
Replace with:
```tsx
import { NeonCard } from '@/components/NeonCard';
import { AppText } from '@/components/ui/AppText';
```

If the file already imports `Text` from `react-native`, remove `Text` from that import.

- [ ] **Step 2: Replace all `<GlassCard` with `<NeonCard` and all `</GlassCard>` with `</NeonCard>`**

The prop interface is the same except `intensity` is not used — remove any `intensity={...}` prop. All other props (`style`, `contentStyle`, `onPress`, `activeOpacity`, `borderRadius`) work identically.

- [ ] **Step 3: Replace all `<Text ` with `<AppText ` and all `</Text>` with `</AppText>`**

For text that uses `fontWeight: 'bold'` in its style, also add `weight="bold"` prop.
For text that uses `fontWeight: '600'` in its style, add `weight="semibold"`.
For text that uses `fontWeight: '500'`, add `weight="medium"`.

- [ ] **Step 4: Run TypeScript check after each file**

```bash
npx tsc --noEmit
```

Expected: 0 errors per file.

**Profile screen only — extra step:**

The profile screen has breakdown bars similar to home. Find any bars using `Colors.gold` or `Colors.bronze` as bar color and replace:
- `Colors.gold` → `Colors.primary`
- `Colors.bronze` → `Colors.secondary`

- [ ] **Step 5: Commit all 4 files**

```bash
git add app/(tabs)/workout.tsx app/(tabs)/exercises.tsx app/(tabs)/history.tsx app/(tabs)/profile.tsx
git commit -m "feat: apply NeonCard + AppText to all tab screens"
```

---

## Task 7: Update Auth screen

**Files:**
- Modify: `app/auth.tsx`

- [ ] **Step 1: Update imports in `app/auth.tsx`**

Add:
```tsx
import { NeonCard } from '@/components/NeonCard';
import { AppText } from '@/components/ui/AppText';
```

Remove `GlassCard` import if present.

- [ ] **Step 2: Replace `<GlassCard` → `<NeonCard`, `<Text` → `<AppText`**

Same pattern as Task 6.

- [ ] **Step 3: Update text input focus border color**

Find any `TextInput` `onFocus`/`onBlur` style that sets `borderColor`. Change the focused border color to `Colors.primary` (`#00ffe0`).

Example pattern to find and update:
```tsx
// Before
borderColor: isFocused ? Colors.primary : Colors.border
// After — already correct if Colors.primary is now cyan
borderColor: isFocused ? Colors.primary : Colors.border
```
No change needed if already using `Colors.primary` — the theme update handles it.

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/auth.tsx
git commit -m "feat: apply NeonCard + AppText to auth screen"
```

---

## Task 8: Update Settings screens (8 screens)

**Files:**
- Modify: `app/settings.tsx`
- Modify: `app/notifications.tsx`
- Modify: `app/advanced.tsx`
- Modify: `app/theme.tsx`
- Modify: `app/rest-timer-settings.tsx`
- Modify: `app/edit-profile.tsx`
- Modify: `app/body-measurements.tsx`
- Modify: `app/goals.tsx`

Apply the same pattern as Task 6 (GlassCard → NeonCard, Text → AppText) to all 8 files.

Additionally, in **all 8 files**, find icon container styles like:

```tsx
backgroundColor: Colors.primary + '12',
```

Update to match the new design density (these stay the same, the color cascades from theme).

Find any toggle component that uses `Colors.primary` as the active color — no change needed since theme updates cascade.

- [ ] **Step 1–3: Apply pattern to each of the 8 settings files**

For each file:
1. Update imports (NeonCard + AppText, remove GlassCard)
2. Replace `<GlassCard` → `<NeonCard`, remove `intensity` prop
3. Replace `<Text` → `<AppText` with appropriate weight props

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/settings.tsx app/notifications.tsx app/advanced.tsx app/theme.tsx app/rest-timer-settings.tsx app/edit-profile.tsx app/body-measurements.tsx app/goals.tsx
git commit -m "feat: apply NeonCard + AppText to all settings screens"
```

---

## Task 9: Update Rank Details screen

**Files:**
- Modify: `app/rank-details.tsx`

The rank details screen has a hero rank card and a tier list. Apply the standard pattern plus one special update for the tier list accent.

- [ ] **Step 1: Apply standard pattern (NeonCard + AppText)**

Same as Task 6 pattern.

- [ ] **Step 2: Update hero card to use `glowColor` prop**

Find the hero rank card in `rank-details.tsx`. Replace any `GlassCard` or plain `View` wrapping the rank card with:

```tsx
<NeonCard
  glowColor={rankColor}
  borderRadius={radius['2xl']}
  style={styles.heroCard}
  contentStyle={styles.heroCardContent}>
```

- [ ] **Step 3: Update tier list accent bars**

The tier list uses a left accent bar for the current tier. Find the style and ensure it uses `rankColor`:

```tsx
// Current tier row left accent
<View style={[styles.tierAccent, { backgroundColor: isCurrentTier ? rankColor : 'transparent' }]} />
```

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/rank-details.tsx
git commit -m "feat: apply NeonCard + AppText to rank details screen"
```

---

## Task 10: Update remaining stack screens

**Files:**
- Modify: `app/privacy-policy.tsx`
- Modify: any other stack screens not yet covered

- [ ] **Step 1: Apply standard pattern to `privacy-policy.tsx`**

GlassCard → NeonCard, Text → AppText (same as Task 6 pattern).

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/privacy-policy.tsx
git commit -m "feat: apply NeonCard + AppText to remaining screens"
```

---

## Task 11: Final verification

**Files:** None modified — verification only.

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Web build check**

```bash
npx expo export --platform web
```

Expected: builds successfully, no errors. Output in `dist/`.

- [ ] **Step 3: Visual check on device**

Run `npx expo start` and open on a device or simulator. Verify:
- Home screen shows cyan/purple neon design
- Rank card shows rank-colored icon ring + glow
- Tab bar bubble shows cyan border
- All text renders in Space Grotesk
- Cards are solid dark with borders (no frosted glass)
- Breakdown bars alternate cyan / purple

- [ ] **Step 4: Update CLAUDE.md with new design system values**

In `CLAUDE.md`, update the Theme section to reflect the new primary/secondary colors:

```
primary: #00ffe0 (cyan)
secondary: #7b2fff (purple)
background: #08080f
card: #0d0d18
border: #1a1a28
```

Also add: "NeonCard replaces GlassCard. AppText replaces Text for all user-visible text."

- [ ] **Step 5: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for new design system"
```
