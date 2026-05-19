/**
 * ROOT LAYOUT
 * This is the outermost wrapper of the entire app.
 */

import { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider as NavigationThemeProvider, DefaultTheme } from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { UserProvider, useUser } from '@/context/UserContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthScreen from './auth';
import { WorkoutOverlay } from '@/components/WorkoutOverlay';
import { AmbientBackground } from '@/components/AmbientBackground';
import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';

// Prevent native splash from auto-hiding early.
// Wrapped in catch — if called before native modules are ready, we still have
// the static logo in AnimatedSplashScreen as a seamless fallback.
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

/** Inner app content that needs access to theme colors */
function AppContent() {
  const Colors = useTheme();
  const { user } = useUser();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isLightTheme = user.theme === 'light';
  const [splashComplete, setSplashComplete] = useState(false);
  const [isDesktopWeb, setIsDesktopWeb] = useState(false);

  // Safe window width check — only runs on client, not during static export
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const check = () => setIsDesktopWeb(window.innerWidth > 600);
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
  }, []);

  // Show splash until animation completes OR auth is still loading
  const showSplash = !splashComplete || authLoading;

  const content = (
    <>
      {/* Animated splash — renders immediately so static logo is ready
          the instant the native splash disappears. */}
      {showSplash && (
        <AnimatedSplashScreen onAnimationComplete={() => setSplashComplete(true)} />
      )}

      {!showSplash && !isAuthenticated && <AuthScreen />}

      {!showSplash && isAuthenticated && (
        <>
          <AmbientBackground />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <WorkoutOverlay />
        </>
      )}

      {Platform.OS !== 'web' && (
        <StatusBar
          style={isLightTheme ? 'dark' : 'light'}
          backgroundColor={Colors.background}
        />
      )}
    </>
  );

  // On desktop web, center the app with a max-width for a mobile-like experience
  if (Platform.OS === 'web' && isDesktopWeb) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 480, height: '100%', maxHeight: 900 }}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const transparentNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function RootLayout() {
  return (
    <UserProvider>
      <AuthProvider>
        <ThemeProvider>
          <WorkoutProvider>
            <NavigationThemeProvider value={transparentNavTheme}>
              <AppContent />
            </NavigationThemeProvider>
          </WorkoutProvider>
        </ThemeProvider>
      </AuthProvider>
    </UserProvider>
  );
}
