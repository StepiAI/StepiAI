const DATE_LABEL_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const TIME_LABEL_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', DATE_LABEL_OPTIONS);
}

export function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString('en-US', TIME_LABEL_OPTIONS);
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeOnly(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function timeOfDay(hours: number, minutes = 0): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addOneMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  return result;
}

const TIME_SLOT_STEP_MINUTES = 30;

export function buildTimeSlots(): Date[] {
  const slots: Date[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += TIME_SLOT_STEP_MINUTES) {
    slots.push(timeOfDay(Math.floor(minutes / 60), minutes % 60));
  }

  return slots;
}

/**
 * Jadwal life plan disimpan sebagai "wall clock": FE kirim jam lokal (mis.
 * "19:00"), BE simpan apa adanya dalam kontainer UTC ("...T19:00:00Z").
 * Jadi pas dibaca, komponen UTC-nya HARUS diperlakukan sebagai jam lokal —
 * kalau di-parse langsung pakai new Date(iso), jamnya geser +7 (WIB) dan
 * sesinya "pindah" ke jam 2 pagi hari berikutnya.
 */
export function parseWallClock(iso: string): Date {
  // buang 'Z'/millis -> di-parse JS sebagai waktu lokal
  return new Date(iso.slice(0, 19));
}
