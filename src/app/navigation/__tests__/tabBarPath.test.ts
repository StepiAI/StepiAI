import { NOTCH_DEPTH } from '../tabBarLayout';
import {
  buildTabBarPath,
  TAB_BAR_NOTCH_HALF_SPAN,
  TAB_BAR_NOTCH_MAX_SLOPE_DEG,
} from '../tabBarPath';

const NUMBER = '(-?[\\d.]+)';

function notchStart(path: string) {
  return Number(path.match(new RegExp(`L ${NUMBER} 0 C`))?.[1]);
}

function notchEnd(path: string) {
  const match = path.match(
    new RegExp(`C ${NUMBER} ${NOTCH_DEPTH} ${NUMBER} 0 ${NUMBER} 0`),
  );
  return Number(match?.[3]);
}

describe('buildTabBarPath', () => {
  it('bentuknya ketutup, biar keisi warna bukan cuma garis', () => {
    expect(buildTabBarPath({ width: 390, height: 80 }).trim().endsWith('Z')).toBe(true);
  });

  it('lekukannya simetris terhadap tengah layar', () => {
    const width = 390;
    const path = buildTabBarPath({ width, height: 80 });

    expect(notchStart(path) + notchEnd(path)).toBeCloseTo(width, 1);
  });

  it('ikut center walau lebar layarnya beda', () => {
    for (const width of [320, 390, 428]) {
      const path = buildTabBarPath({ width, height: 80 });
      expect(notchStart(path) + notchEnd(path)).toBeCloseTo(width, 1);
    }
  });

  it('turun sampai kedalaman yang ditentukan', () => {
    const path = buildTabBarPath({ width: 390, height: 80 });

    expect(path).toContain(`195 ${NOTCH_DEPTH}`);
  });

  it('turunnya diagonal, gak nyaris tegak lurus', () => {
    expect(TAB_BAR_NOTCH_MAX_SLOPE_DEG).toBeGreaterThan(52);
    expect(TAB_BAR_NOTCH_MAX_SLOPE_DEG).toBeLessThan(60);
  });

  it('kurvanya monoton menuju tengah, gak melipat', () => {
    const width = 390;
    const path = buildTabBarPath({ width, height: 80 });
    const match = path.match(
      new RegExp(`L ${NUMBER} 0 C ${NUMBER} 0 ${NUMBER} ${NOTCH_DEPTH} ${NUMBER} ${NOTCH_DEPTH}`),
    );
    const [, startX, c1x, c2x, endX] = match!.map(Number);

    const bezierX = (t: number) => {
      const mt = 1 - t;
      return mt ** 3 * startX + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t ** 3 * endX;
    };

    let prevX = -Infinity;
    for (let i = 0; i <= 50; i++) {
      const x = bezierX(i / 50);
      expect(x).toBeGreaterThanOrEqual(prevX - 0.01);
      prevX = x;
    }
  });

  it('lekukannya gak makan sudut membulat di layar sempit', () => {
    expect(notchStart(buildTabBarPath({ width: 280, height: 80 }))).toBeGreaterThan(52);
  });

  it('gak melebar keluar layar', () => {
    const width = 320;
    const path = buildTabBarPath({ width, height: 80 });

    expect(notchStart(path)).toBeGreaterThan(0);
    expect(notchEnd(path)).toBeLessThan(width);
  });

  it('turun sampai tinggi yang diminta, biar gak ada celah di bawah', () => {
    const height = 96;

    expect(buildTabBarPath({ width: 390, height })).toContain(`L 0 ${height}`);
  });

  it('lekukannya lebih lebar dari FAB, biar ada ruang di sisi kiri-kanannya', () => {
    expect(TAB_BAR_NOTCH_HALF_SPAN * 2).toBeGreaterThan(56);
  });
});
