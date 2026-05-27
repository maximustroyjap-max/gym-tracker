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
