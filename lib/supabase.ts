/**
 * SUPABASE CLIENT
 * Singleton client for auth and database operations.
 * On native: uses AsyncStorage for session persistence.
 * On web: uses localStorage safely (guarded for SSR/static export).
 */

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Please create a .env.local file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
