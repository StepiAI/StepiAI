import type { GoogleCalendarEvent } from '../../../../services/googleCalendar/client';
import { buildWidgetSnapshot } from '../snapshot';

const NOW = new Date('2026-07-19T10:00:00.000Z');

function timed(
  summary: string,
  start: string,
  end?: string,
  extra: Partial<GoogleCalendarEvent> = {},
): GoogleCalendarEvent {
  return {
    id: summary,
    summary,
    start: { dateTime: start },
    end: end ? { dateTime: end } : null,
    ...extra,
  };
}

function allDay(summary: string, date: string, endDate: string): GoogleCalendarEvent {
  return {
    id: summary,
    summary,
    start: { date },
    end: { date: endDate },
  };
}

describe('buildWidgetSnapshot', () => {
  it('buang event yang udah kelar', () => {
    const snapshot = buildWidgetSnapshot(
      [
        timed('sudah lewat', '2026-07-19T08:00:00.000Z', '2026-07-19T09:00:00.000Z'),
        timed('nanti', '2026-07-19T14:00:00.000Z', '2026-07-19T15:00:00.000Z'),
      ],
      { now: NOW },
    );

    expect(snapshot.state).toBe('ready');
    expect(snapshot.nextUp?.title).toBe('nanti');
    expect(snapshot.upcoming).toHaveLength(0);
  });

  it('tahan event yang lagi jalan dan tandain inProgress', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('lagi meeting', '2026-07-19T09:30:00.000Z', '2026-07-19T11:00:00.000Z')],
      { now: NOW },
    );

    expect(snapshot.nextUp?.title).toBe('lagi meeting');
    expect(snapshot.inProgress).toBe(true);
  });

  it('event yang belum mulai bukan inProgress', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('nanti', '2026-07-19T14:00:00.000Z', '2026-07-19T15:00:00.000Z')],
      { now: NOW },
    );

    expect(snapshot.inProgress).toBe(false);
  });

  it('urutin dari yang paling deket, bukan dari urutan yang dikasih', () => {
    const snapshot = buildWidgetSnapshot(
      [
        timed('ketiga', '2026-07-19T18:00:00.000Z'),
        timed('pertama', '2026-07-19T11:00:00.000Z'),
        timed('kedua', '2026-07-19T15:00:00.000Z'),
      ],
      { now: NOW },
    );

    expect(snapshot.nextUp?.title).toBe('pertama');
    expect(snapshot.upcoming.map(e => e.title)).toEqual(['kedua', 'ketiga']);
  });

  it('batesin upcoming di 3 event', () => {
    const events = Array.from({ length: 10 }, (_, i) =>
      timed(`event ${i}`, `2026-07-19T${String(11 + i).padStart(2, '0')}:00:00.000Z`),
    );

    const snapshot = buildWidgetSnapshot(events, { now: NOW });

    expect(snapshot.nextUp?.title).toBe('event 0');
    expect(snapshot.upcoming).toHaveLength(3);
  });

  it('anggep event bertahan sejam kalau Google gak ngasih waktu selesai', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('tanpa end', '2026-07-19T09:30:00.000Z')],
      { now: NOW },
    );

    expect(snapshot.state).toBe('ready');
    expect(snapshot.nextUp?.title).toBe('tanpa end');
  });

  it('event all-day gak bikin badge Now nyala', () => {
    const snapshot = buildWidgetSnapshot(
      [allDay('libur nasional', '2026-07-19', '2026-07-20')],
      { now: NOW },
    );

    expect(snapshot.nextUp?.allDay).toBe(true);
    expect(snapshot.nextUp?.timeLabel).toBe('All day');
    expect(snapshot.inProgress).toBe(false);
  });

  it('state empty kalau nyambung tapi gak ada jadwal', () => {
    const snapshot = buildWidgetSnapshot([], { now: NOW });

    expect(snapshot.state).toBe('empty');
    expect(snapshot.nextUp).toBeNull();
  });

  it('state empty juga kalau semua event-nya udah lewat', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('kemarin', '2026-07-18T08:00:00.000Z', '2026-07-18T09:00:00.000Z')],
      { now: NOW },
    );

    expect(snapshot.state).toBe('empty');
  });

  it('state needs_setup kalau kalendernya belum di-connect', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('harusnya diabaikan', '2026-07-19T14:00:00.000Z')],
      { now: NOW, connected: false },
    );

    expect(snapshot.state).toBe('needs_setup');
    expect(snapshot.nextUp).toBeNull();
    expect(snapshot.upcoming).toHaveLength(0);
  });

  it('skip event yang gak punya waktu mulai', () => {
    const snapshot = buildWidgetSnapshot(
      [
        { id: 'rusak', summary: 'tanpa start', start: null, end: null },
        timed('bener', '2026-07-19T14:00:00.000Z'),
      ],
      { now: NOW },
    );

    expect(snapshot.nextUp?.title).toBe('bener');
    expect(snapshot.upcoming).toHaveLength(0);
  });

  it('kasih judul pengganti buat event tanpa summary', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('x', '2026-07-19T14:00:00.000Z', undefined, { summary: '   ' })],
      { now: NOW },
    );

    expect(snapshot.nextUp?.title).toBe('Untitled event');
  });

  it('bikin id sendiri kalau Google gak ngasih — widget butuh key stabil', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('x', '2026-07-19T14:00:00.000Z', undefined, { id: null })],
      { now: NOW },
    );

    expect(snapshot.nextUp?.id).toBeTruthy();
  });

  it('gak kefilter kalau waktu selesainya lebih awal dari waktu mulai', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('data ngaco', '2026-07-19T14:00:00.000Z', '2026-07-19T13:00:00.000Z')],
      { now: NOW },
    );

    expect(snapshot.state).toBe('ready');
    expect(snapshot.nextUp?.title).toBe('data ngaco');
  });

  it('normalisasi lokasi kosong jadi null', () => {
    const snapshot = buildWidgetSnapshot(
      [timed('x', '2026-07-19T14:00:00.000Z', undefined, { location: '  ' })],
      { now: NOW },
    );

    expect(snapshot.nextUp?.location).toBeNull();
  });
});
