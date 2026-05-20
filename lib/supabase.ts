/**
 * SUPABASE CLIENT
 * Lazy singleton — only created on first use, not during static export build.
 * On native: uses AsyncStorage for session persistence.
 * On web: uses localStorage safely (guarded for SSR/static export).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Safe web storage that doesn't crash during SSR/static export */
const webStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    return Promise.resolve(window.localStorage.setItem(key, value));
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    return Promise.resolve(window.localStorage.removeItem(key));
  },
};

let client: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/** Lazy singleton getter */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

/** Direct export — lazily resolves common methods */
export const supabase: SupabaseClient = {
  get auth() { return getSupabaseClient().auth; },
  get from() { return getSupabaseClient().from.bind(getSupabaseClient()); },
  get channel() { return getSupabaseClient().channel.bind(getSupabaseClient()); },
  get removeChannel() { return getSupabaseClient().removeChannel.bind(getSupabaseClient()); },
} as unknown as SupabaseClient;
