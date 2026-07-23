import type { GoogleCalendarEvent } from '../../services/googleCalendar/client';

export interface EventTone {
  background: string;
  text: string;
}

export const EVENT_PALETTE: EventTone[] = [
  { background: '#1A73E81A', text: '#1A73E8' },
  { background: '#FBF1CE', text: '#977512' },
  { background: '#7E77FF1A', text: '#7E77FF' },
  { background: '#D9F0DE', text: '#2E8B4F' },
  { background: '#FBE0EA', text: '#C24B7E' },
];

export const TONE_PURPLE = EVENT_PALETTE[2];

export function eventColorSeed(event: GoogleCalendarEvent): string {
  return (
    event.id ?? `${event.start?.dateTime ?? event.start?.date ?? ''}-${event.summary ?? ''}`
  );
}

export function toneIndexFor(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_000_007;
  }
  return hash % EVENT_PALETTE.length;
}

export function eventTone(seed: string): EventTone {
  return EVENT_PALETTE[toneIndexFor(seed)];
}
