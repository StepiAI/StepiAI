import { apiClient } from '../api/client';

const BASE_PATH = '/life-plans';

export type ApiWeekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type ApiDifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ApiFocusPreference = 'DEEP_FOCUS' | 'BALANCED' | 'PODOMORO';

export interface ScheduleOverride {
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateLifePlanRequest {
  title: string;
  goal: string;
  topic: string[];
  startDate: string;
  endDate: string;
  availableDays: ApiWeekday[];
  startTime: string;
  endTime: string;
  difficultyLevel: ApiDifficultyLevel;
  focusPreferences: ApiFocusPreference;
  skippedDates?: string[];
  scheduleOverrides?: ScheduleOverride[];
}

export interface LifePlanRecord {
  id: string;
  userId: string;
  title: string;
  goal: string;
  topics: string[];
  startDate: string;
  endDate: string;
  availableDays: ApiWeekday[];
  startTime: string;
  endTime: string;
  difficultyLevel: ApiDifficultyLevel;
  focusPreferences: ApiFocusPreference;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApiScheduleStatus = 'PENDING' | 'ACCEPTED';

export interface ScheduleRecord {
  id: string;
  userId: string;
  messageId: string;
  lifePlanId: string | null;
  summary: string;
  description: string | null;
  location: string | null;
  startDateTime: string;
  endDateTime: string;
  status: ApiScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LifePlanDetail extends LifePlanRecord {
  schedules: ScheduleRecord[];
}

export interface LifePlanConflictSchedule {
  id: string;
  summary: string;
  startDateTime: string;
  endDateTime: string;
}

export interface LifePlanScheduleConflict {
  date: string;
  proposedStartDateTime: string;
  proposedEndDateTime: string;
  conflictingSchedules: LifePlanConflictSchedule[];
}

export type LifePlanConflictOptionType =
  | 'skip_day_and_extend'
  | 'change_time_for_day';

export interface LifePlanConflictOption {
  type: LifePlanConflictOptionType;
  content: string;
  updatedEndDate?: string;
  skippedDates?: string[];
  replacementDates?: string[];
  scheduleOverrides?: ScheduleOverride[];
}

export interface LifePlanConflictResult {
  type: 'life_plan_conflict';
  content: string;
  conflicts: LifePlanScheduleConflict[];
  options: LifePlanConflictOption[];
}

export type CreateLifePlanResult =
  | { created: true; lifePlan: LifePlanRecord }
  | { created: false; conflict: LifePlanConflictResult };

export function createLifePlan(request: CreateLifePlanRequest) {
  return apiClient.post<CreateLifePlanResult>(BASE_PATH, request);
}

export function listLifePlans() {
  return apiClient.get<LifePlanRecord[]>(BASE_PATH);
}

export function getLifePlan(id: string) {
  return apiClient.get<LifePlanDetail>(`${BASE_PATH}/${id}`);
}

export function setLifePlanArchived(id: string, archived: boolean) {
  return apiClient.patch<LifePlanRecord>(`${BASE_PATH}/${id}/archive`, { archived });
}

export function deleteLifePlan(id: string) {
  return apiClient.delete<{ deleted: true }>(`${BASE_PATH}/${id}`);
}
