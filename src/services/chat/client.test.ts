import { apiClient } from '../api/client';
import {
  acceptLifePlan,
  acceptLifePlanDelete,
  acceptLifePlanUpdate,
  acceptScheduleDelete,
  acceptScheduleProposal,
  acceptScheduleUpdate,
  clearChat,
  dismissScheduleProposal,
  getMyChat,
  sendChatMessage,
  sendVoiceMessage,
} from './client';

jest.mock('../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;
const remove = apiClient.delete as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

it('loads and clears the current chat', () => {
  getMyChat();
  clearChat();

  expect(get).toHaveBeenCalledWith('/chats');
  expect(remove).toHaveBeenCalledWith('/chats/messages');
});

it('sends text and voice transcripts with the device timezone', () => {
  sendChatMessage('buat jadwal belajar');
  sendVoiceMessage('buat jadwal belajar');

  expect(post).toHaveBeenNthCalledWith(
    1,
    '/chats/messages',
    expect.objectContaining({
      content: 'buat jadwal belajar',
      timezone: expect.any(String),
    }),
  );
  expect(post).toHaveBeenNthCalledWith(
    2,
    '/chats/voice/messages',
    expect.objectContaining({
      content: 'buat jadwal belajar',
      timezone: expect.any(String),
    }),
  );
});

it('maps every proposal action to its documented endpoint', () => {
  const messageId = 'message-1';
  acceptScheduleProposal(messageId);
  dismissScheduleProposal(messageId);
  acceptScheduleUpdate(messageId);
  acceptScheduleDelete(messageId);
  acceptLifePlan(messageId);
  acceptLifePlanUpdate(messageId);
  acceptLifePlanDelete(messageId);

  expect(post.mock.calls.map(([path]) => path)).toEqual([
    `/chats/messages/${messageId}/accept`,
    `/chats/messages/${messageId}/dismiss`,
    `/chats/messages/${messageId}/accept-schedule-update`,
    `/chats/messages/${messageId}/accept-schedule-delete`,
    `/chats/messages/${messageId}/accept-life-plan`,
    `/chats/messages/${messageId}/accept-life-plan-update`,
    `/chats/messages/${messageId}/accept-life-plan-delete`,
  ]);
});
