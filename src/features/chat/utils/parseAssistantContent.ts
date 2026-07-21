import type { ScheduleProposal } from '../../../services/chat/client';

export type AssistantContent =
  | { kind: 'text'; text: string }
  | { kind: 'proposal'; proposal: ScheduleProposal };

const FALLBACK_TEXT = "Sorry, I couldn't read that response. Mind asking again?";

function stripCodeFence(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return trimmed;

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());
}

function readProposal(value: Record<string, unknown>): AssistantContent {
  if (
    !isNonEmptyString(value.summary) ||
    !isValidDate(value.startDateTime) ||
    !isValidDate(value.endDateTime)
  ) {
    console.warn('[Chat] schedule_proposal gak lengkap:', value);
    return { kind: 'text', text: FALLBACK_TEXT };
  }

  return {
    kind: 'proposal',
    proposal: {
      type: 'schedule_proposal',
      summary: value.summary.trim(),
      description: isNonEmptyString(value.description) ? value.description.trim() : null,
      location: isNonEmptyString(value.location) ? value.location.trim() : null,
      startDateTime: value.startDateTime,
      endDateTime: value.endDateTime,
    },
  };
}

export function parseAssistantContent(raw: string): AssistantContent {
  if (!isNonEmptyString(raw)) {
    return { kind: 'text', text: FALLBACK_TEXT };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    return { kind: 'text', text: raw.trim() };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { kind: 'text', text: raw.trim() };
  }

  const value = parsed as Record<string, unknown>;

  if (value.type === 'schedule_proposal') {
    return readProposal(value);
  } else {
    return isNonEmptyString(value.content) ? { kind: 'text', text: value.content.trim() } : { kind: 'text', text: FALLBACK_TEXT };
  }
}
