import {
  createDefaultPreferences,
  createDefaultSchedule,
  createEmptyDraft,
  createTopic,
  isDraftReady,
  isScheduleReady,
} from '../studyPlanDraft';

describe('createEmptyDraft', () => {
  it('mulai tanpa judul, goal, dan topic', () => {
    const draft = createEmptyDraft();
    expect(draft.title).toBe('');
    expect(draft.goal).toBe('');
    expect(draft.topics).toEqual([]);
  });

  it('pakai default schedule dan preferences', () => {
    const draft = createEmptyDraft();
    expect(draft.schedule).toEqual(createDefaultSchedule());
    expect(draft.preferences).toEqual(createDefaultPreferences());
  });
});

describe('createTopic', () => {
  it('pakai id yang dikasih dan label kosong secara default', () => {
    expect(createTopic('topic-1')).toEqual({ id: 'topic-1', label: '' });
  });

  it('bisa dikasih label awal', () => {
    expect(createTopic('topic-1', 'Animation')).toEqual({ id: 'topic-1', label: 'Animation' });
  });
});

describe('isDraftReady', () => {
  it('belum siap kalau title atau goal masih kosong', () => {
    expect(isDraftReady({ title: '', goal: '' })).toBe(false);
    expect(isDraftReady({ title: 'Learning React', goal: '' })).toBe(false);
    expect(isDraftReady({ title: '', goal: 'Build one project' })).toBe(false);
  });

  it('nolak kalau isinya cuma spasi', () => {
    expect(isDraftReady({ title: '   ', goal: '   ' })).toBe(false);
  });

  it('siap begitu title dan goal keisi', () => {
    expect(isDraftReady({ title: 'Learning React', goal: 'Build one project' })).toBe(true);
  });
});

describe('isScheduleReady', () => {
  it('nolak jadwal default karena belum ada hari yang dipilih', () => {
    expect(isScheduleReady(createDefaultSchedule())).toBe(false);
  });

  it('siap begitu minimal satu hari dipilih', () => {
    expect(isScheduleReady({ ...createDefaultSchedule(), availableDays: ['Saturday'] })).toBe(true);
  });

  it('nolak kalau tanggal selesai sebelum tanggal mulai', () => {
    const schedule = createDefaultSchedule();
    expect(
      isScheduleReady({
        ...schedule,
        endDate: new Date(schedule.startDate.getTime() - 86_400_000),
      }),
    ).toBe(false);
  });

  it('nolak kalau jam selesai gak setelah jam mulai', () => {
    const schedule = createDefaultSchedule();
    expect(
      isScheduleReady({
        ...schedule,
        preferredEndTime: schedule.preferredStartTime,
      }),
    ).toBe(false);
  });
});
