import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

type MessagingModule = typeof import('@react-native-firebase/messaging');
type Messaging = MessagingModule['default'];

let cachedMessaging: Messaging | null | undefined;

export function getFirebaseMessaging(): Messaging | null {
  if (cachedMessaging !== undefined) {
    return cachedMessaging;
  }

  try {
    const messagingModule = require('@react-native-firebase/messaging') as {
      default?: Messaging;
    } & Messaging;
    cachedMessaging = messagingModule.default ?? messagingModule;
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase messaging is not available:', error);
    }
    cachedMessaging = null;
  }

  return cachedMessaging;
}

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;
