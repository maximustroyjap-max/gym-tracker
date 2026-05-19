/**
 * THEME CONTEXT
 * Provides the active theme colors to the entire app.
 * Reads the user's selected theme from UserContext.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useUser } from './UserContext';
import { ThemeColors, getThemeColors } from '@/constants/theme';

interface ThemeContextType {
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const colors = useMemo(() => getThemeColors(user.theme), [user.theme]);

  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeColors {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx.colors;
}
