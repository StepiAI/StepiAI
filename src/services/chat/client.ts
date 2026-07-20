import { apiClient } from '../api/client';

export interface ChatApiMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  isScheduleProposal: boolean;
  createdAt: string;
}

export interface ChatApiChat {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatApiMessage[];
}

export interface ScheduleProposal {
  type: 'schedule_proposal';
  summary: string;
  description: string | null;
  location: string | null;
  startDateTime: string;
  endDateTime: string;
}

export interface SendMessageResponse {
  chatId: string;
  userMessage: ChatApiMessage;
  assistantMessage: ChatApiMessage;
  requiresConfirmation: boolean;
  proposal?: ScheduleProposal;
}

export interface AcceptScheduleResponse {
  schedule: { id: string; googleCalendarEventId: string | null };
  syncedToGoogleCalendar: boolean;
  googleSyncError?: string;
}

export function getMyChat() {
  return apiClient.get<ChatApiChat>('/chats');
}

export function clearChat() {
  return apiClient.delete<ChatApiChat>('/chats/messages');
}

export function acceptScheduleProposal(messageId: string) {
  return apiClient.post<AcceptScheduleResponse>(`/chats/messages/${messageId}/accept`);
}

export function dismissScheduleProposal(messageId: string) {
  return apiClient.post<{ dismissed: true }>(`/chats/messages/${messageId}/dismiss`);
}


function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

export function sendChatMessage(content: string) {
  return apiClient.post<SendMessageResponse>('/chats/messages', {
    content,
    timezone: deviceTimeZone(),
  });
}
