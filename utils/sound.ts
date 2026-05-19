/**
 * SOUND UTIL
 * Plays rest timer alert sounds.
 * On native: uses expo-av.
 * On web: uses HTML5 Audio API.
 */

import { Platform } from 'react-native';

let Audio: any;
let AVPlaybackStatus: any;

// Lazy-load expo-av only on native
if (Platform.OS !== 'web') {
  const expoAv = require('expo-av');
  Audio = expoAv.Audio;
  AVPlaybackStatus = expoAv.AVPlaybackStatus;
}

let audioModeConfigured = false;

/** Ensure audio session is configured for playback (native only) */
async function ensureAudioMode() {
  if (Platform.OS === 'web') return;
  if (audioModeConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioModeConfigured = true;
  } catch (err) {
    console.warn('Audio mode config failed:', err);
  }
}

/** Keep sounds alive until they finish playing */
const activeSounds = new Set<any>();

export const SOUND_OPTIONS = [
  { id: 'boxing-bell', label: 'Boxing Bell' },
  { id: 'double-gong', label: 'Double Gong' },
  { id: 'short-bell', label: 'Short Bell' },
  { id: 'long-bell', label: 'Long Bell' },
  { id: 'iron-plates', label: 'Iron Plates' },
  { id: 'tri-tone', label: 'Tri Tone' },
  { id: 'none', label: 'None' },
] as const;

export type SoundEffectId = (typeof SOUND_OPTIONS)[number]['id'];

/** Play a simple beep using HTML5 Audio (web) */
function playWebBeep(rate: number = 1.0) {
  try {
    const audio = new Audio('/sounds/beep.wav');
    audio.playbackRate = rate;
    audio.play().catch(() => {});
  } catch {
    // Web audio not supported — silently fail
  }
}

/** Preload and play the selected alert sound */
export async function playAlertSound(soundId: string) {
  if (soundId === 'none') return;

  // Web fallback — simple HTML5 Audio
  if (Platform.OS === 'web') {
    switch (soundId) {
      case 'boxing-bell':
        playWebBeep(1.5);
        break;
      case 'double-gong':
        playWebBeep(0.7);
        setTimeout(() => playWebBeep(0.7), 400);
        break;
      case 'short-bell':
        playWebBeep(2.0);
        break;
      case 'long-bell':
        playWebBeep(0.6);
        break;
      case 'iron-plates':
        playWebBeep(0.4);
        break;
      case 'tri-tone':
        playWebBeep(1.2);
        setTimeout(() => playWebBeep(1.6), 200);
        setTimeout(() => playWebBeep(2.0), 400);
        break;
      default:
        playWebBeep(1.0);
    }
    return;
  }

  // Native — use expo-av
  await ensureAudioMode();

  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/beep.wav'),
      { shouldPlay: false, volume: 1.0 }
    );

    activeSounds.add(sound);

    sound.setOnPlaybackStatusUpdate((status: typeof AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        activeSounds.delete(sound);
        sound.unloadAsync().catch(() => {});
      }
    });

    const safetyTimeout = setTimeout(() => {
      activeSounds.delete(sound);
      sound.unloadAsync().catch(() => {});
    }, 5000);

    const cleanup = () => clearTimeout(safetyTimeout);

    switch (soundId) {
      case 'boxing-bell':
        await sound.setRateAsync(1.5, false);
        await sound.playAsync();
        break;

      case 'double-gong': {
        await sound.setRateAsync(0.7, false);
        await sound.playAsync();
        const secondPlay = setTimeout(async () => {
          if (activeSounds.has(sound)) {
            await sound.replayAsync();
          }
        }, 400);
        setTimeout(() => clearTimeout(secondPlay), 3000);
        break;
      }

      case 'short-bell':
        await sound.setRateAsync(2.0, false);
        await sound.playAsync();
        setTimeout(() => {
          if (activeSounds.has(sound)) {
            sound.stopAsync().catch(() => {});
          }
        }, 150);
        break;

      case 'long-bell':
        await sound.setRateAsync(0.6, false);
        await sound.playAsync();
        break;

      case 'iron-plates':
        await sound.setRateAsync(0.4, false);
        await sound.playAsync();
        break;

      case 'tri-tone': {
        await sound.setRateAsync(1.2, false);
        await sound.playAsync();
        const tone2 = setTimeout(async () => {
          if (activeSounds.has(sound)) {
            await sound.setRateAsync(1.6, false);
            await sound.replayAsync();
          }
        }, 200);
        const tone3 = setTimeout(async () => {
          if (activeSounds.has(sound)) {
            await sound.setRateAsync(2.0, false);
            await sound.replayAsync();
          }
        }, 400);
        setTimeout(() => {
          clearTimeout(tone2);
          clearTimeout(tone3);
        }, 3000);
        break;
      }

      default:
        await sound.setRateAsync(1.0, false);
        await sound.playAsync();
    }

    cleanup();
  } catch (err) {
    console.warn('Sound playback failed:', err);
  }
}
