import { useState } from 'react';
import { act, create } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AccessibilitySettingsProvider,
  useAccessibilitySettings,
} from '../AccessibilitySettingsContext';
import { ContrastTheme, contrastVars } from '../ContrastTheme';

// rasio kontras WCAG 2.1
function luminance(hex: string) {
  const channels = [1, 3, 5]
    .map(i => parseInt(hex.substr(i, 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const SHEET = '#FFFFFF';
const CANVAS = '#F2F2F7';

let setSetting: ((key: 'increaseContrast', value: boolean) => void) | null =
  null;
let lastMountId = 0;
let mountCounter = 0;

function Probe() {
  const settings = useAccessibilitySettings();
  // cuma naik pas MOUNT — buat mastiin toggle bikin re-render, bukan remount
  const [mountId] = useState(() => ++mountCounter);

  setSetting = settings.setSetting;
  lastMountId = mountId;

  return null;
}

let root: ReturnType<typeof create>;

async function renderTree() {
  await act(async () => {
    root = create(
      <AccessibilitySettingsProvider>
        <ContrastTheme>
          <Probe />
        </ContrastTheme>
      </AccessibilitySettingsProvider>,
    );
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mountCounter = 0;
  setSetting = null;
});

describe('contrastVars', () => {
  it('milih palet sesuai toggle', () => {
    expect(contrastVars(true)).not.toEqual(contrastVars(false));
  });

  it('kedua palet punya key yg sama persis (gak ada variabel yg bolong)', () => {
    // kalau HIGH kelewatan satu key, token itu nyangkut di nilai normal pas
    // toggle nyala — belang & susah dilacak
    expect(Object.keys(contrastVars(true)).sort()).toEqual(
      Object.keys(contrastVars(false)).sort(),
    );
  });

  it('token teks di palet high-contrast lulus WCAG AA (4.5:1)', () => {
    const high = contrastVars(true);
    // line & rule itu pemisah, bukan teks — gak kena ambang 4.5:1.
    // disabled sengaja dibiarin pudar (WCAG ngecualiin kontrol nonaktif).
    const textTokens = [
      '--color-muted',
      '--color-faint',
      '--color-hint',
      '--color-accent',
    ] as const;

    for (const token of textTokens) {
      const color = high[token];

      expect({
        token,
        sheet: Number(contrastRatio(color, SHEET).toFixed(2)),
        canvas: Number(contrastRatio(color, CANVAS).toFixed(2)),
      }).toEqual({
        token,
        sheet: expect.any(Number),
        canvas: expect.any(Number),
      });

      expect(contrastRatio(color, SHEET)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(color, CANVAS)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('high-contrast selalu lebih gelap dari normal', () => {
    const [normal, high] = [contrastVars(false), contrastVars(true)];

    for (const token of Object.keys(normal) as (keyof typeof normal)[]) {
      expect(luminance(high[token])).toBeLessThan(luminance(normal[token]));
    }
  });
});

describe('ContrastTheme', () => {
  it('nyalain Increase Contrast cuma re-render, gak remount', async () => {
    await renderTree();
    const mountIdBefore = lastMountId;

    await act(async () => {
      setSetting?.('increaseContrast', true);
    });

    expect(lastMountId).toBe(mountIdBefore);
    expect(mountCounter).toBe(1);
  });

  it('View pembungkusnya tetep ada walau toggle-nya mati', async () => {
    await renderTree();

    // kalau View-nya kondisional, struktur tree berubah tiap toggle -> remount
    expect(root.root.findAllByType('View' as never)).toHaveLength(1);
  });
});
