# Rest Timer Done — Banner & Animation Redesign

**Date:** 2026-05-27  
**Status:** Approved

## Goal

When the rest timer reaches zero, give the user a clear, energetic visual signal that it's time to start their next set. The current "DONE!" state inside the `RestTimer` ring is easy to miss. The redesign replaces it with a prominent slide-in banner over the workout overlay plus a snappier ring finish animation.

## Design Decisions

- **Banner style:** Full `Colors.primary → Colors.secondary` gradient (cyan→purple), matching the app's rank card and primary buttons
- **Icon:** Lightning bolt SVG (no emoji) — sharp, energetic, on-brand
- **Dismiss behaviour:** Auto-dismisses after 5 seconds with a visible draining progress bar; user can also tap ✕ to dismiss early
- **Scope:** Banner is overlay-level (not inside `RestTimer`), so it works for both `inline` and `simple` rest timer modes

---

## Components

### 1. `RestDoneBanner` (new, inside `WorkoutOverlay.tsx`)

A self-contained sub-component rendered inside `WorkoutOverlay` at the top of the expanded view.

**Appearance:**
- Full-width gradient banner (`Colors.primary → Colors.secondary` at 100deg)
- Left: 28×28 lightning bolt SVG, dark fill (`rgba(0,0,0,0.7)`)
- Center: bold "GO — NEXT SET!" title (dark text) + "Rest complete" subtitle (semi-transparent dark)
- Right: ✕ dismiss button
- Bottom edge: a 3px white/semi-transparent bar that starts at full width and shrinks to zero over 5 seconds — visually shows how long until auto-dismiss (Animated.Value 1→0, `useNativeDriver: false`, width `'100%'`→`'0%'` interpolation)

**Animation:**
- **Enter:** `Animated.spring` translateY from `-80` to `0`, friction 8, tension 60 — snappy slide-down
- **Exit:** `Animated.timing` translateY to `-80`, 250ms — slides back up and out
- Both the enter and exit animate `opacity` in parallel (0→1 enter, 1→0 exit) for a clean feel

**Trigger / dismiss logic (in `WorkoutOverlay`):**
```
restTimerSeconds hits 0:
  → setShowRestDoneBanner(true)

Auto-dismiss after 5s:
  → setTimeout(() => setShowRestDoneBanner(false), 5000)
  → store timeout ref, clear it on early dismiss or component unmount

Early dismiss (✕ tap):
  → clear timeout, setShowRestDoneBanner(false)

Starting a new rest timer (startRestTimer):
  → clear timeout, setShowRestDoneBanner(false)

handleCancel / handleFinish:
  → clear timeout, setShowRestDoneBanner(false)
```

**Visibility:** Only rendered when `!isMinimized` — the banner makes no sense on the minimized pill bar.

**Platform:** No web guard needed (pure RN Animated, no native APIs).

---

### 2. `RestTimer.tsx` — finish animation redesign

Replace the existing `isDone` sequence (checkmark pop-in → 600ms hold → slow 800ms fade) with a faster burst-then-clear:

**New `isDone` sequence:**
1. Quick scale burst: spring `ringScaleAnim` from `1` → `1.15` → back to `1` (overshoot feel), friction 5, tension 80
2. Simultaneously: flash overlay fades in to `0.25` opacity then back to `0` over 300ms total
3. After the burst (≈ 400ms): fade the entire component out — `fadeAnim` timing to `0` over 300ms

The ring clears fast because the banner is now the primary "rest is done" signal. The existing 2800ms timeout before `setRestTimerActive(false)` in `WorkoutOverlay` covers the full sequence.

Remove: `doneScaleAnim`, `doneOpacityAnim`, the "DONE!" text, checkmark icon, `doneSubtext` — the ring no longer needs to display a done state, it just bursts and disappears.

---

### 3. `CompactRestTimer` upgrade (minimized bar)

When `isDone` in `CompactRestTimer`, replace the plain card style with a gradient pill:

- Background: `Colors.primary + '25'` tint (subtle, avoids the full gradient in the tiny pill)
- Border color: `Colors.primary`
- Dot: `Colors.primary` (already done)
- Text: `Colors.primary` colour, content: **"DONE! GO!"** (more urgent than current "DONE!")

This is a small style change only — no animation added to the minimized bar.

**`CompactRestTimerExpanded` (simple mode, expanded view):** When `isDone`, this component currently shows "REST COMPLETE!" text. Since the banner now handles the done signal, simplify this to just disappear (`return null` when `isDone`) — avoids redundant messaging.

---

## State Added to `WorkoutOverlay`

```ts
const [showRestDoneBanner, setShowRestDoneBanner] = useState(false);
const restDoneBannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

Helper to dismiss cleanly (used in multiple places):
```ts
const dismissRestDoneBanner = useCallback(() => {
  if (restDoneBannerTimeoutRef.current) {
    clearTimeout(restDoneBannerTimeoutRef.current);
    restDoneBannerTimeoutRef.current = null;
  }
  setShowRestDoneBanner(false);
}, []);
```

---

## Files Changed

| File | Change |
|------|--------|
| `components/WorkoutOverlay.tsx` | Add `showRestDoneBanner` state + `restDoneBannerTimeoutRef` + `dismissRestDoneBanner` helper + `RestDoneBanner` sub-component; wire trigger into the `restTimerSeconds === 0` effect; call dismiss in `startRestTimer`, `handleCancel`, `handleFinish` |
| `components/RestTimer.tsx` | Replace `isDone` animation with burst + fast-fade; remove done-state UI (checkmark, DONE! text, doneSubtext, doneScaleAnim, doneOpacityAnim) |

---

## Out of Scope

- Haptic feedback on timer done (separate concern, already handled by `playAlertSound`)
- Banner in minimized state (doesn't make sense in the small pill bar)
- Customising banner duration in settings (YAGNI — 5s is a sensible default)
