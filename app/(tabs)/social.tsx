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
        <View style={styles.header}>
          <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>
            Friends
          </AppText>
          <TouchableOpacity
            style={[
              styles.addBtn,
              { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '40' },
            ]}
            onPress={() => router.push('/add-friend' as any)}
            activeOpacity={0.7}
          >
            <AppText weight="bold" style={{ fontSize: 22, color: Colors.primary, lineHeight: 24 }}>
              +
            </AppText>
          </TouchableOpacity>
        </View>

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
                    { backgroundColor: Colors.card, borderColor: Colors.border },
                  ]}
                  onPress={() => declineRequest(req.friendshipId)}
                  activeOpacity={0.7}
                >
                  <AppText weight="semibold" style={[styles.actionText, { color: Colors.textSecondary }]}>
                    Decline
                  </AppText>
                </TouchableOpacity>
              </View>
            </NeonCard>
          ))}

        {isLoading && (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        )}

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
