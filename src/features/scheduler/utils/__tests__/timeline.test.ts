import {
  DEFAULT_RANGE,
  HOUR_HEIGHT,
  TimelineEvent,
  blockPosition,
  formatDuration,
  formatEventTime,
  formatHourLabel,
  hourSlots,
  isWithinTimeline,
  rangeForEvents,
} from '../timeline';

function event(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    id: 'e1',
    title: 'Event',
    startMinutes: 9 * 60,
    durationMinutes: 60,
    tone: 0,
    ...overrides,
  };
}

describe('formatHourLabel', () => {
  it('pakai jam 12-an dengan AM/PM', () => {
    expect(formatHourLabel(9)).toBe('9AM');
    expect(formatHourLabel(12)).toBe('12PM');
    expect(formatHourLabel(17)).toBe('5PM');
  });

  it('tengah malam jadi 12AM, bukan 0AM', () => {
    expect(formatHourLabel(0)).toBe('12AM');
    expect(formatHourLabel(24)).toBe('12AM');
  });
});

describe('formatEventTime', () => {
  it('selalu dua digit', () => {
    expect(formatEventTime(9 * 60)).toBe('09.00');
    expect(formatEventTime(10 * 60 + 30)).toBe('10.30');
    expect(formatEventTime(0)).toBe('00.00');
  });
});

describe('formatDuration', () => {
  it('pas 60 menit tetep "60min" — ngikutin desain, bukan "1h"', () => {
    expect(formatDuration(60)).toBe('(60min)');
  });

  it('di atas sejam baru dipecah jadi jam + menit', () => {
    expect(formatDuration(30)).toBe('(30min)');
    expect(formatDuration(90)).toBe('(1h 30min)');
    expect(formatDuration(120)).toBe('(2h)');
  });
});

describe('rangeForEvents', () => {
  it('hari kosong pakai rentang default (00:00 - 23:00, sehari penuh)', () => {
    expect(rangeForEvents([])).toEqual(DEFAULT_RANGE);
  });

  it('event subuh atau malem tetep gak ngubah rentang, udah sehari penuh dari sononya', () => {
    expect(rangeForEvents([event({ startMinutes: 5 * 60 })])).toEqual(DEFAULT_RANGE);
    expect(rangeForEvents([event({ startMinutes: 22 * 60 })])).toEqual(DEFAULT_RANGE);
  });

  it('gak pernah keluar dari 0..24', () => {
    const range = rangeForEvents([
      event({ startMinutes: 0, durationMinutes: 24 * 60 }),
    ]);

    expect(range.startHour).toBeGreaterThanOrEqual(0);
    expect(range.endHour).toBeLessThanOrEqual(24);
  });
});

describe('hourSlots', () => {
  it('inklusif di kedua ujungnya', () => {
    expect(hourSlots({ startHour: 9, endHour: 12 })).toEqual([9, 10, 11, 12]);
  });
});

describe('blockPosition', () => {
  const workRange = { startHour: 9, endHour: 17 };

  it('posisinya diukur dari awal rentang, bukan dari tengah malam', () => {
    const { top } = blockPosition(event({ startMinutes: 10 * 60 }), workRange);

    expect(top).toBe(HOUR_HEIGHT);
  });

  it('setengah jam jatuh di tengah baris', () => {
    const { top } = blockPosition(
      event({ startMinutes: 10 * 60 + 30 }),
      workRange,
    );

    expect(top).toBe(HOUR_HEIGHT * 1.5);
  });

  it('tinggi ngikutin durasi', () => {
    expect(blockPosition(event({ durationMinutes: 120 }), DEFAULT_RANGE).height).toBe(
      HOUR_HEIGHT * 2,
    );
  });

  it('event super pendek tetep dikasih tinggi minimum biar kebaca', () => {
    expect(
      blockPosition(event({ durationMinutes: 5 }), DEFAULT_RANGE).height,
    ).toBeGreaterThanOrEqual(34);
  });
});

describe('isWithinTimeline', () => {
  it('true buat jam berapa pun sepanjang hari, dari tengah malam sampe jam 11 malem', () => {
    expect(isWithinTimeline(0, DEFAULT_RANGE)).toBe(true);
    expect(isWithinTimeline(8 * 60, DEFAULT_RANGE)).toBe(true);
    expect(isWithinTimeline(23 * 60, DEFAULT_RANGE)).toBe(true);
  });

  it('false kalau udah lewat jam 11 malem', () => {
    expect(isWithinTimeline(23 * 60 + 30, DEFAULT_RANGE)).toBe(false);
  });
});
