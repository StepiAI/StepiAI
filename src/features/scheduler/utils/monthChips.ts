import type { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import { eventColorSeed, toneIndexFor } from '../eventColors';
import { isAllDayEvent } from './googleEvent';
import { startOfWeek } from './week';

export interface DayChip {
  id: string;
  title: string;
  time?: string;
  allDay: boolean;
  tone: number;
}

export function chipKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`;
}

export function buildDayChips(events: GoogleCalendarEvent[]): Map<string, DayChip[]> {
  const map = new Map<string, DayChip[]>();

  const push = (key: string, chip: DayChip) => {
    const existing = map.get(key);
    if (existing) existing.push(chip);
    else map.set(key, [chip]);
  };

  for (const event of events) {
    const id = eventColorSeed(event);
    const tone = toneIndexFor(id);
    const title = event.summary ?? '(no title)';

    if (isAllDayEvent(event)) {
      const startStr = event.start?.date;
      if (!startStr) continue;

      const start = new Date(`${startStr}T00:00:00`);
      if (Number.isNaN(start.getTime())) continue;

      const endStr = event.end?.date;
      const end = endStr ? new Date(`${endStr}T00:00:00`) : new Date(start.getTime() + 86_400_000);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const key = chipKey(d);
        push(key, { id: `${id}-${key}`, title, allDay: true, tone });
      }
      continue;
    }

    const raw = event.start?.dateTime;
    if (!raw) continue;
    const start = new Date(raw);
    if (Number.isNaN(start.getTime())) continue;

    push(chipKey(start), { id, title, time: formatTime(start), allDay: false, tone });
  }

  for (const chips of map.values()) {
    chips.sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return (a.time ?? '').localeCompare(b.time ?? '');
    });
  }

  return map;
}

export interface CalendarWeek {
  key: string;
  days: Date[];
  monthLabel: string | null;
}

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function buildWeekWindow(month: Date, weeksBefore = 3, weeksAfter = 11): CalendarWeek[] {
  const first = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1));
  const start = new Date(first);
  start.setDate(start.getDate() - weeksBefore * 7);

  const total = weeksBefore + weeksAfter;
  const weeks: CalendarWeek[] = [];

  for (let w = 0; w < total; w++) {
    const days: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      days.push(date);
    }

    const firstOfMonth = days.find(d => d.getDate() === 1);
    weeks.push({
      key: chipKey(days[0]),
      days,
      monthLabel: firstOfMonth ? MONTHS_FULL[firstOfMonth.getMonth()] : null,
    });
  }

  return weeks;
}

export function initialWeekIndex(weeks: CalendarWeek[], month: Date) {
  const idx = weeks.findIndex(week =>
    week.days.some(d => d.getMonth() === month.getMonth() && d.getDate() === 1),
  );
  return idx < 0 ? 0 : idx;
}
