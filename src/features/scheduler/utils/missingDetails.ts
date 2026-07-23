import type { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import { eventColorSeed, toneIndexFor } from '../eventColors';
import { startOfDay, toDateKey } from './day';
import { eventEndDate, eventStartDate, isAllDayEvent } from './googleEvent';
import { TimelineEvent } from './timeline';

export type MissingKind = 'location' | 'time' | 'duration';

export interface MissingDetailItem {
  id: string;
  title: string;
  day: Date;
  dayKey: string;
  timeLabel: string;
  missing: MissingKind | null;
  // cuma "location" yg wajib — tanpa lokasi STEPI gak bisa hitung travel time
  required: boolean;
  // event versi timeline biar bisa langsung dibuka di halaman detail
  timelineEvent: TimelineEvent;
}

export interface MissingDetailGroup {
  key: string;
  label: string;
  items: MissingDetailItem[];
}

export interface MissingDetailSummary {
  all: number;
  required: number;
  completed: number;
}

const MISSING_COPY: Record<MissingKind, string> = {
  location: 'Missing location',
  time: 'Missing time',
  duration: 'Missing duration',
};

export function missingLabel(kind: MissingKind) {
  return MISSING_COPY[kind];
}

function formatClock(date: Date) {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function minutesFromMidnight(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

// analisa satu event: apa yg kurang + versi timeline buat buka detail
function analyzeEvent(event: GoogleCalendarEvent): MissingDetailItem | null {
  if (!event.summary) return null;

  const start = eventStartDate(event);
  if (!start) return null;

  const end = eventEndDate(event);
  const title = event.summary;
  const day = startOfDay(start);
  const tone = toneIndexFor(eventColorSeed(event));
  const id = event.id ?? `${start.toISOString()}-${title}`;

  const base = {
    id,
    title,
    day,
    dayKey: toDateKey(start),
    latitude: event.latitude ?? undefined,
    longitude: event.longitude ?? undefined,
    notes: event.description ?? undefined,
  };

  // all-day event (ulang tahun, libur, dll) itu emang sengaja tanpa jam —
  // jangan dihitung "missing", biar count di banner gak ke-inflate.
  if (isAllDayEvent(event)) {
    return null;
  }

  const startMinutes = minutesFromMidnight(start);
  const durationMinutes =
    end && end.getTime() > start.getTime()
      ? Math.round((end.getTime() - start.getTime()) / 60_000)
      : 0;

  const timelineEvent: TimelineEvent = {
    id,
    title,
    subtitle: event.location ?? undefined,
    notes: base.notes,
    latitude: base.latitude,
    longitude: base.longitude,
    startMinutes,
    durationMinutes: durationMinutes || 60,
    tone,
  };

  // durasi kosong (end <= start) → "missing duration"
  if (durationMinutes <= 0) {
    return {
      ...base,
      timeLabel: `${formatClock(start)} - ?`,
      missing: 'duration',
      required: false,
      timelineEvent,
    };
  }

  const rangeLabel = `${formatClock(start)} - ${formatClock(end as Date)}`;

  // ada jam & durasi tapi belum ada lokasi → "missing location" (wajib)
  if (!event.location?.trim()) {
    return {
      ...base,
      timeLabel: rangeLabel,
      missing: 'location',
      required: true,
      timelineEvent,
    };
  }

  // lengkap
  return {
    ...base,
    timeLabel: rangeLabel,
    missing: null,
    required: false,
    timelineEvent,
  };
}

export function analyzeMissingDetails(events: GoogleCalendarEvent[]): MissingDetailItem[] {
  const items = events
    .map(analyzeEvent)
    .filter((item): item is MissingDetailItem => item !== null);

  // urutkan per hari, lalu per jam mulai
  items.sort((a, b) => {
    if (a.dayKey !== b.dayKey) return a.dayKey < b.dayKey ? -1 : 1;
    return a.timelineEvent.startMinutes - b.timelineEvent.startMinutes;
  });

  return items;
}

export function summarizeMissingDetails(items: MissingDetailItem[]): MissingDetailSummary {
  return {
    all: items.length,
    required: items.filter(item => item.required && item.missing !== null).length,
    completed: items.filter(item => item.missing === null).length,
  };
}

export type MissingDetailTab = 'all' | 'required' | 'completed';

export function filterMissingDetails(items: MissingDetailItem[], tab: MissingDetailTab) {
  if (tab === 'required') return items.filter(item => item.required && item.missing !== null);
  if (tab === 'completed') return items.filter(item => item.missing === null);
  return items;
}

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function relativeDayLabel(day: Date, today: Date) {
  const diffDays = Math.round(
    (startOfDay(day).getTime() - startOfDay(today).getTime()) / 86_400_000,
  );

  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'TOMORROW';
  if (diffDays === -1) return 'YESTERDAY';

  return day
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
}

export function groupMissingDetails(
  items: MissingDetailItem[],
  today = new Date(),
): MissingDetailGroup[] {
  const groups = new Map<string, MissingDetailGroup>();

  for (const item of items) {
    let group = groups.get(item.dayKey);

    if (!group) {
      const rel = relativeDayLabel(item.day, today);
      const dateLabel = `${item.day.getDate()} ${MONTHS_SHORT[item.day.getMonth()]}`;
      group = { key: item.dayKey, label: `${rel} - ${dateLabel}`, items: [] };
      groups.set(item.dayKey, group);
    }

    group.items.push(item);
  }

  return Array.from(groups.values());
}
