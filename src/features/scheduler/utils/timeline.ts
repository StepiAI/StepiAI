export const HOUR_HEIGHT = 80;

export const DEFAULT_START_HOUR = 0;
export const DEFAULT_END_HOUR = 23;

export interface TimelineEvent {
  id: string;
  title: string;
  subtitle?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  startMinutes: number;
  durationMinutes: number;
  tone: number;
  // menit-sebelum tiap reminder (dari Google), urut naik. [] = tanpa alert
  reminderMinutes?: number[];
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

export function formatClockTime(minutes: number) {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatClockRange(startMinutes: number, durationMinutes: number) {
  return `${formatClockTime(startMinutes)} – ${formatClockTime(startMinutes + durationMinutes)}`;
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

export interface PositionedEvent {
  event: TimelineEvent;
  top: number;
  height: number;
  columnIndex: number;
  columnCount: number;
}

export function layoutEvents(
  events: TimelineEvent[],
  range: TimelineRange,
): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
    return b.durationMinutes - a.durationMinutes;
  });

  const result: PositionedEvent[] = [];
  const eventEnd = (e: TimelineEvent) => e.startMinutes + e.durationMinutes;

  let cluster: { event: TimelineEvent; column: number }[] = [];
  let clusterEnd = -Infinity;
  let columnEnds: number[] = [];

  const flush = () => {
    if (cluster.length === 0) return;
    const columnCount = Math.max(...cluster.map(item => item.column)) + 1;
    for (const item of cluster) {
      const { top, height } = blockPosition(item.event, range);
      result.push({
        event: item.event,
        top,
        height,
        columnIndex: item.column,
        columnCount,
      });
    }
    cluster = [];
    columnEnds = [];
    clusterEnd = -Infinity;
  };

  for (const event of sorted) {
    if (event.startMinutes >= clusterEnd) flush();

    let column = columnEnds.findIndex(end => end <= event.startMinutes);
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(eventEnd(event));
    } else {
      columnEnds[column] = eventEnd(event);
    }

    cluster.push({ event, column });
    clusterEnd = Math.max(clusterEnd, eventEnd(event));
  }
  flush();

  return result;
}

export function minutesNow(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function isWithinTimeline(minutes: number, range: TimelineRange) {
  return minutes >= range.startHour * 60 && minutes <= range.endHour * 60;
}
