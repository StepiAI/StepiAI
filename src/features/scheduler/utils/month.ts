import { startOfWeek } from './week';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_HEADINGS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const WEEKS_SHOWN = 6;

export interface MonthCell {
  key: string;
  date: Date;
  dayOfMonth: number;
  inCurrentMonth: boolean;
}

export function formatMonthYear(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function buildMonthGrid(month: Date): MonthCell[][] {
  const gridStart = startOfWeek(startOfMonth(month));
  const currentMonth = month.getMonth();
  const rows: MonthCell[][] = [];

  for (let week = 0; week < WEEKS_SHOWN; week++) {
    const cells: MonthCell[] = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + week * 7 + day);

      cells.push({
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        date,
        dayOfMonth: date.getDate(),
        inCurrentMonth: date.getMonth() === currentMonth,
      });
    }

    rows.push(cells);
  }

  return rows;
}
