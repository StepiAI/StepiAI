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

function toAlertEvents(events: GoogleCalendarEvent[]): AnalyzeAlertsEvent[] {
  return events
    .filter(
      (event) =>
        !!event.id &&
        !!event.summary &&
        !!event.location?.trim() &&
        !!event.start?.dateTime &&
        !!event.end?.dateTime,
    )
    .map((event) => ({
      id: event.id as string,
      summary: event.summary as string,
      location: event.location as string,
      startDateTime: event.start!.dateTime as string,
      endDateTime: event.end!.dateTime as string,
    }));
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
    if (latitude === null || longitude === null || alertEvents.length === 0) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    analyzeAlerts({
      origin: { latitude, longitude },
      events: alertEvents,
      timezone: deviceTimeZone(),
    })
      .then((result) => {
        if (!cancelled) setAlerts(result);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[Alerts] gagal ambil warning:', err);
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
