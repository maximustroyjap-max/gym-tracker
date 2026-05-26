/**
 * NOTIFICATIONS SETTINGS SCREEN — Premium Redesign
 * Controls notification preferences for the app.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppText } from '@/components/ui/AppText';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

const DELAY_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hr', value: 120 },
];

export default function NotificationsScreen() {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const settings = user.notificationSettings;

  const toggleAlert = async (value: boolean) => {
    if (value && Platform.OS !== 'web') {
      const result = await Notifications.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive workout alerts.',
        );
        return;
      }
    }
    updateUser({
      notificationSettings: {
        ...settings,
        unfinishedWorkoutAlert: value,
      },
    });
  };

  const setDelay = (minutes: number) => {
    updateUser({
      notificationSettings: {
        ...settings,
        unfinishedWorkoutDelayMinutes: minutes,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Notifications', headerShown: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
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
        <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>Notifications</AppText>

        {/* Alert Toggle */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <View style={styles.toggleRow}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '18' }]}>
              <MaterialIcons name="notifications" size={22} color={Colors.primary} />
            </View>
            <View style={styles.toggleInfo}>
              <AppText weight="semibold" style={[styles.toggleLabel, { color: Colors.text }]}>
                Unfinished Workout Alert
              </AppText>
              <AppText style={[styles.toggleDesc, { color: Colors.textSecondary }]}>
                Get notified when you leave a workout running
              </AppText>
            </View>
            <Switch
              value={settings.unfinishedWorkoutAlert}
              onValueChange={toggleAlert}
              trackColor={{ false: Colors.border, true: Colors.primary + '66' }}
              thumbColor={settings.unfinishedWorkoutAlert ? Colors.primary : Colors.textSecondary}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        {/* Delay Selector */}
        {settings.unfinishedWorkoutAlert && (
          <>
            <AppText weight="semibold" style={[styles.sectionTitle, { color: Colors.textSecondary }]}>
              Alert Delay
            </AppText>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                  shadowColor: Colors.shadow,
                },
              ]}>
              <AppText style={[styles.cardDescription, { color: Colors.textSecondary }]}>
                How long to wait before alerting you about an unfinished workout.
              </AppText>
              <View style={styles.chipGrid}>
                {DELAY_OPTIONS.map((option) => {
                  const isSelected = settings.unfinishedWorkoutDelayMinutes === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? Colors.primary + '1A'
                            : Colors.background,
                          borderColor: isSelected ? Colors.primary : Colors.border,
                          borderWidth: isSelected ? 1.5 : 1,
                        },
                      ]}
                      onPress={() => setDelay(option.value)}
                      activeOpacity={activeOpacity.button}>
                      <AppText
                        weight={isSelected ? 'bold' : 'medium'}
                        style={[
                          styles.chipText,
                          { color: isSelected ? Colors.primary : Colors.textSecondary },
                        ]}>
                        {option.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: touch.minHeight,
  },
  iconContainer: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toggleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: typography.lg,
  },
  toggleDesc: {
    fontSize: typography.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  cardDescription: {
    fontSize: typography.base,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    lineHeight: 20,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: typography.base,
  },
});
