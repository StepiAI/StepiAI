import { apiClient } from '../api/client';
import { bumpCalendarRevision } from '../googleCalendar/revision';
import type { ScheduleRecord } from '../lifePlan/client';

const BASE_PATH = '/schedules';

/**
 * Jadwal lokal dari database STEPI (bukan Google Calendar) — termasuk sesi
 * life plan. Server udah nge-filter sesi milik plan yg archived/deleted.
 */
export function listSchedules(timeMin?: string, timeMax?: string) {
  const params = new URLSearchParams();
  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);
  params.set('status', 'ACCEPTED');
  return apiClient.get<ScheduleRecord[]>(`${BASE_PATH}?${params.toString()}`);
}

export function deleteSchedule(scheduleId: string) {
  return apiClient
    .delete<{ deleted: true }>(`${BASE_PATH}/${encodeURIComponent(scheduleId)}`)
    .then(result => {
      // biar kalender yg lagi kebuka ikut refresh
      bumpCalendarRevision();
      return result;
    });
}

export interface UpdateScheduleInput {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
}


export function toUtcIso(date: Date): string {
  return date.toISOString();
}

export function updateSchedule(scheduleId: string, input: UpdateScheduleInput) {
  return apiClient
    .put<ScheduleRecord>(`${BASE_PATH}/${encodeURIComponent(scheduleId)}`, input)
    .then(result => {
      bumpCalendarRevision();
      return result;
    });
}
