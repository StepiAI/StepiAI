import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  GoogleCalendarEvent,
  listGoogleCalendarEvents,
} from '../../../services/googleCalendar/client';
import { useCalendarRevision } from '../../../services/googleCalendar/revision';
import { listSchedules } from '../../../services/schedules/client';
import type { ScheduleRecord } from '../../../services/lifePlan/client';
import { syncWidgetFromApp } from '../../widget/sync';

function lifePlanSchedulesToEvents(
  schedules: ScheduleRecord[],
): GoogleCalendarEvent[] {
  return schedules
    .filter(
      schedule =>
        schedule.lifePlanId !== null && !schedule.googleCalendarEventId,
    )
    .map(schedule => ({
      id: schedule.id,
      summary: schedule.summary,
      description: schedule.description,
      location: schedule.location,
      start: { dateTime: schedule.startDateTime },
      end: { dateTime: schedule.endDateTime },
      isLifePlanSession: true,
    }));
}

const DEFAULT_RANGE_DAYS = 7;

function timeKey(
  slot?: { dateTime?: string | null; date?: string | null } | null,
) {
  const raw = slot?.dateTime ?? slot?.date;
  if (!raw) return '';
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? raw : String(parsed);
}

function dedupeEvents(events: GoogleCalendarEvent[]): GoogleCalendarEvent[] {
  const seen = new Set<string>();
  const result: GoogleCalendarEvent[] = [];
  for (const event of events) {
    const key = [
      event.summary?.trim().toLowerCase() ?? '',
      event.location?.trim().toLowerCase() ?? '',
      timeKey(event.start),
      timeKey(event.end),
    ].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(event);
  }
  return result;
}

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
        // sesi life plan diambil barengan; kalau endpoint-nya error, kalender
        // Google tetap tampil (makanya di-catch jadi [])
        const [events, localSchedules] = await Promise.all([
          listGoogleCalendarEvents(timeMin.toISOString(), timeMax.toISOString()),
          listSchedules(timeMin.toISOString(), timeMax.toISOString()).catch(err => {
            console.warn('[Schedules] gagal ambil jadwal life plan:', err);
            return [] as ScheduleRecord[];
          }),
        ]);

        const merged = dedupeEvents([
          ...events,
          ...lifePlanSchedulesToEvents(localSchedules),
        ]);

        setState({
          events: merged,
          loading: false,
          refreshing: false,
          error: null,
          notConnected: false,
        });

        // ini gk gw await SENGAJA -> widget tu bonus soalny, jgn ampe dia nahan" render
        syncWidgetFromApp(merged);
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
