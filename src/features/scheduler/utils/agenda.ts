import type { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import { eventStartDate, isAllDayEvent } from './googleEvent';

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
