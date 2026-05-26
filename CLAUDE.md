# ASCENT — Gym Tracker

Gamified gym tracker for iOS, Android, and Web (PWA). React Native + Expo 54, TypeScript, Expo Router, Supabase backend, deployed to Netlify. Full feature history in `PROJECT_SUMMARY.md`.

## Commands

```bash
npx expo start              # native (Expo Go)
npx expo start --web        # web dev
npx expo export --platform web  # build for Netlify → dist/
npx tsc --noEmit            # type check (run after changes)
```

## Critical Rules

- **Colors:** always `const Colors = useTheme()` — never import static Colors
- **Typography:** always `<AppText weight="bold|semibold|medium|regular">` — never use RN `<Text>` or `fontWeight` in StyleSheet
- **Cards:** always `<NeonCard>` — never `<GlassCard>` or raw `View` for card surfaces
- **Icons:** use `<IconSymbol name="sf-symbol-name">` (maps to MaterialIcons) for nav/UI icons; only use `MaterialIcons` directly for icons not in the mapping
- **User data:** `useUser()` → `updateUser()` writes to Supabase; add new fields to `types/user.ts` + `DEFAULT_USER` first
- **Auth:** `useAuth()` — `login()`/`signup()` return `{ success, error? }`, always check result
- **Tab bar padding:** `TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl` (import from `@/components/CurvedTabBar`)
- **Tab screen background:** `Platform.OS === 'web' ? Colors.background : 'transparent'`
- **Platform guards:** wrap `expo-haptics`, `expo-status-bar`, `expo-av` in `Platform.OS !== 'web'`
- **Design tokens:** import from `@/constants/design` (spacing, radius, typography, activeOpacity, animation) — no hardcoded values
- **Headers:** all hidden globally; every screen needs its own back button
- **Popups:** render after ScrollView with `StyleSheet.absoluteFill` + high `zIndex`

## Key Files

| Path | Purpose |
|------|---------|
| `app/_layout.tsx` | Root — UserProvider + AuthProvider + ThemeProvider + WorkoutProvider |
| `context/ThemeContext.tsx` | `useTheme()` → Colors |
| `context/UserContext.tsx` | `useUser()` → Supabase profiles |
| `context/AuthContext.tsx` | `useAuth()` → Supabase Auth |
| `lib/supabase.ts` | Lazy singleton client + `isMockClient()` |
| `lib/platform.ts` | `isWeb` / `isNative` helpers |
| `types/user.ts` | All TypeScript interfaces |
| `constants/design.ts` | Design tokens + `fontFamily` map for Space Grotesk |
| `constants/ranks.ts` | 16-tier rank system + fitness score + streak logic |
| `components/CurvedTabBar.tsx` | Exports `TAB_BAR_TOTAL_HEIGHT = 84` |
| `components/ui/AppText.tsx` | Typography wrapper — always use instead of `<Text>` |
| `components/NeonCard.tsx` | Card component — cyan/purple neon border, optional `glowColor` |
| `components/ui/icon-symbol.tsx` | SF Symbol → MaterialIcons mapping; add new icons here |

## Deployment

Netlify auto-deploys on push to `master`. Env vars (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) live in `.env.local` locally and in the Netlify dashboard — never commit them.
