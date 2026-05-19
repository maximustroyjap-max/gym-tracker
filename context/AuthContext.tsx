/**
 * AUTH CONTEXT — Supabase Auth
 * Manages login / signup / logout via Supabase.
 * Sessions persist automatically via AsyncStorage (native) or localStorage (web).
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SupabaseUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, weeklyTarget: number) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Listen to auth state changes + check initial session
  useEffect(() => {
    let mounted = true;

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

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return !error;
  }, []);

  const signup = useCallback(
    async (email: string, password: string, username: string, weeklyTarget: number): Promise<boolean> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { username: username.trim() },
        },
      });

      if (error || !data.user) {
        return false;
      }

      // Update profile with the user's chosen weekly target
      // (the trigger auto-creates the profile with defaults; we patch the target here)
      await supabase
        .from('profiles')
        .update({ weekly_target: weeklyTarget })
        .eq('id', data.user.id);

      return true;
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
