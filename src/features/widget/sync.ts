import { requestWidgetUpdate } from 'react-native-android-widget';
import { ApiError } from '../../services/api/client';
import {
  listGoogleCalendarEvents,
  type GoogleCalendarEvent,
} from '../../services/googleCalendar/client';
import { supabase } from '../../services/supabase/client';
import { WIDGET_NAME, WIDGET_RANGE_DAYS } from './constants';
import { renderAgendaWidget } from './components/AgendaWidget';
import { readWidgetSnapshot, saveWidgetSnapshot } from './storage';
import { buildWidgetSnapshot } from './utils/snapshot';
import { EMPTY_SNAPSHOT, type WidgetSnapshot } from './types';

function range(now: Date) {
  const timeMin = new Date(now);
  timeMin.setHours(0, 0, 0, 0);

  const timeMax = new Date(
    timeMin.getTime() + WIDGET_RANGE_DAYS * 24 * 60 * 60 * 1000,
  );

  return { timeMin, timeMax };
}

export async function publishWidgetSnapshot(
  events: GoogleCalendarEvent[],
  { connected = true }: { connected?: boolean } = {},
): Promise<WidgetSnapshot> {
  const snapshot = buildWidgetSnapshot(events, { connected });
  await saveWidgetSnapshot(snapshot);
  return snapshot;
}

export async function refreshWidgetSnapshot(): Promise<WidgetSnapshot> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const snapshot = buildWidgetSnapshot([], { connected: false });
      await saveWidgetSnapshot(snapshot);
      return snapshot;
    }

    const { timeMin, timeMax } = range(new Date());
    const events = await listGoogleCalendarEvents(
      timeMin.toISOString(),
      timeMax.toISOString(),
    );

    return await publishWidgetSnapshot(events);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const snapshot = buildWidgetSnapshot([], { connected: false });
      await saveWidgetSnapshot(snapshot);
      return snapshot;
    }

    console.warn('[Widget] refresh gagal, pakai data lama:', error);

    const cached = await readWidgetSnapshot();
    return cached ?? EMPTY_SNAPSHOT;
  }
}

export async function syncWidgetFromApp(
  events: GoogleCalendarEvent[],
  { connected = true }: { connected?: boolean } = {},
) {
  try {
    const snapshot = await publishWidgetSnapshot(events, { connected });

    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: ({ height }) => renderAgendaWidget(snapshot, height),
      widgetNotFound: () => {},
    });
  } catch (error) {
    console.warn('[Widget] gagal sync dari app:', error);
  }
}
