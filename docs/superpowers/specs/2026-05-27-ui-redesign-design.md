# ASCENT UI Redesign — Design Spec
**Date:** 2026-05-27
**Status:** Approved by user

---

## Problem

The current UI feels bland and messy. Typography is inconsistent, the personality doesn't match the gamified concept, and there's no strong visual identity tying the app together.

## Goal

Redesign the full UI to feel like a proper **neon/gaming app** — sharp, dark, and exciting — while staying readable and clean. Every screen should feel cohesive.

---

## Design Decisions (All Locked In)

| Decision | Choice |
|----------|--------|
| Personality | Neon / Gaming |
| Color palette | Cyan + Purple on near-black |
| Typography | Space Grotesk |
| Card/surface style | Neon borders |
| Rank icon color | Matches rank tier (deferred full redesign) |
| Tab bar | Vector icons, no emojis |

---

## Design System

### Colors

```
Background:     #08080f  (near-black, slight blue tint)
Surface:        #0d0d18  (card background)
Border default: #1a1a28  (subtle dark border)
Border primary: rgba(0, 255, 224, 0.25)  (cyan neon — hero card only)

Primary:        #00ffe0  (cyan — active states, highlights, CTA)
Secondary:      #7b2fff  (purple — secondary bars, gradients)
Gradient:       linear-gradient(90deg, #00ffe0, #7b2fff)

Text primary:   #ffffff
Text secondary: #888888
Text muted:     #444444
Text label:     #333333  (small-caps labels)
```

**Rank tier colors** (icon ring + glow + accent text only — not used globally):
```
Bronze:   #b46432
Silver:   #b0b8c4
Gold:     #ffb900
Platinum: #00dcc8
Diamond:  #64a0ff
Immortal: #ff3c78
```

### Typography — Space Grotesk

Install via `@expo-google-fonts/space-grotesk`.

| Role | Size | Weight | Treatment |
|------|------|--------|-----------|
| Page title | 28px | 700 | — |
| Hero number | 34–40px | 700 | — |
| Section heading | 16px | 600 | — |
| Body | 14–15px | 400 | — |
| Label / tag | 10–11px | 600 | UPPERCASE, letter-spacing 3–4px |
| Stat value | 18–20px | 700 | — |
| Stat unit | 11px | 400 | muted color |

**Rule:** No system default fonts anywhere. Space Grotesk across the entire app.

### Spacing & Radius

Keep existing `constants/design.ts` tokens — no changes needed.

Notable: cards use `radius['2xl']` (24px) or `radius.xl` (20px). Tab bar uses `radius.lg` (16px) for icon box.

### Shadows / Glows

```
Hero card glow:    box-shadow: 0 0 24px rgba(0,255,224,0.06)
CTA button glow:   box-shadow: 0 0 20px rgba(0,255,224,0.18)
Progress bar glow: box-shadow: 0 0 10px rgba(0,255,224,0.35)  [cyan bars]
                   box-shadow: 0 0 6px  rgba(123,47,255,0.25) [purple bars]
Rank icon glow:    box-shadow: 0 0 18px rgba(<rankColor>, 0.2)
Active tab glow:   box-shadow: 0 0 10px rgba(0,255,224,0.12)
```

Ambient glow orbs behind rank card: radial-gradient blobs, purple top-right + cyan bottom-left, 10–20% opacity.

---

## Component Patterns

### Cards

Two tiers of cards:

**Hero card** (rank card on Home, rank card on Rank Details):
- Background: `#0d0d18`
- Border: `1px solid rgba(0,255,224,0.25)` + subtle cyan box-shadow
- Border-radius: 20px
- Ambient glow orbs behind content

**Standard card** (score breakdown, stats, settings rows, etc.):
- Background: `#0d0d18`
- Border: `1px solid #1a1a28`
- Border-radius: 16px
- No glow

### Progress Bars

- Track: `#111`, border-radius 6px, height 8px (large) / 4px (small)
- Fill: `linear-gradient(90deg, #00ffe0, #7b2fff)` for fitness score
- Pillar bars alternate: cyan gradient (Consistency, Progression) / purple gradient (Volume, Variety)
- Gloss layer: `rgba(255,255,255,0.15)` on top 50% of fill
- Glow: see shadow values above

### Buttons

**Primary CTA:**
- Background: `linear-gradient(90deg, #00ffe0, #7b2fff)`
- Text: `#08080f` (dark), 700 weight, uppercase, letter-spacing 1px
- Border-radius: 14px, min-height 52px
- Glow: `0 0 20px rgba(0,255,224,0.18)`

**Secondary / outline:**
- Background: transparent
- Border: `1px solid #1a1a28`
- Text: `#444`, 600 weight, uppercase
- Border-radius: 14px

### Tab Bar

- Background: `#0d0d18`, border-top `1px solid #161626`
- **Active tab:** 38×38px icon box, `rgba(0,255,224,0.1)` bg, `1px solid rgba(0,255,224,0.35)` border, 11px radius, cyan icon fill + cyan glow. Dot indicator (4×4px, cyan, glow) below.
- **Inactive tabs:** icon only, fill `#2a2a3a`, no box, no dot
- Icons (Material Design vectors, no emojis): Home, Dumbbell, List, Calendar, Person
- Keep existing `CurvedTabBar.tsx` bubble animation logic, apply new visual style

### Rank Icon Area (Hero Card)

- Icon ring: 54×54px, `rgba(<rankColor>, 0.08)` bg, `1px solid rgba(<rankColor>, 0.35)` border, 15px radius
- Glow: `0 0 18px rgba(<rankColor>, 0.2)`
- Icon: existing PNG from `assets/images/ranks/` via `RankIcon` component
- Rank name text: white for tier name, rank-tier color for sub-tier number (e.g. "Gold **II**")
- Ambient orb: `radial-gradient(circle, rgba(<rankColor>, 0.18), transparent 70%)` top-right
- **Full rank icon image redesign is deferred** — use existing PNGs for now

### Labels

All section labels: 10–11px, weight 600, `UPPERCASE`, letter-spacing 3–4px, color `#333`–`#555`.

### Settings Rows

- Background: `#0d0d18`, border `1px solid #1a1a28`
- Icon container: 36×36px, `rgba(0,255,224,0.08)` bg, `rgba(0,255,224,0.15)` border (was `Colors.primary + '12'`)
- Toggle: cyan when on

---

## Screen Breakdown

### All Screens
- Background: `#08080f`
- Replace all `useTheme()` color references — update `constants/theme.ts` dark theme values
- Font: Space Grotesk loaded globally in `app/_layout.tsx`

### Home (`app/(tabs)/index.tsx`)
- Header: "Welcome back" label + bold username + settings gear pill
- Hero rank card: rank-color icon ring, ambient orbs, gradient progress bar
- Score breakdown card: 4 alternating cyan/purple mini bars
- Quick stats row: 3 equal cards
- Quick actions: gradient CTA + outline secondary

### Workout (`app/(tabs)/workout.tsx`)
- Templates list: standard cards with neon-bordered "Start" buttons
- Quick Start: primary gradient CTA

### Exercises (`app/(tabs)/exercises.tsx`)
- Search bar: `#0d0d18` bg, `#1a1a28` border, cyan focus border
- Filter chips: cyan border + bg tint when active
- Exercise rows: standard card style

### History (`app/(tabs)/history.tsx`)
- Workout history cards: standard card style
- Calendar modal: dark surface, cyan selected date highlight

### Profile (`app/(tabs)/profile.tsx`)
- Profile header: avatar circle with cyan border
- Rank progress bar: gradient fill
- Widgets: standard card style with cyan/purple bars

### Auth (`app/auth.tsx`)
- Top area: keep `Colors.card` + ASCENT logo
- Form card: `#0d0d18`, `border-top-radius: 36`, neon-border inputs on focus
- CTA: gradient primary button

### Settings Screens (8 screens)
- Rows: standard card pattern
- Icon containers: cyan-tinted
- Toggles: cyan
- Save button: gradient primary

### Rank Details (`app/rank-details.tsx`)
- Hero card: rank-color icon ring + ambient orbs
- All-tiers list: left accent bar in rank-tier color for current tier
- Pillar cards: tinted cyan/purple icons

---

## Font Installation

```bash
npx expo install @expo-google-fonts/space-grotesk expo-font
```

Load in `app/_layout.tsx`:
```tsx
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
```

**Application strategy:** Create a `components/ui/Text.tsx` wrapper that applies the correct Space Grotesk variant based on a `weight` prop. Use this everywhere instead of RN's built-in `<Text>`. This avoids having to update every individual StyleSheet.

```tsx
// components/ui/Text.tsx
<Text style={[{ fontFamily: fontFamily[weight] }, style]} {...props} />
```

Add a `fontFamily` map to `constants/design.ts`:
```ts
export const fontFamily = {
  regular:  'SpaceGrotesk_400Regular',
  medium:   'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold:     'SpaceGrotesk_700Bold',
};
```

---

## Theme Updates (`constants/theme.ts`)

Update the **dark theme** palette:
```ts
background: '#08080f',
card:        '#0d0d18',
border:      '#1a1a28',
primary:     '#00ffe0',
secondary:   '#7b2fff',
```

Light and sunset themes are out of scope for this redesign pass.

---

## Out of Scope

- Full rank icon PNG artwork redesign (deferred)
- Light and sunset theme updates
- New screens / new features
- Animation timing changes (keep existing spring values)

---

## Reference

Mockups saved in: `gym-tracker/.superpowers/brainstorm/3036-1779810240/content/`
- `personality.html` — direction selection
- `palette.html` — color palette selection
- `typography.html` — font selection
- `surfaces.html` — card style selection
- `home-mockup-v3.html` — approved final home screen mockup
