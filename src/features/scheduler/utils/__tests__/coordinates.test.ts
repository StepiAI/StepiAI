import { formatCoordinates } from '../coordinates';

describe('formatCoordinates', () => {
  it('formats southern & eastern coordinates as DMS with direction', () => {
    // 6°17'32'' S, 106°38'38'' E
    expect(formatCoordinates(-6.292222, 106.643889)).toBe(
      "6°17'32'' S, 106°38'38'' E",
    );
  });

  it('uses N and W for positive latitude and negative longitude', () => {
    expect(formatCoordinates(40.75, -73.9967)).toBe(
      "40°45'0'' N, 73°59'48'' W",
    );
  });

  it('handles the equator / prime meridian as positive directions', () => {
    expect(formatCoordinates(0, 0)).toBe("0°0'0'' N, 0°0'0'' E");
  });

  it('carries seconds that round up to 60 into the next minute', () => {
    expect(formatCoordinates(1.016666, 0)).toBe("1°1'0'' N, 0°0'0'' E");
  });
});
