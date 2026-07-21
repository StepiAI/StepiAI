import type { PickerOption } from '../components/OptionPickerModal';

export type AlertValue =
  | 'none'
  | 'at_time'
  | 'min_5'
  | 'min_15'
  | 'min_30'
  | 'hour_1'
  | 'day_1';

export const ALERT_OPTIONS: readonly PickerOption<AlertValue>[] = [
  { value: 'none', label: 'None' },
  { value: 'at_time', label: 'At time of event' },
  { value: 'min_5', label: '5 minutes before' },
  { value: 'min_15', label: '15 minutes before' },
  { value: 'min_30', label: '30 minutes before' },
  { value: 'hour_1', label: '1 hour before' },
  { value: 'day_1', label: '1 day before' },
];

export const ALERT_MINUTES_BEFORE: Record<AlertValue, number | null> = {
  none: null,
  at_time: 0,
  min_5: 5,
  min_15: 15,
  min_30: 30,
  hour_1: 60,
  day_1: 1440,
};

export function alertLabel(value: AlertValue): string {
  return ALERT_OPTIONS.find(option => option.value === value)?.label ?? 'None';
}
