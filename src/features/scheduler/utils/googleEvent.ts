import type { GoogleCalendarEvent } from '../../../services/googleCalendar/client';

export function isAllDayEvent(event: GoogleCalendarEvent) {
  return !event.start?.dateTime && !!event.start?.date;
}

export function eventStartDate(event: GoogleCalendarEvent): Date | null {
  const raw = event.start?.dateTime ?? event.start?.date;
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function eventEndDate(event: GoogleCalendarEvent): Date | null {
  const raw = event.end?.dateTime ?? event.end?.date;
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
