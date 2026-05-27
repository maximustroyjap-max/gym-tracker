# Splash Animation Redesign — Implementation Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current platform-split splash screen (native video + simple web fade) with a single unified code-based "Neon Ignite" animation that works identically on iOS, Android, and Web.

**Architecture:** One `AnimatedSplashScreen` component using React Native `Animated` API + `react-native-svg`. No platform split, no video file, no `expo-av` Video dependency. The component receives `onAnimationComplete` callback and fires it after the animation finishes.

**Tech Stack:** React Native `Animated`, `react-native-svg` (already installed), `expo-splash-screen`

---

## Animation Sequence

Total duration: ~4.3s

| Time | Beat | Detail |
|------|------|--------|
| 0.0s | Dark hold | Pure `#0F0F0F` — lets OS transition settle |
| 0.5s | Spark begins | Short bright spark (60px) starts traveling the mountain SVG path |
| 0.5s | Trail draws | Dimmer cyan trail renders permanently behind the spark |
| 2.5s | Logo ignites | Filled `#00FF88` logo snaps in with a soft brightness flash (no white screen flash) |
| 2.5s | Glow ring | Subtle cyan ring expands outward once and fades — signals the ignite moment |
| 2.9s | ASCENT compresses | Text starts at wide letter-spacing (~20), compresses to final (~8) in 0.45s |
| 3.4s | Tagline rises | "Level Up Your Fitness" fades up in `#00FF8870` |
| 3.8s | Hold | Brief pause so the full logo+text can be read |
| 3.8s | Fade out | Entire screen fades opacity 1→0 over 500ms, then `onAnimationComplete()` fires |

---

## Component API

```ts
// components/AnimatedSplashScreen.tsx
interface Props {
  onAnimationComplete: () => void;
}
export function AnimatedSplashScreen({ onAnimationComplete }: Props): JSX.Element
```

No platform split — same component renders on all platforms.

---

## Animation Implementation Notes

### SVG Stroke Trace (spark + trail)

Two overlaid `<Path>` elements sharing the same `d` attribute:

1. **Trail path** — dimmer stroke, `strokeDasharray` = total path length (~950), `strokeDashoffset` animated from 950 → 0 over 2.0s. Draws permanently and stays.
2. **Spark path** — bright stroke + glow filter, `strokeDasharray` = `"60 10000"` (short 60px dash), `strokeDashoffset` animated from 60 → -950 over 2.0s. Travels ahead of the trail.

Both start at `delay = 0.5s`, same duration, same easing (`ease-in-out`) so the spark stays at the leading edge of the trail.

In React Native, `strokeDashoffset` is driven by a single `Animated.Value` (for the trail) and a second `Animated.Value` (for the spark). Both animated with `Animated.timing`.

### Filled Logo Snap-In

A third `<Path>` with the same shape, `fill="#00FF88"`, starts at `opacity: 0`. At t=2.5s: two animations run in parallel — `Animated.timing` opacity 0→1 over 300ms, and `Animated.timing` scale 1.08→1.0 over 300ms on the wrapping `Animated.View`. The slight over-scale then settle gives the snap-in feel.

### Glow Ring

A `<Circle>` element (or `View` with `borderRadius`) that scales from 0.6→1.4 and fades opacity 0→0.8→0 over 800ms starting at t=2.5s. Color `#00FF8840`.

### Text Reveal

`Animated.Value` for `letterSpacing` is NOT supported natively in RN. Instead, use individual letter `<AppText>` elements with a staggered `translateX` + `opacity` entrance (each letter slides in from a slight offset, staggered 40ms apart). This achieves the "compressing in" effect.

### Fade Out

At t=3.8s: `Animated.timing` on the root container's opacity from 1 → 0 over 500ms. In callback: call `onAnimationComplete()`.

### `ExpoSplashScreen.hideAsync()`

Called immediately on component mount (inside `useEffect` with empty deps). This removes the native OS splash image and hands control to our animated component.

---

## Colors (hardcoded — theme not loaded yet)

```ts
const SPLASH_BG      = '#0F0F0F';
const SPLASH_PRIMARY = '#00FF88';   // cyan neon
const SPLASH_TRAIL   = '#00FF8870'; // dimmer trail
const SPLASH_GLOW    = '#00FF8840'; // glow ring
const SPLASH_TEXT    = '#FFFFFF';
const SPLASH_TAGLINE = '#00FF8870';
```

No `useTheme()` — contexts are not yet mounted when splash plays.

---

## Files

| File | Change |
|------|--------|
| `components/AnimatedSplashScreen.tsx` | Full rewrite — remove Platform split, NativeSplashScreen, WebSplashScreen; single unified component |
| `assets/videos/splash-screen.mp4` | No longer referenced (keep file, just unused) |

`_layout.tsx` — no changes needed. The `onAnimationComplete` prop interface is unchanged.

---

## What's Removed

- `Video` import from `expo-av` (was deprecated anyway — the warning seen during setup)
- `NativeSplashScreen` component (video playback)
- `WebSplashScreen` component (simple fade)
- `Platform.OS` split in `AnimatedSplashScreen`
- `ResizeMode` import

---

## Gotchas

- **Letter spacing animation**: RN's `Animated` does not animate `letterSpacing` on Android. Use staggered per-letter entrance instead.
- **`strokeDashoffset` in RN SVG**: Use `Animated.createAnimatedComponent(Path)` from `react-native`'s `Animated` (where `Path` is imported from `react-native-svg`). Pass the `Animated.Value` directly as the `strokeDashoffset` prop. This requires `useNativeDriver: false`.
- **`useNativeDriver`**: Opacity and transform animations use `useNativeDriver: true`. Any SVG prop animations (`strokeDashoffset`) use `useNativeDriver: false`.
- **Never mix** `useNativeDriver: true` and `false` in the same `Animated.parallel()` call — split into separate parallel groups.
- **`AppText` not available** — font context not loaded yet. Use RN `Text` with `fontFamily: 'SpaceGrotesk-Bold'` (the actual font file name from `constants/design.ts`).
- **Web**: `ExpoSplashScreen.hideAsync()` is a no-op on web — safe to call.
