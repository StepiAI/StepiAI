import type {
  AssistantResponse,
  ChatApiMessage,
  ChatProposal,
} from '../../../services/chat/client';
import type { ChatMessage } from '../types';
import {
  parseAssistantContent,
  parseAssistantValue,
} from './parseAssistantContent';

function proposalLead(proposal: ChatProposal) {
  switch (proposal.type) {
    case 'schedule_proposal':
      return "Here's what I can add to your calendar:";
    case 'schedule_update_proposal':
      return 'Review these schedule changes:';
    case 'schedule_delete_proposal':
      return 'Please confirm this schedule deletion:';
    case 'life_plan_proposal':
      return 'Review your new study plan:';
    case 'life_plan_update_proposal':
      return 'Review these study plan changes:';
    case 'life_plan_delete_proposal':
      return 'Please confirm this study plan deletion:';
  }
}

export function toChatMessage(
  message: ChatApiMessage,
  parsedValue?: AssistantResponse,
): ChatMessage {
  if (message.role === 'user') {
    return { id: message.id, role: 'user', text: message.content };
  }

  const parsed = parsedValue
    ? parseAssistantValue(parsedValue)
    : parseAssistantContent(message.content);

  if (parsed.kind === 'proposal') {
    return {
      id: message.id,
      role: 'bot',
      text: proposalLead(parsed.proposal),
      proposal: parsed.proposal,
      proposalStatus: 'pending',
    };
  }

  if (parsed.kind === 'resolvedProposal') {
    return {
      id: message.id,
      role: 'bot',
      text: parsed.text,
      proposal: parsed.proposal,
      proposalStatus: parsed.status,
    };
  }

  return { id: message.id, role: 'bot', text: parsed.text };
}

export function toChatMessages(messages: ChatApiMessage[]): ChatMessage[] {
  return messages.map(message => toChatMessage(message));
}
