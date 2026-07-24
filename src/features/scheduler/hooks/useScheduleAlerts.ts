import { useEffect, useMemo, useState } from 'react';
import { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import {
  AnalyzeAlertsEvent,
  ScheduleAlert,
  analyzeAlerts,
} from '../../../services/alerts/client';

interface Origin {
  latitude: number;
  longitude: number;
}

function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

const NON_PHYSICAL_LOCATIONS = new Set([
  'online',
  'daring',
  'zoom',
  'google meet',
  'gmeet',
]);

function toAlertEvents(events: GoogleCalendarEvent[]): AnalyzeAlertsEvent[] {
  const kept: AnalyzeAlertsEvent[] = [];
  for (const event of events) {
    const location = event.location?.trim() ?? '';
    const reasons: string[] = [];
    if (!event.id) reasons.push('no id');
    if (!event.summary) reasons.push('no summary');
    if (!location) reasons.push('no location');
    else if (NON_PHYSICAL_LOCATIONS.has(location.toLowerCase()))
      reasons.push('non-physical location (online/zoom/dst)');
    if (!event.start?.dateTime) reasons.push('no start.dateTime');
    if (!event.end?.dateTime) reasons.push('no end.dateTime');

    if (reasons.length > 0) {
      console.log(
        `[DEBUG ALERTS] skip "${event.summary ?? '(untitled)'}" -> ${reasons.join(', ')}`,
      );
      continue;
    }

    kept.push({
      id: event.id as string,
      summary: event.summary as string,
      location: event.location as string,
      startDateTime: event.start!.dateTime as string,
      endDateTime: event.end!.dateTime as string,
    });
  }
  console.log(
    `[DEBUG ALERTS] events masuk=${events.length}, lolos filter=${kept.length}`,
    kept.map((e) => `${e.summary} @ ${e.startDateTime} (${e.location})`),
  );
  return kept;
}

export function useScheduleAlerts(
  origin: Origin | null,
  events: GoogleCalendarEvent[],
): { alerts: ScheduleAlert[]; loading: boolean } {
  const [alerts, setAlerts] = useState<ScheduleAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const latitude = origin?.latitude ?? null;
  const longitude = origin?.longitude ?? null;

  const alertEvents = useMemo(() => toAlertEvents(events), [events]);

  useEffect(() => {
    if (latitude === null || longitude === null) {
      console.log('[DEBUG ALERTS] SKIP: lokasi (origin) masih null — GPS/izin?');
      setAlerts([]);
      setLoading(false);
      return;
    }
    if (alertEvents.length === 0) {
      console.log('[DEBUG ALERTS] SKIP: nggak ada event yang lolos filter minggu ini');
      setAlerts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const payload = {
      origin: { latitude, longitude },
      events: alertEvents,
      timezone: deviceTimeZone(),
    };
    console.log('[DEBUG ALERTS] POST /alerts/analyze payload:', JSON.stringify(payload));

    analyzeAlerts(payload)
      .then((result) => {
        console.log(
          `[DEBUG ALERTS] backend balikin ${result.length} alert:`,
          JSON.stringify(result.map((a) => ({ type: a.type, summary: a.summary, title: a.title }))),
        );
        if (!cancelled) setAlerts(result);
      })
      .catch((err) => {
        if (cancelled) return;
        const e = err as { status?: number; message?: string };
        console.warn('[DEBUG ALERTS] gagal ambil warning:', e?.status, e?.message, err);
        setAlerts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, alertEvents]);

  return { alerts, loading };
}
