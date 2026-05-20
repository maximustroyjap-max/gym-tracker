/**
 * SUPABASE CLIENT
 * Lazy singleton — only created on first use.
 * During static export (no env vars): returns a mock client so the build doesn't crash.
 * At runtime (env vars present): returns the real Supabase client.
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
let mockClientFlag = false;

/** Check if the current client is the mock (build-time fallback) */
export function isMockClient(): boolean {
  return mockClientFlag;
}

/** Mock client for static export builds (no env vars available) */
function createMockClient(): SupabaseClient {
  const noop = () => Promise.resolve({ data: null, error: null } as any);
  const emptyQuery = () => ({
    select: () => emptyQuery(),
    insert: noop,
    update: () => ({ eq: noop }),
    delete: () => ({ eq: noop }),
    eq: () => emptyQuery(),
    single: noop,
    order: () => emptyQuery(),
    limit: () => emptyQuery(),
    data: null,
    error: null,
  });

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null } as any),
      signInWithPassword: noop,
      signUp: noop,
      signOut: noop,
      onAuthStateChange: () => ({ subscription: { unsubscribe: () => {} }, data: {} } as any),
      getUser: () => Promise.resolve({ data: { user: null }, error: null } as any),
    },
    from: () => emptyQuery(),
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
    removeChannel: () => {},
  } as unknown as SupabaseClient;
}

function createRealClient(): SupabaseClient {
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
  if (client) return client;

  // During static export, env vars are not available — use mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    mockClientFlag = true;
    client = createMockClient();
    return client;
  }

  mockClientFlag = false;
  client = createRealClient();
  return client;
}

/** Direct export — lazily resolves common methods */
export const supabase: SupabaseClient = {
  get auth() { return getSupabaseClient().auth; },
  get from() { return getSupabaseClient().from.bind(getSupabaseClient()); },
  get channel() { return getSupabaseClient().channel.bind(getSupabaseClient()); },
  get removeChannel() { return getSupabaseClient().removeChannel.bind(getSupabaseClient()); },
} as unknown as SupabaseClient;
