import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../../../config/env';
import { supabase } from '../../../services/supabase/client';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true, // return serverAuthCode buat api.
});

// flow ny: google account picker -> idToken -> session ambil dari Supabase
export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
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

  return data.session;
}
