import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  clearChat,
  getMyChat,
  sendChatMessage,
} from '../../../services/chat/client';
import type { ChatMessage } from '../types';
import { toChatMessage, toChatMessages } from '../utils/mapMessages';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not reach the assistant.';
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // ini COUNTER YA, bukan Date.now(), biar dua kiriman beruntun gak dapet id kembar
  const localId = useRef(0);

  const load = useCallback(async (initial: boolean) => {
    if (initial) {
      setLoading(true);
      setError(null);
    } else {
      setRefreshing(true);
      setSendError(null);
    }

    try {
      // buat bikin chat baru kl user blm punya, jadi user baru dapet daftar kosong, bukan status code 404
      const chat = await getMyChat();
      setMessages(toChatMessages(chat.messages));
    } catch (err) {
      console.error('[Chat] failed to load history:', err);
      if (initial) {
        setError(describeError(err));
      } else {
        setSendError(describeError(err));
      }
    } finally {
      if (initial) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const refresh = useCallback(() => load(false), [load]);
  const retry = useCallback(() => load(true), [load]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    localId.current += 1;
    const pendingId = `local-${localId.current}`;

    setMessages(current => [
      ...current,
      { id: pendingId, role: 'user', text: trimmed, status: 'sending' },
    ]);
    setSending(true);
    setSendError(null);

    try {
      const response = await sendChatMessage(trimmed);

      setMessages(current => [
        ...current.map(message =>
          message.id === pendingId
            ? toChatMessage(response.userMessage)
            : message,
        ),
        toChatMessage(response.assistantMessage, response.parsed),
      ]);
    } catch (err) {
      console.error('[Chat] failed to send message:', err);

      setMessages(current =>
        current.map(message =>
          message.id === pendingId ? { ...message, status: 'failed' } : message,
        ),
      );
      setSendError(describeError(err));
    } finally {
      setSending(false);
    }
  }, []);

  const clear = useCallback(async () => {
    const previous = messages;
    setMessages([]);
    setSendError(null);

    try {
      await clearChat();
    } catch (err) {
      console.error('[Chat] failed to clear chat:', err);
      setMessages(previous);
      setSendError(describeError(err));
    }
  }, [messages]);

  const setProposalStatus = useCallback(
    (
      messageId: string,
      proposalStatus: 'pending' | 'accepted' | 'dismissed',
    ) => {
      setMessages(current =>
        current.map(message =>
          message.id === messageId ? { ...message, proposalStatus } : message,
        ),
      );
    },
    [],
  );

  return {
    messages,
    loading,
    refreshing,
    sending,
    error,
    sendError,
    send,
    refresh,
    retry,
    clear,
    setProposalStatus,
  };
}
