import type { ScheduleProposal } from '../../services/chat/client';

export type ChatRole = 'user' | 'bot';

export type ChatMessageStatus = 'sending' | 'failed';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  bullets?: string[];
  quickReplies?: string[];

  proposal?: ScheduleProposal;
  status?: ChatMessageStatus;
}
