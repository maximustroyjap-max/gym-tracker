/**
 * SETTINGS SCREEN — Premium Redesign
 * Full settings UI with grouped sections and tappable menu rows.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NeonCard } from '@/components/NeonCard';
import { SettingsRow } from '@/components/SettingsRow';
import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';

export default function SettingsScreen() {
  const Colors = useTheme();
  const { user, resetUser } = useUser();
  const { logout } = useAuth();
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const themeLabel: Record<string, string> = {
    dark: 'Dark Theme',
    light: 'Light Theme',
    black: 'Black Theme',
    halloween: 'Halloween Theme',
    christmas: 'Christmas Theme',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Settings', headerShown: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={activeOpacity.row}>
            <IconSymbol name="chevron.left" size={28} color={Colors.primary} />
            <AppText weight="medium" style={[styles.backText, { color: Colors.primary }]}>Back</AppText>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>Settings</AppText>

        {/* General */}
        <SectionTitle colors={Colors}>General</SectionTitle>
        <NeonCard borderRadius={radius.lg}>
          <SettingsRow
            icon="notifications"
            label="Notifications"
            onPress={() => router.push('/notifications')}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="keyboard-voice"
            label="Siri / AI Shortcuts"
            onPress={() => {}}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="settings"
            label="Advanced Settings"
            onPress={() => router.push('/advanced')}
          />
        </NeonCard>

        {/* Appearance */}
        <SectionTitle colors={Colors}>Appearance</SectionTitle>
        <NeonCard borderRadius={radius.lg}>
          <SettingsRow
            icon="palette"
            label="App Theme"
            value={themeLabel[user.theme] ?? 'Dark Theme'}
            onPress={() => router.push('/theme')}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="apps"
            label="App Icon"
            onPress={() => {}}
          />
        </NeonCard>

        {/* Log Workout Settings */}
        <SectionTitle colors={Colors}>Log Workout Settings</SectionTitle>
        <NeonCard borderRadius={radius.lg}>
          <SettingsRow
            icon="timer"
            label="Rest Timer Settings"
            value={`${Math.floor(user.restTimerSettings.durationSeconds / 60)} min`}
            onPress={() => router.push('/rest-timer-settings')}
          />
        </NeonCard>

        {/* Account */}
        <SectionTitle colors={Colors}>Account</SectionTitle>
        <NeonCard borderRadius={radius.lg}>
          <SettingsRow
            icon="person"
            label="Edit Profile"
            onPress={() => router.push('/edit-profile')}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="straighten"
            label="Body Measurements"
            onPress={() => router.push('/body-measurements')}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="emoji-events"
            label="Goals"
            onPress={() => router.push('/goals')}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="logout"
            label="Logout"
            danger
            onPress={() => setShowLogoutPopup(true)}
          />
        </NeonCard>

        {/* Support & About */}
        <SectionTitle colors={Colors}>Support &amp; About</SectionTitle>
        <NeonCard borderRadius={radius.lg}>
          <SettingsRow
            icon="help"
            label="Help & Support"
            onPress={() => router.push('/help-support' as any)}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="privacy-tip"
            label="Privacy Policy"
            onPress={() => router.push('/privacy-policy' as any)}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="description"
            label="Terms of Service"
            onPress={() => router.push('/terms-of-service' as any)}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="info"
            label="App Version"
            value="1.0.0"
            hideChevron
          />
        </NeonCard>

        {/* Data */}
        <SectionTitle colors={Colors}>Data</SectionTitle>
        <NeonCard borderRadius={radius.lg}>
          <SettingsRow
            icon="share"
            label="Export Workout Data"
            onPress={() => {}}
          />
          <Divider colors={Colors} />
          <SettingsRow
            icon="delete"
            label="Reset All Data"
            danger
            onPress={() => setShowResetPopup(true)}
          />
        </NeonCard>
      </ScrollView>

      {/* Logout Confirmation */}
      <ConfirmationPopup
        visible={showLogoutPopup}
        title="Logout?"
        message="You will be returned to the login screen. Your workout data is safely saved."
        cancelText="Cancel"
        confirmText="Logout"
        onCancel={() => setShowLogoutPopup(false)}
        onConfirm={useCallback(async () => {
          await logout();
          setShowLogoutPopup(false);
        }, [logout])}
      />

      {/* Reset All Data Confirmation */}
      <ConfirmationPopup
        visible={showResetPopup}
        title="Reset All Data?"
        message="This will permanently delete all your workouts, templates, history, fitness score, rank, streaks, and settings. This action cannot be undone."
        cancelText="Cancel"
        confirmText="Reset Everything"
        onCancel={() => setShowResetPopup(false)}
        onConfirm={useCallback(async () => {
          await resetUser();
          setShowResetPopup(false);
        }, [resetUser])}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ children, colors }: { children: React.ReactNode; colors: ReturnType<typeof useTheme> }) {
  return <AppText weight="semibold" style={[styles.sectionTitle, { color: colors.textSecondary }]}>{children}</AppText>;
}

function Divider({ colors }: { colors: ReturnType<typeof useTheme> }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginLeft: -spacing.xs,
    minHeight: 44,
  },
  backText: {
    fontSize: typography.lg,
    marginLeft: -spacing.xs,
  },
  pageTitle: {
    fontSize: typography['3xl'],
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
});
