import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { apiClient } from '../api/client';
import { supabase } from '../supabase/client';
import { getFirebaseMessaging, type RemoteMessage } from './messaging';

export interface RegisterDeviceResponse {
  id: number;
  userId: string;
  token: string;
  createdAt: string;
  lastUsedAt: string;
}

export async function initializeNotifications(p0: { userId: string; }): Promise<null | RegisterDeviceResponse> {
  try {
    const messaging = getFirebaseMessaging();

    if (!messaging) {
      return null;
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return null;
    }

    const token = await messaging().getToken();

    return await registerDevice(token);
  } catch (error) {
    return null;
  }
}

// userId-nya diambil backend dari JWT, jadi gak usah dikirim dari sini
async function registerDevice(
  deviceToken: string,
): Promise<RegisterDeviceResponse> {
  return apiClient.post<RegisterDeviceResponse>(
    '/notifications/register-device',
    { deviceToken },
  );
}

/**
 * Lepasin device ini dari user yg lagi login. WAJIB dipanggil sebelum
 * supabase.auth.signOut() — butuh JWT yg masih hidup. Kalau dilewat, baris
 * token-nya masih nunjuk user lama dan reminder jadwal dia terus masuk ke HP
 * ini walaupun yg login udah ganti orang.
 */
export async function unregisterDevice(): Promise<void> {
  try {
    const deviceToken = await messaging().getToken();
    await apiClient.post('/notifications/unregister-device', { deviceToken });
  } catch (error) {
    console.warn('[Notifications] gagal lepas device token pas logout:', error);
  }
}

export function setupNotificationListeners() {
  const messaging = getFirebaseMessaging();

  if (!messaging) {
    return () => {};
  }

  // Handle foreground messages
  const unsubscribeForeground = messaging().onMessage(
    async (remoteMessage: RemoteMessage) => {
      console.log('Foreground notification:', remoteMessage);
    },
  );

  // Handle background messages
  messaging().onNotificationOpenedApp(
    (remoteMessage: RemoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
    },
  );

  // Handle notification that opened the app from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage: RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('App opened from quit by notification:', remoteMessage);
      }
    })
    .catch((error: Error) => {
      console.error('Error getting initial notification:', error);
    });

  // Handle token refresh — daftarin ulang token baru ke backend
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // tanpa session, token barunya bakal nyantol ke user yg salah
      if (session) {
        await registerDevice(token);
      }
    } catch (error) {
      console.error('Failed to re-register refreshed FCM token:', error);
    }
  });

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
}
