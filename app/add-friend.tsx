import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
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
      <View style={styles.handleWrap}>
        <View style={[styles.handle, { backgroundColor: Colors.textSecondary + '50' }]} />
      </View>

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

      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: Colors.card,
            borderColor: isFriendCode ? Colors.primary + '80' : Colors.border,
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
                      borderColor: sent ? Colors.border : Colors.primary + '60',
                    },
                  ]}
                  onPress={() => !sent && handleAdd(item.id)}
                  disabled={sent}
                  activeOpacity={0.7}
                >
                  <AppText
                    weight="semibold"
                    style={[styles.addText, { color: sent ? Colors.textSecondary : Colors.primary }]}
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
