import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  readAccessibilitySettings,
  saveAccessibilitySettings,
} from '../storage';

const SETTINGS_KEY = 'stepi.accessibility.v1';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('readAccessibilitySettings', () => {
  it('balikin default kalau belum pernah nyimpen', async () => {
    await expect(readAccessibilitySettings()).resolves.toEqual(
      DEFAULT_ACCESSIBILITY_SETTINGS,
    );
  });

  it('baca balik nilai yg udah disimpen', async () => {
    await saveAccessibilitySettings({ boldText: true, increaseContrast: true });

    await expect(readAccessibilitySettings()).resolves.toEqual({
      boldText: true,
      increaseContrast: true,
    });
  });

  it('key toggle yg udah dibuang diabaikan, gak bikin read-nya gagal', async () => {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        boldText: true,
        autoBrightness: true,
        colorFilters: true,
      }),
    );

    await expect(readAccessibilitySettings()).resolves.toEqual({
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      boldText: true,
    });
  });

  it('key yg belum ada di data lama diisi default (jd gak perlu migrasi)', async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({}));

    await expect(readAccessibilitySettings()).resolves.toEqual(
      DEFAULT_ACCESSIBILITY_SETTINGS,
    );
  });

  it('nilai non-boolean diabaikan, gak bikin switch-nya "truthy"', async () => {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ boldText: 'yes' }),
    );

    await expect(readAccessibilitySettings()).resolves.toEqual(
      DEFAULT_ACCESSIBILITY_SETTINGS,
    );
  });

  it('balikin default kalau isinya bukan object', async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(['bold']));

    await expect(readAccessibilitySettings()).resolves.toEqual(
      DEFAULT_ACCESSIBILITY_SETTINGS,
    );
  });

  it('balikin default (bukan throw) kalau JSON-nya rusak', async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, '{rusak');

    await expect(readAccessibilitySettings()).resolves.toEqual(
      DEFAULT_ACCESSIBILITY_SETTINGS,
    );
  });
});
