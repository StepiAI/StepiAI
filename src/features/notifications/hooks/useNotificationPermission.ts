import { useCallback, useEffect, useState } from 'react';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { initializeNotifications } from '../../../services/notifications/client';

export type NotificationPermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied' // belum diizinin, tapi masih bisa diminta lagi
  | 'blocked'; // ditolak permanen -> cuma bisa dinyalain lewat Settings

const androidNeedsRuntimePermission =
  Platform.OS === 'android' && Number(Platform.Version) >= 33;

function interpretIos(authStatus: number): NotificationPermissionStatus {
  switch (authStatus) {
    case messaging.AuthorizationStatus.AUTHORIZED:
    case messaging.AuthorizationStatus.PROVISIONAL:
      return 'granted';
    case messaging.AuthorizationStatus.DENIED:
      return 'blocked'; // iOS ga bisa re-prompt, harus ke Settings
    default:
      return 'denied'; // NOT_DETERMINED
  }
}

// Cek status izin notifikasi sekarang + kasih fungsi buat minta izinnya.
// userId cuma penanda "udah login" — device token-nya didaftarin backend ke
// user yg ada di JWT, bukan ke userId yg dikirim dari sini.
export function useNotificationPermission(userId?: string) {
  const [status, setStatus] = useState<NotificationPermissionStatus>('unknown');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        if (androidNeedsRuntimePermission) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          // dari check doang belum bisa bedain denied vs blocked; anggap
          // 'denied' dulu, baru ketauan pas user nyoba nyalain.
          if (active) setStatus(granted ? 'granted' : 'denied');
          return;
        }

        if (Platform.OS === 'ios') {
          const authStatus = await messaging().hasPermission();
          if (active) setStatus(interpretIos(authStatus));
          return;
        }

        // Android < 13: notifikasi otomatis nyala
        if (active) setStatus('granted');
      } catch {
        // biarin 'unknown' — banner-nya ga akan maksa muncul
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const request = useCallback(async (): Promise<NotificationPermissionStatus> => {
    if (!userId) return status;

    setRequesting(true);
    try {
      if (androidNeedsRuntimePermission) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setStatus('blocked');
          return 'blocked';
        }
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          setStatus('denied');
          return 'denied';
        }
      }

      // izin OS udah oke (atau iOS/legacy) -> minta token & daftarin device
      const registration = await initializeNotifications();

      if (Platform.OS === 'ios') {
        const next = interpretIos(await messaging().hasPermission());
        setStatus(next);
        return next;
      }

      const next: NotificationPermissionStatus = registration
        ? 'granted'
        : 'denied';
      setStatus(next);
      return next;
    } catch {
      setStatus('denied');
      return 'denied';
    } finally {
      setRequesting(false);
    }
  }, [userId, status]);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      // no-op: kalau gagal buka Settings, biarin aja
    });
  }, []);

  return { status, requesting, request, openSettings };
}
