import type { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import { eventColorSeed, toneIndexFor } from '../eventColors';
import { isSameDay, startOfDay, toDateKey } from './day';
import { isAllDayEvent } from './googleEvent';
import { TimelineEvent } from './timeline';

const MINUTES_PER_DAY = 24 * 60;

// menit-sebelum tiap reminder yg di-set manual (override). urut naik, tanpa
// duplikat. reminder "useDefault" gak dihitung karena Google gak kasih menitnya.
export function reminderMinutesOf(event: GoogleCalendarEvent): number[] {
  const overrides = event.reminders?.overrides ?? [];
  const minutes = overrides
    .map(o => o.minutes)
    .filter((m): m is number => typeof m === 'number');
  return Array.from(new Set(minutes)).sort((a, b) => a - b);
}

export interface DayEvents {
  timed: TimelineEvent[];
  allDay: GoogleCalendarEvent[];
}

function minutesFromStartOfDay(date: Date, day: Date) {
  return Math.round((date.getTime() - startOfDay(day).getTime()) / 60_000);
}

function coversDay(event: GoogleCalendarEvent, day: Date) {
  const startDate = event.start?.date;
  if (!startDate) return false;

  const dayKey = toDateKey(day);
  const endDate = event.end?.date;

  if (!endDate) return startDate === dayKey;
  return dayKey >= startDate && dayKey < endDate;
}

export function toDayEvents(events: GoogleCalendarEvent[], day: Date): DayEvents {
  const timed: TimelineEvent[] = [];
  const allDay: GoogleCalendarEvent[] = [];

  for (const event of events) {
    if (isAllDayEvent(event)) {
      if (coversDay(event, day)) {
        allDay.push(event);
      }
      continue;
    }

    const rawStart = event.start?.dateTime;
    if (!rawStart) continue;

    const start = new Date(rawStart);
    if (Number.isNaN(start.getTime())) continue;

    const rawEnd = event.end?.dateTime;
    const end = rawEnd ? new Date(rawEnd) : null;
    const hasEnd = end !== null && !Number.isNaN(end.getTime());

    const startsToday = isSameDay(start, day);
    const spansDay =
      hasEnd && start.getTime() < startOfDay(day).getTime() + MINUTES_PER_DAY * 60_000 &&
      end.getTime() > startOfDay(day).getTime();

    if (!startsToday && !spansDay) continue;

    const startMinutes = Math.max(minutesFromStartOfDay(start, day), 0);
    const endMinutes = hasEnd ? Math.min(minutesFromStartOfDay(end, day), MINUTES_PER_DAY) : startMinutes + 60;

    timed.push({
      id: event.id ?? `${rawStart}-${event.summary ?? ''}`,
      title: event.summary ?? '(no title)',
      subtitle: event.location ?? undefined,
      notes: event.description ?? undefined,
      latitude: event.latitude ?? undefined,
      longitude: event.longitude ?? undefined,
      startMinutes,
      durationMinutes: Math.max(endMinutes - startMinutes, 15),
      tone: toneIndexFor(eventColorSeed(event)),
      reminderMinutes: reminderMinutesOf(event),
    });
  }

  timed.sort((a, b) => a.startMinutes - b.startMinutes);

  return { timed, allDay };
}
