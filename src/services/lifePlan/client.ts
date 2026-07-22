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
  createdAt: string;
  updatedAt: string;
}

export type ApiScheduleStatus = 'PENDING' | 'ACCEPTED';

export interface ScheduleRecord {
  id: string;
  userId: string;
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

export function createLifePlan(request: CreateLifePlanRequest) {
  return apiClient.post<LifePlanRecord>(BASE_PATH, request);
}

export function listLifePlans() {
  return apiClient.get<LifePlanRecord[]>(BASE_PATH);
}

export function getLifePlan(id: string) {
  return apiClient.get<LifePlanDetail>(`${BASE_PATH}/${id}`);
}
