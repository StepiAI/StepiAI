import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';
import { supabase } from '../supabase/client';

export interface InitializeNotificationsRequest {
  userId: string;
}

interface RegisterDeviceRequest extends InitializeNotificationsRequest {
  deviceToken: string;
}

export interface RegisterDeviceResponse {
  id: number;
  userId: string;
  token: string;
  createdAt: string;
  lastUsedAt: string;
}

export async function initializeNotifications(
  request: InitializeNotificationsRequest,
): Promise<null | RegisterDeviceResponse> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return null;
    }

    const token = await messaging().getToken();

    const registerDeviceRequest: RegisterDeviceRequest = {
      userId: request.userId,
      deviceToken: token,
    };

    return await registerDevice(registerDeviceRequest);
  } catch (error) {
    return null;
  }
}

async function registerDevice(
  request: RegisterDeviceRequest,
): Promise<RegisterDeviceResponse> {
  return apiClient.post<RegisterDeviceResponse>(
    '/notifications/register-device',
    request,
  );
}

export function setupNotificationListeners() {
  // Handle foreground messages
  const unsubscribeForeground = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground notification:', remoteMessage);
    },
  );

  // Handle background messages
  messaging().onNotificationOpenedApp(
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
    },
  );

  // Handle notification that opened the app from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
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
      const userId = session?.user.id;

      if (userId) {
        await registerDevice({ userId, deviceToken: token });
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
