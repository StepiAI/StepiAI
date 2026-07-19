import { NOTCH_DEPTH } from './tabBarLayout';

const CORNER_RADIUS = 20;
export const TAB_BAR_NOTCH_HALF_SPAN = 62.5;
const LEAD_IN = 33;

export const TAB_BAR_NOTCH_MAX_SLOPE_DEG =
  (Math.atan(
    (2 * NOTCH_DEPTH) / (2 * TAB_BAR_NOTCH_HALF_SPAN - 2 * LEAD_IN),
  ) *
    180) /
  Math.PI;

export interface TabBarPathOptions {
  width: number;
  height: number;
}

export function buildTabBarPath({ width, height }: TabBarPathOptions): string {
  const centerX = width / 2;

  const round = (value: number) => Math.round(value * 100) / 100;

  const start = round(centerX - TAB_BAR_NOTCH_HALF_SPAN);
  const end = round(centerX + TAB_BAR_NOTCH_HALF_SPAN);
  const leftLead = round(start + LEAD_IN);
  const rightLead = round(end - LEAD_IN);
  const leftBottom = round(centerX - LEAD_IN);
  const rightBottom = round(centerX + LEAD_IN);
  const depth = round(NOTCH_DEPTH);

  return [
    `M 0 ${CORNER_RADIUS}`,
    `Q 0 0 ${CORNER_RADIUS} 0`,
    `L ${start} 0`,
    `C ${leftLead} 0 ${leftBottom} ${depth} ${round(centerX)} ${depth}`,
    `C ${rightBottom} ${depth} ${rightLead} 0 ${end} 0`,
    `L ${round(width - CORNER_RADIUS)} 0`,
    `Q ${round(width)} 0 ${round(width)} ${CORNER_RADIUS}`,
    `L ${round(width)} ${round(height)}`,
    `L 0 ${round(height)}`,
    'Z',
  ].join(' ');
}
