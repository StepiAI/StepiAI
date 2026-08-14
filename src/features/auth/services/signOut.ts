import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../../../services/supabase/client';
import { unregisterDevice } from '../../../services/notifications/client';
import { syncWidgetFromApp } from '../../widget/sync';
import { configureGoogleSignin } from './googleSigninConfig';

/**
 * Logout + bersihin jejak akun di device ini.
 *
 * Urutannya penting: unregisterDevice masih butuh JWT yg hidup, jadi harus
 * jalan duluan sebelum sesi Supabase-nya dimatiin.
 */
export async function performSignOut() {
  await unregisterDevice();

  // sign out Google-nya jangan sampai nahan sign out Supabase — kalau gagal,
  // user tetap harus keluar
  try {
    configureGoogleSignin();
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn('[Auth] Google sign out gagal:', error);
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // snapshot widget disimpan global (bukan per user), jadi kalau gak
  // dikosongin, widget di home screen masih pajang agenda akun sebelumnya
  await syncWidgetFromApp([], { connected: false });
}
