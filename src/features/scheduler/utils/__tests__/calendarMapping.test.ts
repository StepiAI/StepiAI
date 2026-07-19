import type { GoogleCalendarEvent } from '../../../../services/googleCalendar/client';
import { toDayEvents } from '../calendarMapping';

const DAY = new Date(2026, 6, 19);

function at(year: number, month: number, day: number, hour: number, minute = 0) {
  return new Date(year, month, day, hour, minute).toISOString();
}

function timed(
  summary: string,
  start: string,
  end: string,
  extra: Partial<GoogleCalendarEvent> = {},
): GoogleCalendarEvent {
  return { id: summary, summary, start: { dateTime: start }, end: { dateTime: end }, ...extra };
}

function allDay(summary: string, start: string, end?: string): GoogleCalendarEvent {
  return { id: summary, summary, start: { date: start }, end: end ? { date: end } : null };
}

describe('toDayEvents', () => {
  it('ngambil event di hari itu doang', () => {
    const { timed: result } = toDayEvents(
      [
        timed('Hari ini', at(2026, 6, 19, 9), at(2026, 6, 19, 10)),
        timed('Hari lain', at(2026, 6, 21, 9), at(2026, 6, 21, 10)),
      ],
      DAY,
    );

    expect(result.map(event => event.title)).toEqual(['Hari ini']);
  });

  it('ngitung menit dan durasi dari jam lokal', () => {
    const [event] = toDayEvents(
      [timed('Gereja', at(2026, 6, 19, 9), at(2026, 6, 19, 11))],
      DAY,
    ).timed;

    expect(event.startMinutes).toBe(9 * 60);
    expect(event.durationMinutes).toBe(120);
  });

  it('diurutin dari yang paling pagi', () => {
    const { timed: result } = toDayEvents(
      [
        timed('Siang', at(2026, 6, 19, 14), at(2026, 6, 19, 15)),
        timed('Pagi', at(2026, 6, 19, 8), at(2026, 6, 19, 9)),
      ],
      DAY,
    );

    expect(result.map(event => event.title)).toEqual(['Pagi', 'Siang']);
  });

  it('yang paling awal dikasih warna biru, sisanya ungu', () => {
    const { timed: result } = toDayEvents(
      [
        timed('Kedua', at(2026, 6, 19, 14), at(2026, 6, 19, 15)),
        timed('Pertama', at(2026, 6, 19, 8), at(2026, 6, 19, 9)),
      ],
      DAY,
    );

    expect(result.map(event => event.tone)).toEqual(['blue', 'purple']);
  });

  it('event yang mulai kemarin dipotong di jam 00.00', () => {
    const [event] = toDayEvents(
      [timed('Lembur', at(2026, 6, 18, 23), at(2026, 6, 19, 1))],
      DAY,
    ).timed;

    expect(event.startMinutes).toBe(0);
    expect(event.durationMinutes).toBe(60);
  });

  it('event yang belum kelar hari ini dipotong di ujung hari', () => {
    const [event] = toDayEvents(
      [timed('Nginep', at(2026, 6, 19, 23), at(2026, 6, 20, 2))],
      DAY,
    ).timed;

    expect(event.startMinutes).toBe(23 * 60);
    expect(event.durationMinutes).toBe(60);
  });

  it('all-day dipisah, gak dicampur ke timeline', () => {
    const result = toDayEvents([allDay('Libur', '2026-07-19', '2026-07-20')], DAY);

    expect(result.timed).toHaveLength(0);
    expect(result.allDay.map(event => event.summary)).toEqual(['Libur']);
  });

  it('all-day beberapa hari kebawa selama harinya masih ke-cover', () => {
    const events = [allDay('Cuti', '2026-07-18', '2026-07-21')];

    expect(toDayEvents(events, new Date(2026, 6, 20)).allDay).toHaveLength(1);
    expect(toDayEvents(events, new Date(2026, 6, 21)).allDay).toHaveLength(0);
  });

  it('all-day di hari lain gak keikut', () => {
    expect(toDayEvents([allDay('Kemarin', '2026-07-12', '2026-07-13')], DAY).allDay)
      .toHaveLength(0);
  });

  it('lokasi dipakai jadi subtitle', () => {
    const [event] = toDayEvents(
      [timed('Rapat', at(2026, 6, 19, 9), at(2026, 6, 19, 10), { location: 'Zoom' })],
      DAY,
    ).timed;

    expect(event.subtitle).toBe('Zoom');
  });

  it('event tanpa judul gak bikin blank', () => {
    const [event] = toDayEvents(
      [{ id: 'x', start: { dateTime: at(2026, 6, 19, 9) }, end: { dateTime: at(2026, 6, 19, 10) } }],
      DAY,
    ).timed;

    expect(event.title).toBe('(no title)');
  });

  it('event rusak dilewatin, bukan bikin crash', () => {
    const result = toDayEvents(
      [
        { id: 'no-start', summary: 'Tanpa mulai' },
        { id: 'bad', summary: 'Tanggal ngawur', start: { dateTime: 'bukan tanggal' } },
      ],
      DAY,
    );

    expect(result.timed).toHaveLength(0);
    expect(result.allDay).toHaveLength(0);
  });

  it('hari kosong balikin dua-duanya kosong', () => {
    const result = toDayEvents([], DAY);

    expect(result.timed).toHaveLength(0);
    expect(result.allDay).toHaveLength(0);
  });
});
