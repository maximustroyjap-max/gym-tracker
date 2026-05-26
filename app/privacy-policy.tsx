/**
 * PRIVACY POLICY SCREEN
 * Visual icon-card layout — no plain text wall.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppText } from '@/components/ui/AppText';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

interface PrivacyItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

const PRIVACY_ITEMS: PrivacyItem[] = [
  {
    icon: 'folder-open',
    title: 'Data We Collect',
    description:
      'We collect your email (for authentication), display name, workout history, body measurements, fitness scores, and app preferences. This data is necessary to provide the tracking and ranking features.',
  },
  {
    icon: 'storage',
    title: 'Cloud Storage',
    description:
      'Your data is stored securely in a PostgreSQL database hosted by Supabase. This enables multi-device sync, cloud backup, and access across web and mobile.',
  },
  {
    icon: 'security',
    title: 'Data Security',
    description:
      'Row Level Security ensures you can only access your own data. All connections use SSL/TLS encryption. Passwords are hashed and never stored in plain text.',
  },
  {
    icon: 'account-circle',
    title: 'Account Required',
    description:
      'An email and password account is required to keep your data synchronized across devices and backed up to the cloud. No phone number or social login is mandatory.',
  },
  {
    icon: 'download',
    title: 'Your Rights',
    description:
      'You own your data. You can export your complete workout history or permanently delete your account and all associated data at any time via Settings.',
  },
  {
    icon: 'mail-outline',
    title: 'Questions?',
    description:
      'If you have any privacy concerns, reach out through Help & Support in the Settings menu.',
  },
];

export default function PrivacyPolicyScreen() {
  const Colors = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Privacy Policy', headerShown: false }} />

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
        <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>Privacy Policy</AppText>

        {/* Hero Banner */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <View style={[styles.heroIcon, { backgroundColor: Colors.primary + '12' }]}>
            <MaterialIcons name="lock" size={32} color={Colors.primary} />
          </View>
          <AppText weight="bold" style={[styles.heroTitle, { color: Colors.text }]}>Your Privacy Matters</AppText>
          <AppText style={[styles.heroSubtitle, { color: Colors.textSecondary }]}>
            Your data is secure, encrypted, and always under your control.
          </AppText>
        </View>

        {/* Section Label */}
        <AppText weight="semibold" style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Our Principles</AppText>

        {/* Privacy Cards */}
        <View style={styles.cardsList}>
          {PRIVACY_ITEMS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.card,
                {
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                  shadowColor: Colors.shadow,
                },
              ]}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary + '18' }]}>
                <MaterialIcons name={item.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.cardText}>
                <AppText weight="bold" style={[styles.cardTitle, { color: Colors.text }]}>{item.title}</AppText>
                <AppText style={[styles.cardBody, { color: Colors.textSecondary }]}>
                  {item.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        {/* Footer Note */}
        <AppText style={[styles.footer, { color: Colors.textSecondary }]}>
          Last updated: June 2026
        </AppText>
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
  heroCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography['2xl'],
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  cardsList: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.lg,
  },
  cardBody: {
    fontSize: typography.base,
    lineHeight: 22,
  },
  footer: {
    fontSize: typography.sm,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
