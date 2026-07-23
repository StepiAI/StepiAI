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

// minggu mulai Senin, jadi index 3 = Kamis alias tengah minggu
export function weekAnchor(days: Date[]) {
  return days[3];
}

/**
 * Bikin semua minggu dalam SATU TAHUN penuh (Januari–Desember) dari tahun yg
 * lagi dibuka, bukan cuma beberapa minggu di sekitar bulannya. Mulainya dari
 * Senin di minggu 1 Januari, berhentinya di minggu yg masih nyentuh 31
 * Desember — jadi ada 52-53 minggu dan user bisa scroll Jan sampai Des.
 */
export function buildWeekWindow(month: Date): CalendarWeek[] {
  const year = month.getFullYear();
  const start = startOfWeek(new Date(year, 0, 1));
  const lastDay = new Date(year, 11, 31);

  const weeks: CalendarWeek[] = [];
  let labelledMonth: number | null = null;

  for (let w = 0; ; w++) {
    // minggu ini mulainya kapan; kalau udah lewat 31 Des, berhenti
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + w * 7);
    if (weekStart > lastDay) break;

    const days: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      days.push(date);
    }

    // Label-nya nempel di minggu yg MAYORITAS-nya bulan itu (patokannya hari
    // Kamis), bukan minggu yg kebetulan ada tanggal 1-nya. Kalau pakai tanggal
    // 1, minggu peralihan kayak 27 Jul–2 Agu bakal kelempar ke heading
    // "August", jadi tanggal 27-31 keliatan ilang dari bagian July.
    const anchorMonth = weekAnchor(days).getMonth();
    const startsNewMonth = anchorMonth !== labelledMonth;
    labelledMonth = anchorMonth;

    weeks.push({
      key: chipKey(days[0]),
      days,
      monthLabel: startsNewMonth ? MONTHS_FULL[anchorMonth] : null,
    });
  }

  return weeks;
}

export function initialWeekIndex(weeks: CalendarWeek[], month: Date) {
  const idx = weeks.findIndex(week => {
    const anchor = weekAnchor(week.days);
    return (
      anchor.getMonth() === month.getMonth() &&
      anchor.getFullYear() === month.getFullYear()
    );
  });
  return idx < 0 ? 0 : idx;
}
