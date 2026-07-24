import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';

// akun yg dibuat < 10 menit lalu dianggap "baru sign up" -> masuk onboarding.
// user lama yg belum punya flag langsung ditandain selesai biar gak keulang.
const NEW_USER_WINDOW_MS = 10 * 60 * 1000;

type Status = 'loading' | 'needed' | 'done';

function storageKey(userId: string) {
  return `stepi:onboarded:${userId}`;
}

export function useOnboardingStatus(session: Session | null) {
  const userId = session?.user?.id;
  const createdAt = session?.user?.created_at;
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!userId) {
      setStatus('loading');
      return;
    }

    let active = true;

    (async () => {
      try {
        const done = await AsyncStorage.getItem(storageKey(userId));
        if (!active) return;

        if (done) {
          setStatus('done');
          return;
        }

        const createdMs = createdAt ? new Date(createdAt).getTime() : 0;
        const isNewUser = createdMs > 0 && Date.now() - createdMs < NEW_USER_WINDOW_MS;

        if (isNewUser) {
          setStatus('needed');
        } else {
          // user lama tanpa flag: tandain selesai, jangan paksa onboarding
          await AsyncStorage.setItem(storageKey(userId), '1');
          if (active) setStatus('done');
        }
      } catch (err) {
        console.warn('[Onboarding] gagal baca status:', err);
        if (active) setStatus('done');
      }
    })();

    return () => {
      active = false;
    };
  }, [userId, createdAt]);

  const complete = useCallback(async () => {
    setStatus('done');
    if (userId) {
      try {
        await AsyncStorage.setItem(storageKey(userId), '1');
      } catch (err) {
        console.warn('[Onboarding] gagal simpan status:', err);
      }
    }
  }, [userId]);

  return { status, complete };
}
