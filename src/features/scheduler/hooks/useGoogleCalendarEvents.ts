import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  GoogleCalendarEvent,
  listGoogleCalendarEvents,
} from '../../../services/googleCalendar/client';
import { useCalendarRevision } from '../../../services/googleCalendar/revision';
import { syncWidgetFromApp } from '../../widget/sync';

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

interface Options {
  // default nya hari ini
  from?: Date;
  // default nya from + 7 hari
  to?: Date;
}

export function useGoogleCalendarEvents({ from, to }: Options = {}) {
  const [state, setState] = useState<State>(INITIAL);

  const fromMs = from?.getTime();
  const toMs = to?.getTime();

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      setState(prev => ({
        ...prev,
        loading: mode === 'initial',
        refreshing: mode === 'refresh',
        error: null,
      }));

      let timeMin: Date;
      if (fromMs !== undefined) {
        timeMin = new Date(fromMs);
      } else {
        timeMin = new Date();
        timeMin.setHours(0, 0, 0, 0);
      }

      const timeMax =
        toMs !== undefined
          ? new Date(toMs)
          : new Date(timeMin.getTime() + DEFAULT_RANGE_DAYS * 86_400_000);

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

        // ini gk gw await SENGAJA -> widget tu bonus soalny, jgn ampe dia nahan" render
        syncWidgetFromApp(events);
      } catch (err) {
        console.error('[GoogleCalendar] failed to list events:', err);
        const notConnected = err instanceof ApiError && err.status === 404;

        if (notConnected) {
          syncWidgetFromApp([], { connected: false });
        }

        setState({
          events: [],
          loading: false,
          refreshing: false,
          error: notConnected ? null : describeError(err),
          notConnected,
        });
      }
    },
    [fromMs, toMs],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  // begitu ada mutasi (add/edit/delete) di mana pun, refetch diam-diam
  const revision = useCalendarRevision();
  const seenRevision = useRef(revision);
  useEffect(() => {
    if (seenRevision.current === revision) return;
    seenRevision.current = revision;
    load('refresh');
  }, [revision, load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  return { ...state, refresh };
}
