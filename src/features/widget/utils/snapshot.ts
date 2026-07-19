import type { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import { formatTimeRange } from '../../scheduler/utils/agenda';
import {
  eventEndDate,
  eventStartDate,
  isAllDayEvent,
} from '../../scheduler/utils/googleEvent';
import type { WidgetEvent, WidgetSnapshot } from '../types';

const UPCOMING_COUNT = 3;
const ASSUMED_DURATION_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Resolved {
  event: GoogleCalendarEvent;
  start: Date;
  end: Date;
}

function resolve(event: GoogleCalendarEvent): Resolved | null {
  const start = eventStartDate(event);
  if (!start) return null;

  const explicitEnd = eventEndDate(event);
  const fallbackMs = isAllDayEvent(event) ? DAY_MS : ASSUMED_DURATION_MS;
  const end = explicitEnd ?? new Date(start.getTime() + fallbackMs);

  return { event, start, end: end > start ? end : new Date(start.getTime() + fallbackMs) };
}

function toWidgetEvent({ event, start, end }: Resolved, index: number): WidgetEvent {
  const allDay = isAllDayEvent(event);

  return {
    id: event.id ?? `${start.toISOString()}-${index}`,
    title: event.summary?.trim() || 'Untitled event',
    timeLabel: formatTimeRange(event),
    location: event.location?.trim() || null,
    startsAt: start.toISOString(),
    endsAt: allDay ? null : end.toISOString(),
    allDay,
  };
}

interface Options {
  now?: Date;
  connected?: boolean;
}

export function buildWidgetSnapshot(
  events: GoogleCalendarEvent[],
  { now = new Date(), connected = true }: Options = {},
): WidgetSnapshot {
  const generatedAt = now.toISOString();

  if (!connected) {
    return {
      state: 'needs_setup',
      nextUp: null,
      upcoming: [],
      inProgress: false,
      generatedAt,
    };
  }

  const live = events
    .map(resolve)
    .filter((item): item is Resolved => item !== null && item.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (live.length === 0) {
    return {
      state: 'empty',
      nextUp: null,
      upcoming: [],
      inProgress: false,
      generatedAt,
    };
  }

  const [next, ...rest] = live;

  return {
    state: 'ready',
    nextUp: toWidgetEvent(next, 0),
    upcoming: rest
      .slice(0, UPCOMING_COUNT)
      .map((item, index) => toWidgetEvent(item, index + 1)),
    inProgress: !isAllDayEvent(next.event) && next.start <= now,
    generatedAt,
  };
}
