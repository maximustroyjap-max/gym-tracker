/**
 * EDIT PROFILE SCREEN — Premium Redesign
 * Lets the user change their display name, pick an avatar emoji,
 * and set a personal fitness goal.
 */

import React, { useState, useCallback } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppText } from '@/components/ui/AppText';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';
import { AVATARS } from '@/constants/avatars';



export default function EditProfileScreen() {
  const Colors = useTheme();
  const { user, updateUser } = useUser();

  const [displayName, setDisplayName] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '');
  const [personalGoal, setPersonalGoal] = useState(user.personalGoal);

  const hasChanges =
    displayName !== user.username ||
    selectedAvatar !== (user.avatar || '') ||
    personalGoal !== user.personalGoal;

  const saveProfile = useCallback(() => {
    const trimmedName = displayName.trim();
    if (!trimmedName) return;

    updateUser({
      username: trimmedName,
      avatar: selectedAvatar,
      personalGoal: personalGoal.trim(),
    });
    router.back();
  }, [displayName, selectedAvatar, personalGoal, updateUser]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Edit Profile', headerShown: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
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
        <AppText weight="bold" style={[styles.pageTitle, { color: Colors.text }]}>Edit Profile</AppText>

        {/* Avatar Selection */}
        <AppText weight="semibold" style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Profile Picture</AppText>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    {
                      backgroundColor: isSelected ? Colors.primary + '15' : Colors.background,
                      borderColor: isSelected ? Colors.primary : Colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedAvatar(avatar.id)}
                  activeOpacity={activeOpacity.button}>
                  <Image source={avatar.source} style={styles.avatarImage} />
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: Colors.primary }]}>
                      <MaterialIcons name="check" size={12} color={Colors.background} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            {/* No avatar option */}
            <TouchableOpacity
              style={[
                styles.avatarOption,
                {
                  backgroundColor: selectedAvatar === '' ? Colors.primary + '15' : Colors.background,
                  borderColor: selectedAvatar === '' ? Colors.primary : Colors.border,
                  borderWidth: selectedAvatar === '' ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedAvatar('')}
              activeOpacity={activeOpacity.button}>
              <AppText weight="bold" style={[styles.avatarFallbackText, { color: Colors.textSecondary }]}>
                A-Z
              </AppText>
              {selectedAvatar === '' && (
                <View style={[styles.checkmark, { backgroundColor: Colors.primary }]}>
                  <MaterialIcons name="check" size={12} color={Colors.background} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Name */}
        <AppText weight="semibold" style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Display Name</AppText>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <TextInput
            style={[styles.textInput, { color: Colors.text }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textSecondary}
            maxLength={30}
            autoCapitalize="words"
          />
        </View>

        {/* Personal Goal */}
        <AppText weight="semibold" style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Personal Goal</AppText>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <TextInput
            style={[styles.textInput, styles.multilineInput, { color: Colors.text }]}
            value={personalGoal}
            onChangeText={setPersonalGoal}
            placeholder="What's your fitness goal?"
            placeholderTextColor={Colors.textSecondary}
            maxLength={120}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <AppText style={[styles.charCount, { color: Colors.textSecondary }]}>
            {personalGoal.length}/120
          </AppText>
        </View>

        {/* Spacer for save button */}
        {hasChanges && <View style={{ height: 80 }} />}
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.saveButtonContainer, { backgroundColor: Colors.background + 'EE' }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors.primary }]}
            onPress={saveProfile}
            activeOpacity={activeOpacity.button}>
            <AppText weight="bold" style={[styles.saveButtonText, { color: Colors.background }]}>Save Profile</AppText>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: spacing.xl,
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
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  avatarFallbackText: {
    fontSize: typography.sm,
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: typography.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 52,
  },
  multilineInput: {
    height: 80,
    paddingTop: spacing.sm,
  },
  charCount: {
    fontSize: typography.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: typography.lg,
  },
});
