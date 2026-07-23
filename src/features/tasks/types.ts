export interface LifePlanTopic {
  id: string;
  label: string;
}

export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type FocusPreference = 'deep-focus' | 'balanced' | 'pomodoro';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface StudySchedule {
  startDate: Date;
  endDate: Date;
  availableDays: Weekday[];
  preferredStartTime: Date;
  preferredEndTime: Date;
}

export interface StudyPreferences {
  focus: FocusPreference;
  difficulty: DifficultyLevel;
  includeReviewSessions: boolean;
}

export interface LifePlanDraft {
  title: string;
  goal: string;
  topics: LifePlanTopic[];
  schedule: StudySchedule;
  preferences: StudyPreferences;
}
