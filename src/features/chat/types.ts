import type { ChatProposal } from '../../services/chat/client';

export type ChatRole = 'user' | 'bot';

export type ChatMessageStatus = 'sending' | 'failed';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  bullets?: string[];
  quickReplies?: string[];

  proposal?: ChatProposal;
  proposalStatus?: 'pending' | 'accepted' | 'dismissed';
  status?: ChatMessageStatus;
}
