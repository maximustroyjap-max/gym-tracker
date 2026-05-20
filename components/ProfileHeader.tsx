/**
 * PROFILE HEADER
 * This is the top section of the Profile screen.
 * It shows the user's avatar image (or initials if no photo), username,
 * and a colored rank badge. Tapping the avatar navigates to Edit Profile.
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { getTierColor } from '@/constants/ranks';
import { RankIcon } from '@/components/RankIcon';
import { AVATARS } from '@/constants/avatars';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';

export function ProfileHeader() {
  const Colors = useTheme();
  const { user } = useUser();

  // If the user has an avatar image ID, show it.
  // Otherwise show initials as a fallback.
  const initials = user.username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarImage = AVATARS.find((a) => a.id === user.avatar);
  const hasAvatar = !!avatarImage;

  // Get the color for this rank
  const rankColor = getTierColor(user.rank, user.theme);

  return (
    <View style={styles.container}>
      {/* Avatar Circle */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => router.push('/edit-profile')}
        activeOpacity={activeOpacity.button}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.primary + '66',
              shadowColor: Colors.shadow,
            },
          ]}>
          {hasAvatar ? (
            <Image source={avatarImage.source} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: Colors.primary, fontSize: 32 }]}>
              {initials}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Username */}
      <Text style={[styles.username, { color: Colors.text }]}>{user.username}</Text>

      {/* Rank Badge */}
      <View style={[styles.rankBadge, { backgroundColor: rankColor + '1A' /* 10% opacity */ }]}>
        <RankIcon rank={user.rank} size={18} glow glowColor={rankColor} glowIntensity="subtle" />
        <Text style={[styles.rankText, { color: rankColor }]}>{user.rank}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.full,
  },
  avatarText: {
    fontWeight: 'bold',
  },
  username: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  rankText: {
    fontSize: typography.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
