export interface WidgetEvent {
  id: string;
  title: string;
  timeLabel: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
}

export type WidgetState = | 'needs_setup' | 'empty' | 'ready';

export interface WidgetSnapshot {
  state: WidgetState;
  nextUp: WidgetEvent | null;
  upcoming: WidgetEvent[];
  inProgress: boolean;
  generatedAt: string;
}

export const EMPTY_SNAPSHOT: WidgetSnapshot = {
  state: 'needs_setup',
  nextUp: null,
  upcoming: [],
  inProgress: false,
  generatedAt: new Date(0).toISOString(),
};
