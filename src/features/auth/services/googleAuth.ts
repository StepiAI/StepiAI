import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../../../services/supabase/client';
import type { InitializeNotificationsRequest } from '../../../services/notifications/client';
import { initializeNotifications } from '../../../services/notifications/client';
import { configureGoogleSignin } from './googleSigninConfig';

// flow ny: google account picker -> idToken -> session ambil dari Supabase
export async function signInWithGoogle() {
  configureGoogleSignin();
  await GoogleSignin.hasPlayServices();

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      return null;
    }
    throw error;
  }

  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error('Google sign-in did not return an idToken.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.data.idToken,
  });

  if (error) {
    throw error;
  }

  const initializeNotificationServiceRequest: InitializeNotificationsRequest = {
    userId: data.session?.user.id,
  };
  await initializeNotificationServices(initializeNotificationServiceRequest);

  return data.session;
}

async function initializeNotificationServices(
  request: InitializeNotificationsRequest,
) {
  try {
    const deviceRegistration = await initializeNotifications(request);
    if (!deviceRegistration) {
      return 'Device registration failed or permission denied.';
    }
  } catch (error) {
    return error;
  }
}
