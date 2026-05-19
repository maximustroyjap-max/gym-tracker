/**
 * BODY MEASUREMENTS SCREEN — Premium Redesign
 * Lets the user input their body stats with a polished form UI.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, touch, activeOpacity } from '@/constants/design';

export default function BodyMeasurementsScreen() {
  const Colors = useTheme();
  const { user, updateUser } = useUser();
  const bm = user.bodyMeasurements;

  const [heightCm, setHeightCm] = useState(bm.heightCm > 0 ? bm.heightCm.toString() : '');
  const [weightKg, setWeightKg] = useState(bm.weightKg > 0 ? bm.weightKg.toString() : '');
  const [age, setAge] = useState(bm.age > 0 ? bm.age.toString() : '');
  const [gender, setGender] = useState<'male' | 'female'>(bm.gender);
  const [bodyFat, setBodyFat] = useState(
    bm.bodyFatPercent && bm.bodyFatPercent > 0 ? bm.bodyFatPercent.toString() : ''
  );
  const [neckCm, setNeckCm] = useState(bm.neckCm && bm.neckCm > 0 ? bm.neckCm.toString() : '');
  const [waistCm, setWaistCm] = useState(bm.waistCm && bm.waistCm > 0 ? bm.waistCm.toString() : '');
  const [hipsCm, setHipsCm] = useState(bm.hipsCm && bm.hipsCm > 0 ? bm.hipsCm.toString() : '');

  const hasChanges =
    parseFloat(heightCm || '0') !== bm.heightCm ||
    parseFloat(weightKg || '0') !== bm.weightKg ||
    parseInt(age || '0', 10) !== bm.age ||
    gender !== bm.gender ||
    parseFloat(bodyFat || '0') !== (bm.bodyFatPercent || 0) ||
    parseFloat(neckCm || '0') !== (bm.neckCm || 0) ||
    parseFloat(waistCm || '0') !== (bm.waistCm || 0) ||
    parseFloat(hipsCm || '0') !== (bm.hipsCm || 0);

  const calculations = useMemo(() => {
    const h = parseFloat(heightCm || '0');
    const w = parseFloat(weightKg || '0');
    if (h <= 0 || w <= 0) return null;

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    const recommendedWeight = 22 * heightM * heightM;
    const minHealthy = 18.5 * heightM * heightM;
    const maxHealthy = 25 * heightM * heightM;

    let suggestion = '';
    let suggestionTitle = '';
    let suggestionIcon: keyof typeof MaterialIcons.glyphMap = 'fitness-center';
    let statusColor = Colors.primary;

    if (bmi < 18.5) {
      suggestionTitle = 'Bulk Up Focus';
      suggestion =
        'You are on the lighter side — a great starting point for building muscle! Focus on eating more calories (especially protein) and lift heavy weights with fewer reps.';
      suggestionIcon = 'restaurant';
      statusColor = Colors.secondary;
    } else if (bmi <= 25) {
      suggestionTitle = 'Lean Muscle Builder';
      suggestion =
        'You are in a healthy weight range — perfect for building lean muscle! Focus on progressive overload: add a little more weight or do one more rep each week.';
      suggestionIcon = 'trending-up';
      statusColor = Colors.primary;
    } else {
      suggestionTitle = 'Strength & Recomposition';
      suggestion =
        'You are carrying extra weight — that is actually energy your body can use to build muscle! Focus on big compound exercises: squats, deadlifts, bench press.';
      suggestionIcon = 'sync';
      statusColor = Colors.secondary;
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      recommendedWeight: Math.round(recommendedWeight * 10) / 10,
      minHealthy: Math.round(minHealthy * 10) / 10,
      maxHealthy: Math.round(maxHealthy * 10) / 10,
      suggestionTitle,
      suggestion,
      suggestionIcon,
      statusColor,
    };
  }, [heightCm, weightKg, Colors]);

  const saveMeasurements = useCallback(() => {
    const h = Math.max(50, Math.min(300, parseFloat(heightCm || '0')));
    const w = Math.max(20, Math.min(500, parseFloat(weightKg || '0')));
    const a = Math.max(10, Math.min(120, parseInt(age || '0', 10)));

    updateUser({
      bodyMeasurements: {
        heightCm: h || bm.heightCm,
        weightKg: w || bm.weightKg,
        age: a || bm.age,
        gender,
        bodyFatPercent: bodyFat ? parseFloat(bodyFat) : undefined,
        neckCm: neckCm ? parseFloat(neckCm) : undefined,
        waistCm: waistCm ? parseFloat(waistCm) : undefined,
        hipsCm: hipsCm ? parseFloat(hipsCm) : undefined,
      },
    });
    router.back();
  }, [heightCm, weightKg, age, gender, bodyFat, neckCm, waistCm, hipsCm, updateUser, bm]);

  const renderInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    unit: string,
    placeholder: string
  ) => (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>{label}</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={[
            styles.numberInput,
            { backgroundColor: Colors.background, color: Colors.text, borderColor: Colors.border },
          ]}
          value={value}
          onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, '').replace(/(\.\.*)\. /g, '$1'))}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          maxLength={6}
        />
        <Text style={[styles.unitLabel, { color: Colors.textSecondary }]}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Body Measurements', headerShown: false }} />

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
            <MaterialIcons name="chevron-left" size={28} color={Colors.primary} />
            <Text style={[styles.backText, { color: Colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <Text style={[styles.pageTitle, { color: Colors.text }]}>Body Measurements</Text>

        {/* Core Stats */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Core Stats</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          {renderInput('Height', heightCm, setHeightCm, 'cm', '175')}
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          {renderInput('Weight', weightKg, setWeightKg, 'kg', '70')}
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          {renderInput('Age', age, setAge, 'years', '25')}
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>Gender</Text>
            <View style={styles.genderRow}>
              {(['male', 'female'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderChip,
                    {
                      backgroundColor: gender === g ? Colors.primary + '15' : Colors.background,
                      borderColor: gender === g ? Colors.primary : Colors.border,
                      borderWidth: gender === g ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={activeOpacity.button}>
                  <Text
                    style={[
                      styles.genderChipText,
                      { color: gender === g ? Colors.primary : Colors.textSecondary },
                    ]}>
                    {g === 'male' ? 'Male' : 'Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Optional Measurements */}
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Optional</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
            },
          ]}>
          {renderInput('Body Fat %', bodyFat, setBodyFat, '%', '15')}
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          {renderInput('Neck', neckCm, setNeckCm, 'cm', '38')}
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          {renderInput('Waist', waistCm, setWaistCm, 'cm', '80')}
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          {renderInput('Hips', hipsCm, setHipsCm, 'cm', '95')}
        </View>

        {/* Analysis */}
        {calculations && (
          <>
            <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Analysis</Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                  shadowColor: Colors.shadow,
                },
              ]}>
              {/* BMI Row */}
              <View style={styles.calcRow}>
                <Text style={[styles.calcLabel, { color: Colors.textSecondary }]}>Your BMI</Text>
                <View style={styles.calcValueBox}>
                  <Text style={[styles.calcValue, { color: Colors.text }]}>{calculations.bmi}</Text>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: calculations.statusColor },
                    ]}
                  />
                </View>
              </View>

              {/* Recommended Weight */}
              <View style={[styles.calcRow, { marginTop: spacing.md }]}>
                <Text style={[styles.calcLabel, { color: Colors.textSecondary }]}>
                  Recommended Weight
                </Text>
                <Text style={[styles.calcValue, { color: Colors.primary }]}>
                  {calculations.recommendedWeight} kg
                </Text>
              </View>
              <Text style={[styles.calcSubtext, { color: Colors.textSecondary }]}>
                Healthy range: {calculations.minHealthy} - {calculations.maxHealthy} kg
              </Text>

              {/* Suggestion Card */}
              <View
                style={[
                  styles.suggestionBox,
                  { backgroundColor: Colors.background, borderColor: Colors.border },
                ]}>
                <View style={styles.suggestionHeader}>
                  <View
                    style={[
                      styles.suggestionIcon,
                      { backgroundColor: calculations.statusColor + '18' },
                    ]}>
                    <MaterialIcons
                      name={calculations.suggestionIcon}
                      size={20}
                      color={calculations.statusColor}
                    />
                  </View>
                  <Text style={[styles.suggestionTitle, { color: Colors.text }]}>
                    {calculations.suggestionTitle}
                  </Text>
                </View>
                <Text style={[styles.suggestionText, { color: Colors.textSecondary }]}>
                  {calculations.suggestion}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Spacer for save button */}
        {hasChanges && <View style={{ height: 80 }} />}
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.saveButtonContainer, { backgroundColor: Colors.background + 'EE' }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors.primary }]}
            onPress={saveMeasurements}
            activeOpacity={activeOpacity.button}>
            <Text style={[styles.saveButtonText, { color: Colors.background }]}>
              Save Measurements
            </Text>
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
    paddingVertical: spacing.xs,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: {
    height: 1,
    marginLeft: spacing.lg,
    marginRight: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  inputLabel: {
    fontSize: typography.lg,
    fontWeight: '500',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  numberInput: {
    width: 88,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: typography.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  unitLabel: {
    fontSize: typography.base,
    width: 40,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minHeight: 44,
    justifyContent: 'center',
  },
  genderChipText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  calcLabel: {
    fontSize: typography.base,
    fontWeight: '500',
  },
  calcValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  calcValue: {
    fontSize: typography.xl,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  calcSubtext: {
    fontSize: typography.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  suggestionBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  suggestionIcon: {
    width: touch.iconContainer,
    height: touch.iconContainer,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  suggestionTitle: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  suggestionText: {
    fontSize: typography.base,
    lineHeight: 20,
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
});
