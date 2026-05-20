/**
 * AUTH CONTEXT — Supabase Auth
 * Manages login / signup / logout via Supabase.
 * Sessions persist automatically via AsyncStorage (native) or localStorage (web).
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase, isMockClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SupabaseUser | null;
  authConfigError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string, weeklyTarget: number) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authConfigError, setAuthConfigError] = useState<string | null>(null);

  // Listen to auth state changes + check initial session
  useEffect(() => {
    let mounted = true;

    // Skip during SSR/static export (window is undefined in Node.js)
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Detect mock client (missing env vars → auth won't work)
    if (isMockClient()) {
      setAuthConfigError(
        'Auth is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      );
      setIsLoading(false);
      return;
    }

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    // Subscribe to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setIsAuthenticated(!!session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isMockClient()) {
      return { success: false, error: 'Auth is not configured. Check your environment variables.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const signup = useCallback(
    async (email: string, password: string, username: string, weeklyTarget: number) => {
      if (isMockClient()) {
        return { success: false, error: 'Auth is not configured. Check your environment variables.' };
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { username: username.trim() },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (!data.user) {
        return { success: false, error: 'Signup failed. Please try again.' };
      }

      // Update profile with the user's chosen weekly target
      // (the trigger auto-creates the profile with defaults; we patch the target here)
      await supabase
        .from('profiles')
        .update({ weekly_target: weeklyTarget })
        .eq('id', data.user.id);

      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        authConfigError,
        login,
        signup,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
