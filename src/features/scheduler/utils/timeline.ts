export const HOUR_HEIGHT = 52;

export const DEFAULT_START_HOUR = 0;
export const DEFAULT_END_HOUR = 23;

export type EventTone = 'blue' | 'purple';

export interface TimelineEvent {
  id: string;
  title: string;
  subtitle?: string;
  startMinutes: number;
  durationMinutes: number;
  tone: EventTone;
}

export interface TimelineRange {
  startHour: number;
  endHour: number;
}

export const DEFAULT_RANGE: TimelineRange = {
  startHour: DEFAULT_START_HOUR,
  endHour: DEFAULT_END_HOUR,
};

export function rangeForEvents(events: TimelineEvent[]): TimelineRange {
  if (events.length === 0) return DEFAULT_RANGE;

  let earliest = DEFAULT_START_HOUR;
  let latest = DEFAULT_END_HOUR;

  for (const event of events) {
    const startHour = Math.floor(event.startMinutes / 60);
    const endHour = Math.ceil((event.startMinutes + event.durationMinutes) / 60);

    earliest = Math.min(earliest, startHour);
    latest = Math.max(latest, endHour);
  }

  return { startHour: Math.max(earliest, 0), endHour: Math.min(latest, 24) };
}

export function hourSlots({ startHour, endHour }: TimelineRange) {
  const slots: number[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(hour);
  }
  return slots;
}

export function timelineHeight(range: TimelineRange) {
  return (range.endHour - range.startHour + 1) * HOUR_HEIGHT;
}

export function formatHourLabel(hour: number) {
  const normalized = hour % 24;
  const suffix = normalized < 12 ? 'AM' : 'PM';
  const display = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${display}${suffix}`;
}

export function formatEventTime(startMinutes: number) {
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;
  return `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}`;
}

export function formatDuration(durationMinutes: number) {
  if (durationMinutes <= 60) return `(${durationMinutes}min)`;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes === 0 ? `(${hours}h)` : `(${hours}h ${minutes}min)`;
}

export function offsetForMinutes(minutes: number, range: TimelineRange) {
  return ((minutes - range.startHour * 60) / 60) * HOUR_HEIGHT;
}

export function blockPosition(event: TimelineEvent, range: TimelineRange) {
  return {
    top: offsetForMinutes(event.startMinutes, range),
    height: Math.max((event.durationMinutes / 60) * HOUR_HEIGHT, 34),
  };
}

export function minutesNow(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function isWithinTimeline(minutes: number, range: TimelineRange) {
  return minutes >= range.startHour * 60 && minutes <= range.endHour * 60;
}
