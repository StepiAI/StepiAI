import { useSyncExternalStore } from 'react';

// "revisi" kalender: dinaikin tiap ada mutasi (create/update/delete/reschedule).
// hook list event nyimak angka ini, jadi begitu ada perubahan datanya auto
// refetch — gak perlu pull-to-refresh manual lagi.
let revision = 0;
const listeners = new Set<() => void>();

export function bumpCalendarRevision() {
  revision += 1;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return revision;
}

export function useCalendarRevision() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
