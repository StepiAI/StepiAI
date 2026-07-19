import { toDateKey } from './day';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'Wed', 'Th', 'Fr', 'Sa'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface WeekDay {
  key: string;
  dayOfMonth: number;
  label: string;
  date: Date;
}

export function startOfWeek(date: Date) {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function buildWeek(date: Date): WeekDay[] {
  const monday = startOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);

    return {
      key: toDateKey(day),
      dayOfMonth: day.getDate(),
      label: WEEKDAY_LABELS[day.getDay()],
      date: day,
    };
  });
}

export function formatWeekRange(week: WeekDay[]) {
  if (week.length === 0) return '';

  const first = week[0].date;
  const last = week[week.length - 1].date;
  const firstMonth = MONTHS[first.getMonth()];

  if (first.getMonth() === last.getMonth()) {
    return `${firstMonth} ${first.getDate()} - ${last.getDate()}`;
  }

  return `${firstMonth.slice(0, 3)} ${first.getDate()} - ${MONTHS[last.getMonth()].slice(0, 3)} ${last.getDate()}`;
}

