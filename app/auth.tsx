/**
 * AUTH SCREEN — Login / Signup
 *
 * Design inspired by the reference GIF:
 * - Light top area with floating brand logo
 * - Dark form card rises up with smooth rounded top corners
 * - Animated toggle pill between Login / Sign up
 * - Cross-fade form transitions
 * - Underline-style inputs
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing, radius, typography, activeOpacity } from '@/constants/design';

const TOGGLE_W = 280;
const TOGGLE_HALF = TOGGLE_W / 2;
const PILL_W = TOGGLE_HALF - 8;
const PILL_LOGIN_X = 4;
const PILL_SIGNUP_X = TOGGLE_HALF + 4;
const CARD_RADIUS = 36;

/** Mountain/A logo SVG — same as splash screen brand symbol */
function BrandLogo({ size = 64, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path
        d="M256 32 L80 440 L200 440 L256 280 L312 440 L432 440 L256 32ZM256 180 L288 260 L224 260 L256 180Z"
        fill={color}
      />
    </Svg>
  );
}

/** Simple email regex validation */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function AuthScreen() {
  const Colors = useTheme();
  const { login, signup } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState('5');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logo entrance + float animation
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  // Toggle & form animation
  const toggleAnim = useRef(new Animated.Value(isLogin ? 0 : 1)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;

  // Card shadow pulse
  const shadowPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle logo float
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatAnim.start();

    // Subtle shadow pulse on the card edge
    const shadowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shadowPulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shadowPulse, {
          toValue: 0.5,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    shadowAnim.start();

    return () => {
      floatAnim.stop();
      shadowAnim.stop();
    };
  }, []);

  const floatY = logoFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const shadowOpacity = shadowPulse.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.12, 0.22],
  });

  const animateToggle = useCallback((toLogin: boolean) => {
    setError('');
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: toLogin ? 16 : -16,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(toggleAnim, {
        toValue: toLogin ? 0 : 1,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLogin(toLogin);
      setEmail('');
      setPassword('');
      setDisplayName('');
      setWeeklyTarget('5');
      formTranslateY.setValue(toLogin ? -16 : 16);
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [formOpacity, formTranslateY, toggleAnim]);

  const validate = () => {
    setError('');
    if (!email.trim()) return 'Email is required';
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!isLogin) {
      if (!displayName.trim()) return 'Display name is required';
      if (displayName.trim().length < 2) return 'Display name must be at least 2 characters';
      const target = parseInt(weeklyTarget, 10);
      if (isNaN(target) || target < 1 || target > 21) {
        return 'Please enter a realistic weekly target (1-21)';
      }
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const success = await login(email.trim().toLowerCase(), password);
        if (!success) {
          setError('Invalid email or password');
        }
      } else {
        const targetNum = parseInt(weeklyTarget, 10) || 5;
        const success = await signup(
          email.trim().toLowerCase(),
          password,
          displayName.trim(),
          targetNum
        );
        if (!success) {
          setError('Could not create account. This email may already be registered.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pillTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PILL_LOGIN_X, PILL_SIGNUP_X],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.card }]} edges={['top']}>
      <StatusBar style={Colors.background === '#0F0F0F' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* ── Branding Area ── */}
          <View style={styles.brandingArea}>
            <Animated.View
              style={[
                styles.branding,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }, { translateY: floatY }],
                },
              ]}>
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: Colors.primary + '18' },
                ]}>
                <BrandLogo size={56} color={Colors.primary} />
              </View>
              <Text style={[styles.appName, { color: Colors.text }]}>
                ASCENT
              </Text>
              <Text style={[styles.appTagline, { color: Colors.textSecondary }]}>
                Level Up Your Fitness
              </Text>
            </Animated.View>
          </View>

          {/* ── Form Card ── */}
          <Animated.View
            style={[
              styles.formCard,
              {
                backgroundColor: Colors.background,
                borderTopLeftRadius: CARD_RADIUS,
                borderTopRightRadius: CARD_RADIUS,
                shadowColor: Colors.shadow,
                shadowOpacity: shadowOpacity,
              },
            ]}>
            <View style={styles.formInner}>
              {/* Toggle Pill */}
              <View style={[styles.toggleContainer, { backgroundColor: Colors.border + '99' }]}>
                <Animated.View
                  style={[
                    styles.togglePill,
                    {
                      backgroundColor: Colors.card,
                      transform: [{ translateX: pillTranslateX }],
                      shadowColor: Colors.shadow,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => animateToggle(true)}
                  activeOpacity={1}>
                  <Text
                    style={[
                      styles.toggleText,
                      { color: isLogin ? Colors.text : Colors.textSecondary },
                    ]}>
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => animateToggle(false)}
                  activeOpacity={1}>
                  <Text
                    style={[
                      styles.toggleText,
                      { color: !isLogin ? Colors.text : Colors.textSecondary },
                    ]}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <Animated.View
                style={[
                  styles.formFields,
                  {
                    opacity: formOpacity,
                    transform: [{ translateY: formTranslateY }],
                  },
                ]}>
                {!isLogin && (
                  <InputField
                    label="Display Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    Colors={Colors}
                  />
                )}

                <InputField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  Colors={Colors}
                />
                <InputField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  Colors={Colors}
                />

                {!isLogin && (
                  <InputField
                    label="How many workouts is your target per week?"
                    value={weeklyTarget}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, '');
                      setWeeklyTarget(num);
                    }}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    Colors={Colors}
                  />
                )}

                {error ? (
                  <Text style={[styles.errorText, { color: Colors.secondary }]}>
                    {error}
                  </Text>
                ) : null}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: Colors.primary },
                    isSubmitting && { opacity: 0.7 },
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={activeOpacity.button}
                  disabled={isSubmitting}>
                  <Text style={[styles.submitButtonText, { color: Colors.background }]}>
                    {isSubmitting
                      ? 'Please wait...'
                      : isLogin
                      ? 'Login'
                      : 'Sign up'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Reusable underline input field */
function InputField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  Colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  Colors: ReturnType<typeof useTheme>;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: Colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: Colors.text,
            borderBottomColor: isFocused ? Colors.primary : Colors.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={Colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  brandingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    minHeight: 200,
  },
  branding: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  appTagline: {
    fontSize: typography.sm,
    marginTop: spacing.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  formCard: {
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 20,
    elevation: 10,
  },
  formInner: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  toggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: TOGGLE_W,
    height: 44,
    borderRadius: radius.full,
    position: 'relative',
    marginBottom: spacing['2xl'],
  },
  togglePill: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: PILL_W,
    height: 36,
    borderRadius: radius.full,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  formFields: {
    gap: spacing.lg,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  input: {
    fontSize: typography.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 44,
  },
  errorText: {
    fontSize: typography.sm,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  submitButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: typography.lg,
    fontWeight: 'bold',
  },
});
