import { toDateKey } from '../day';
import { addMonths, buildMonthGrid, formatMonthYear, startOfMonth } from '../month';

describe('addMonths', () => {
  it('31 Jan + 1 bulan jadi Februari, bukan lompat ke Maret', () => {
    expect(formatMonthYear(addMonths(new Date(2026, 0, 31), 1))).toBe('February 2026');
  });

  it('mundur bisa nyebrang tahun', () => {
    expect(formatMonthYear(addMonths(new Date(2026, 0, 15), -1))).toBe('December 2025');
  });

  it('maju bisa nyebrang tahun', () => {
    expect(formatMonthYear(addMonths(new Date(2026, 11, 15), 1))).toBe('January 2027');
  });
});

describe('buildMonthGrid', () => {
  it('selalu 6 baris x 7 kolom biar tinggi popup-nya gak loncat', () => {
    for (let month = 0; month < 12; month++) {
      const grid = buildMonthGrid(new Date(2026, month, 1));

      expect(grid).toHaveLength(6);
      grid.forEach(row => expect(row).toHaveLength(7));
    }
  });

  it('semua tanggal di bulan itu kebawa, gak ada yang keilangan', () => {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(2026, month + 1, 0).getDate();
      const shown = buildMonthGrid(new Date(2026, month, 1))
        .flat()
        .filter(cell => cell.inCurrentMonth);

      expect(shown).toHaveLength(daysInMonth);
      expect(shown[0].dayOfMonth).toBe(1);
      expect(shown[shown.length - 1].dayOfMonth).toBe(daysInMonth);
    }
  });

  it('mulai dari senin dan nandain tanggal bulan sebelah', () => {
    const firstRow = buildMonthGrid(new Date(2026, 6, 1))[0];

    expect(firstRow.map(cell => cell.inCurrentMonth)).toEqual([
      false, false, true, true, true, true, true,
    ]);
    expect(firstRow[2].dayOfMonth).toBe(1);
  });

  it('grid-nya berurutan tanpa tanggal dobel atau bolong', () => {
    const cells = buildMonthGrid(new Date(2026, 1, 1)).flat();

    for (let index = 1; index < cells.length; index++) {
      const previous = cells[index - 1].date;
      const expected = new Date(previous);
      expected.setDate(previous.getDate() + 1);

      expect(toDateKey(cells[index].date)).toBe(toDateKey(expected));
    }
  });
});

describe('startOfMonth', () => {
  it('balikin tanggal 1', () => {
    expect(toDateKey(startOfMonth(new Date(2026, 6, 19)))).toBe('2026-07-01');
  });
});
