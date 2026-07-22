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

export function isDraftReady(draft: Pick<LifePlanDraft, 'title' | 'goal'>): boolean {
  return draft.title.trim().length > 0 && draft.goal.trim().length > 0;
}

export function isScheduleReady(schedule: StudySchedule): boolean {
  return (
    schedule.availableDays.length > 0 &&
    schedule.endDate.getTime() >= schedule.startDate.getTime() &&
    minutesSinceMidnight(schedule.preferredEndTime) > minutesSinceMidnight(schedule.preferredStartTime)
  );
}
