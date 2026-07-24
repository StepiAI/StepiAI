import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'stepi.accessibility.v1';

export interface AccessibilitySettings {
  boldText: boolean;
  increaseContrast: boolean;
}

export type AccessibilitySettingKey = keyof AccessibilitySettings;

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  boldText: false,
  increaseContrast: false,
};

const SETTING_KEYS = Object.keys(
  DEFAULT_ACCESSIBILITY_SETTINGS,
) as AccessibilitySettingKey[];

function pickKnownSettings(value: Record<string, unknown>): AccessibilitySettings {
  const result = { ...DEFAULT_ACCESSIBILITY_SETTINGS };

  for (const key of SETTING_KEYS) {
    if (typeof value[key] === 'boolean') {
      result[key] = value[key];
    }
  }

  return result;
}

export async function readAccessibilitySettings(): Promise<AccessibilitySettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_ACCESSIBILITY_SETTINGS;

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }

    return pickKnownSettings(parsed as Record<string, unknown>);
  } catch (error) {
    console.warn('[Accessibility] gagal baca setting:', error);
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

export async function saveAccessibilitySettings(settings: AccessibilitySettings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[Accessibility] gagal nyimpen setting:', error);
  }
}
