import { useCallback, useRef, useState } from 'react';
import { DifficultyLevel, FocusPreference, LifePlanDraft, Weekday } from '../types';
import { createEmptyDraft, createTopic, isDraftReady, isScheduleReady } from '../utils/lifePlanDraft';

export function useLifePlanDraft() {
  const [draft, setDraft] = useState<LifePlanDraft>(createEmptyDraft);

  // counter lokal biar id topic gak kembar walau ditambah beruntun
  const nextTopicId = useRef(0);

  const setTitle = useCallback((title: string) => {
    setDraft(current => ({ ...current, title }));
  }, []);

  const setGoal = useCallback((goal: string) => {
    setDraft(current => ({ ...current, goal }));
  }, []);

  const addTopic = useCallback(() => {
    nextTopicId.current += 1;
    const topic = createTopic(`topic-${nextTopicId.current}`);
    setDraft(current => ({ ...current, topics: [...current.topics, topic] }));
  }, []);

  const updateTopic = useCallback((id: string, label: string) => {
    setDraft(current => ({
      ...current,
      topics: current.topics.map(topic => (topic.id === id ? { ...topic, label } : topic)),
    }));
  }, []);

  const removeTopic = useCallback((id: string) => {
    setDraft(current => ({
      ...current,
      topics: current.topics.filter(topic => topic.id !== id),
    }));
  }, []);

  const setScheduleStartDate = useCallback((startDate: Date) => {
    setDraft(current => ({ ...current, schedule: { ...current.schedule, startDate } }));
  }, []);

  const setScheduleEndDate = useCallback((endDate: Date) => {
    setDraft(current => ({ ...current, schedule: { ...current.schedule, endDate } }));
  }, []);

  const toggleAvailableDay = useCallback((day: Weekday) => {
    setDraft(current => {
      const { availableDays } = current.schedule;
      const nextAvailableDays = availableDays.includes(day)
        ? availableDays.filter(existing => existing !== day)
        : [...availableDays, day];

      return { ...current, schedule: { ...current.schedule, availableDays: nextAvailableDays } };
    });
  }, []);

  const setPreferredStartTime = useCallback((preferredStartTime: Date) => {
    setDraft(current => ({
      ...current,
      schedule: { ...current.schedule, preferredStartTime },
    }));
  }, []);

  const setPreferredEndTime = useCallback((preferredEndTime: Date) => {
    setDraft(current => ({
      ...current,
      schedule: { ...current.schedule, preferredEndTime },
    }));
  }, []);

  const setFocus = useCallback((focus: FocusPreference) => {
    setDraft(current => ({ ...current, preferences: { ...current.preferences, focus } }));
  }, []);

  const setDifficulty = useCallback((difficulty: DifficultyLevel) => {
    setDraft(current => ({ ...current, preferences: { ...current.preferences, difficulty } }));
  }, []);

  const setIncludeReviewSessions = useCallback((includeReviewSessions: boolean) => {
    setDraft(current => ({
      ...current,
      preferences: { ...current.preferences, includeReviewSessions },
    }));
  }, []);

  const reset = useCallback(() => {
    nextTopicId.current = 0;
    setDraft(createEmptyDraft());
  }, []);

  return {
    draft,
    setTitle,
    setGoal,
    addTopic,
    updateTopic,
    removeTopic,
    setScheduleStartDate,
    setScheduleEndDate,
    toggleAvailableDay,
    setPreferredStartTime,
    setPreferredEndTime,
    setFocus,
    setDifficulty,
    setIncludeReviewSessions,
    reset,
    canSubmitGoals: isDraftReady(draft),
    canSubmitSchedule: isScheduleReady(draft.schedule),
  };
}
