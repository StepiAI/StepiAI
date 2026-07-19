import type { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import { toDateKey } from './day';
import { eventStartDate, isAllDayEvent } from './googleEvent';

export interface AgendaSection {
  key: string;
  title: string;
  events: GoogleCalendarEvent[];
}

export function formatTimeRange(event: GoogleCalendarEvent) {
  if (isAllDayEvent(event)) return 'All day';

  const start = eventStartDate(event);
  if (!start) return '';

  const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDayTitle(date: Date) {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);

  if (toDateKey(date) === toDateKey(today)) return 'Today';
  if (toDateKey(date) === toDateKey(tomorrow)) return 'Tomorrow';

  return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
}

export function groupEventsByDay(events: GoogleCalendarEvent[]): AgendaSection[] {
  const sections = new Map<string, AgendaSection>();

  for (const event of events) {
    const start = eventStartDate(event);
    if (!start) continue;

    const key = toDateKey(start);
    const section = sections.get(key);

    if (section) {
      section.events.push(event);
    } else {
      sections.set(key, { key, title: formatDayTitle(start), events: [event] });
    }
  }

  return [...sections.values()];
}
