/**
 * ROOT LAYOUT
 * This is the outermost wrapper of the entire app.
 */

import { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
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

// Show notifications even while the app is in the foreground.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

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

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  // Show splash until animation completes OR auth is still loading OR fonts not ready
  const showSplash = !splashComplete || authLoading || !fontsLoaded;

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

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      {content}
    </View>
  );
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
