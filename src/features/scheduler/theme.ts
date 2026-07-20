import { EventTone } from './utils/timeline';

export const EVENT_TONE: Record<EventTone, { background: string; text: string }> = {
  blue: { background: '#DCE8FB', text: '#4A8FE0' },
  purple: { background: '#E5E1FB', text: '#7B70EE' },
};

export const NOW_INDICATOR_COLOR = '#F34A4D';

export const ALERT_TONE = {
  background: '#FDECEC',
  title: '#D64545',
  body: '#C56A6A',
  action: '#D64545',
};
