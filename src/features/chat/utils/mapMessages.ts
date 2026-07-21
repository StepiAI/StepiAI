import type { ChatApiMessage } from '../../../services/chat/client';
import type { ChatMessage } from '../types';
import { parseAssistantContent } from './parseAssistantContent';

const PROPOSAL_LEAD = "Here's what I can add to your calendar:";

export function toChatMessage(message: ChatApiMessage): ChatMessage {
  if (message.role === 'user') {
    return { id: message.id, role: 'user', text: message.content };
  }

  const parsed = parseAssistantContent(message.content);

  if (parsed.kind === 'proposal') {
    return {
      id: message.id,
      role: 'bot',
      text: PROPOSAL_LEAD,
      proposal: parsed.proposal,
      proposalStatus: 'pending',
    };
  }

  if (parsed.kind === 'acceptedProposal') {
    return {
      id: message.id,
      role: 'bot',
      text: PROPOSAL_LEAD,
      proposal: parsed.proposal,
      proposalStatus: 'accepted',
    };
  }

  if (parsed.kind === 'dismissedProposal') {
    return {
      id: message.id,
      role: 'bot',
      text: PROPOSAL_LEAD,
      proposal: parsed.proposal,
      proposalStatus: 'dismissed',
    };
  }

  return { id: message.id, role: 'bot', text: parsed.text };
}

export function toChatMessages(messages: ChatApiMessage[]): ChatMessage[] {
  return messages.map(toChatMessage);
}
