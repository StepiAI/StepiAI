import {
  ApiWeekday,
  CreateStudyPlanRequest,
  ScheduleRecord,
  StudyPlanRecord,
} from '../../../services/studyPlan/client';
import { DifficultyLevel, FocusPreference, StudyPlanDraft, Weekday } from '../types';
import { formatDateOnly, formatTimeOnly } from './dateTime';

const WEEKDAY_TO_API: Record<Weekday, ApiWeekday> = {
  Monday: 'MONDAY',
  Tuesday: 'TUESDAY',
  Wednesday: 'WEDNESDAY',
  Thursday: 'THURSDAY',
  Friday: 'FRIDAY',
  Saturday: 'SATURDAY',
  Sunday: 'SUNDAY',
};

const FOCUS_PREFERENCE_TO_API: Record<FocusPreference, CreateStudyPlanRequest['focusPreferences']> = {
  'deep-focus': 'DEEP_FOCUS',
  balanced: 'BALANCED',
  pomodoro: 'PODOMORO',
};

const DIFFICULTY_LEVEL_TO_API: Record<DifficultyLevel, CreateStudyPlanRequest['difficultyLevel']> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
};

export function toCreateStudyPlanRequest(draft: StudyPlanDraft): CreateStudyPlanRequest {
  return {
    title: draft.title.trim(),
    goal: draft.goal.trim(),
    topic: draft.topics.map(topic => topic.label.trim()).filter(label => label.length > 0),
    startDate: formatDateOnly(draft.schedule.startDate),
    endDate: formatDateOnly(draft.schedule.endDate),
    availableDays: draft.schedule.availableDays.map(day => WEEKDAY_TO_API[day]),
    startTime: formatTimeOnly(draft.schedule.preferredStartTime),
    endTime: formatTimeOnly(draft.schedule.preferredEndTime),
    difficultyLevel: DIFFICULTY_LEVEL_TO_API[draft.preferences.difficulty],
    focusPreferences: FOCUS_PREFERENCE_TO_API[draft.preferences.focus],
  };
}

const API_WEEKDAY_TO_DAY_INDEX: Record<ApiWeekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export function countStudyPlanSessions(plan: StudyPlanRecord): number {
  const availableDayIndexes = new Set(plan.availableDays.map(day => API_WEEKDAY_TO_DAY_INDEX[day]));
  if (availableDayIndexes.size === 0) return 0;

  const cursor = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  let count = 0;

  while (cursor.getTime() <= end.getTime()) {
    if (availableDayIndexes.has(cursor.getUTCDay())) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return count;
}

export function getStudyPlanDurationDays(plan: StudyPlanRecord): number {
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

export function computeElapsedProgress(plan: StudyPlanRecord): number {
  const start = new Date(plan.startDate).getTime();
  const end = new Date(plan.endDate).getTime();

  if (end <= start) return 0;

  const ratio = (Date.now() - start) / (end - start);
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}

export function getSessionTopic(plan: StudyPlanRecord, index: number): string | null {
  if (plan.topics.length === 0) return null;
  return plan.topics[index % plan.topics.length];
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isSessionToday(date: Date): boolean {
  return startOfDay(date).getTime() === startOfDay(new Date()).getTime();
}

export function getThisWeekSchedules(schedules: ScheduleRecord[]): ScheduleRecord[] {
  const start = startOfDay(new Date()).getTime();
  const end = start + 7 * 86_400_000;

  return schedules.filter(schedule => {
    const scheduleStart = new Date(schedule.startDateTime).getTime();
    return scheduleStart >= start && scheduleStart < end;
  });
}

export function formatSessionDayLabel(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const dayDiff = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Tomorrow';

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday}, ${date.getDate()} ${month}`;
}
