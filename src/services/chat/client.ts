import { apiClient } from '../api/client';
import type {
  ApiDifficultyLevel,
  ApiFocusPreference,
  ApiWeekday,
  LifePlanRecord,
  ScheduleRecord,
} from '../lifePlan/client';

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

export interface ScheduleUpdateProposal extends Omit<ScheduleProposal, 'type'> {
  type: 'schedule_update_proposal';
  scheduleId: string;
}

export interface ScheduleDeleteProposal {
  type: 'schedule_delete_proposal';
  scheduleId: string;
  summary: string;
}

interface LifePlanProposalFields {
  title: string;
  goal: string;
  topic: string[];
  startDate: string;
  endDate: string;
  availableDays: ApiWeekday[];
  startTime: string;
  endTime: string;
  difficultyLevel: ApiDifficultyLevel;
  focusPreferences: ApiFocusPreference;
}

export interface LifePlanProposal extends LifePlanProposalFields {
  type: 'life_plan_proposal';
}

export interface LifePlanUpdateProposal extends LifePlanProposalFields {
  type: 'life_plan_update_proposal';
  lifePlanId: string;
}

export interface LifePlanDeleteProposal {
  type: 'life_plan_delete_proposal';
  lifePlanId: string;
  title: string;
}

export type ChatProposal =
  | ScheduleProposal
  | ScheduleUpdateProposal
  | ScheduleDeleteProposal
  | LifePlanProposal
  | LifePlanUpdateProposal
  | LifePlanDeleteProposal;

export type AssistantResponse =
  | { type: 'message'; content: string }
  | { type: 'need_info'; content: string }
  | ChatProposal;

export interface SendMessageResponse {
  chatId: string;
  userMessage: ChatApiMessage;
  assistantMessage: ChatApiMessage;
  parsed: AssistantResponse;
  requiresConfirmation: boolean;
  proposal?: ScheduleProposal;
  scheduleUpdateProposal?: ScheduleUpdateProposal;
  scheduleDeleteProposal?: ScheduleDeleteProposal;
  lifePlanProposal?: LifePlanProposal;
  lifePlanUpdateProposal?: LifePlanUpdateProposal;
  lifePlanDeleteProposal?: LifePlanDeleteProposal;
  isNeedMoreData: boolean;
}

export interface AcceptScheduleResponse {
  schedule: { id: string; googleCalendarEventId: string | null };
  syncedToGoogleCalendar: boolean;
  googleSyncError?: string;
}

export interface VoiceSpeech {
  locale: 'id-ID';
  summary: string;
}

export interface VoicePopupAction {
  label: string;
  method: 'POST';
  path: string;
}

export interface VoicePopup {
  kind: 'proposal' | 'need_info';
  title: string;
  message: string;
  data: AssistantResponse;
  actions: VoicePopupAction[];
}

export interface SendVoiceMessageResponse extends SendMessageResponse {
  speech: VoiceSpeech;
  popup: VoicePopup | null;
}

export function getMyChat() {
  return apiClient.get<ChatApiChat>('/chats');
}

export function clearChat() {
  return apiClient.delete<ChatApiChat>('/chats/messages');
}

export function acceptScheduleProposal(messageId: string) {
  return apiClient.post<AcceptScheduleResponse>(
    `/chats/messages/${messageId}/accept`,
  );
}

export function dismissScheduleProposal(messageId: string) {
  return apiClient.post<{ dismissed: true }>(
    `/chats/messages/${messageId}/dismiss`,
  );
}

export function acceptScheduleUpdate(messageId: string) {
  return apiClient.post<{
    updated: true;
    schedule: ScheduleRecord;
    syncedToGoogleCalendar: boolean;
    googleSyncError?: string;
  }>(`/chats/messages/${messageId}/accept-schedule-update`);
}

export function acceptScheduleDelete(messageId: string) {
  return apiClient.post<{
    deleted: true;
    schedule: ScheduleRecord;
    syncedToGoogleCalendar: boolean;
    googleSyncError?: string;
  }>(`/chats/messages/${messageId}/accept-schedule-delete`);
}

export function acceptLifePlan(messageId: string) {
  return apiClient.post<{
    created: boolean;
    lifePlan: LifePlanRecord | null;
    lifePlanConflict: unknown | null;
  }>(`/chats/messages/${messageId}/accept-life-plan`);
}

export function acceptLifePlanUpdate(messageId: string) {
  return apiClient.post<{
    updated: boolean;
    lifePlan: LifePlanRecord | null;
    lifePlanConflict: unknown | null;
  }>(`/chats/messages/${messageId}/accept-life-plan-update`);
}

export function acceptLifePlanDelete(messageId: string) {
  return apiClient.post<{ deleted: true; lifePlan: LifePlanRecord }>(
    `/chats/messages/${messageId}/accept-life-plan-delete`,
  );
}

export async function acceptChatProposal(
  messageId: string,
  proposal: ChatProposal,
) {
  switch (proposal.type) {
    case 'schedule_proposal':
      await acceptScheduleProposal(messageId);
      return { accepted: true as const };
    case 'schedule_update_proposal':
      await acceptScheduleUpdate(messageId);
      return { accepted: true as const };
    case 'schedule_delete_proposal':
      await acceptScheduleDelete(messageId);
      return { accepted: true as const };
    case 'life_plan_proposal': {
      const response = await acceptLifePlan(messageId);
      return { accepted: response.created };
    }
    case 'life_plan_update_proposal': {
      const response = await acceptLifePlanUpdate(messageId);
      return { accepted: response.updated };
    }
    case 'life_plan_delete_proposal':
      await acceptLifePlanDelete(messageId);
      return { accepted: true as const };
  }
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

export function sendVoiceMessage(content: string) {
  return apiClient.post<SendVoiceMessageResponse>('/chats/voice/messages', {
    content,
    timezone: deviceTimeZone(),
  });
}

export function synthesizeVoice(
  text: string,
  voice = 'id-ID-Gadis:DragonHDLatestNeural',
) {
  return apiClient.postBinary('/voice/tts', { text, voice });
}
