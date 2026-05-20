# Gym Tracker Game App — Project Summary

## What We Built So Far

A **gamified gym tracker mobile + web app** for iPhone, Android, and Web browsers built with **React Native + Expo**. The app has 5 bottom tabs: **Home** (fitness score overview), **Workout** (templates + live session), **Exercises** (A-Z library with search/filters), **History** (completed workouts + calendar), and **Profile** (stats/dashboard/rank system). Features include a **16-tier Solo League Rank System** with Fitness Score (4 pillars), **PR detection**, **workout history with calendar**, **150+ exercise library**, **custom exercise creation**, **configurable rest timer** with alert sounds, **5 themes**, **dynamic settings suite**, **body measurements with BMI**, **goals tracking**, **10 custom avatar images**, and a **Login/Signup auth flow**.

**NEW:** The app is now a **dual-platform app** (iOS/Android native + Web PWA) with **Supabase** as the cloud backend for auth, data persistence, and multi-device sync. Deployed via **Vercel**.

---

### Recently Completed: Supabase + Web Migration (Phase 14–19)

**Goal:** Move from local-only AsyncStorage to cloud-backed Supabase, add web support, and deploy to Vercel.

**Phase 1: Supabase SDK Setup**
- Installed `@supabase/supabase-js`
- Created `lib/supabase.ts` — lazy singleton client with mock fallback for static export builds
- Created `lib/platform.ts` — `isWeb` / `isNative` helpers
- Created `.env.local` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Phase 2: Auth Migration (`context/AuthContext.tsx` + `app/auth.tsx`)**
- Replaced local AsyncStorage credentials with **Supabase Auth**
- `login(email, password)` → `supabase.auth.signInWithPassword()`
- `signup(email, password, username, weeklyTarget)` → `supabase.auth.signUp()` with user metadata
- `logout()` → `supabase.auth.signOut()`
- Listens to `onAuthStateChange` for real-time session updates
- `isAuthenticated` derives from `session !== null`
- **Auth screen updated:** Email + Password fields (was Username + Password). Display Name + Weekly Target on signup. Removed "Remember me" (Supabase handles session persistence automatically).
- SSR guards skip Supabase calls during static export builds

**Phase 3: User Data Migration (`context/UserContext.tsx`)**
- Replaced ALL AsyncStorage reads/writes with **Supabase Database**
- `profiles` table stores all user data including JSONB columns for nested/array data:
  - `fitness_breakdown`, `body_measurements`, `notification_settings`, `advanced_settings`, `rest_timer_settings` (JSONB)
  - `hidden_exercise_ids` (TEXT array)
  - `workout_history`, `custom_exercises`, `templates`, `template_folders`, `weekly_history` (JSONB)
- `loadUser()` fetches profile from Supabase and reconstructs the `User` object
- `updateUser(updates)` maps camelCase fields to snake_case DB columns and writes to Supabase
- `resetUser()` resets the profile row to defaults in Supabase
- Keeps optimistic local state updates (UI updates immediately, Supabase syncs in background)
- Recalculates fitness score, rank, and streak on load for correctness

**Phase 4: Web Compatibility**
- `utils/sound.ts` — HTML5 Audio API fallback on web, `expo-av` on native
- `components/AnimatedSplashScreen.tsx` — Static branded screen with fade animation on web (no video). MP4 video unchanged on native.
- `components/haptic-tab.tsx` + `components/CurvedTabBar.tsx` — Haptics only fire on native (`Platform.OS !== 'web'`)
- `app/_layout.tsx` — StatusBar only renders on native. Desktop web gets centered 480px container with black background so the mobile UI doesn't stretch on large monitors.
- `lib/supabase.ts` — `webStorage` adapter guards `localStorage` with `typeof window !== 'undefined'` for SSR safety

**Phase 5: Privacy Policy Rewrite (`app/privacy-policy.tsx`)**
- Updated all claims to reflect cloud storage reality:
  - "Data We Collect" — email, workout data, body measurements, fitness scores, preferences
  - "Cloud Storage" — Supabase PostgreSQL database
  - "Data Security" — Row Level Security, SSL/TLS encryption
  - "Account Required" — email/password for cross-device sync
  - "Your Rights" — export data or permanently delete account
- Hero subtitle: "Your data is secure, encrypted, and always under your control."
- Last updated: June 2026

**Phase 6: Vercel Deployment**
- Created `vercel.json` — build command, output directory (`dist`), SPA rewrites for client-side routing
- `app.json` already had `"web": { "output": "static" }`
- Web export builds successfully (`npx expo export --platform web`) — 25 routes, ~2.6MB bundle
- Deployed to Vercel with auto-deploy on every GitHub push

**Supabase Project Details:**
- **Project URL:** `https://rrepsekxwiqlwuglyhbp.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXBzZWt4d2lxbHd1Z2x5aGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjkxODksImV4cCI6MjA5NDc0NTE4OX0.RRGFjSddu0w1reG-5Lp5argKq_sP3jm4C4JfDk_yyIM`
- **Tables created:** `profiles` (with RLS + trigger for auto-profile creation on signup)
- **Auth:** Email + Password (email confirmation disabled for easier onboarding)

---

### Previously Completed: Login / Signup Auth Flow (Phase 13)

**Auth Screen** (`app/auth.tsx`) — Premium Login/Signup inspired by the reference GIF:
- **Light top area** (`Colors.card`) with ASCENT branding — floating mountain/A logo (from `logo-mountain-a.svg`) with gentle entrance scale + fade + continuous float animation
- **Dark form card** rises up with smooth `borderTopRadius: 36` creating a seamless curved separation
- **Animated toggle pill** — fixed-width 280px container, spring-sliding pill with drop shadow, no drift bug
- **Login form**: Email, Password
- **Signup form**: Display Name, Email, Password, "How many workouts is your target per week?" (numeric input)
- **Form cross-fade**: opacity + translateY animation on Login ↔ Signup switch
- **Validation**: email format, password min 6 chars, display name min 2 chars, weekly target 1-21
- **Primary-colored submit button** with shadow, loading state support

**AuthContext** (`context/AuthContext.tsx`) — Supabase Auth state management:
- Uses `supabase.auth.signInWithPassword`, `signUp`, `signOut`
- Listens to `onAuthStateChange` for session updates
- `isAuthenticated` derived from `session !== null`
- Auto-login: Supabase sessions persist automatically via AsyncStorage (native) / localStorage (web)

**Root Layout Integration** (`app/_layout.tsx`):
- `AuthProvider` wraps the app inside `UserProvider`
- Splash screen **always plays first** regardless of auth state
- After splash completes:
  - Not authenticated → show `AuthScreen`
  - Authenticated → show main app Stack with `(tabs)`
- `StatusBar` renders globally on native only

**Settings Logout** (`app/settings.tsx`):
- "Logout" row added to Account section (red danger style)
- Confirmation popup: "You will be returned to the login screen. Your workout data is safely saved."
- Calls `logout()` from AuthContext on confirm

---

### Previously Completed: Avatar Image System (Phase 12)

**Avatar Images** (`constants/avatars.ts` + `assets/images/avatars/`):
- 10 custom PNG avatar images in `assets/images/avatars/` (avatar1.png … avatar10.png)
- `AVATARS` array maps `avatar1`…`avatar10` IDs to `require()` sources
- `OLD_EMOJI_AVATARS` list for migration of legacy emoji data

**ProfileHeader** (`components/ProfileHeader.tsx`):
- Avatar is now **tappable** — wraps in `TouchableOpacity` with `activeOpacity={activeOpacity.button}`
- Tap navigates directly to `/edit-profile` via `router.push('/edit-profile')`
- Renders `<Image source={avatarImage.source}>` when `user.avatar` matches an avatar ID
- Falls back to initials (A-Z) when `user.avatar` is empty or invalid
- Added `overflow: 'hidden'` to avatar circle for clean image clipping

**Edit Profile** (`app/edit-profile.tsx`):
- Replaced 10 emoji options with 10 image avatars in a grid
- Each cell shows a 48×48px circular avatar image instead of emoji text
- Keeps "A-Z" (initials) fallback option as the 11th choice (stores `''`)
- Selection visuals: primary-tinted background + 2px primary border + checkmark when selected

**UserContext Migration** (`context/UserContext.tsx`):
- `loadUser()` checks if `mergedUser.avatar` is in `OLD_EMOJI_AVATARS`
- If so, silently clears it to `''` so old emoji values fall back to initials

---

### Previously Completed: Liquid Tab Bar + Rank Icons + Home Redesign (Phase 11)

**Liquid Tab Bar** (`components/CurvedTabBar.tsx`) — Lukáš Straňák inspired bubble animation:
- **Static SVG bar body** with rounded top corners + border — no animated path morphing (crash-safe on Expo Go)
- **Rising white bubble** (48px diameter) above the active tab, same `Colors.card` background as bar for seamless merge
- **Spring slide** on adjacent tab switches (`withSpring`, damping 15, stiffness 150)
- **Cross-jump handling**: when jumping >1 tab apart (e.g., Home → Profile), bubble fades out → teleports → fades in. Prevents bubble from traversing the entire screen
- **Active icon pop**: scale 0.9 → 1.15 spring animation on every tab switch
- **Inactive icons** at 40% opacity, hidden (opacity 0) when their tab is active
- **Icon-only tabs**: no text labels. 5 equal tabs within flat bar area
- **Entrance animation**: slide up from 30px + fade in
- **Exports `TAB_BAR_TOTAL_HEIGHT`** (84px visual height) for screen bottom padding

**Rank Icon System** (`components/RankIcon.tsx`):
- 16 custom PNG rank icons in `assets/images/ranks/` (bronze1-3, silver1-3, gold1-3, platinum1-3, diamond1-3, immortal)
- Props: `rank`, `size`, `glow`, `glowColor`, `glowIntensity` (`subtle`/`medium`/`strong`), `gloss`, `animated`
- Glow effect: shadow-based halo around icon using `glowColor`
- Animated entrance: spring scale pop when `animated=true`
- Used in Home hero card, Rank Details screen, Profile header

**Home Screen Redesign** (`app/(tabs)/index.tsx`):
- **Premium Hero Rank Card**: Centered layout with soft glow orb (`rankColor + '10'`), icon ring (`rankColor + '12'` bg, `rankColor + '25'` border), 56px RankIcon with strong glow, rank name in rank color uppercase, large fitness score number, spring-animated progress bar with Huashu gloss layer
- **Score Breakdown Card** (replaced C/V/P/R pills): 4 horizontal mini progress bars (Consistency, Volume, Progression, Variety) with label/value row + tinted bar + gloss overlay. Much cleaner than the old single-letter pills
- **Quick Stats Row**: Workouts, Streak, Hours — 3 equal cards with icon boxes
- **Quick Actions**: Start Workout (primary) + View Profile (secondary outline)
- **Minimal header**: "Welcome back" + username + settings gear pill

**Streak Logic Rebuild** (`constants/ranks.ts`):
- `calculateWeeklyStreak(weeklyHistory, weeklyTarget)`: streak = consecutive weeks where `weeklyHistory.count >= weeklyTarget`
- Resets to 0 on miss. Recalculates on app launch and when target changes.

**Tab Bar Height & Screen Padding** (all 5 tab screens updated):
- Old hardcoded `TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 72` removed
- All screens now import `TAB_BAR_TOTAL_HEIGHT` from `CurvedTabBar` + use `useSafeAreaInsets()`
- Consistent bottom padding: `TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl`
- Applied to: `index.tsx`, `profile.tsx`, `workout.tsx`, `exercises.tsx`, `history.tsx`

---

### Previously Completed: Full UI Polish (Phase 1–6)

A comprehensive design-system overhaul applied across **all 25+ screens and components**:
- **Centralized design tokens** via `constants/design.ts` — spacing, radius, typography, shadows, animations, touch targets
- **Standardized visual patterns**: 28px page titles, 12px uppercase section labels, 16px card radius + subtle shadows, 44px min touch targets
- **Consistent icon system**: `IconSymbol` cross-platform component — native SF Symbols on iOS, MaterialIcons fallback on Android/web
- **All emoji/text structural icons replaced** with vector icons
- **TypeScript clean compile** verified after all changes

### Previously Completed: Exercise Detail Popup + Profile Widget Upgrades (Phase 7)

**Exercise Detail Popup** (`components/ExerciseDetailPopup.tsx`):
- Sheet-style floating card with backdrop fade + card slide-up spring animation
- **4 tabs**: About (demo video placeholder + step-by-step instructions), History (past logged dates/sets/weight/1RM), Charts (weight, 1RM, volume bar charts), Records (PR grid)
- Tap any exercise row in Exercises tab to open
- **Instructions database** (`constants/exerciseInstructions.ts`): 80+ built-in exercises with detailed steps + tips
- Entrance animation: `Animated.parallel` with spring (friction 5, tension 120) + timing fades

**Workouts Per Week Widget** (`components/WorkoutsPerWeekWidget.tsx`) — fully rebuilt:
- Each week is a distinct visual block with rounded background, 10px gap separation
- **Target line**: Dashed horizontal line in semi-transparent primary color with target-value badge pill
- **Visual states**: Below target = muted bar; On/Above target = primary color + bold count label
- **Animations**: Bars spring up from bottom (staggered 45ms per bar). Target line fades in after ~300ms
- **Trigger**: Animation only fires when Profile tab gains focus (`useFocusEffect`)

**Fitness Score Section** (`app/(tabs)/profile.tsx`):
- **4 Breakdown Bars**: Synchronized spring animation. Only triggers on Profile tab focus
- **Rank progress bar**: `Math.max(tierProgress * 100, 3)` minimum width + percentage label

### Previously Completed: Home Fitness Score Bar + Rank Details Redesign (Phase 9)

**Home Screen Fitness Score Bar**:
- `Math.max(tierProgress * 100, 3)` minimum width
- Spring animation + Huashu gloss layer

**Rank Details Screen** (`app/rank-details.tsx`):
- Hero Rank Card with glow orb, large score, animated progress bar
- 4 Pillar Cards with tinted icons, gloss progress bars
- All Tiers list with left accent bar for current tier

### Previously Completed: Premium Exercise Picker UI (Phase 10)

**Exercise Picker** (`components/ExercisePicker.tsx`):
- Spring entrance animation
- Premium search bar with focus border transition
- Premium filter chips with 1.5px primary border when active
- Huashu gloss layer on selected cards
- Vector checkmark + enhanced empty state

### Previously Completed: Premium Settings Redesign (Phase 8)

All **8 settings sub-pages** redesigned with premium UI:
- Tinted icon containers (`Colors.primary + '18'`)
- Bold labels + description subtitles
- Radio circles for single-select options
- Theme cards with 4 labeled color swatches
- Pages: `settings.tsx`, `notifications.tsx`, `advanced.tsx`, `theme.tsx`, `rest-timer-settings.tsx`, `edit-profile.tsx`, `body-measurements.tsx`, `goals.tsx`

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **React Native** | Build mobile apps using JavaScript/React |
| **Expo** | Toolkit that makes React Native easier (no Xcode/Android Studio needed) |
| **Expo Router** | File-based navigation. Create a file = create a screen |
| **TypeScript** | Adds type checking to catch mistakes early |
| **Supabase** | Cloud backend: Auth + PostgreSQL database + Realtime sync |
| **AsyncStorage** | Auth session storage adapter on native (Surabase uses it) |
| **React Context** | Shares user data + theme colors + auth state across all screens |
| **Safe Area Context** | Handles notches/Dynamic Island on all phones automatically |
| **expo-av** | Audio playback for rest timer alert sounds + splash screen video (native only) |
| **react-native-reanimated** | Animations (~4.1.1) |
| **react-native-svg** | SVG shapes for tab bar background + brand logo (15.12.1) |
| **expo-haptics** | Haptic feedback on tab presses (native only) |
| **Vercel** | Static web hosting for the web PWA build |

---

## File Structure

```
gym-tracker/
├── app/                          # Screens (Expo Router)
│   ├── (tabs)/                   # Tab navigation group (5 tabs)
│   │   ├── _layout.tsx           # Tab layout — uses custom CurvedTabBar
│   │   ├── index.tsx             # Home screen — Hero Rank Card + Breakdown + Quick Stats
│   │   ├── workout.tsx           # Workout screen — templates + Quick Start
│   │   ├── exercises.tsx         # Exercises screen — A-Z list, search, filters, sort
│   │   ├── history.tsx           # History screen — workout list + calendar modal
│   │   └── profile.tsx           # Profile screen — stats, widgets, rank progress
│   ├── _layout.tsx               # Root wrapper — UserProvider + AuthProvider + ThemeProvider + WorkoutProvider
│   ├── auth.tsx                  # Login/Signup screen — ASCENT branding + toggle + forms (Email/Password)
│   ├── rank-details.tsx          # Rank detail screen — 16 tiers, formula, breakdown
│   ├── settings.tsx              # Main Settings screen (includes Logout)
│   ├── notifications.tsx         # Notifications settings
│   ├── advanced.tsx              # Advanced settings
│   ├── theme.tsx                 # Theme selection screen
│   ├── rest-timer-settings.tsx   # Rest Timer settings
│   ├── edit-profile.tsx          # Edit Profile — avatar image picker + name + goal
│   ├── body-measurements.tsx     # Body Measurements
│   ├── goals.tsx                 # Goals screen
│   └── privacy-policy.tsx        # Privacy Policy (updated for Supabase/cloud)
├── components/
│   ├── CurvedTabBar.tsx          # Liquid bubble tab bar (Lukáš Straňák style)
│   ├── RankIcon.tsx              # Rank icon PNG renderer with glow/gloss/animated props
│   ├── ProfileHeader.tsx         # Avatar (tappable → Edit Profile), username, rank badge
│   ├── WorkoutsPerWeekWidget.tsx # Animated bar chart widget
│   ├── ExerciseDetailPopup.tsx   # Sheet-style exercise detail (4 tabs)
│   ├── WorkoutOverlay.tsx        # Draggable workout session overlay
│   ├── WorkoutCompleteAnimation.tsx # Celebration animation
│   ├── ExercisePicker.tsx        # Full-screen exercise selector
│   ├── ExerciseTracker.tsx       # Set tracking UI
│   ├── RestTimer.tsx             # Circular countdown
│   ├── CreateCustomExercise.tsx  # Create custom exercise form
│   ├── SettingsRow.tsx           # Reusable settings row
│   ├── ToggleRow.tsx             # Settings row with toggle
│   ├── AnimatedSplashScreen.tsx  # Video splash (native) / static branded (web)
│   └── ui/
│       ├── icon-symbol.tsx       # Android/web: MaterialIcons fallback
│       └── icon-symbol.ios.tsx   # iOS: native SF Symbols + fallback
├── context/
│   ├── UserContext.tsx           # User data — persists to Supabase profiles table
│   ├── AuthContext.tsx           # Auth state — Supabase Auth (email/password)
│   ├── WorkoutContext.tsx        # Workout overlay visibility
│   └── ThemeContext.tsx          # Dynamic theme colors
├── constants/
│   ├── design.ts                 # Design tokens (spacing, radius, typography, shadows, animations)
│   ├── theme.ts                  # 5 theme palettes
│   ├── ranks.ts                  # 16-tier rank system + Fitness Score + streak logic
│   ├── avatars.ts                # Avatar ID→image mapping + old emoji migration list
│   ├── exercises.ts              # 150+ gym exercises
│   ├── exerciseInstructions.ts   # 80+ exercise step-by-step guides
│   └── templates.ts              # Pre-made workout templates
├── lib/
│   ├── supabase.ts               # Supabase client (lazy singleton + mock for static build)
│   └── platform.ts               # Platform helpers (isWeb / isNative)
├── types/
│   └── user.ts                   # All TypeScript interfaces
├── utils/
│   └── sound.ts                  # Alert sound player (expo-av native, HTML5 Audio web)
├── assets/
│   ├── images/
│   │   ├── ranks/                # 16 rank icon PNGs
│   │   ├── avatars/              # 10 avatar PNGs (avatar1.png … avatar10.png)
│   │   ├── icon.png              # App icon
│   │   └── logo-mountain-a.svg   # ASCENT brand logo (mountain/A shape)
│   ├── sounds/
│   │   └── beep.wav
│   └── videos/
│       └── splash-screen.mp4     # Splash screen entrance video (native only)
├── .env.local                    # Supabase env vars (gitignored)
├── vercel.json                   # Vercel deployment config
└── package.json
```

---

## Design System (`constants/design.ts`)

```ts
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, '4xl': 40 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 };
export const typography = { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, '2xl': 24, '3xl': 28, '4xl': 32 };
export const activeOpacity = { card: 0.7, button: 0.8, row: 0.6 };
export const animation = { pressScale: 0.97, springFriction: 8, springTension: 40, microDuration: 150, standardDuration: 250 };
```

**Standardized patterns:**
- Page titles: `typography['3xl']` (28px) bold
- Section labels: `typography.sm` (13px), fontWeight 600, uppercase, letterSpacing 0.5
- Cards: `radius['2xl']` (24px), 1px border, shadow, `Colors.card` background
- Buttons: `radius.lg` (16px), min height 56px
- Icon containers: 36×36px, `radius.md` (12px), `Colors.primary + '12'` or `Colors.primary + '18'` background
- Huashu gloss layer: `rgba(255,255,255,0.15-0.18)` on top 50% of progress bars

---

## Data Model (`types/user.ts`)

```ts
interface User {
  username: string;
  avatar: string;                    // 'avatar1' … 'avatar10' or '' (initials fallback)
  theme: 'dark' | 'light' | 'sunset';
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: string;                      // "Bronze 1", "Gold 2", "Diamond 3", "Immortal"
  rankCredits: number;
  rankCreditsToNext: number;
  fitnessScore: number;              // 0-100
  fitnessBreakdown: {
    consistency: number;             // 40% weight
    volume: number;                  // 30% weight
    progression: number;             // 20% weight
    variety: number;                 // 10% weight
  };
  totalWorkouts: number;
  currentStreak: number;             // weeks (consecutive weeks meeting weeklyTarget)
  totalHours: number;
  weeklyTarget: number;
  monthlyVolumeGoal: number;
  weeklyHistory: WeeklyWorkout[];    // { weekStart: string, count: number }[]
  workoutHistory: WorkoutHistoryEntry[];
  myTemplates: WorkoutTemplate[];
  customExercises: Exercise[];
  hiddenExerciseIds: string[];
  personalGoal: string;
  bodyMeasurements: BodyMeasurements;
  notificationSettings: { unfinishedWorkoutAlert: boolean; unfinishedWorkoutDelayMinutes: number; };
  advancedSettings: { soundEffects: boolean; disableSleep: boolean; };
  restTimerSettings: { durationSeconds: number; soundEffect: string; mode: 'simple' | 'inline'; };
  templateFolders: TemplateFolder[];
}
```

`DEFAULT_USER` creates sample data. `createEmptyUser()` returns a fresh user with no history.

**Supabase `profiles` table columns:**
- Scalar fields: `username`, `avatar`, `theme`, `level`, `xp`, `xp_to_next_level`, `rank`, `rank_credits`, `rank_credits_to_next`, `total_workouts`, `current_streak`, `total_hours`, `weekly_target`, `monthly_volume_goal`, `personal_goal`, `fitness_score`
- JSONB fields: `fitness_breakdown`, `body_measurements`, `notification_settings`, `advanced_settings`, `rest_timer_settings`
- JSONB array fields: `workout_history`, `custom_exercises`, `templates`, `template_folders`, `weekly_history`
- Text array field: `hidden_exercise_ids`
- Timestamps: `created_at`, `updated_at`

---

## State Management

| Context | Purpose | Hook | Persistence |
|---------|---------|------|-------------|
| `UserContext` | All user data + settings | `useUser()` | Supabase `profiles` table |
| `AuthContext` | Login/signup/logout + session | `useAuth()` | Supabase Auth (AsyncStorage/localStorage adapter) |
| `WorkoutContext` | Workout overlay visibility | `useWorkout()` | None (runtime only) |
| `ThemeContext` | Current theme colors | `useTheme()` | Derived from `user.theme` |

**Usage:**
```tsx
const { user, updateUser, resetUser } = useUser();
const { isAuthenticated, login, signup, logout } = useAuth();
const Colors = useTheme();
```

---

## Auth Flow

```
App Launch
    ↓
AnimatedSplashScreen (video native / static branded web)
    ↓
AuthContext checks Supabase session via getSession()
    ↓
├─ No session → Show AuthScreen (Login tab)
└─ Session exists → Auto-login → Main App
```

**Signup:**
1. User enters display name, email, password, weekly target
2. `signup()` calls `supabase.auth.signUp()` with username metadata
3. Database trigger `handle_new_user` auto-creates profile row
4. `signup()` patches `weekly_target` in the profile
5. App navigates to main app

**Login:**
1. User enters email + password
2. `login()` calls `supabase.auth.signInWithPassword()`
3. On success, `onAuthStateChange` fires → `isAuthenticated = true`

**Logout:**
- Settings → Account → Logout → confirmation popup
- Calls `supabase.auth.signOut()` → session cleared → AuthScreen appears

---

## Theme System

**5 themes:**
- **Dark** (default) — charcoal `#0F0F0F`, neon green `#00FF88`, orange `#FF6B00`
- **Light** — light gray `#F2F2F7`, iOS green `#34C759`, dark text
- **Sunset** — deep navy `#1F1C2B`, coral peach `#FFA586`, rich reds

All screens use `useTheme()` instead of static colors. Theme change is immediate.

---

## Navigation (5 Tabs + Stack Screens + Auth)

| Screen | Path | How to Reach |
|--------|------|--------------|
| Home | `/(tabs)/` | Bottom tab — Hero Rank Card + Breakdown + Quick Stats |
| Workout | `/(tabs)/workout` | Bottom tab — templates + Quick Start |
| Exercises | `/(tabs)/exercises` | Bottom tab — exercise library |
| History | `/(tabs)/history` | Bottom tab — past workouts + calendar |
| Profile | `/(tabs)/profile` | Bottom tab — stats + rank + widgets |
| Auth (Login/Signup) | `/auth` | Shown after splash if not authenticated |
| Rank Details | `/rank-details` | Home hero card tap or Profile rank tap |
| Settings | `/settings` | Profile → gear icon |
| Notifications | `/notifications` | Settings → Notifications |
| Advanced | `/advanced` | Settings → Advanced Settings |
| Theme | `/theme` | Settings → App Theme |
| Rest Timer | `/rest-timer-settings` | Settings → Rest Timer Settings |
| Edit Profile | `/edit-profile` | Settings → Edit Profile OR tap Profile avatar |
| Body Measurements | `/body-measurements` | Settings → Body Measurements |
| Goals | `/goals` | Settings → Goals |

---

## The 16-Tier Rank System (`constants/ranks.ts`)

### Tiers & Thresholds

| Tier | Score Required |
|------|---------------|
| Bronze 1 | 0 |
| Bronze 2 | 5 |
| Bronze 3 | 10 |
| Silver 1 | 16 |
| Silver 2 | 23 |
| Silver 3 | 31 |
| Gold 1 | 40 |
| Gold 2 | 50 |
| Gold 3 | 61 |
| Platinum 1 | 72 |
| Platinum 2 | 82 |
| Platinum 3 | 91 |
| Diamond 1 | 96 |
| Diamond 2 | 98 |
| Diamond 3 | 99 |
| Immortal | 100 |

### Fitness Score Formula
```
Fitness Score = (Consistency × 0.40) + (Volume × 0.30) + (Progression × 0.20) + (Variety × 0.10)
```

**Streak calculation (`calculateWeeklyStreak`):**
- Streak = consecutive weeks where `weeklyHistory.count >= weeklyTarget`
- Resets to 0 on first miss
- Recalculates on app launch and when target changes

### Key Behaviors
- Rank can go **UP and DOWN** — penalties from missed workouts drop Consistency
- Workout finish recalculates full Fitness Score from fresh history
- `WorkoutCompleteAnimation` shows score breakdown + rank change banner

---

## Active Workout Flow

1. Tap "Start Empty Workout" or a template → `openWorkout()`
2. `WorkoutOverlay` expands with full-screen session UI
3. Add exercises → track sets (kg × reps) → mark complete → rest timer auto-starts
4. Swipe left on any set to delete
5. Tap "Finish Workout" → calculates best sets, detects PRs, creates history entry, updates streak/score/rank, shows completion animation

---

## Current Features (Fully Working)

✅ **Supabase Cloud Backend** — Auth, profiles table, JSONB data storage, RLS policies, multi-device sync

✅ **Dual Platform** — iOS/Android native app + Web PWA from same codebase

✅ **Vercel Deployment** — Static web export with auto-deploy on GitHub push

✅ **Login/Signup Auth Flow** — Supabase Auth with email/password. Splash screen always plays first.

✅ **Liquid Bubble Tab Bar** — Lukáš Straňák inspired: rising white bubble above active tab, spring slide for adjacent tabs, fade-teleport-fade for cross-jumps, icon-only, haptic feedback on native

✅ **16-Tier Rank System** — Bronze 1-3 → Silver 1-3 → Gold 1-3 → Platinum 1-3 → Diamond 1-3 → Immortal. Fitness Score from 4 pillars. Rank-up and demotion supported.

✅ **16 Custom Rank Icons** — PNG assets in `assets/images/ranks/` with glow/gloss/animated effects via `RankIcon` component

✅ **10 Custom Avatar Images** — PNG assets in `assets/images/avatars/` (avatar1-10), selectable in Edit Profile, tappable on Profile header

✅ **Premium Home Screen** — Hero Rank Card with glow orb, icon ring, 56px RankIcon, spring-animated progress bar with gloss. Score Breakdown Card with 4 tinted mini progress bars. Quick Stats + Quick Actions.

✅ **Workout Session** — Draggable overlay, exercise tracking, add/remove exercises & sets, live timer, configurable rest timer, finish celebration

✅ **PR Detection** — Compares every exercise's best set against all previous workouts

✅ **Workout History** — Complete history with FlatList. Calendar modal with 2-year range.

✅ **Exercises Library** — 150+ built-in exercises. Search, filters, sort. Custom exercise creation.

✅ **Theme System** — 3 themes (dark, light, sunset) with immediate app-wide application

✅ **Settings Suite** — 8 settings screens with persistence, all with premium UI, includes Logout

✅ **Rest Timer** — Configurable duration, 7 alert sounds, Simple/Inline modes

✅ **Data Persistence** — All user data stored in Supabase cloud. Auth sessions persist via AsyncStorage (native) / localStorage (web).

✅ **Full UI Polish** — Design tokens, consistent spacing/radius/typography, shadows, touch targets, vector icons, Huashu gloss layers

✅ **Exercise Detail Popup** — 4 tabs (About/History/Charts/Records), 80+ instruction guides, spring-animated sheet

✅ **Workouts Per Week Widget** — Animated bar chart with target line, spring entrance on Profile focus

---

## How to Run

**Native (iOS/Android):**
```bash
cd gym-tracker
npx expo start
```
Scan the QR code with **Expo Go**.

**Web (local):**
```bash
cd gym-tracker
npx expo start --web
```

**Build for deployment:**
```bash
cd gym-tracker
npx expo export --platform web
```
Output goes to `dist/` — ready for Vercel.

---

## Deployment

**GitHub:** Code hosted at user's repository. Push to `master` branch triggers Vercel deploy.

**Vercel:** Connected to GitHub repo. Auto-deploys on every push.
- Build Command: `npx expo export --platform web`
- Output Directory: `dist`
- SPA Rewrites: All routes → `index.html` (handled by `vercel.json`)

**Environment Variables (set in Vercel dashboard):**
```
EXPO_PUBLIC_SUPABASE_URL=https://rrepsekxwiqlwuglyhbp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXBzZWt4d2lxbHd1Z2x5aGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjkxODksImV4cCI6MjA5NDc0NTE4OX0.RRGFjSddu0w1reG-5Lp5argKq_sP3jm4C4JfDk_yyIM
```

---

## What's Next (Future Phases)

🔄 **Template CRUD** — Add/edit/delete custom templates, start workout from template

🔄 **More Profile Widgets** — Calories, Best Sets / 1RM tracking, Exercise volume chart, Personal Records widget

🔄 **Body Measurements Tracking** — Save history over time, show progress graphs

🔄 **Goals Progress Tracking** — Weekly target completion %, monthly volume progress bar

🔄 **Export Workout Data** — Generate and share workout logs

🔄 **Social Features** — Leaderboards, friend comparisons

🔄 **Exercise Demo Videos** — Replace placeholder in Exercise Detail Popup

🔄 **Advanced Exercise Charts** — Time-series line charts with date ranges

🔄 **Password Recovery** — Supabase email reset flow

🔄 **OAuth Login** — Google, Apple sign-in via Supabase Auth

🔄 **Biometric Login** — Face ID / Touch ID support for returning users

🔄 **Offline Support** — Local queue for Supabase operations when offline

---

## Important Notes for Next Chat

1. **Platform:** iPhone, Android (Expo Go), and Web (PWA via Vercel)
2. **Data storage:** Supabase cloud (PostgreSQL). Local AsyncStorage is ONLY used as Supabase auth session adapter.
3. **Navigation:** File-based with Expo Router. Files in `app/` = screens.
4. **State management:**
   - User data: `UserContext` (`useUser()` hook) → Supabase `profiles` table
   - Auth state: `AuthContext` (`useAuth()` hook) → Supabase Auth
   - Workout overlay: `WorkoutContext` (`useWorkout()` hook)
   - Theme colors: `ThemeContext` (`useTheme()` hook)
5. **Colors:** Always use `useTheme()` in NEW components — NEVER import static `Colors`
6. **User data shape:** Defined in `@/types/user.ts` — add new fields there FIRST, then `DEFAULT_USER`
7. **Supabase client:** `lib/supabase.ts` — lazy singleton. Returns mock client during static export (no env vars), real client at runtime.
8. **Workout overlay:** Rendered at ROOT in `app/_layout.tsx`. `pointerEvents="box-none"` when minimized.
9. **Rest timer:** Uses ref-based interval to avoid re-renders during drag gestures
10. **Sound:** `utils/sound.ts` — `expo-av` on native, HTML5 Audio on web
11. **Settings pattern:** Back button, section titles, cards, Save button when changed
12. **Rank system:** `constants/ranks.ts` has all logic. `getTierForScore()` returns sub-tier. `getTierColor()` returns main tier color. `calculateFitnessScore()` computes 4 pillars. `calculateWeeklyStreak()` computes streak.
13. **Custom exercises:** `user.customExercises` stores user-created exercises.
14. **Hidden exercises:** `user.hiddenExerciseIds` for hiding default exercises.
15. **Workout history:** `user.workoutHistory` has full detail for PR detection, rank calculations, calendar, history display.
16. **Icon system:** `IconSymbol` component handles cross-platform icons. iOS uses SF Symbols, falls back to MaterialIcons. Android uses MaterialIcons mappings.
17. **Design tokens:** Import from `@/constants/design` — spacing, radius, typography, shadow, animation, activeOpacity. Use them instead of hardcoded values.
18. **Tab bar (`components/CurvedTabBar.tsx`):**
   - Liquid bubble style, icon-only, 5 equal tabs
   - **Export:** `TAB_BAR_TOTAL_HEIGHT = 84` (visual height above safe area)
   - All ScrollView/FlatList/SectionList bottom padding must use: `TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl`
   - Import `TAB_BAR_TOTAL_HEIGHT` from `@/components/CurvedTabBar` and `useSafeAreaInsets` from `react-native-safe-area-context`
   - Tab bar is `position: 'absolute'` at bottom
19. **Rank icons:** `RankIcon` component in `@/components/RankIcon`. 16 PNGs in `assets/images/ranks/`. Use glow + animated for premium feel.
20. **Avatars:** `constants/avatars.ts` exports `AVATARS` array (id + source) and `OLD_EMOJI_AVATARS` for migration. 10 PNGs in `assets/images/avatars/`.
21. **Profile tab animation trigger:** Widgets on Profile use `useFocusEffect` from `@react-navigation/native` to animate ONLY when Profile tab is tapped.
22. **Overlay layering rule:** Popups render after ScrollView with `StyleSheet.absoluteFill` + high `zIndex`.
23. **Animation performance:** Prefer `useNativeDriver: true`. For width-based progress bars, `useNativeDriver: false` is acceptable.
24. **TypeScript:** Run `npx tsc --noEmit` after changes to verify clean compile.
25. **Root Stack headers are hidden globally** — `app/_layout.tsx` sets `screenOptions={{ headerShown: false }}`. Every screen has its own custom back button.
26. **Huashu gloss layer pattern:** `rgba(255,255,255,0.15-0.18)` on top 50% of filled bars — used on Home progress bar, Rank Details progress bars, Breakdown Card bars.
27. **Premium card patterns:** Tinted border (`rankColor + '30'`), glow orb (`rankColor + '10'`), icon ring (`rankColor + '12'` bg + `rankColor + '25'` border).
28. **Active opacity:** Use `activeOpacity` from design tokens — `activeOpacity.card` (0.7) for cards, `activeOpacity.button` (0.8) for buttons.
29. **Auth screen patterns:** Brand logo uses `logo-mountain-a.svg` (inline SVG via `react-native-svg`). Form card uses `borderTopRadius: 36` for curved separation. Toggle uses fixed 280px width with precise pill math (PILL_W = 132px, translateX 4→144px).
30. **Web compatibility:** Always wrap native-only APIs (`expo-haptics`, `expo-status-bar`, `expo-av`) in `Platform.OS !== 'web'` checks. Use `lib/platform.ts` helpers.
31. **SSR safety:** During static export, `typeof window === 'undefined'`. The Supabase client returns mock data. Contexts skip Supabase calls.
32. **Vercel deploy:** Push to GitHub → Vercel auto-deploys. Env vars must be set in Vercel dashboard (not committed).
