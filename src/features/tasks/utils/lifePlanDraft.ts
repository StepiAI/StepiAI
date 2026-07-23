import { LifePlanDraft, LifePlanTopic, StudyPreferences, StudySchedule } from '../types';
import { addOneMonth, minutesSinceMidnight, startOfToday, timeOfDay } from './dateTime';

export function createDefaultSchedule(): StudySchedule {
  const startDate = startOfToday();

  return {
    startDate,
    endDate: addOneMonth(startDate),
    availableDays: [],
    preferredStartTime: timeOfDay(19),
    preferredEndTime: timeOfDay(21),
  };
}

export function createDefaultPreferences(): StudyPreferences {
  return { focus: 'balanced', difficulty: 'intermediate', includeReviewSessions: true };
}

export function createEmptyDraft(): LifePlanDraft {
  return {
    title: '',
    goal: '',
    topics: [],
    schedule: createDefaultSchedule(),
    preferences: createDefaultPreferences(),
  };
}

export function createTopic(id: string, label = ''): LifePlanTopic {
  return { id, label };
}

export const LIFE_PLAN_FIELD_MIN = 5;
export const LIFE_PLAN_FIELD_MAX = 100;

export function validateLifePlanField(label: string, value: string): string | null {
  const length = value.trim().length;
  if (length === 0) return `${label} is required`;
  if (length < LIFE_PLAN_FIELD_MIN) return `${label} must be at least ${LIFE_PLAN_FIELD_MIN} characters`;
  if (length > LIFE_PLAN_FIELD_MAX) return `${label} must be at most ${LIFE_PLAN_FIELD_MAX} characters`;
  return null;
}

export function isDraftReady(draft: Pick<LifePlanDraft, 'title' | 'goal'>): boolean {
  return (
    validateLifePlanField('Title', draft.title) === null &&
    validateLifePlanField('Goal', draft.goal) === null
  );
}

export function isScheduleReady(schedule: StudySchedule): boolean {
  return (
    schedule.availableDays.length > 0 &&
    schedule.endDate.getTime() >= schedule.startDate.getTime() &&
    minutesSinceMidnight(schedule.preferredEndTime) > minutesSinceMidnight(schedule.preferredStartTime)
  );
}
