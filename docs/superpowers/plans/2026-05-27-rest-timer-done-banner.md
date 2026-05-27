# Rest Timer Done — Banner & Animation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rest timer's "DONE!" ring state with a snappy burst animation and a bold slide-in gradient banner that auto-dismisses after 5 seconds, giving users a clear "GO — NEXT SET!" signal.

**Architecture:** The `RestDoneBanner` is a new sub-component inside `WorkoutOverlay.tsx` that lives as a `position: absolute` overlay at the top of the expanded view. It animates in/out based on a `visible` prop driven by `showRestDoneBanner` state in the parent. `RestTimer.tsx` loses its "DONE!" UI and gains a quick burst + fast-fade instead.

**Tech Stack:** React Native `Animated`, `LinearGradient` from expo-linear-gradient, existing design tokens from `@/constants/design`, existing theme from `useTheme()`

---

## File Map

| File | Change |
|------|--------|
| `components/RestTimer.tsx` | Remove done-state UI (checkmark, DONE! text); replace isDone animation with burst + fast-fade |
| `components/WorkoutOverlay.tsx` | Add `RestDoneBanner` sub-component; add `showRestDoneBanner` state + timeout ref; wire trigger/dismiss; update `CompactRestTimer` and `CompactRestTimerExpanded` |

---

## Task 1 — Simplify RestTimer.tsx: remove done-state, add burst animation

**Files:**
- Modify: `components/RestTimer.tsx`

- [ ] **Step 1: Remove the done-state animated refs**

In `RestTimer`, remove the two refs that are only used for the old "DONE!" pop-in:

```tsx
// DELETE these two lines (currently around line 37-38):
const doneScaleAnim = useRef(new Animated.Value(0)).current;
const doneOpacityAnim = useRef(new Animated.Value(0)).current;
```

- [ ] **Step 2: Replace the isDone animation effect**

Replace the entire `useEffect` block for `isDone` (currently lines ~68-115) with a snappy burst + fast fade:

```tsx
// "Done" burst animation — quick scale pop + flash, then fast fade out
useEffect(() => {
  if (!isDone) return;
  Animated.sequence([
    // Scale burst + flash in
    Animated.parallel([
      Animated.spring(ringScaleAnim, {
        toValue: 1.15,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]),
    // Snap back + flash out
    Animated.parallel([
      Animated.spring(ringScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]),
    // Brief hold — lets the banner begin sliding in
    Animated.delay(100),
    // Fade out the entire timer component
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start();
}, [isDone]);
```

- [ ] **Step 3: Simplify the center content — remove done-state UI**

Replace the entire `isDone ? (...checkmark block) : (...timer block)` inside `<View style={styles.centerContent}>` (currently lines ~229-258) with just the timer display (which shows `0:00` when done):

```tsx
<View style={styles.centerContent}>
  <Text style={[styles.restLabel, { color: Colors.textSecondary }]}>REST</Text>
  <Text style={[styles.timeText, { color: timerColor }]}>
    {timeString}
  </Text>
  <Text style={[styles.secondsLabel, { color: Colors.textSecondary }]}>seconds</Text>
</View>
```

Note: `timeString` already shows `0:00` when `secondsRemaining <= 0` because of `Math.floor(Math.max(0, secondsRemaining) / 60)`.

- [ ] **Step 4: Remove unused styles**

Delete these entries from the `StyleSheet.create({...})` at the bottom of the file (no longer referenced):

```
doneText: { ... }
doneSubtext: { ... }
```

- [ ] **Step 5: Type-check**

```bash
cd "C:/Users/maxim/AI coding project/1st Gym Project/gym-tracker"
npx tsc --noEmit
```

Expected: no new errors (there may be pre-existing ones — only fail if NEW errors appear in `RestTimer.tsx`).

- [ ] **Step 6: Commit**

```bash
git add components/RestTimer.tsx
git commit -m "refactor(RestTimer): replace done-state UI with quick burst + fast-fade animation"
```

---

## Task 2 — Add `RestDoneBanner` sub-component to WorkoutOverlay.tsx

**Files:**
- Modify: `components/WorkoutOverlay.tsx`

The banner is a `position: absolute` view at the top of the expanded container. It's always mounted while the overlay is expanded so it can animate in and out smoothly. It's hidden (opacity 0, translateY -80) when not visible.

- [ ] **Step 1: Add the import for LinearGradient**

Check if `LinearGradient` is already imported at the top of `WorkoutOverlay.tsx`. If not, add it:

```tsx
import { LinearGradient } from 'expo-linear-gradient';
```

- [ ] **Step 2: Add the `RestDoneBanner` sub-component**

Add this new function above the `WorkoutOverlay` export (e.g. after `CompactRestTimerExpanded`, around line 148):

```tsx
function RestDoneBanner({
  visible,
  onDismiss,
  topOffset,
  Colors,
}: {
  visible: boolean;
  onDismiss: () => void;
  topOffset: number;
  Colors: ReturnType<typeof useTheme>;
}) {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Reset progress bar to full
      progressAnim.setValue(1);
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      // Drain the progress bar over 5 seconds
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 5000,
        useNativeDriver: false,
      }).start();
    } else {
      // Stop progress drain and slide out
      progressAnim.stopAnimation();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.restDoneBanner,
        {
          top: topOffset,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.restDoneBannerGradient}>
        <View style={styles.restDoneBannerInner}>
          {/* Lightning bolt icon */}
          <View style={styles.restDoneBannerIcon}>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="rgba(0,0,0,0.72)">
              <Path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
            </Svg>
          </View>
          {/* Text */}
          <View style={styles.restDoneBannerText}>
            <Text style={styles.restDoneBannerTitle}>GO — NEXT SET!</Text>
            <Text style={styles.restDoneBannerSub}>Rest complete · tap ✕ to dismiss</Text>
          </View>
          {/* Dismiss button */}
          <TouchableOpacity
            onPress={onDismiss}
            activeOpacity={activeOpacity.button}
            style={styles.restDoneBannerClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.restDoneBannerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        {/* Draining progress bar */}
        <View style={styles.restDoneBannerProgressTrack}>
          <Animated.View
            style={[styles.restDoneBannerProgressFill, { width: progressWidth }]}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
```

- [ ] **Step 3: Add the SVG imports**

At the top of `WorkoutOverlay.tsx`, add the react-native-svg imports needed for the lightning bolt:

```tsx
import Svg, { Path } from 'react-native-svg';
```

> `react-native-svg` is already a dependency in this project (used elsewhere). No install needed.

- [ ] **Step 4: Add the banner styles to the StyleSheet**

Add these entries inside the `StyleSheet.create({...})` at the bottom of `WorkoutOverlay.tsx`:

```tsx
restDoneBanner: {
  position: 'absolute',
  // top is set dynamically via topOffset={insets.top} prop to avoid notch overlap
  left: 0,
  right: 0,
  zIndex: 100,
},
restDoneBannerGradient: {
  borderBottomLeftRadius: radius.lg,
  borderBottomRightRadius: radius.lg,
  overflow: 'hidden',
},
restDoneBannerInner: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
  gap: spacing.md,
},
restDoneBannerIcon: {
  width: 32,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
},
restDoneBannerText: {
  flex: 1,
},
restDoneBannerTitle: {
  fontSize: typography.base,
  fontWeight: '900',
  color: 'rgba(0,0,0,0.82)',
  letterSpacing: 0.5,
},
restDoneBannerSub: {
  fontSize: typography.xs,
  color: 'rgba(0,0,0,0.55)',
  marginTop: 2,
},
restDoneBannerClose: {
  padding: spacing.xs,
},
restDoneBannerCloseText: {
  fontSize: typography.base,
  fontWeight: '700',
  color: 'rgba(0,0,0,0.4)',
},
restDoneBannerProgressTrack: {
  height: 3,
  backgroundColor: 'rgba(0,0,0,0.15)',
},
restDoneBannerProgressFill: {
  height: 3,
  backgroundColor: 'rgba(255,255,255,0.45)',
},
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors in `WorkoutOverlay.tsx`.

- [ ] **Step 6: Commit**

```bash
git add components/WorkoutOverlay.tsx
git commit -m "feat(WorkoutOverlay): add RestDoneBanner sub-component with slide-in animation and draining progress bar"
```

---

## Task 3 — Wire RestDoneBanner into WorkoutOverlay state

**Files:**
- Modify: `components/WorkoutOverlay.tsx`

- [ ] **Step 1: Add state and timeout ref**

Inside the `WorkoutOverlay` function, after the existing `restTimerSeconds` state declarations (around line 176), add:

```tsx
const [showRestDoneBanner, setShowRestDoneBanner] = useState(false);
const restDoneBannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

- [ ] **Step 2: Add the dismiss helper**

After the state declarations, add:

```tsx
const dismissRestDoneBanner = useCallback(() => {
  if (restDoneBannerTimeoutRef.current) {
    clearTimeout(restDoneBannerTimeoutRef.current);
    restDoneBannerTimeoutRef.current = null;
  }
  setShowRestDoneBanner(false);
}, []);
```

- [ ] **Step 3: Wire the trigger into the rest-timer-done effect**

Find the existing `useEffect` that fires when `restTimerSeconds` hits zero (currently around lines 281–288):

```tsx
useEffect(() => {
  if (!restTimerActive || restTimerSeconds !== 0) return;
  playAlertSound(user.restTimerSettings.soundEffect);
  const timeout = setTimeout(() => {
    setRestTimerActive(false);
  }, 2800);
  return () => clearTimeout(timeout);
}, [restTimerActive, restTimerSeconds, user.restTimerSettings.soundEffect]);
```

Replace it with:

```tsx
useEffect(() => {
  if (!restTimerActive || restTimerSeconds !== 0) return;
  playAlertSound(user.restTimerSettings.soundEffect);
  // Show the "GO — NEXT SET!" banner
  setShowRestDoneBanner(true);
  restDoneBannerTimeoutRef.current = setTimeout(() => {
    setShowRestDoneBanner(false);
    restDoneBannerTimeoutRef.current = null;
  }, 5000);
  // Clear the rest timer state after the ring animation completes
  const clearTimer = setTimeout(() => {
    setRestTimerActive(false);
  }, 2800);
  return () => {
    clearTimeout(clearTimer);
    if (restDoneBannerTimeoutRef.current) {
      clearTimeout(restDoneBannerTimeoutRef.current);
      restDoneBannerTimeoutRef.current = null;
    }
  };
}, [restTimerActive, restTimerSeconds, user.restTimerSettings.soundEffect]);
```

- [ ] **Step 4: Dismiss banner when a new rest timer starts**

Find `startRestTimer` (around lines 358–363):

```tsx
const startRestTimer = useCallback(() => {
  restEndTimeRef.current = Date.now() + restTimerDuration * 1000;
  setRestTimerActive(true);
  setRestTimerSeconds(restTimerDuration);
}, [restTimerDuration]);
```

Replace with:

```tsx
const startRestTimer = useCallback(() => {
  dismissRestDoneBanner();
  restEndTimeRef.current = Date.now() + restTimerDuration * 1000;
  setRestTimerActive(true);
  setRestTimerSeconds(restTimerDuration);
}, [restTimerDuration, dismissRestDoneBanner]);
```

- [ ] **Step 5: Dismiss banner in handleCancel**

Find `handleCancel` (around lines 420–432). Add `dismissRestDoneBanner()` as the first call:

```tsx
const handleCancel = () => {
  dismissRestDoneBanner();
  if (Platform.OS !== 'web' && pendingNotifIdRef.current) {
    Notifications.cancelScheduledNotificationAsync(pendingNotifIdRef.current).catch(() => {});
    pendingNotifIdRef.current = null;
  }
  setIsActive(false);
  setElapsedSeconds(0);
  setTrackedExercises([]);
  setShowExercisePicker(false);
  setRestTimerActive(false);
  setRestTimerSeconds(0);
  closeWorkout();
};
```

- [ ] **Step 6: Dismiss banner in handleFinish**

Find the end of `handleFinish` (around line 595–598) where it calls `setIsActive(false)`. Add `dismissRestDoneBanner()` before it:

```tsx
dismissRestDoneBanner();
setIsActive(false);
setRestTimerActive(false);
setShowCompleteAnimation(true);
```

- [ ] **Step 7: Render the banner in the expanded view**

Inside the expanded container JSX, find the `<View style={styles.dragHandle} ...>` element. The banner needs to sit just below the drag handle but above the scroll content, inside the `expandedContainer` view. Add it right after the header `</View>` (after the "Finish Workout" button row, before `<ScrollView>`):

```tsx
{/* Rest Done Banner */}
<RestDoneBanner
  visible={showRestDoneBanner}
  onDismiss={dismissRestDoneBanner}
  topOffset={insets.top}
  Colors={Colors}
/>
```

- [ ] **Step 8: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add components/WorkoutOverlay.tsx
git commit -m "feat(WorkoutOverlay): wire RestDoneBanner trigger/dismiss into rest timer state"
```

---

## Task 4 — Update CompactRestTimer and CompactRestTimerExpanded

**Files:**
- Modify: `components/WorkoutOverlay.tsx` (top of file, the two compact sub-components)

- [ ] **Step 1: Update CompactRestTimer done state**

Find `CompactRestTimer` (lines ~69–102). Change the done-state text from `'DONE!'` to `'DONE! GO!'` and make the pill more prominent by removing the low-opacity background — use `Colors.primary + '28'` instead of `+ '18'`:

```tsx
function CompactRestTimer({ seconds, Colors }: { seconds: number; Colors: ReturnType<typeof useTheme> }) {
  const isDone = seconds <= 0;
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDone ? Colors.primary + '28' : Colors.card,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        borderWidth: isDone ? 1.5 : 1,
        borderColor: isDone ? Colors.primary : Colors.border,
        marginBottom: spacing.xs,
      }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: radius.full,
          backgroundColor: isDone ? Colors.primary : Colors.danger,
          marginRight: spacing.sm,
        }}
      />
      <Text style={{ fontSize: typography.sm, fontWeight: '700', color: isDone ? Colors.primary : Colors.text }}>
        {isDone ? 'DONE! GO!' : `REST ${timeString}`}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Simplify CompactRestTimerExpanded — return null when done**

Find `CompactRestTimerExpanded` (lines ~104–148). Since the banner now handles the "done" signal in the expanded view, return null when `isDone`:

```tsx
function CompactRestTimerExpanded({
  active,
  seconds,
  Colors,
}: {
  active: boolean;
  seconds: number;
  Colors: ReturnType<typeof useTheme>;
}) {
  if (!active) return null;
  const isDone = seconds <= 0;
  if (isDone) return null;

  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        backgroundColor: Colors.card,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        alignSelf: 'center',
      }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: radius.full,
          backgroundColor: Colors.danger,
          marginRight: spacing.sm,
        }}
      />
      <Text style={{ fontSize: typography.lg, fontWeight: 'bold', color: Colors.text }}>
        {`Resting: ${timeString}`}
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/WorkoutOverlay.tsx
git commit -m "feat(WorkoutOverlay): upgrade CompactRestTimer done state; simplify CompactRestTimerExpanded"
```

---

## Task 5 — Manual verification

- [ ] **Step 1: Start the app**

```bash
npx expo start --web
```

Open in browser or Expo Go.

- [ ] **Step 2: Verify rest timer finish sequence**

1. Start a workout
2. Complete a set (this starts the rest timer)
3. Wait for the timer to hit 0:00
4. **Expected:**
   - The ring does a quick scale burst (~150ms) with a bright flash, then fades out in ~300ms
   - Simultaneously (within ~500ms), the gradient banner slides down from the top: "GO — NEXT SET!" with a lightning bolt icon
   - The white progress bar at the bottom of the banner visibly shrinks to zero over 5 seconds
   - After 5 seconds, the banner slides back up automatically
   - Tapping ✕ dismisses the banner immediately with a slide-up animation

- [ ] **Step 3: Verify banner dismisses on next set**

1. Let the banner appear
2. Complete another set (before the 5s auto-dismiss)
3. **Expected:** Banner slides out instantly when the new rest timer starts

- [ ] **Step 4: Verify minimized state**

1. Start workout, complete a set, minimize the overlay
2. Wait for rest timer to finish
3. **Expected:** The minimized pill shows "DONE! GO!" in `Colors.primary` with a stronger background tint (no banner — correct, banner is expanded-only)

- [ ] **Step 5: Verify cancel/finish clears banner**

1. Let banner appear
2. Tap "Cancel Workout" or "Finish Workout"
3. **Expected:** Banner dismissed, no stale state
