# ASCENT — Gym Tracker

Gamified gym tracker for iOS, Android, and Web (PWA). React Native + Expo 54, TypeScript, Expo Router, Supabase backend (auth + PostgreSQL), deployed to Netlify. 5 tabs: Home, Workout, Exercises, History, Profile. 16-tier rank system driven by Fitness Score (4 pillars).

## Commands

```bash
npx expo start              # native (Expo Go)
npx expo start --web        # web dev
npx expo export --platform web  # build for Netlify → dist/
npx tsc --noEmit            # type check (run after every change)
```

## Critical Rules

- **Colors:** always `const Colors = useTheme()` — never import static Colors
- **Typography:** always `<AppText weight="bold|semibold|medium|regular">` — never use RN `<Text>` or `fontWeight` in StyleSheet
- **Cards:** always `<NeonCard>` — never `<GlassCard>` or raw `View` for card surfaces
- **Icons:** use `<IconSymbol name="sf-symbol-name">` for nav/UI icons; use `MaterialIcons` directly only for icons not in the mapping
- **User data:** `useUser()` → `updateUser()` writes to Supabase; add new fields to `types/user.ts` + `DEFAULT_USER` first
- **Auth:** `useAuth()` — `login()`/`signup()` return `{ success, error? }`, always check result
- **Tab bar padding:** `TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl` (import from `@/components/CurvedTabBar`)
- **Tab screen background:** `Platform.OS === 'web' ? Colors.background : 'transparent'`
- **Platform guards:** wrap `expo-haptics`, `expo-status-bar`, `expo-av` in `Platform.OS !== 'web'`
- **Design tokens:** import from `@/constants/design` (spacing, radius, typography, activeOpacity, animation) — no hardcoded values
- **Headers:** all hidden globally; every screen needs its own back button
- **Popups:** render after ScrollView with `StyleSheet.absoluteFill` + high `zIndex`

## State Management

| Hook | Context | Persistence |
|------|---------|-------------|
| `useTheme()` → `Colors` | `ThemeContext` | Derived from `user.theme` |
| `useUser()` → `{ user, updateUser, resetUser }` | `UserContext` | Supabase `profiles` table |
| `useAuth()` → `{ isAuthenticated, login, signup, logout, authConfigError }` | `AuthContext` | Supabase Auth |
| `useWorkout()` | `WorkoutContext` | Runtime only |

## Auth Flow

App launch → Splash → Supabase `getSession()` → no session: Auth screen / session: main app tabs.

- **Signup:** `supabase.auth.signUp()` → DB trigger auto-creates profile row → patch `weekly_target`
- **Login:** `supabase.auth.signInWithPassword()` → `onAuthStateChange` → `isAuthenticated = true`
- **Logout:** Settings → Logout → `supabase.auth.signOut()`
- **Config error:** If Supabase env vars missing, `authConfigError` shows a red banner on the auth screen
- **SSR:** During static export `typeof window === 'undefined'` — Supabase returns mock client, contexts skip DB calls

## Data Model (key fields — full types in `types/user.ts`)

```ts
User {
  username, avatar,           // avatar: 'avatar1'…'avatar10' or '' (initials)
  theme,                      // 'dark' | 'light' | 'sunset'
  fitnessScore,               // 0-100
  fitnessBreakdown: { consistency, volume, progression, variety },
  rank,                       // "Bronze 1" … "Immortal"
  currentStreak,              // consecutive weeks meeting weeklyTarget
  weeklyTarget, weeklyHistory, workoutHistory,
  myTemplates, customExercises, hiddenExerciseIds,
  bodyMeasurements, notificationSettings, advancedSettings, restTimerSettings,
  templateFolders
}
```

Supabase `profiles` table: scalar columns + JSONB for `fitness_breakdown`, `body_measurements`, `notification_settings`, `advanced_settings`, `rest_timer_settings`, `workout_history`, `custom_exercises`, `templates`, `template_folders`, `weekly_history`. Text array: `hidden_exercise_ids`.

## Navigation

| Screen | Path | How to Reach |
|--------|------|-------------|
| Home | `/(tabs)/` | Tab bar |
| Workout | `/(tabs)/workout` | Tab bar |
| Exercises | `/(tabs)/exercises` | Tab bar |
| History | `/(tabs)/history` | Tab bar |
| Profile | `/(tabs)/profile` | Tab bar |
| Auth | `/auth` | After splash if not authenticated |
| Rank Details | `/rank-details` | Home hero card or Profile rank tap |
| Settings | `/settings` | Profile gear icon |
| Notifications | `/notifications` | Settings |
| Advanced | `/advanced` | Settings |
| Theme | `/theme` | Settings |
| Rest Timer | `/rest-timer-settings` | Settings |
| Edit Profile | `/edit-profile` | Settings or tap avatar |
| Body Measurements | `/body-measurements` | Settings |
| Goals | `/goals` | Settings |

## Rank System (`constants/ranks.ts`)

16 tiers: Bronze 1-3 → Silver 1-3 → Gold 1-3 → Platinum 1-3 → Diamond 1-3 → Immortal.

```
Fitness Score = (Consistency × 0.40) + (Volume × 0.30) + (Progression × 0.20) + (Variety × 0.10)
```

Score thresholds: B1=0, B2=5, B3=10, S1=16, S2=23, S3=31, G1=40, G2=50, G3=61, P1=72, P2=82, P3=91, D1=96, D2=98, D3=99, Immortal=100.

Streak = consecutive weeks where `weeklyHistory.count >= weeklyTarget`. Rank can go up **and down**. Recalculates on workout finish and app launch.

## Design System (`constants/design.ts`)

```ts
spacing  = { xs:4, sm:8, md:12, lg:16, xl:20, '2xl':24, '3xl':32, '4xl':40 }
radius   = { sm:8, md:12, lg:16, xl:20, '2xl':24, full:9999 }
typography = { xs:11, sm:13, base:15, lg:17, xl:20, '2xl':24, '3xl':28, '4xl':32 }
activeOpacity = { card:0.7, button:0.8, row:0.6 }
animation = { pressScale:0.97, springFriction:8, springTension:40, microDuration:150, standardDuration:250 }
fontFamily = { regular, medium, semibold, bold }  // Space Grotesk weights
```

Patterns: page titles = `typography['3xl']` bold · section labels = `typography.sm` semibold uppercase · gloss layer = `rgba(255,255,255,0.15)` on top 50% of filled bars · icon containers = 36×36px, `radius.md`, `Colors.primary+'18'` bg.

## Key Files

| Path | Purpose |
|------|---------|
| `app/_layout.tsx` | Root — UserProvider + AuthProvider + ThemeProvider + WorkoutProvider; workout overlay rendered here |
| `app/(tabs)/_layout.tsx` | Tab layout — uses custom CurvedTabBar |
| `context/ThemeContext.tsx` | `useTheme()` → Colors |
| `context/UserContext.tsx` | `useUser()` → Supabase profiles |
| `context/AuthContext.tsx` | `useAuth()` → Supabase Auth |
| `lib/supabase.ts` | Lazy singleton client + `isMockClient()` |
| `lib/platform.ts` | `isWeb` / `isNative` helpers |
| `types/user.ts` | All TypeScript interfaces + `DEFAULT_USER` |
| `constants/design.ts` | Design tokens + `fontFamily` map for Space Grotesk |
| `constants/ranks.ts` | 16-tier rank system + fitness score + streak logic |
| `constants/theme.ts` | 5 theme color palettes |
| `constants/exercises.ts` | 150+ built-in exercises |
| `constants/avatars.ts` | Avatar ID→image mapping + old emoji migration list |
| `components/CurvedTabBar.tsx` | Liquid bubble tab bar; exports `TAB_BAR_TOTAL_HEIGHT = 84` |
| `components/NeonCard.tsx` | Card surface — cyan/purple neon border, optional `glowColor` for hero variant |
| `components/RankIcon.tsx` | Rank PNG renderer with glow/gloss/animated props |
| `components/ui/AppText.tsx` | Typography wrapper — always use instead of `<Text>` |
| `components/ui/icon-symbol.tsx` | SF Symbol → MaterialIcons mapping; add new icons here |
| `utils/sound.ts` | Alert sounds — expo-av on native, HTML5 Audio on web |
| `app/+html.tsx` | PWA HTML wrapper — viewport lock, meta tags, safe area CSS |
| `public/manifest.json` | Web App Manifest for PWA installability |

## Gotchas

- **Workout overlay** is at ROOT in `_layout.tsx` with `pointerEvents="box-none"` when minimized
- **Rest timer** uses ref-based interval (not state) to avoid re-renders during drag
- **Profile animations** (widgets, breakdown bars) use `useFocusEffect` — only trigger on tab focus
- **Progress bar animations** use `useNativeDriver: false` (width-based); everything else `useNativeDriver: true`
- **PWA icons** in `public/` — do not delete; copied to `dist/` on every build
- **AmbientBackground blobs** show through transparent tab screens on native only (hence the Platform.OS check)

## Deployment

Netlify auto-deploys on push to `master`. Env vars (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) in `.env.local` locally and in Netlify dashboard — never commit them.
