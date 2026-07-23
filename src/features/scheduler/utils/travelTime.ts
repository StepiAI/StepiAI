import type { PickerOption } from '../components/OptionPickerModal';

export type TravelTimeValue =
  | 'none'
  | 'min_5'
  | 'min_15'
  | 'min_30'
  | 'hour_1'
  | 'hour_1_30'
  | 'hour_2';

export const TRAVEL_TIME_OPTIONS: readonly PickerOption<TravelTimeValue>[] = [
  { value: 'none', label: 'None' },
  { value: 'min_5', label: '5 minutes' },
  { value: 'min_15', label: '15 minutes' },
  { value: 'min_30', label: '30 minutes' },
  { value: 'hour_1', label: '1 hour' },
  { value: 'hour_1_30', label: '1 hour, 30 minutes' },
  { value: 'hour_2', label: '2 hours' },
];

export const TRAVEL_TIME_MINUTES: Record<TravelTimeValue, number> = {
  none: 0,
  min_5: 5,
  min_15: 15,
  min_30: 30,
  hour_1: 60,
  hour_1_30: 90,
  hour_2: 120,
};

export function travelTimeLabel(value: TravelTimeValue): string {
  return TRAVEL_TIME_OPTIONS.find(option => option.value === value)?.label ?? 'None';
}
