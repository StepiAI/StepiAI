import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { performSignOut } from '../../auth/services/signOut';

export function useSignOut() {
  const [busy, setBusy] = useState(false);

  const signOut = useCallback(async () => {
    setBusy(true);

    try {
      await performSignOut();
      // gak perlu navigate manual, useAuthSession di RootNavigator yg nendang ke RegisterScreen
    } catch (err) {
      console.error('[Auth] failed to sign out:', err);
      Alert.alert('Log out failed', 'Please try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  const confirmSignOut = useCallback(() => {
    Alert.alert('Log out?', 'You will need to sign in again to see your schedule.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  return { busy, confirmSignOut };
}
