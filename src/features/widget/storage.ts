import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMPTY_SNAPSHOT, type WidgetSnapshot } from './types';

// technologia terbaik gw, last cache snapshot, jadinya widget bisa di build kapanpun, termasuk pas hp lagi offline, token supabase mati, dll
const SNAPSHOT_KEY = 'stepi.widget.snapshot.v1';

export async function saveWidgetSnapshot(snapshot: WidgetSnapshot) {
  try {
    await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('[Widget] gagal nyimpen snapshot:', error);
  }
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return EMPTY_SNAPSHOT;

    const parsed = JSON.parse(raw) as WidgetSnapshot;

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.upcoming)) {
      return EMPTY_SNAPSHOT;
    }

    return parsed;
  } catch (error) {
    console.warn('[Widget] gagal baca snapshot:', error);
    return EMPTY_SNAPSHOT;
  }
}
