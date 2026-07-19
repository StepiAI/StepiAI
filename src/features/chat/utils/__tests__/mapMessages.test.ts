import type { ChatApiMessage } from '../../../../services/chat/client';
import { toChatMessages } from '../mapMessages';

function apiMessage(overrides: Partial<ChatApiMessage>): ChatApiMessage {
  return {
    id: 'm1',
    chatId: 'c1',
    role: 'user',
    content: 'hello',
    isScheduleProposal: false,
    createdAt: '2026-07-19T10:00:00.000Z',
    ...overrides,
  };
}

describe('toChatMessages', () => {
  it('pesan user dipakai apa adanya', () => {
    const [message] = toChatMessages([
      apiMessage({ role: 'user', content: 'move my 2pm' }),
    ]);

    expect(message).toEqual({ id: 'm1', role: 'user', text: 'move my 2pm' });
  });

  it('balasan assistant dibongkar dulu dari JSON — jangan sampe user liat JSON mentah', () => {
    const [message] = toChatMessages([
      apiMessage({
        role: 'assistant',
        content: JSON.stringify({ type: 'message', content: 'Done!' }),
      }),
    ]);

    expect(message.role).toBe('bot');
    expect(message.text).toBe('Done!');
    expect(message.proposal).toBeUndefined();
  });

  it('usulan jadwal jadi kalimat pembuka plus data kartunya', () => {
    const [message] = toChatMessages([
      apiMessage({
        role: 'assistant',
        isScheduleProposal: true,
        content: JSON.stringify({
          type: 'schedule_proposal',
          summary: 'Gym',
          description: null,
          location: null,
          startDateTime: '2026-07-20T09:00:00.000Z',
          endDateTime: '2026-07-20T10:00:00.000Z',
        }),
      }),
    ]);

    expect(message.proposal?.summary).toBe('Gym');
    expect(message.text).not.toContain('{');
  });

  it('jaga urutan riwayat chat', () => {
    const messages = toChatMessages([
      apiMessage({ id: 'a', content: 'first' }),
      apiMessage({ id: 'b', content: 'second' }),
    ]);

    expect(messages.map(m => m.id)).toEqual(['a', 'b']);
  });
});
