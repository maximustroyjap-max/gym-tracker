/**
 * HELP & SUPPORT SCREEN
 * Premium FAQ hub with single-open accordion and contact card.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppText } from '@/components/ui/AppText';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does the rank system work?',
    answer:
      'The app has a 16-tier Solo League rank system: Bronze → Silver → Gold → Platinum → Diamond → Immortal. Your Fitness Score (0-100) determines your rank. You can rank up by working out consistently, or rank down if you miss weeks. Each tier has 3 sub-tiers (e.g., Gold 1, Gold 2, Gold 3).',
  },
  {
    question: 'How is my fitness score calculated?',
    answer:
      'Fitness Score is calculated from 4 pillars: Consistency (40%) — how regularly you hit your weekly target; Volume (30%) — total reps and workout time per month; Progression (20%) — PRs and weight increases; Variety (10%) — how many different exercises and body parts you train.',
  },
  {
    question: 'What happens to my data?',
    answer:
      'All your data is stored 100% locally on your device using AsyncStorage. Nothing is uploaded to the cloud, no servers are involved, and no account is required. Your workout history, templates, and settings never leave your phone.',
  },
  {
    question: 'How do I create custom exercises?',
    answer:
      'Go to the Exercises tab, tap the "+" button in the top right, and fill in the exercise name, body part, and optional notes. Your custom exercises will appear alongside the 150+ built-in exercises.',
  },
  {
    question: 'How do workout templates work?',
    answer:
      'Templates are pre-made workout routines you can start instantly. The app comes with sample templates (Morning Workout, Afternoon Workout, Back & Biceps). You can also build your own templates by adding exercises and saving them for quick access later.',
  },
  {
    question: 'How does the streak system work?',
    answer:
      'Your streak counts consecutive weeks where you complete at least your weekly target number of workouts. If you miss a week, the streak resets to zero. You can change your weekly target in Settings → Goals.',
  },
  {
    question: 'Can I export my workout data?',
    answer:
      'Yes! Go to Settings → Data → Export Workout Data. You can share your complete workout history, templates, and stats as a structured file.',
  },
  {
    question: 'What happens if I reset all data?',
    answer:
      'Resetting will permanently erase all workouts, templates, history, fitness score, rank, streaks, and settings. This action cannot be undone. Your app will return to a fresh, empty state.',
  },
];

export default function HelpSupportScreen() {
  const Colors = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = useCallback(
    (index: number) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOpenIndex(openIndex === index ? null : index);
    },
    [openIndex]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Help & Support', headerShown: false }} />

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
        <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>Help &amp; Support</AppText>

        {/* Hero Contact Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: Colors.primary + '12' },
            ]}>
            <MaterialIcons name="help-outline" size={32} color={Colors.primary} />
          </View>
          <AppText weight="bold" style={[styles.heroTitle, { color: Colors.text }]}>We&apos;re here to help</AppText>
          <AppText style={[styles.heroSubtitle, { color: Colors.textSecondary }]}>
            Find answers to common questions below, or reach out if you need more support.
          </AppText>
          <View style={styles.heroFooter}>
            <View style={[styles.versionPill, { backgroundColor: Colors.background }]}>
              <AppText weight="semibold" style={[styles.versionText, { color: Colors.textSecondary }]}>v1.0.0</AppText>
            </View>
          </View>
        </View>

        {/* FAQ Section Label */}
        <AppText weight="semibold" style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Frequently Asked</AppText>

        {/* FAQ Accordion */}
        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.faqCard,
                  {
                    backgroundColor: Colors.card,
                    borderColor: isOpen ? Colors.primary + '40' : Colors.border,
                    shadowColor: Colors.shadow,
                  },
                ]}
                onPress={() => toggleFAQ(index)}
                activeOpacity={activeOpacity.card}>
                <View style={styles.faqHeader}>
                  <View style={[styles.numberBadge, { backgroundColor: Colors.primary }]}>
                    <AppText weight="bold" style={styles.numberText}>{index + 1}</AppText>
                  </View>
                  <AppText weight="semibold" style={[styles.question, { color: Colors.text }]} numberOfLines={2}>
                    {faq.question}
                  </AppText>
                  <Animated.View
                    style={{
                      transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
                    }}>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color={isOpen ? Colors.primary : Colors.textSecondary}
                    />
                  </Animated.View>
                </View>

                {isOpen && (
                  <View style={styles.answerBox}>
                    <View style={[styles.answerDivider, { backgroundColor: Colors.border }]} />
                    <AppText style={[styles.answer, { color: Colors.textSecondary }]}>
                      {faq.answer}
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
    marginBottom: spacing.lg,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  versionPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  versionText: {
    fontSize: typography.sm,
  },
  sectionTitle: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  faqList: {
    gap: spacing.md,
  },
  faqCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: typography.sm,
    color: '#FFFFFF',
  },
  question: {
    flex: 1,
    fontSize: typography.lg,
    lineHeight: 24,
  },
  answerBox: {
    marginTop: spacing.md,
  },
  answerDivider: {
    height: 1,
    marginBottom: spacing.md,
  },
  answer: {
    fontSize: typography.base,
    lineHeight: 22,
  },
});
