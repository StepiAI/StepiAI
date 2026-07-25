import { useCallback, useEffect, useState } from 'react';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type LocationPermissionStatus = | 'unknown' | 'granted' | 'denied' | 'blocked' | 'unavailable';

const ANDROID_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
];

export function interpretPermissionResults(results: Record<string, string>,): LocationPermissionStatus {
  const values = Object.values(results);
  if (values.includes('granted')) return 'granted';

  if (values.includes('never_ask_again')) return 'blocked';

  return 'denied';
}

export function useLocationPermission() {
  const [status, setStatus] = useState<LocationPermissionStatus>(
    Platform.OS === 'android' || Platform.OS === 'ios' ? 'unknown' : 'unavailable',
  );
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let active = true;

    (async () => {
      try {
        const checks = await Promise.all(
          ANDROID_PERMISSIONS.map(permission => PermissionsAndroid.check(permission)),
        );

        if (active && checks.some(Boolean)) setStatus('granted');
      } catch (error) {
        console.warn('[Location] gagal ngecek izin:', error);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const request = useCallback(async () => {
    // iOS: requestAuthorization munculin prompt OS kalau belum pernah ditanya.
    // Kalau user udah pernah nolak, iOS gak bakal nanya lagi — error callback
    // kepanggil, statusnya kita set 'blocked' biar tombolnya jadi "Open
    // Settings" (satu-satunya jalan ngaktifin lagi di iOS).
    if (Platform.OS === 'ios') {
      setRequesting(true);

      return new Promise<LocationPermissionStatus>(resolve => {
        Geolocation.requestAuthorization(
          () => {
            setStatus('granted');
            setRequesting(false);
            resolve('granted');
          },
          error => {
            console.warn('[Location] izin iOS ditolak:', error?.message);
            setStatus('blocked');
            setRequesting(false);
            resolve('blocked');
          },
        );
      });
    }

    if (Platform.OS !== 'android') return 'unavailable' as const;

    setRequesting(true);

    try {
      const results = await PermissionsAndroid.requestMultiple(ANDROID_PERMISSIONS);
      const next = interpretPermissionResults(results);

      setStatus(next);
      return next;
    } catch (error) {
      console.warn('[Location] gagal minta izin:', error);
      setStatus('denied');
      return 'denied' as const;
    } finally {
      setRequesting(false);
    }
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(error =>
      console.warn('[Location] gagal buka Settings:', error),
    );
  }, []);

  return { status, requesting, request, openSettings };
}
