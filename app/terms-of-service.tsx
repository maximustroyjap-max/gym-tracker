/**
 * TERMS OF SERVICE SCREEN
 * Visual icon-card layout with warning accent on medical disclaimer.
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

interface TermItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  warning?: boolean;
}

const TERMS: TermItem[] = [
  {
    icon: 'local-hospital',
    title: 'Medical Disclaimer',
    description:
      'Consult a physician before starting any exercise program. This app is for tracking and motivation only and does not constitute medical advice, diagnosis, or treatment.',
    warning: true,
  },
  {
    icon: 'warning-amber',
    title: 'Assumption of Risk',
    description:
      'You assume full responsibility for any injury, harm, or damage that may result from exercises tracked or performed using this app. Stop immediately if you feel pain or discomfort.',
  },
  {
    icon: 'fitness-center',
    title: 'App Purpose',
    description:
      'This app is designed for workout tracking and personal motivation. Exercise instructions are educational and general in nature — they are not personalized coaching or training programs.',
  },
  {
    icon: 'edit-note',
    title: 'Data Accuracy',
    description:
      'You are solely responsible for entering accurate information including weights, reps, sets, body measurements, and workout durations. Results and recommendations depend on accurate data.',
  },
  {
    icon: 'cloud-off',
    title: 'App Availability',
    description:
      'This app is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, error-free operation, or that the app will meet your specific requirements.',
  },
  {
    icon: 'update',
    title: 'Updates',
    description:
      'We may update the app, its features, and these terms at any time. Continued use after changes constitutes acceptance of the revised terms.',
  },
  {
    icon: 'gavel',
    title: 'Limitation of Liability',
    description:
      'To the fullest extent permitted by law, we are not liable for any direct, indirect, incidental, or consequential damages arising from your use of this app.',
  },
];

export default function TermsOfServiceScreen() {
  const Colors = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Terms of Service', headerShown: false }} />

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
        <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>Terms of Service</AppText>

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
            <MaterialIcons name="policy" size={32} color={Colors.primary} />
          </View>
          <AppText weight="bold" style={[styles.heroTitle, { color: Colors.text }]}>Terms of Service</AppText>
          <AppText style={[styles.heroSubtitle, { color: Colors.textSecondary }]}>
            Please read these terms carefully before using the app.
          </AppText>
        </View>

        {/* Section Label */}
        <AppText weight="semibold" style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Terms</AppText>

        {/* Terms Cards */}
        <View style={styles.cardsList}>
          {TERMS.map((item, index) => {
            const iconBg = item.warning ? Colors.danger + '18' : Colors.primary + '18';
            const iconColor = item.warning ? Colors.danger : Colors.primary;
            const borderColor = item.warning ? Colors.danger + '30' : Colors.border;

            return (
              <View
                key={index}
                style={[
                  styles.card,
                  {
                    backgroundColor: Colors.card,
                    borderColor: borderColor,
                    shadowColor: Colors.shadow,
                  },
                ]}>
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                  <MaterialIcons name={item.icon} size={22} color={iconColor} />
                </View>
                <View style={styles.cardText}>
                  <AppText weight="bold" style={[styles.cardTitle, { color: Colors.text }]}>{item.title}</AppText>
                  <AppText style={[styles.cardBody, { color: Colors.textSecondary }]}>
                    {item.description}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer Note */}
        <AppText style={[styles.footer, { color: Colors.textSecondary }]}>
          Last updated: May 2026
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
