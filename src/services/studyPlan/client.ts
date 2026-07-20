import { apiClient } from '../api/client';

const BASE_PATH = '/study-plans';

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

export interface CreateStudyPlanRequest {
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

export interface StudyPlanRecord {
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
  studyPlanId: string | null;
  summary: string;
  description: string | null;
  location: string | null;
  startDateTime: string;
  endDateTime: string;
  status: ApiScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanDetail extends StudyPlanRecord {
  schedules: ScheduleRecord[];
}

export function createStudyPlan(request: CreateStudyPlanRequest) {
  return apiClient.post<StudyPlanRecord>(BASE_PATH, request);
}

export function listStudyPlans() {
  return apiClient.get<StudyPlanRecord[]>(BASE_PATH);
}

export function getStudyPlan(id: string) {
  return apiClient.get<StudyPlanDetail>(`${BASE_PATH}/${id}`);
}
