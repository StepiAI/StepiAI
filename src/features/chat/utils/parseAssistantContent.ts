import type {
  ChatProposal,
  LifePlanDeleteProposal,
  LifePlanProposal,
  LifePlanUpdateProposal,
  ScheduleDeleteProposal,
  ScheduleProposal,
  ScheduleUpdateProposal,
} from '../../../services/chat/client';

export type AssistantContent =
  | { kind: 'text'; text: string }
  | { kind: 'proposal'; proposal: ChatProposal }
  | {
      kind: 'resolvedProposal';
      proposal: ChatProposal;
      status: 'accepted' | 'dismissed';
      text: string;
    };

const FALLBACK_TEXT =
  "Sorry, I couldn't read that response. Mind asking again?";
const WEEKDAYS = new Set([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);
const DIFFICULTIES = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
const FOCUS_PREFERENCES = new Set(['DEEP_FOCUS', 'BALANCED', 'PODOMORO']);

function stripCodeFence(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return trimmed;

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function nullableString(value: unknown) {
  return isNonEmptyString(value) ? value.trim() : null;
}

function isValidDateTime(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());
}

function isDateOnly(value: unknown): value is string {
  return isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTimeOnly(value: unknown): value is string {
  return isNonEmptyString(value) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function readScheduleProposal(
  value: Record<string, unknown>,
  type: 'schedule_proposal' | 'schedule_update_proposal',
): ScheduleProposal | ScheduleUpdateProposal | null {
  if (
    !isNonEmptyString(value.summary) ||
    !isValidDateTime(value.startDateTime) ||
    !isValidDateTime(value.endDateTime)
  ) {
    return null;
  }

  const common = {
    summary: value.summary.trim(),
    description: nullableString(value.description),
    location: nullableString(value.location),
    startDateTime: value.startDateTime,
    endDateTime: value.endDateTime,
  };

  if (type === 'schedule_update_proposal') {
    if (!isNonEmptyString(value.scheduleId)) return null;
    return { type, scheduleId: value.scheduleId, ...common };
  }

  return { type, ...common };
}

function readScheduleDeleteProposal(
  value: Record<string, unknown>,
): ScheduleDeleteProposal | null {
  if (!isNonEmptyString(value.scheduleId) || !isNonEmptyString(value.summary))
    return null;
  return {
    type: 'schedule_delete_proposal',
    scheduleId: value.scheduleId,
    summary: value.summary.trim(),
  };
}

function readLifePlanProposal(
  value: Record<string, unknown>,
  type: 'life_plan_proposal' | 'life_plan_update_proposal',
): LifePlanProposal | LifePlanUpdateProposal | null {
  if (
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.goal) ||
    !Array.isArray(value.topic) ||
    !value.topic.every(isNonEmptyString) ||
    !isDateOnly(value.startDate) ||
    !isDateOnly(value.endDate) ||
    !Array.isArray(value.availableDays) ||
    !value.availableDays.every(
      day => typeof day === 'string' && WEEKDAYS.has(day),
    ) ||
    !isTimeOnly(value.startTime) ||
    !isTimeOnly(value.endTime) ||
    typeof value.difficultyLevel !== 'string' ||
    !DIFFICULTIES.has(value.difficultyLevel) ||
    typeof value.focusPreferences !== 'string' ||
    !FOCUS_PREFERENCES.has(value.focusPreferences)
  ) {
    return null;
  }

  const common = {
    title: value.title.trim(),
    goal: value.goal.trim(),
    topic: value.topic.map(topic => topic.trim()),
    startDate: value.startDate,
    endDate: value.endDate,
    availableDays: value.availableDays as LifePlanProposal['availableDays'],
    startTime: value.startTime,
    endTime: value.endTime,
    difficultyLevel:
      value.difficultyLevel as LifePlanProposal['difficultyLevel'],
    focusPreferences:
      value.focusPreferences as LifePlanProposal['focusPreferences'],
  };

  if (type === 'life_plan_update_proposal') {
    if (!isNonEmptyString(value.lifePlanId)) return null;
    return { type, lifePlanId: value.lifePlanId, ...common };
  }

  return { type, ...common };
}

function readLifePlanDeleteProposal(
  value: Record<string, unknown>,
): LifePlanDeleteProposal | null {
  if (!isNonEmptyString(value.lifePlanId) || !isNonEmptyString(value.title))
    return null;
  return {
    type: 'life_plan_delete_proposal',
    lifePlanId: value.lifePlanId,
    title: value.title.trim(),
  };
}

export function readChatProposal(value: unknown): ChatProposal | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;

  const type = value.type.replace(
    'study_plan_',
    'life_plan_',
  ) as ChatProposal['type'];

  switch (type) {
    case 'schedule_proposal':
    case 'schedule_update_proposal':
      return readScheduleProposal(value, type);
    case 'schedule_delete_proposal':
      return readScheduleDeleteProposal(value);
    case 'life_plan_proposal':
    case 'life_plan_update_proposal':
      return readLifePlanProposal(value, type);
    case 'life_plan_delete_proposal':
      return readLifePlanDeleteProposal(value);
    default:
      return null;
  }
}

const RESOLVED_TYPES: Record<
  string,
  { proposalType: ChatProposal['type']; status: 'accepted' | 'dismissed' }
> = {
  schedule_accepted: { proposalType: 'schedule_proposal', status: 'accepted' },
  schedule_dismissed: {
    proposalType: 'schedule_proposal',
    status: 'dismissed',
  },
  schedule_update_accepted: {
    proposalType: 'schedule_update_proposal',
    status: 'accepted',
  },
  schedule_delete_accepted: {
    proposalType: 'schedule_delete_proposal',
    status: 'accepted',
  },
  life_plan_accepted: {
    proposalType: 'life_plan_proposal',
    status: 'accepted',
  },
  life_plan_update_accepted: {
    proposalType: 'life_plan_update_proposal',
    status: 'accepted',
  },
  life_plan_delete_accepted: {
    proposalType: 'life_plan_delete_proposal',
    status: 'accepted',
  },
};

export function parseAssistantValue(parsed: unknown): AssistantContent {
  if (!isRecord(parsed)) return { kind: 'text', text: FALLBACK_TEXT };

  const proposal = readChatProposal(parsed);
  if (proposal) return { kind: 'proposal', proposal };

  if (typeof parsed.type === 'string' && RESOLVED_TYPES[parsed.type]) {
    const resolved = RESOLVED_TYPES[parsed.type];
    const nested = isRecord(parsed.proposal)
      ? { ...parsed.proposal, type: resolved.proposalType }
      : null;
    const nestedProposal = readChatProposal(nested);

    if (nestedProposal) {
      return {
        kind: 'resolvedProposal',
        proposal: nestedProposal,
        status: resolved.status,
        text: isNonEmptyString(parsed.content)
          ? parsed.content.trim()
          : FALLBACK_TEXT,
      };
    }
  }

  return isNonEmptyString(parsed.content)
    ? { kind: 'text', text: parsed.content.trim() }
    : { kind: 'text', text: FALLBACK_TEXT };
}

export function parseAssistantContent(raw: string): AssistantContent {
  if (!isNonEmptyString(raw)) return { kind: 'text', text: FALLBACK_TEXT };

  try {
    return parseAssistantValue(JSON.parse(stripCodeFence(raw)));
  } catch {
    return { kind: 'text', text: raw.trim() };
  }
}
