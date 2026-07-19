import { toDateKey } from '../day';
import { buildWeek, formatWeekRange, startOfWeek } from '../week';

describe('startOfWeek', () => {
  it('balikin senin di minggu yang sama', () => {
    expect(toDateKey(startOfWeek(new Date(2026, 4, 21)))).toBe('2026-05-18');
  });

  it('minggu ikut ke minggu yang lagi jalan, bukan lompat ke senin depan', () => {
    expect(toDateKey(startOfWeek(new Date(2026, 4, 24)))).toBe('2026-05-18');
  });

  it('senin balikin dirinya sendiri', () => {
    expect(toDateKey(startOfWeek(new Date(2026, 4, 18)))).toBe('2026-05-18');
  });
});

describe('buildWeek', () => {
  const week = buildWeek(new Date(2026, 4, 21));

  it('tujuh hari mulai dari senin', () => {
    expect(week).toHaveLength(7);
    expect(week.map(day => day.dayOfMonth)).toEqual([18, 19, 20, 21, 22, 23, 24]);
  });

  it('label harinya ngikutin desain', () => {
    expect(week.map(day => day.label)).toEqual([
      'Mo', 'Tu', 'Wed', 'Th', 'Fr', 'Sa', 'Su',
    ]);
  });

  it('key-nya tanggal lokal, bukan hasil geseran UTC', () => {
    expect(week[0].key).toBe('2026-05-18');
    expect(week[6].key).toBe('2026-05-24');
  });
});

describe('formatWeekRange', () => {
  it('sebulan cukup nulis bulannya sekali', () => {
    expect(formatWeekRange(buildWeek(new Date(2026, 4, 21)))).toBe('May 18 - 24');
  });

  it('kalau nyebrang bulan, dua-duanya ditulis', () => {
    expect(formatWeekRange(buildWeek(new Date(2026, 3, 30)))).toBe('Apr 27 - May 3');
  });

  it('minggu kosong gak bikin error', () => {
    expect(formatWeekRange([])).toBe('');
  });
});
