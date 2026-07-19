const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function todayAsDateInput(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function nextHourAsTimeInput(date = new Date()) {
  const next = new Date(date.getTime() + 3_600_000);
  return `${pad(next.getHours())}:00`;
}

export function addHourToTimeInput(time: string) {
  const parsed = TIME_PATTERN.exec(time.trim());
  if (!parsed) return '';

  const hours = Number(parsed[1]);
  return `${pad((hours + 1) % 24)}:${parsed[2]}`;
}

export function parseLocalDateTime(date: string, time: string): Date | null {
  const dateParts = DATE_PATTERN.exec(date.trim());
  const timeParts = TIME_PATTERN.exec(time.trim());
  if (!dateParts || !timeParts) return null;

  const year = Number(dateParts[1]);
  const month = Number(dateParts[2]);
  const day = Number(dateParts[3]);
  const hours = Number(timeParts[1]);
  const minutes = Number(timeParts[2]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hours > 23 || minutes > 59) return null;

  const result = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (result.getMonth() !== month - 1 || result.getDate() !== day) return null;

  return result;
}
