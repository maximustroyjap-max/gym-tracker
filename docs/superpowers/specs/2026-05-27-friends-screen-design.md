# Friends Screen — Design Spec
**Date:** 2026-05-27  
**Status:** Approved

## Overview

Add a Friends social feature to ASCENT as a new 6th tab. Phase 1 ships the friends list and add-friend flow. Phase 2 (future) adds a leaderboard. The Supabase schema is designed now to support both phases.

## Navigation

- New tab added to `app/(tabs)/_layout.tsx` — label: **Friends**, icon: `person.2.fill` (SF Symbol)
- Sits as the 6th tab alongside Home, Workout, Exercises, History, Profile
- Tab screen file: `app/(tabs)/social.tsx`

## Phase 1: Friends List

### Main Screen (`app/(tabs)/social.tsx`)

**Header row:**
- Title: "Friends" (typography `3xl`, bold)
- Top-right: `+` icon button (36×36px, `radius.md`, `Colors.primary+'18'` background) — opens the Add Friend modal

**Pending requests banner (conditional):**
- Shows only when the user has incoming friend requests
- Purple accent (`Colors.secondary`) — "N pending request(s)" with a "View →" tap to expand inline or navigate to a requests section
- Accept / Decline actions per request

**Friends list:**
- Each friend rendered via `FriendCard` component
- Sorted by fitness score descending (highest first)
- Empty state when no friends yet: prompt to add friends and share code

**Leaderboard section (Phase 1 placeholder):**
- Dashed-border card at the bottom of the screen
- Label: "LEADERBOARD" (small caps)
- Body: "Coming soon — compete with friends for the top spot"
- No interaction

### FriendCard Component (`components/FriendCard.tsx`)

Displays per friend:
- **Avatar** — uses existing avatar system (`avatars.ts`); falls back to initials circle
- **Username** — `AppText` weight semibold
- **Streak** — 🔥 + `currentStreak` + "day streak"
- **Rank icon** — `RankIcon` component (existing), small size (~36px)
- **Fitness score** — cyan (`Colors.primary`) number + "pts" label

Uses `NeonCard` as the card surface per project rules.

### Add Friend Modal (`app/add-friend.tsx`)

Presented as a bottom-sheet modal (slides up). Contains:

**Your friend code section:**
- Displays logged-in user's `friendCode` as `Username · XXXXXX`
- "Copy" button copies the code to clipboard

**Smart search input:**
- Placeholder: "Search by username or friend code"
- Debounced (300ms) — fires Supabase query on each keystroke after debounce
- **Username mode** (default): partial match on `username` column, returns up to 10 results
- **Friend code mode**: activates automatically when input is exactly 6 alphanumeric characters — switches to exact match on `friend_code` column, returns 0 or 1 result, shows "Friend code detected" hint below input
- Results excluded: the current user, existing friends, already-sent pending requests

**Search result row:**
- Avatar, username, friend code (`· XXXXXX`), mini rank icon, "Add" button
- Tapping "Add" inserts a `friendships` row with `status = 'pending'`, button immediately changes to "Sent" (disabled)

## Data Model

### `profiles` table — new column

```sql
ALTER TABLE profiles ADD COLUMN friend_code TEXT UNIQUE;
```

- Generated at signup as a random 6-character alphanumeric string (e.g. `B4NX12`)
- Generation logic: `Math.random().toString(36).slice(2, 8).toUpperCase()`
- Retry on collision (extremely rare)
- Existing users: generated and backfilled on first app launch if `friend_code` is null

### `friendships` table — new table

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);
```

Row-level security: users can only read rows where they are `requester_id` or `addressee_id`.

## Hook: `useFriends` (`hooks/useFriends.ts`)

Fetches from Supabase on mount:
- **Accepted friends**: query `friendships` where `status = 'accepted'` and current user is requester or addressee — join `profiles` to get friend data
- **Incoming pending requests**: query `friendships` where `addressee_id = currentUser.id` and `status = 'pending'`

Exposes:
```ts
{
  friends: FriendProfile[];        // accepted friends, sorted by fitnessScore desc
  pendingRequests: FriendProfile[]; // incoming requests
  isLoading: boolean;
  sendRequest: (addresseeId: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  declineRequest: (friendshipId: string) => Promise<void>;
}
```

`FriendProfile`:
```ts
{
  id: string;
  username: string;
  avatar: string;
  friendCode: string;
  rank: string;
  fitnessScore: number;
  currentStreak: number;
}
```

## TypeScript Changes

**`types/user.ts`:**
- Add `friendCode: string` to the `User` interface
- Add `friendCode: ''` to `DEFAULT_USER`

**`context/UserContext.tsx`:**
- Read `friend_code` from Supabase profile row and map to `user.friendCode`
- On first load: if `friend_code` is null, generate one and write it back to Supabase

## RLS Policy

```sql
-- Users can see friendships they are part of
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can insert a friendship request
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update status of requests sent to them
CREATE POLICY "Users can accept or decline requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id);
```

## Phase 2 (Future — not in scope now)

- Leaderboard section: ranked list of accepted friends by `fitness_score` descending
- Shows position (#1, #2, …), rank icon, username, score
- Replaces the "Coming Soon" placeholder with no schema changes needed

## Design Rules

All standard ASCENT rules apply:
- Colors via `useTheme()` — never static imports
- Typography via `<AppText>` — never raw `<Text>`
- Card surfaces via `<NeonCard>`
- Spacing/radius from `constants/design.ts`
- Bottom padding: `TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl`
- Tab screen background: `Platform.OS === 'web' ? Colors.background : 'transparent'`
