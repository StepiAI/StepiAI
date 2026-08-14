import { useState } from 'react';
import type { TextStyle } from 'react-native';
import { act, create } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AccessibilitySettingsProvider,
  useAccessibilitySettings,
} from '../../accessibility/AccessibilitySettingsContext';
import { textStyle, useTextStyle } from '../typography';

let lastStyle: TextStyle | null = null;
let lastMountId = 0;
let setSetting: ((key: 'boldText', value: boolean) => void) | null = null;

let mountCounter = 0;

function Probe() {
  const resolveStyle = useTextStyle();
  const settings = useAccessibilitySettings();
  // cuma naik pas komponen di-MOUNT, bukan tiap render — dipake buat mastiin
  // toggle-nya bikin re-render, bukan remount (remount = state user ilang)
  const [mountId] = useState(() => ++mountCounter);

  lastStyle = resolveStyle('regular');
  lastMountId = mountId;
  setSetting = settings.setSetting;

  return null;
}

async function renderProbe() {
  await act(async () => {
    create(
      <AccessibilitySettingsProvider>
        <Probe />
      </AccessibilitySettingsProvider>,
    );
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mountCounter = 0;
  lastStyle = null;
  setSetting = null;
});

describe('useTextStyle', () => {
  it('default-nya sama persis kayak textStyle biasa', async () => {
    await renderProbe();

    expect(lastStyle).toEqual(textStyle('regular'));
  });

  it('dorong weight mentok ke bold pas Bold Text dinyalain', async () => {
    await renderProbe();

    await act(async () => {
      setSetting?.('boldText', true);
    });

    expect(lastStyle).toEqual(textStyle('bold'));
    expect(lastStyle).not.toEqual(textStyle('regular'));
  });

  it('nyalain Bold Text cuma re-render, gak remount (state komponen aman)', async () => {
    await renderProbe();
    const mountIdBefore = lastMountId;

    await act(async () => {
      setSetting?.('boldText', true);
    });

    expect(lastMountId).toBe(mountIdBefore);
    expect(mountCounter).toBe(1);
  });

  it('ikut nilai yg udah kesimpen pas app dibuka', async () => {
    await AsyncStorage.setItem(
      'stepi.accessibility.v1',
      JSON.stringify({ boldText: true }),
    );

    await renderProbe();

    expect(lastStyle).toEqual(textStyle('bold'));
  });
});
