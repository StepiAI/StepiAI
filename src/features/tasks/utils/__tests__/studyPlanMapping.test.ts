import type { ScheduleRecord, StudyPlanRecord } from '../../../../services/studyPlan/client';
import type { Weekday } from '../../types';
import { createEmptyDraft, createTopic } from '../studyPlanDraft';
import {
  computeElapsedProgress,
  countStudyPlanSessions,
  formatSessionDayLabel,
  getSessionTopic,
  getStudyPlanDurationDays,
  getThisWeekSchedules,
  isSessionToday,
  toCreateStudyPlanRequest,
} from '../studyPlanMapping';

function buildRecord(overrides: Partial<StudyPlanRecord> = {}): StudyPlanRecord {
  return {
    id: 'plan-1',
    userId: 'user-1',
    title: 'Learning React',
    goal: 'Build one project',
    topics: ['Hooks'],
    startDate: '2026-07-20T00:00:00.000Z',
    endDate: '2026-08-20T00:00:00.000Z',
    availableDays: ['SATURDAY', 'SUNDAY'],
    startTime: '19:00',
    endTime: '21:00',
    difficultyLevel: 'INTERMEDIATE',
    focusPreferences: 'BALANCED',
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('toCreateStudyPlanRequest', () => {
  it('konversi hari, fokus, dan level kesulitan ke format enum backend', () => {
    const draft = {
      ...createEmptyDraft(),
      title: 'Learning React',
      goal: 'Build one project',
      topics: [createTopic('topic-1', 'Hooks'), createTopic('topic-2', '  ')],
      schedule: {
        startDate: new Date(2026, 6, 20),
        endDate: new Date(2026, 7, 20),
        availableDays: ['Saturday', 'Sunday'] as Weekday[],
        preferredStartTime: new Date(2026, 6, 20, 19, 0),
        preferredEndTime: new Date(2026, 6, 20, 21, 0),
      },
      preferences: { focus: 'balanced' as const, difficulty: 'intermediate' as const, includeReviewSessions: true },
    };

    expect(toCreateStudyPlanRequest(draft)).toEqual({
      title: 'Learning React',
      goal: 'Build one project',
      topic: ['Hooks'],
      startDate: '2026-07-20',
      endDate: '2026-08-20',
      availableDays: ['SATURDAY', 'SUNDAY'],
      startTime: '19:00',
      endTime: '21:00',
      difficultyLevel: 'INTERMEDIATE',
      focusPreferences: 'BALANCED',
    });
  });
});

describe('countStudyPlanSessions', () => {
  it('ngitung jumlah hari yang cocok sama available days dalam rentang tanggal', () => {
    const plan = buildRecord({
      startDate: '2026-07-20T00:00:00.000Z',
      endDate: '2026-07-27T00:00:00.000Z',
      availableDays: ['SATURDAY', 'SUNDAY'],
    });

    // 20 Jul 2026 (Senin) - 27 Jul 2026 (Senin): yang cocok cuma Sabtu 25 & Minggu 26
    expect(countStudyPlanSessions(plan)).toBe(2);
  });

  it('balikin 0 kalau gak ada available days', () => {
    expect(countStudyPlanSessions(buildRecord({ availableDays: [] }))).toBe(0);
  });
});

describe('getStudyPlanDurationDays', () => {
  it('ngitung selisih hari antara startDate dan endDate', () => {
    const plan = buildRecord({
      startDate: '2026-07-20T00:00:00.000Z',
      endDate: '2026-08-20T00:00:00.000Z',
    });

    expect(getStudyPlanDurationDays(plan)).toBe(31);
  });
});

describe('computeElapsedProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(Date.UTC(2026, 6, 30)));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ngitung persentase seberapa jauh tanggal sekarang di antara start dan end', () => {
    const plan = buildRecord({
      startDate: '2026-07-20T00:00:00.000Z',
      endDate: '2026-08-19T00:00:00.000Z',
    });

    // 10 dari 30 hari udah lewat -> 33%
    expect(computeElapsedProgress(plan)).toBe(33);
  });

  it('balikin 0 kalau belum masuk startDate', () => {
    const plan = buildRecord({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-20T00:00:00.000Z',
    });

    expect(computeElapsedProgress(plan)).toBe(0);
  });

  it('balikin 100 kalau udah lewat endDate', () => {
    const plan = buildRecord({
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-07-01T00:00:00.000Z',
    });

    expect(computeElapsedProgress(plan)).toBe(100);
  });
});

describe('getSessionTopic', () => {
  it('muter urutan topics bergilir berdasarkan index sesi', () => {
    const plan = buildRecord({ topics: ['Hooks', 'State', 'Routing'] });

    expect(getSessionTopic(plan, 0)).toBe('Hooks');
    expect(getSessionTopic(plan, 1)).toBe('State');
    expect(getSessionTopic(plan, 3)).toBe('Hooks');
  });

  it('balikin null kalau plan gak punya topics', () => {
    expect(getSessionTopic(buildRecord({ topics: [] }), 0)).toBeNull();
  });
});

function buildSchedule(overrides: Partial<ScheduleRecord> = {}): ScheduleRecord {
  return {
    id: 'schedule-1',
    userId: 'user-1',
    studyPlanId: 'plan-1',
    summary: 'Learning React',
    description: 'Build one project',
    location: 'ONLINE',
    startDateTime: '2026-07-20T19:00:00.000Z',
    endDateTime: '2026-07-20T21:00:00.000Z',
    status: 'ACCEPTED',
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('isSessionToday dan formatSessionDayLabel', () => {
  const TODAY = new Date(2026, 6, 20, 10, 0);

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(TODAY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('isSessionToday nganggep bener kalau tanggalnya sama walau jamnya beda', () => {
    expect(isSessionToday(new Date(2026, 6, 20, 23, 0))).toBe(true);
    expect(isSessionToday(new Date(2026, 6, 21, 0, 0))).toBe(false);
  });

  it('formatSessionDayLabel ngasih label Today/Tomorrow buat tanggal deket', () => {
    expect(formatSessionDayLabel(new Date(2026, 6, 20))).toBe('Today');
    expect(formatSessionDayLabel(new Date(2026, 6, 21))).toBe('Tomorrow');
  });

  it('formatSessionDayLabel ngasih format "Weekday, d Month" buat tanggal lainnya', () => {
    expect(formatSessionDayLabel(new Date(2026, 6, 25))).toBe('Sat, 25 July');
  });
});

describe('getThisWeekSchedules', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 20));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cuma ambil sesi dari hari ini sampai 7 hari ke depan', () => {
    const schedules = [
      buildSchedule({ id: 'yesterday', startDateTime: new Date(2026, 6, 19, 19, 0).toISOString() }),
      buildSchedule({ id: 'today', startDateTime: new Date(2026, 6, 20, 19, 0).toISOString() }),
      buildSchedule({ id: 'in-6-days', startDateTime: new Date(2026, 6, 26, 19, 0).toISOString() }),
      buildSchedule({ id: 'in-10-days', startDateTime: new Date(2026, 6, 30, 19, 0).toISOString() }),
    ];

    expect(getThisWeekSchedules(schedules).map(schedule => schedule.id)).toEqual([
      'today',
      'in-6-days',
    ]);
  });
});
