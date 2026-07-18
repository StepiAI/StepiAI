import { useCallback, useEffect, useState } from 'react';
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  GoogleCalendarStatus,
} from '../../../services/googleCalendar/client';

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
      setError('Something went wrong connecting to Google Calendar.');
    } finally {
      setBusy(false);
    }
  }, [status]);

  return { status, busy, error, toggleConnection };
}
