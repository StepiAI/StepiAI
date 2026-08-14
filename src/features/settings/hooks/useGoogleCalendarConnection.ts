import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  GoogleCalendarStatus,
} from '../../../services/googleCalendar/client';

// 400/403 dari backend itu pesan yg emang ditujukan ke user — mis. akun Google
// yg dipilih di picker beda sama akun login. jangan ditelen jadi pesan generik,
// user gak bakal tau harus milih akun yg mana.
function describeConnectionError(err: unknown): string {
  if (err instanceof ApiError && (err.status === 400 || err.status === 403)) {
    return err.message;
  }

  return 'Something went wrong connecting to Google Calendar.';
}

export function useGoogleCalendarConnection() {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setStatus(await getGoogleCalendarStatus());
    } catch (err) {
      console.error('[GoogleCalendar] status check failed:', err);
      setError('Could not load Google Calendar status.');
      setStatus({ connected: false }); // fallback ke not connected
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const toggleConnection = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      if (status?.connected) {
        setStatus(await disconnectGoogleCalendar());
      } else {
        const result = await connectGoogleCalendar();
        if (result) setStatus(result);
      }
    } catch (err) {
      console.error('GoogleCalendar connect/disconnect failed:', err);
      setError(describeConnectionError(err));
    } finally {
      setBusy(false);
    }
  }, [status]);

  return { status, busy, error, toggleConnection };
}
