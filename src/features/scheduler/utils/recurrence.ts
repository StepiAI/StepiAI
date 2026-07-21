import type { PickerOption } from '../components/OptionPickerModal';

export type RepeatValue =
  | 'never'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly';

export const REPEAT_OPTIONS: readonly PickerOption<RepeatValue>[] = [
  { value: 'never', label: 'Never' },
  { value: 'daily', label: 'Every Day' },
  { value: 'weekly', label: 'Every Week' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Every Month' },
  { value: 'yearly', label: 'Every Year' },
];

const RRULES: Record<RepeatValue, string | null> = {
  never: null,
  daily: 'RRULE:FREQ=DAILY',
  weekly: 'RRULE:FREQ=WEEKLY',
  biweekly: 'RRULE:FREQ=WEEKLY;INTERVAL=2',
  monthly: 'RRULE:FREQ=MONTHLY',
  yearly: 'RRULE:FREQ=YEARLY',
};

export function toRecurrence(value: RepeatValue): string[] | undefined {
  const rule = RRULES[value];
  return rule ? [rule] : undefined;
}

export function repeatLabel(value: RepeatValue): string {
  return (
    REPEAT_OPTIONS.find(option => option.value === value)?.label ?? 'Never'
  );
}
