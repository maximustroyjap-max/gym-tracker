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
