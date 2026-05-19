/**
 * PLATFORM UTILS
 * Helpers for branching logic between native (iOS/Android) and web.
 */

import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS !== 'web';
