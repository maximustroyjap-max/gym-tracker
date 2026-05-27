# Workout Complete Animation Redesign — Design Spec

## Goal

Replace the current small auto-dismissing card with a full-screen celebration screen that gives users a satisfying, gamified summary of their finished workout — including PRs, XP level progress, fitness score breakdown, and rank changes.

## Background

The current `WorkoutCompleteAnimation` is a centered card (~320px wide) that auto-dismisses after ~3 seconds. It shows a checkmark, "Workout Complete!", stats grid, XP row, fitness score, and an optional rank banner. The main problems:

- Dismisses too fast to read
- Centered card feels generic — doesn't match ASCENT's neon gamified aesthetic
- XP shown as a plain number; no level context
- PR data is tracked in `handleFinish` but never shown to the user
- No celebration feel (no confetti, no glow)

## Design Decisions

| Topic | Decision |
|---|---|
| Layout | Full-screen overlay (not a small card) |
| Top section | Glowing gradient ring + "Workout Complete!" + 🔥 streak pill |
| XP display | Large gradient `+79 XP` number + level progress bar that fills on entrance |
| PR details | Gold-bordered row, only shown when `prAchieved === true` |
| Rank change | Purple-bordered row with rank icon, only shown when rank changed |
| Dismiss | Auto-dismiss after 6s with a draining progress bar; tap anywhere dismisses early |

## Visual Design

### Full layout (top to bottom)

```
[dark backdrop, rgba(0,0,0,0.88)]
  scattered confetti dots (static, ~8-10 small colored circles)
  ─────────────────────────────
  76px glowing gradient ring (primary→secondary) — ✓ checkmark
  "Workout Complete!"  (white, 22px bold)
  [🔥 12-Day Streak]  (gold pill badge, only if currentStreak > 0)
  ─────────────────────────────
  [Duration] [Exercises] [Sets]   ← 3-card grid
  ─────────────────────────────
  [🎯 2 Personal Records!]         ← gold row, conditional
    "Bench Press: 100kg×5 · Squat: 140kg×3"
  ─────────────────────────────
  +79 XP         Level 14
  Earned this    420/580 to Lvl 15
  [━━━━━━━━━━━░░░░░░░░]  ← fills on entrance (0→progress, 600ms)
  Lvl 14                 Lvl 15
  ─────────────────────────────
  Fitness Score          68
  C ██  V ██  P ██  R ██   ← mini breakdown bars
  ─────────────────────────────
  [🏅 ⬆ RANK UP — Gold 3!]        ← purple row, conditional
    Previous: Gold 2
  ─────────────────────────────
  [━━━━━━━━━━━━━━━━━━━━━━━━━━]   ← 6s drain bar (primary→secondary)
  auto-closing in 6s · tap anywhere to dismiss
```

### Colors & tokens

All colors from `useTheme()`. Specific uses:
- Glowing ring: `linear-gradient(135deg, Colors.primary, Colors.secondary)` + `box-shadow` glow
- Streak pill: `Colors.gold + '20'` bg, `Colors.gold + '55'` border, `Colors.gold` text
- PR row: `Colors.gold + '14'` bg, `Colors.gold + '55'` border
- XP gradient text: `Colors.primary` → `Colors.secondary` (via `LinearGradient` with `MaskedView`, or approximate with a solid color — use `Colors.primary` for simplicity on RN)
- XP bar: `LinearGradient` horizontal, `Colors.primary` → `Colors.secondary`
- Fitness row: `Colors.secondary + '12'` bg, `Colors.secondary + '38'` border
- Rank row: `Colors.secondary + '18'` bg, `Colors.secondary + '66'` border
- Countdown bar: `LinearGradient` horizontal, `Colors.primary` → `Colors.secondary`
- Confetti dots: mix of `Colors.primary`, `Colors.secondary`, `Colors.gold` at 30–50% opacity

### Confetti dots

8–10 `position: absolute` dots, each a `View` with `borderRadius: radius.full`. Sizes vary (3–7px). Scattered at fixed positions near the top third of the screen. Static — no particle animation needed.

## Animation Sequence

```
t=0ms    backdrop fades in (timing, 300ms, opacity 0→1)
t=300ms  ring springs in (spring, friction:6, tension:50, scale 0→1)
         + title + streak pill fade in (timing, 350ms, opacity 0→1)
t=650ms  stat cards slide up (timing, 300ms, translateY 20→0 + opacity 0→1)
         + PR row slides up with same params (if prAchieved)
t=950ms  XP number fades in + level bar fills (timing, 600ms, width 0→progress%)
t=950ms  fitness row slides up (timing, 300ms)
t=1250ms rank banner springs in (spring, friction:6, tension:50, scale 0.85→1 + opacity 0→1)
         (only if rankChanged)
t=1400ms 6s countdown drain bar begins (timing, 6000ms, width 100→0%, useNativeDriver: false)
t=7400ms fade-out: backdrop + content (timing, 400ms, opacity 1→0) → onComplete()
```

Total auto-dismiss time: ~7.8 seconds (1.4s entrance + 6s hold + 0.4s exit).

Early dismiss (tap anywhere): interrupt countdown, run the same fade-out immediately → `onComplete()`.

**`useNativeDriver` notes:**
- All `transform` + `opacity` animations: `useNativeDriver: true`
- XP bar fill width + countdown drain bar: `useNativeDriver: false` (width-based)

## Props Interface

### New `WorkoutCompleteAnimation` props (additions)

```ts
interface WorkoutCompleteAnimationProps {
  // Existing
  durationSeconds: number;
  exerciseCount: number;
  setCount: number;
  xpGained: number;
  leveledUp: boolean;
  fitnessScore: number;
  fitnessBreakdown: FitnessBreakdown;
  rankChanged: boolean;
  newRank: string;
  oldRank: string;
  onComplete: () => void;

  // New
  prAchieved: boolean;
  prDetails: string;        // e.g. "Bench Press: 100kg × 5  ·  Squat: 140kg × 3"
  newLevel: number;
  newXp: number;            // XP after this workout
  newXpToNextLevel: number; // XP needed for next level after this workout
  currentStreak: number;    // streak after this workout (to show in pill)
}
```

### `workoutStats` additions in `WorkoutOverlay`

```ts
// In handleFinish, after calculating newLevel/newXp/newXpToNextLevel:
setWorkoutStats({
  // existing fields...
  prAchieved,
  prDetails,
  newLevel,
  newXp,
  newXpToNextLevel,
  currentStreak: newStreak,
});
```

And in the `workoutStats` state initialiser:

```ts
const [workoutStats, setWorkoutStats] = useState({
  // existing...
  prAchieved: false,
  prDetails: '',
  newLevel: 1,
  newXp: 0,
  newXpToNextLevel: 100,
  currentStreak: 0,
});
```

## Files Changed

| File | Change |
|---|---|
| `components/WorkoutCompleteAnimation.tsx` | Full rewrite of the component |
| `components/WorkoutOverlay.tsx` | Add 5 new fields to `workoutStats` state + pass as props |

## Sub-components (all inside `WorkoutCompleteAnimation.tsx`)

- `ConfettiDots` — renders the static scattered dots
- `StatCard` — single duration/exercise/set card
- `PRRow` — conditional gold PR row
- `XPSection` — XP number + level bar with fill animation
- `FitnessRow` — fitness score + mini breakdown bars
- `RankBanner` — conditional rank change row

## Gotchas

- **XP bar width animation:** `useNativeDriver: false`, animate from `0` to `(newXp / newXpToNextLevel) * 100 + '%'`. Use `Animated.Value` interpolated to a percentage string.
- **Countdown drain bar:** same, `useNativeDriver: false`, `100%` → `0%` over 6000ms.
- **Early dismiss:** store the main `Animated.CompositeAnimation` in a `ref`, call `.stop()` on tap, then run the exit sequence manually.
- **`leveledUp`:** if `leveledUp` is true, the XP bar should show the overflow visually — animate to `100%`, then reset to `0%` briefly, then animate to the new partial progress. (Nice-to-have; start with simple 0→progress if this adds complexity.)
- **Tap target:** wrap the entire content in a `TouchableWithoutFeedback` / `Pressable` that calls the dismiss handler.
- **Platform guard:** `expo-linear-gradient` already used in this project; no new installs needed. `react-native-svg` already installed.
- **`LinearGradient` for XP bar:** use `expo-linear-gradient` horizontally inside the bar track view, with `flex:1` so it fills the track naturally.
