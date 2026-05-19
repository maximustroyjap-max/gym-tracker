/**
 * REST TIMER SETTINGS SCREEN — Premium Redesign
 * Controls rest timer duration, alert sound, and display mode.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { SOUND_OPTIONS, playAlertSound } from '@/utils/sound';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

export default function RestTimerSettingsScreen() {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const settings = user.restTimerSettings;

  const [minutes, setMinutes] = useState(Math.floor(settings.durationSeconds / 60).toString());
  const [seconds, setSeconds] = useState((settings.durationSeconds % 60).toString());
  const [selectedSound, setSelectedSound] = useState(settings.soundEffect);
  const [selectedMode, setSelectedMode] = useState(settings.mode);
  const [soundModalVisible, setSoundModalVisible] = useState(false);

  const currentDuration = parseInt(minutes || '0', 10) * 60 + parseInt(seconds || '0', 10);
  const hasChanges =
    currentDuration !== settings.durationSeconds ||
    selectedSound !== settings.soundEffect ||
    selectedMode !== settings.mode;

  const saveSettings = useCallback(() => {
    const validDuration = Math.max(5, Math.min(600, currentDuration));
    updateUser({
      restTimerSettings: {
        durationSeconds: validDuration,
        soundEffect: selectedSound,
        mode: selectedMode,
      },
    });
    router.back();
  }, [currentDuration, selectedSound, selectedMode, updateUser]);

  const soundLabel = SOUND_OPTIONS.find((s) => s.id === selectedSound)?.label ?? 'Boxing Bell';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Rest Timer', headerShown: false }} />

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
            <MaterialIcons name="chevron-left" size={28} color={Colors.primary} />
            <Text style={[styles.backText, { color: Colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <Text style={[styles.pageTitle, { color: Colors.text }]}>Rest Timer</Text>

        {/* Duration */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Duration</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <Text style={[styles.cardLabel, { color: Colors.textSecondary }]}>
            Time between sets
          </Text>
          <View style={styles.durationRow}>
            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.timeInput,
                  { backgroundColor: Colors.background, color: Colors.text, borderColor: Colors.border },
                ]}
                value={minutes}
                onChangeText={(text) => setMinutes(text.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="2"
                placeholderTextColor={Colors.textSecondary}
              />
              <Text style={[styles.timeUnit, { color: Colors.textSecondary }]}>min</Text>
            </View>
            <Text style={[styles.colon, { color: Colors.text }]}>:</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.timeInput,
                  { backgroundColor: Colors.background, color: Colors.text, borderColor: Colors.border },
                ]}
                value={seconds}
                onChangeText={(text) => {
                  const clean = text.replace(/[^0-9]/g, '').slice(0, 2);
                  const num = parseInt(clean || '0', 10);
                  setSeconds(num > 59 ? '59' : clean);
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={Colors.textSecondary}
              />
              <Text style={[styles.timeUnit, { color: Colors.textSecondary }]}>sec</Text>
            </View>
          </View>
        </View>

        {/* Sound Effect */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Alert Sound</Text>
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: Colors.card, borderColor: Colors.border, shadowColor: Colors.shadow },
          ]}
          onPress={() => setSoundModalVisible(true)}
          activeOpacity={activeOpacity.card}>
          <View style={styles.soundRow}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '18' }]}>
              <MaterialIcons name="volume-up" size={22} color={Colors.primary} />
            </View>
            <View style={styles.soundInfo}>
              <Text style={[styles.soundLabel, { color: Colors.text }]}>Sound Effect</Text>
              <Text style={[styles.soundValue, { color: Colors.textSecondary }]}>{soundLabel}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Display Mode */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Display Mode</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          <ModeOption
            icon="fitness-center"
            label="Simple"
            description="Timer appears in the navigation bar"
            selected={selectedMode === 'simple'}
            onSelect={() => setSelectedMode('simple')}
            Colors={Colors}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <ModeOption
            icon="view-list"
            label="Inline"
            description="Timer displays inline with the sets"
            selected={selectedMode === 'inline'}
            onSelect={() => setSelectedMode('inline')}
            Colors={Colors}
          />
        </View>

        {/* Spacer for save button */}
        {hasChanges && <View style={{ height: 80 }} />}
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.saveButtonContainer, { backgroundColor: Colors.background + 'EE' }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors.primary }]}
            onPress={saveSettings}
            activeOpacity={activeOpacity.button}>
            <Text style={[styles.saveButtonText, { color: Colors.background }]}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sound Selection Modal */}
      <Modal
        visible={soundModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSoundModalVisible(false)}>
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
          onPress={() => setSoundModalVisible(false)}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors.card, borderColor: Colors.border, shadowColor: Colors.shadow },
            ]}>
            <Text style={[styles.modalTitle, { color: Colors.text }]}>Select Sound</Text>
            <View style={styles.soundList}>
              {SOUND_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.soundOption,
                    selectedSound === option.id && {
                      backgroundColor: Colors.primary + '15',
                      borderColor: Colors.primary,
                    },
                  ]}
                  onPress={() => {
                    setSelectedSound(option.id);
                    if (option.id !== 'none') {
                      playAlertSound(option.id);
                    }
                  }}
                  activeOpacity={activeOpacity.row}>
                  <Text
                    style={[
                      styles.soundOptionText,
                      { color: Colors.text },
                      selectedSound === option.id && { color: Colors.primary, fontWeight: '700' },
                    ]}>
                    {option.label}
                  </Text>
                  {selectedSound === option.id && (
                    <MaterialIcons name="check" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: Colors.primary }]}
              onPress={() => setSoundModalVisible(false)}
              activeOpacity={activeOpacity.button}>
              <Text style={[styles.modalCloseText, { color: Colors.background }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ModeOption({
  icon,
  label,
  description,
  selected,
  onSelect,
  Colors,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  Colors: ReturnType<typeof useTheme>;
}) {
  return (
    <TouchableOpacity style={styles.modeRow} onPress={onSelect} activeOpacity={activeOpacity.row}>
      <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '18' }]}>
        <MaterialIcons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.modeInfo}>
        <Text style={[styles.modeLabel, { color: Colors.text }]}>{label}</Text>
        <Text style={[styles.modeDesc, { color: Colors.textSecondary }]}>{description}</Text>
      </View>
      <View
        style={[
          styles.radioCircle,
          {
            borderColor: selected ? Colors.primary : Colors.border,
            backgroundColor: selected ? Colors.primary : 'transparent',
          },
        ]}>
        {selected && <MaterialIcons name="check" size={14} color={Colors.background} />}
      </View>
    </TouchableOpacity>
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
    fontWeight: '500',
    marginLeft: -spacing.xs,
  },
  pageTitle: {
    fontSize: typography['3xl'],
    fontWeight: 'bold',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xs,
    fontWeight: '600',
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
  cardLabel: {
    fontSize: typography.base,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  inputGroup: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeInput: {
    width: 88,
    height: 60,
    borderRadius: radius.lg,
    borderWidth: 1,
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeUnit: {
    fontSize: typography.sm,
  },
  colon: {
    fontSize: typography['2xl'],
    fontWeight: 'bold',
    marginTop: -spacing.md,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  soundInfo: {
    flex: 1,
  },
  soundLabel: {
    fontSize: typography.lg,
    fontWeight: '600',
  },
  soundValue: {
    fontSize: typography.sm,
    marginTop: 2,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: typography.lg,
    fontWeight: '600',
  },
  modeDesc: {
    fontSize: typography.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    marginLeft: 60,
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
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 0,
  },
  modalContent: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.xl,
    borderTopWidth: 1,
    paddingBottom: spacing['3xl'],
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  soundList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: touch.minHeight,
  },
  soundOptionText: {
    fontSize: typography.lg,
  },
  modalCloseButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    minHeight: touch.minHeight,
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
});
