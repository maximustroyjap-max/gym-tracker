# Friends Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Friends tab (6th tab) to ASCENT where users can add friends by username or friend code, see their rank icon, fitness score, and streak, with a Coming Soon leaderboard placeholder.

**Architecture:** A new `friendships` Supabase table stores friend requests/connections. A `friend_code` column is added to `profiles` for easy lookup. A `useFriends` hook handles all Supabase queries. The Friends tab screen (`social.tsx`) uses `FriendCard` components and navigates to an `add-friend` modal.

**Tech Stack:** React Native, Expo Router, Supabase (PostgreSQL + RLS), TypeScript, `react-native-safe-area-context`

---

### Task 1: Supabase Schema

**Files:**
- No app files — run SQL directly in the Supabase dashboard SQL editor

- [ ] **Step 1: Open Supabase SQL editor**

  Go to your project in supabase.com → SQL Editor → New query.

- [ ] **Step 2: Run the schema migration**

  Paste and run the following SQL:

  ```sql
  -- Add friend_code column to profiles
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS friend_code TEXT UNIQUE;

  -- Create friendships table
  CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (requester_id, addressee_id)
  );

  -- Enable RLS on friendships
  ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

  -- Users can see friendships they are part of
  CREATE POLICY "Users can view own friendships"
    ON friendships FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

  -- Users can send friend requests (insert where they are the requester)
  CREATE POLICY "Users can send friend requests"
    ON friendships FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

  -- Users can accept or decline requests addressed to them
  CREATE POLICY "Users can respond to friend requests"
    ON friendships FOR UPDATE
    USING (auth.uid() = addressee_id);

  -- Users can delete (decline/remove) friendships they are part of
  CREATE POLICY "Users can remove friendships"
    ON friendships FOR DELETE
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  ```

- [ ] **Step 3: Verify**

  Run `SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'friend_code';` — expect 1 row.
  Run `SELECT tablename FROM pg_tables WHERE tablename = 'friendships';` — expect 1 row.

---

### Task 2: Add `person.2.fill` Icon Mapping

**Files:**
- Modify: `components/ui/icon-symbol.tsx`

- [ ] **Step 1: Add the icon mapping**

  In `components/ui/icon-symbol.tsx`, add one entry to the `MAPPING` object after `'person.fill'`:

  ```ts
  'person.fill': 'person',
  'person.2.fill': 'group',
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add components/ui/icon-symbol.tsx
  git commit -m "feat: add person.2.fill icon mapping for Friends tab"
  ```

---

### Task 3: Add `friendCode` to User Types

**Files:**
- Modify: `types/user.ts`

- [ ] **Step 1: Add `friendCode` to the `User` interface**

  In `types/user.ts`, inside the `User` interface, add after `avatar: string;`:

  ```ts
  avatar: string;
  friendCode: string;
  ```

- [ ] **Step 2: Add `friendCode` to `createEmptyUser()`**

  In the `createEmptyUser()` function return object, add after `avatar: '',`:

  ```ts
  avatar: '',
  friendCode: '',
  ```

- [ ] **Step 3: Add `friendCode` to `DEFAULT_USER`**

  In the `DEFAULT_USER` constant, add after `avatar: '',`:

  ```ts
  avatar: '',
  friendCode: '',
  ```

- [ ] **Step 4: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add types/user.ts
  git commit -m "feat: add friendCode field to User type"
  ```

---

### Task 4: Update UserContext to Read and Generate Friend Codes

**Files:**
- Modify: `context/UserContext.tsx`

- [ ] **Step 1: Add a `generateFriendCode` helper function**

  In `context/UserContext.tsx`, add this function directly above the `UserProvider` function:

  ```ts
  function generateFriendCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  ```

- [ ] **Step 2: Add `friendCode` to `FIELD_MAP`**

  In the `FIELD_MAP` object, add:

  ```ts
  friendCode: 'friend_code',
  ```

- [ ] **Step 3: Update `profileToUser` to read `friend_code`**

  In `profileToUser`, add after `avatar: profile.avatar ?? '',`:

  ```ts
  avatar: profile.avatar ?? '',
  friendCode: profile.friend_code ?? '',
  ```

- [ ] **Step 4: Update `loadUser` to generate and backfill a missing friend code**

  In the `loadUser` function, find the block that sets `mergedUser` (after `let mergedUser = profileToUser(profile);`). Add the following code right after the existing streak/fitness recalculation block (after `setUser(mergedUser)`):

  ```ts
  // Generate friend_code for users who don't have one yet
  if (!profile.friend_code) {
    const code = generateFriendCode();
    await supabase.from('profiles').update({ friend_code: code }).eq('id', userId);
    mergedUser = { ...mergedUser, friendCode: code };
  }

  setUser(mergedUser);
  ```

  > Important: replace the existing bare `setUser(mergedUser);` call (the one after the fitness recalculation block) with the above block so `setUser` is only called once. The existing code calls `setUser(mergedUser)` at line ~189 — replace that single line with the block above.

- [ ] **Step 5: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 6: Commit**

  ```bash
  git add context/UserContext.tsx
  git commit -m "feat: read and auto-generate friend_code in UserContext"
  ```

---

### Task 5: Create `useFriends` Hook

**Files:**
- Create: `hooks/useFriends.ts`

- [ ] **Step 1: Create the file**

  Create `hooks/useFriends.ts` with the following content:

  ```ts
  import { useState, useCallback } from 'react';
  import { supabase } from '@/lib/supabase';

  export interface FriendProfile {
    id: string;
    username: string;
    avatar: string;
    friendCode: string;
    rank: string;
    fitnessScore: number;
    currentStreak: number;
  }

  export interface PendingRequest {
    friendshipId: string;
    from: FriendProfile;
  }

  const PROFILE_COLUMNS = 'id, username, avatar, friend_code, rank, fitness_score, current_streak';

  function rowToFriendProfile(p: Record<string, any>): FriendProfile {
    return {
      id: p.id,
      username: p.username ?? 'Unknown',
      avatar: p.avatar ?? '',
      friendCode: p.friend_code ?? '',
      rank: p.rank ?? 'Bronze 1',
      fitnessScore: p.fitness_score ?? 0,
      currentStreak: p.current_streak ?? 0,
    };
  }

  export function useFriends() {
    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadFriends = useCallback(async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = session.user.id;

        // All accepted friendships involving the current user
        const { data: friendships } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
          .eq('status', 'accepted');

        const friendIds = (friendships ?? []).map((f) =>
          f.requester_id === userId ? f.addressee_id : f.requester_id
        );

        let acceptedFriends: FriendProfile[] = [];
        if (friendIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .in('id', friendIds);
          acceptedFriends = (profiles ?? [])
            .map(rowToFriendProfile)
            .sort((a, b) => b.fitnessScore - a.fitnessScore);
        }

        // Incoming pending requests
        const { data: incoming } = await supabase
          .from('friendships')
          .select('id, requester_id')
          .eq('addressee_id', userId)
          .eq('status', 'pending');

        let requests: PendingRequest[] = [];
        if ((incoming ?? []).length > 0) {
          const requesterIds = (incoming ?? []).map((r) => r.requester_id);
          const { data: requestProfiles } = await supabase
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .in('id', requesterIds);

          requests = (incoming ?? []).map((r) => ({
            friendshipId: r.id,
            from: rowToFriendProfile(
              (requestProfiles ?? []).find((p) => p.id === r.requester_id) ?? {}
            ),
          }));
        }

        setFriends(acceptedFriends);
        setPendingRequests(requests);
      } finally {
        setIsLoading(false);
      }
    }, []);

    const sendRequest = useCallback(async (addresseeId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from('friendships').insert({
        requester_id: session.user.id,
        addressee_id: addresseeId,
        status: 'pending',
      });
    }, []);

    const acceptRequest = useCallback(
      async (friendshipId: string) => {
        await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', friendshipId);
        await loadFriends();
      },
      [loadFriends]
    );

    const declineRequest = useCallback(
      async (friendshipId: string) => {
        await supabase.from('friendships').delete().eq('id', friendshipId);
        await loadFriends();
      },
      [loadFriends]
    );

    return {
      friends,
      pendingRequests,
      isLoading,
      loadFriends,
      sendRequest,
      acceptRequest,
      declineRequest,
    };
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add hooks/useFriends.ts
  git commit -m "feat: add useFriends hook for Supabase friend data"
  ```

---

### Task 6: Create `FriendCard` Component

**Files:**
- Create: `components/FriendCard.tsx`

- [ ] **Step 1: Create the file**

  Create `components/FriendCard.tsx`:

  ```tsx
  import React from 'react';
  import { View, StyleSheet } from 'react-native';
  import { useTheme } from '@/context/ThemeContext';
  import { AppText } from '@/components/ui/AppText';
  import { NeonCard } from '@/components/NeonCard';
  import { RankIcon } from '@/components/RankIcon';
  import { spacing, typography } from '@/constants/design';
  import { type FriendProfile } from '@/hooks/useFriends';

  interface FriendCardProps {
    friend: FriendProfile;
  }

  export function FriendCard({ friend }: FriendCardProps) {
    const Colors = useTheme();

    return (
      <NeonCard style={styles.card}>
        <View style={styles.row}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: Colors.primary + '18',
                borderColor: Colors.primary + '40',
              },
            ]}
          >
            <AppText weight="bold" style={[styles.avatarLetter, { color: Colors.primary }]}>
              {friend.username.charAt(0).toUpperCase()}
            </AppText>
          </View>

          <View style={styles.info}>
            <AppText weight="semibold" style={[styles.username, { color: Colors.text }]}>
              {friend.username}
            </AppText>
            <AppText weight="regular" style={[styles.streak, { color: Colors.textSecondary }]}>
              🔥 {friend.currentStreak} day streak
            </AppText>
          </View>

          <View style={styles.rankArea}>
            <RankIcon rank={friend.rank} size={36} />
            <View style={styles.scoreRow}>
              <AppText weight="bold" style={[styles.score, { color: Colors.primary }]}>
                {friend.fitnessScore}
              </AppText>
              <AppText weight="regular" style={[styles.pts, { color: Colors.textSecondary }]}>
                {' '}pts
              </AppText>
            </View>
          </View>
        </View>
      </NeonCard>
    );
  }

  const styles = StyleSheet.create({
    card: {
      marginBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLetter: {
      fontSize: typography.lg,
    },
    info: {
      flex: 1,
    },
    username: {
      fontSize: typography.base,
    },
    streak: {
      fontSize: typography.sm,
      marginTop: 2,
    },
    rankArea: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    score: {
      fontSize: typography.sm,
    },
    pts: {
      fontSize: typography.xs,
    },
  });
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add components/FriendCard.tsx
  git commit -m "feat: add FriendCard component"
  ```

---

### Task 7: Create Add Friend Modal Screen

**Files:**
- Create: `app/add-friend.tsx`

- [ ] **Step 1: Create the file**

  Create `app/add-friend.tsx`:

  ```tsx
  import React, { useState, useCallback, useRef } from 'react';
  import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Share,
    Platform,
  } from 'react-native';
  import { useSafeAreaInsets } from 'react-native-safe-area-context';
  import { useRouter } from 'expo-router';
  import { supabase } from '@/lib/supabase';
  import { useTheme } from '@/context/ThemeContext';
  import { useUser } from '@/context/UserContext';
  import { AppText } from '@/components/ui/AppText';
  import { NeonCard } from '@/components/NeonCard';
  import { RankIcon } from '@/components/RankIcon';
  import { spacing, radius, typography } from '@/constants/design';
  import { type FriendProfile } from '@/hooks/useFriends';

  const FRIEND_CODE_REGEX = /^[A-Z0-9]{6}$/;
  const DEBOUNCE_MS = 300;
  const PROFILE_COLUMNS = 'id, username, avatar, friend_code, rank, fitness_score, current_streak';

  function rowToFriendProfile(p: Record<string, any>): FriendProfile {
    return {
      id: p.id,
      username: p.username ?? 'Unknown',
      avatar: p.avatar ?? '',
      friendCode: p.friend_code ?? '',
      rank: p.rank ?? 'Bronze 1',
      fitnessScore: p.fitness_score ?? 0,
      currentStreak: p.current_streak ?? 0,
    };
  }

  export default function AddFriendScreen() {
    const Colors = useTheme();
    const { user } = useUser();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FriendProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sentIds, setSentIds] = useState<Set<string>>(new Set());
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isFriendCode = FRIEND_CODE_REGEX.test(query.toUpperCase());

    const search = useCallback(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const upper = q.toUpperCase();
        let data: Record<string, any>[] | null = null;

        if (FRIEND_CODE_REGEX.test(upper)) {
          const { data: rows } = await supabase
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .eq('friend_code', upper)
            .neq('id', session.user.id)
            .limit(1);
          data = rows;
        } else {
          const { data: rows } = await supabase
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .ilike('username', `${q}%`)
            .neq('id', session.user.id)
            .limit(10);
          data = rows;
        }

        setResults((data ?? []).map(rowToFriendProfile));
      } finally {
        setIsSearching(false);
      }
    }, []);

    const handleQueryChange = (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(text), DEBOUNCE_MS);
    };

    const handleAdd = async (addresseeId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from('friendships').insert({
        requester_id: session.user.id,
        addressee_id: addresseeId,
        status: 'pending',
      });
      setSentIds((prev) => new Set(prev).add(addresseeId));
    };

    const handleShareCode = async () => {
      if (!user.friendCode) return;
      await Share.share({
        message: `Add me on ASCENT! My friend code is ${user.friendCode}`,
      });
    };

    return (
      <View style={[styles.container, { backgroundColor: Colors.background, paddingBottom: insets.bottom }]}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: Colors.textSecondary + '50' }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <AppText weight="bold" style={[styles.title, { color: Colors.text }]}>
            Add Friend
          </AppText>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
            <AppText weight="regular" style={[styles.cancel, { color: Colors.textSecondary }]}>
              Cancel
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Search input */}
        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: Colors.card,
              borderColor: isFriendCode ? Colors.primary + '80' : Colors.border ?? Colors.card,
            },
          ]}
        >
          <AppText weight="regular" style={[styles.searchIcon, { color: Colors.textSecondary }]}>
            ⌕
          </AppText>
          <TextInput
            style={[
              styles.input,
              { color: isFriendCode ? Colors.primary : Colors.text, fontFamily: 'SpaceGrotesk-Regular' },
            ]}
            placeholder="Search by username or friend code"
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={handleQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>

        {isFriendCode && (
          <AppText weight="regular" style={[styles.hint, { color: Colors.primary }]}>
            Friend code detected
          </AppText>
        )}

        {/* Results */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const sent = sentIds.has(item.id);
            return (
              <NeonCard style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: Colors.primary + '18',
                        borderColor: Colors.primary + '40',
                      },
                    ]}
                  >
                    <AppText weight="bold" style={[styles.avatarLetter, { color: Colors.primary }]}>
                      {item.username.charAt(0).toUpperCase()}
                    </AppText>
                  </View>

                  <View style={styles.resultInfo}>
                    <AppText weight="semibold" style={[styles.resultName, { color: Colors.text }]}>
                      {item.username}
                    </AppText>
                    <AppText weight="regular" style={[styles.resultCode, { color: Colors.textSecondary }]}>
                      · {item.friendCode}
                    </AppText>
                  </View>

                  <RankIcon rank={item.rank} size={28} />

                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      {
                        backgroundColor: sent ? Colors.card : Colors.primary + '20',
                        borderColor: sent ? (Colors.border ?? Colors.card) : Colors.primary + '60',
                      },
                    ]}
                    onPress={() => !sent && handleAdd(item.id)}
                    disabled={sent}
                    activeOpacity={0.7}
                  >
                    <AppText
                      weight="semibold"
                      style={[
                        styles.addText,
                        { color: sent ? Colors.textSecondary : Colors.primary },
                      ]}
                    >
                      {sent ? 'Sent' : 'Add'}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </NeonCard>
            );
          }}
          ListEmptyComponent={
            query.length > 0 && !isSearching ? (
              <AppText weight="regular" style={[styles.noResults, { color: Colors.textSecondary }]}>
                No users found
              </AppText>
            ) : null
          }
        />

        {/* Your friend code */}
        <View
          style={[
            styles.codeSection,
            { backgroundColor: Colors.card, borderColor: Colors.primary + '30' },
          ]}
        >
          <AppText weight="semibold" style={[styles.codeLabel, { color: Colors.textSecondary }]}>
            YOUR FRIEND CODE
          </AppText>
          <View style={styles.codeRow}>
            <AppText weight="bold" style={[styles.codeText, { color: Colors.text }]}>
              {user.username}{' '}
              <AppText weight="bold" style={{ color: Colors.primary }}>
                · {user.friendCode || '------'}
              </AppText>
            </AppText>
            <TouchableOpacity
              style={[
                styles.shareBtn,
                { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '40' },
              ]}
              onPress={handleShareCode}
              activeOpacity={0.7}
            >
              <AppText weight="semibold" style={[styles.shareText, { color: Colors.primary }]}>
                Share
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    handleWrap: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    title: {
      fontSize: typography['2xl'],
    },
    cancel: {
      fontSize: typography.sm,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xs,
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      gap: spacing.sm,
    },
    searchIcon: {
      fontSize: typography.lg,
    },
    input: {
      flex: 1,
      fontSize: typography.base,
      padding: 0,
    },
    hint: {
      fontSize: typography.xs,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    resultCard: {
      marginBottom: spacing.sm,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLetter: {
      fontSize: typography.base,
    },
    resultInfo: {
      flex: 1,
    },
    resultName: {
      fontSize: typography.base,
    },
    resultCode: {
      fontSize: typography.xs,
      marginTop: 1,
    },
    addBtn: {
      borderRadius: radius.sm,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
    },
    addText: {
      fontSize: typography.sm,
    },
    noResults: {
      fontSize: typography.sm,
      textAlign: 'center',
      marginTop: spacing['2xl'],
    },
    codeSection: {
      margin: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      padding: spacing.md,
    },
    codeLabel: {
      fontSize: typography.xs,
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
    },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    codeText: {
      fontSize: typography.base,
      flex: 1,
    },
    shareBtn: {
      borderRadius: radius.sm,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
    },
    shareText: {
      fontSize: typography.sm,
    },
  });
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/add-friend.tsx
  git commit -m "feat: add Add Friend modal screen"
  ```

---

### Task 8: Create Friends Tab Screen

**Files:**
- Create: `app/(tabs)/social.tsx`

- [ ] **Step 1: Create the file**

  Create `app/(tabs)/social.tsx`:

  ```tsx
  import React, { useCallback, useState } from 'react';
  import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
  } from 'react-native';
  import { useSafeAreaInsets } from 'react-native-safe-area-context';
  import { useRouter } from 'expo-router';
  import { useFocusEffect } from '@react-navigation/native';
  import { useTheme } from '@/context/ThemeContext';
  import { AppText } from '@/components/ui/AppText';
  import { NeonCard } from '@/components/NeonCard';
  import { FriendCard } from '@/components/FriendCard';
  import { useFriends } from '@/hooks/useFriends';
  import { TAB_BAR_TOTAL_HEIGHT } from '@/components/CurvedTabBar';
  import { spacing, radius, typography } from '@/constants/design';

  export default function SocialScreen() {
    const Colors = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { friends, pendingRequests, isLoading, loadFriends, acceptRequest, declineRequest } =
      useFriends();
    const [showRequests, setShowRequests] = useState(false);

    useFocusEffect(
      useCallback(() => {
        loadFriends();
      }, [loadFriends])
    );

    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: Platform.OS === 'web' ? Colors.background : 'transparent' },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom + spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>
              Friends
            </AppText>
            <TouchableOpacity
              style={[
                styles.addBtn,
                { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '40' },
              ]}
              onPress={() => router.push('/add-friend')}
              activeOpacity={0.7}
            >
              <AppText weight="bold" style={{ fontSize: 22, color: Colors.primary, lineHeight: 24 }}>+</AppText>
            </TouchableOpacity>
          </View>

          {/* Pending requests banner */}
          {pendingRequests.length > 0 && (
            <TouchableOpacity
              style={[
                styles.requestsBanner,
                { backgroundColor: Colors.secondary + '18', borderColor: Colors.secondary + '40' },
              ]}
              onPress={() => setShowRequests((v) => !v)}
              activeOpacity={0.7}
            >
              <AppText weight="semibold" style={[styles.requestsText, { color: Colors.secondary }]}>
                {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
              </AppText>
              <AppText weight="regular" style={[styles.requestsArrow, { color: Colors.secondary }]}>
                {showRequests ? '▲' : '▼'}
              </AppText>
            </TouchableOpacity>
          )}

          {/* Expanded pending requests */}
          {showRequests &&
            pendingRequests.map((req) => (
              <NeonCard key={req.friendshipId} style={styles.requestCard}>
                <View style={styles.requestRow}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: Colors.primary + '18',
                        borderColor: Colors.primary + '40',
                      },
                    ]}
                  >
                    <AppText weight="bold" style={[styles.avatarLetter, { color: Colors.primary }]}>
                      {req.from.username.charAt(0).toUpperCase()}
                    </AppText>
                  </View>
                  <AppText weight="semibold" style={[styles.requestName, { color: Colors.text }]}>
                    {req.from.username}
                  </AppText>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: Colors.primary + '20', borderColor: Colors.primary + '60' },
                    ]}
                    onPress={() => acceptRequest(req.friendshipId)}
                    activeOpacity={0.7}
                  >
                    <AppText weight="semibold" style={[styles.actionText, { color: Colors.primary }]}>
                      Accept
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: Colors.card, borderColor: Colors.border ?? Colors.card },
                    ]}
                    onPress={() => declineRequest(req.friendshipId)}
                    activeOpacity={0.7}
                  >
                    <AppText
                      weight="semibold"
                      style={[styles.actionText, { color: Colors.textSecondary }]}
                    >
                      Decline
                    </AppText>
                  </TouchableOpacity>
                </View>
              </NeonCard>
            ))}

          {/* Loading */}
          {isLoading && (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.loader}
            />
          )}

          {/* Friends list */}
          {!isLoading && friends.length === 0 && (
            <NeonCard style={styles.emptyCard}>
              <AppText weight="semibold" style={[styles.emptyTitle, { color: Colors.text }]}>
                No friends yet
              </AppText>
              <AppText weight="regular" style={[styles.emptyBody, { color: Colors.textSecondary }]}>
                Tap + to search for friends by username or share your friend code.
              </AppText>
            </NeonCard>
          )}

          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}

          {/* Leaderboard — Coming Soon */}
          <View
            style={[
              styles.leaderboardPlaceholder,
              { borderColor: Colors.textSecondary + '30' },
            ]}
          >
            <AppText
              weight="semibold"
              style={[styles.leaderboardLabel, { color: Colors.textSecondary + '80' }]}
            >
              LEADERBOARD
            </AppText>
            <AppText
              weight="regular"
              style={[styles.leaderboardBody, { color: Colors.textSecondary }]}
            >
              Coming soon — compete with friends for the top spot
            </AppText>
          </View>
        </ScrollView>
      </View>
    );
  }

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    pageTitle: {
      fontSize: typography['3xl'],
    },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    requestsBanner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      marginBottom: spacing.sm,
    },
    requestsText: {
      fontSize: typography.sm,
    },
    requestsArrow: {
      fontSize: typography.xs,
    },
    requestCard: {
      marginBottom: spacing.sm,
    },
    requestRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLetter: {
      fontSize: typography.base,
    },
    requestName: {
      flex: 1,
      fontSize: typography.base,
    },
    actionBtn: {
      borderRadius: radius.sm,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    actionText: {
      fontSize: typography.xs,
    },
    loader: {
      marginVertical: spacing['3xl'],
    },
    emptyCard: {
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: typography.lg,
      marginBottom: spacing.sm,
    },
    emptyBody: {
      fontSize: typography.sm,
      textAlign: 'center',
    },
    leaderboardPlaceholder: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: radius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    leaderboardLabel: {
      fontSize: typography.xs,
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    leaderboardBody: {
      fontSize: typography.sm,
      textAlign: 'center',
    },
  });
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/(tabs)/social.tsx
  git commit -m "feat: add Friends tab screen"
  ```

---

### Task 9: Make CurvedTabBar Support Dynamic Tab Count

The tab bar currently hardcodes 5 tabs via `const TAB_W = SCREEN_W / 5` and `Array.from({ length: 5 }, ...)`. These must be dynamic to support 6 tabs.

**Files:**
- Modify: `components/CurvedTabBar.tsx`

- [ ] **Step 1: Remove the static `TAB_W` and `TAB_POSITIONS` constants**

  In `components/CurvedTabBar.tsx`, delete these two lines (currently around line 54–57):

  ```ts
  // DELETE these two lines:
  const TAB_W = SCREEN_W / 5;
  const TAB_POSITIONS: number[] = Array.from(
    { length: 5 },
    (_, i) => TAB_W * (i + 0.5)
  );
  ```

- [ ] **Step 2: Compute `tabW` and `tabPositions` dynamically inside `CurvedTabBar`**

  Inside the `CurvedTabBar` function body, add these two lines right after `const Colors = useTheme();`:

  ```ts
  const tabW = SCREEN_W / state.routes.length;
  const tabPositions = Array.from(
    { length: state.routes.length },
    (_, i) => tabW * (i + 0.5)
  );
  ```

- [ ] **Step 3: Update all references inside `CurvedTabBar`**

  There are two places that reference the old module-level `TAB_POSITIONS`. Update both:

  1. Line `currentX.value = withSpring(TAB_POSITIONS[state.index], {` → `currentX.value = withSpring(tabPositions[state.index], {`
  2. Line `const currentX = useSharedValue(TAB_POSITIONS[state.index]);` → `const currentX = useSharedValue(tabPositions[state.index]);`

- [ ] **Step 4: Pass `tabW` as a prop to `TabButton`**

  `TabButton` still uses `TAB_W` in its `style` for the button width. Update the `TabButton` props interface and call sites:

  In the `TabButton` props interface, add:
  ```ts
  tabW: number;
  ```

  In the `TabButton` body, replace:
  ```ts
  style={[styles.tabButton, { left: positionX - TAB_W / 2, width: TAB_W }]}
  ```
  with:
  ```ts
  style={[styles.tabButton, { left: positionX - tabW / 2, width: tabW }]}
  ```

  In the `CurvedTabBar` render where `TabButton` is used (inside `state.routes.map`), add `tabW={tabW}`:
  ```tsx
  <TabButton
    key={route.key}
    route={route}
    descriptors={descriptors}
    navigation={navigation}
    positionX={tabPositions[index]}
    tabW={tabW}
    Colors={Colors}
  />
  ```

- [ ] **Step 5: Update the `useSharedValue` initial value**

  The `useSharedValue` line uses the old `TAB_POSITIONS` array. Since we now compute `tabPositions` before this, it's already correct after Step 3. Verify the line reads:
  ```ts
  const currentX = useSharedValue(tabPositions[state.index]);
  ```

- [ ] **Step 6: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git add components/CurvedTabBar.tsx
  git commit -m "feat: make CurvedTabBar dynamic for any tab count"
  ```

---

### Task 10: Add Friends Tab to Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Add the Friends (`social`) tab**

  In `app/(tabs)/_layout.tsx`, add a new `<Tabs.Screen>` entry after the `profile` screen:

  ```tsx
  <Tabs.Screen
    name="profile"
    options={{
      title: 'Profile',
      tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
    }}
  />
  <Tabs.Screen
    name="social"
    options={{
      title: 'Friends',
      tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
    }}
  />
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Run the app and verify**

  ```bash
  npx expo start --web
  ```

  Check:
  - 6 tabs appear in the tab bar, all evenly spaced
  - The Friends tab (people icon) is visible and tappable
  - Tapping Friends shows the screen with "Friends" title and "+" button
  - Tapping "+" opens the Add Friend modal
  - Searching a username returns results from Supabase
  - Typing exactly 6 uppercase alphanumeric characters shows "Friend code detected"
  - Tapping Add sends a friend request (check in Supabase dashboard: `SELECT * FROM friendships;`)
  - The animated bubble moves to the Friends tab position correctly

- [ ] **Step 4: Commit**

  ```bash
  git add app/(tabs)/_layout.tsx
  git commit -m "feat: add Friends tab to tab layout"
  ```

---

## Summary

| Task | Files Changed |
|------|--------------|
| 1 | Supabase SQL (dashboard) |
| 2 | `components/ui/icon-symbol.tsx` |
| 3 | `types/user.ts` |
| 4 | `context/UserContext.tsx` |
| 5 | `hooks/useFriends.ts` (new) |
| 6 | `components/FriendCard.tsx` (new) |
| 7 | `app/add-friend.tsx` (new) |
| 8 | `app/(tabs)/social.tsx` (new) |
| 9 | `components/CurvedTabBar.tsx` |
| 10 | `app/(tabs)/_layout.tsx` |
