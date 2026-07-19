import {
  addHourToTimeInput,
  parseLocalDateTime,
  todayAsDateInput,
} from '../eventForm';

describe('parseLocalDateTime', () => {
  it('gabungin tanggal + jam jadi waktu lokal', () => {
    const result = parseLocalDateTime('2026-07-18', '14:30');

    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(6);
    expect(result!.getDate()).toBe(18);
    expect(result!.getHours()).toBe(14);
    expect(result!.getMinutes()).toBe(30);
  });

  it('nolak tanggal yang gak ada', () => {
    expect(parseLocalDateTime('2026-02-31', '09:00')).toBeNull();
  });

  it('nolak format tanggal yang gak dipad', () => {
    expect(parseLocalDateTime('2026-7-18', '14:30')).toBeNull();
  });

  it('nolak jam di luar akal', () => {
    expect(parseLocalDateTime('2026-07-18', '25:00')).toBeNull();
    expect(parseLocalDateTime('2026-07-18', '10:75')).toBeNull();
  });

  it('nolak input kosong / ngawur', () => {
    expect(parseLocalDateTime('', '')).toBeNull();
    expect(parseLocalDateTime('besok', 'pagi')).toBeNull();
  });

  it('jam satu digit masih diterima', () => {
    expect(parseLocalDateTime('2026-07-18', '9:05')?.getHours()).toBe(9);
  });
});

describe('addHourToTimeInput', () => {
  it('nambah sejam', () => {
    expect(addHourToTimeInput('09:00')).toBe('10:00');
    expect(addHourToTimeInput('10:30')).toBe('11:30');
  });

  it('muter balik lewat tengah malam', () => {
    expect(addHourToTimeInput('23:30')).toBe('00:30');
  });

  it('input ngawur balikin string kosong', () => {
    expect(addHourToTimeInput('abc')).toBe('');
  });
});

describe('todayAsDateInput', () => {
  it('formatnya YYYY-MM-DD dan bisa dibaca balik', () => {
    const formatted = todayAsDateInput(new Date(2026, 6, 5));

    expect(formatted).toBe('2026-07-05');
    expect(parseLocalDateTime(formatted, '10:00')).not.toBeNull();
  });
});
