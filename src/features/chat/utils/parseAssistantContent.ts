import type { ScheduleProposal } from '../../../services/chat/client';

export type AssistantContent =
  | { kind: 'text'; text: string }
  | { kind: 'proposal'; proposal: ScheduleProposal }
  | { kind: 'acceptedProposal'; proposal: ScheduleProposal }
  | { kind: 'dismissedProposal'; proposal: ScheduleProposal };

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

function readProposalFields(value: Record<string, unknown>): ScheduleProposal | null {
  if (
    !isNonEmptyString(value.summary) ||
    !isValidDate(value.startDateTime) ||
    !isValidDate(value.endDateTime)
  ) {
    return null;
  }

  return {
    type: 'schedule_proposal',
    summary: value.summary.trim(),
    description: isNonEmptyString(value.description) ? value.description.trim() : null,
    location: isNonEmptyString(value.location) ? value.location.trim() : null,
    startDateTime: value.startDateTime,
    endDateTime: value.endDateTime,
  };
}

function readProposal(value: Record<string, unknown>): AssistantContent {
  const proposal = readProposalFields(value);

  if (!proposal) {
    console.warn('[Chat] schedule_proposal gak lengkap:', value);
    return { kind: 'text', text: FALLBACK_TEXT };
  }

  return { kind: 'proposal', proposal };
}

function readNestedProposal(value: Record<string, unknown>): ScheduleProposal | null {
  const nested =
    typeof value.proposal === 'object' && value.proposal !== null
      ? (value.proposal as Record<string, unknown>)
      : null;

  return nested ? readProposalFields(nested) : null;
}

function readAcceptedProposal(value: Record<string, unknown>): AssistantContent {
  const proposal = readNestedProposal(value);

  if (!proposal) {
    console.warn('[Chat] schedule_accepted gak lengkap:', value);
    return { kind: 'text', text: FALLBACK_TEXT };
  }

  return { kind: 'acceptedProposal', proposal };
}

function readDismissedProposal(value: Record<string, unknown>): AssistantContent {
  const proposal = readNestedProposal(value);

  if (!proposal) {
    console.warn('[Chat] schedule_dismissed gak lengkap:', value);
    return { kind: 'text', text: FALLBACK_TEXT };
  }

  return { kind: 'dismissedProposal', proposal };
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
  }

  if (value.type === 'schedule_accepted') {
    return readAcceptedProposal(value);
  }

  if (value.type === 'schedule_dismissed') {
    return readDismissedProposal(value);
  }

  if (value.type === 'message') {
    return isNonEmptyString(value.content) ? { kind: 'text', text: value.content.trim() } : { kind: 'text', text: FALLBACK_TEXT };
  }

  console.warn('[Chat] bentuk balasan gak dikenal:', value);
  return { kind: 'text', text: FALLBACK_TEXT };
}
