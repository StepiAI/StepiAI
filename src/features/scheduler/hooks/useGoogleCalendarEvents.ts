import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  GoogleCalendarEvent,
  listGoogleCalendarEvents,
} from '../../../services/googleCalendar/client';

const DEFAULT_RANGE_DAYS = 7;

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not load your calendar.';
}

type State = {
  events: GoogleCalendarEvent[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  notConnected: boolean;
};

const INITIAL: State = {
  events: [],
  loading: true,
  refreshing: false,
  error: null,
  notConnected: false,
};

export function useGoogleCalendarEvents(rangeDays = DEFAULT_RANGE_DAYS) {
  const [state, setState] = useState<State>(INITIAL);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      setState(prev => ({
        ...prev,
        loading: mode === 'initial',
        refreshing: mode === 'refresh',
        error: null,
      }));

      // mulai dari awal hari ini biar event yg jamnya udah lewat tetep keliatan
      const timeMin = new Date();
      timeMin.setHours(0, 0, 0, 0);
      const timeMax = new Date(timeMin.getTime() + rangeDays * 86_400_000);

      try {
        const events = await listGoogleCalendarEvents(
          timeMin.toISOString(),
          timeMax.toISOString(),
        );
        setState({
          events,
          loading: false,
          refreshing: false,
          error: null,
          notConnected: false,
        });
      } catch (err) {
        console.error('[GoogleCalendar] failed to list events:', err);
        // backend balikin 404 kalau akun google belum di-connect
        const notConnected = err instanceof ApiError && err.status === 404;
        setState({
          events: [],
          loading: false,
          refreshing: false,
          error: notConnected ? null : describeError(err),
          notConnected,
        });
      }
    },
    [rangeDays],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  return { ...state, refresh };
}
