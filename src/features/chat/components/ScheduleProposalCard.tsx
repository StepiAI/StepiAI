import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ApiError } from '../../../services/api/client';
import {
  acceptScheduleProposal,
  dismissScheduleProposal,
  type ScheduleProposal,
} from '../../../services/chat/client';
import { CheckBadge } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

interface ScheduleProposalCardProps {
  messageId: string;
  proposal: ScheduleProposal;
  status: 'pending' | 'accepted' | 'dismissed';
}

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not save the event.';
}

function formatWhen({ startDateTime, endDateTime }: ScheduleProposal) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  const day = start.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const time = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return `${day}  ·  ${time(start)} – ${time(end)}`;
}

export function ScheduleProposalCard({ messageId, proposal, status }: ScheduleProposalCardProps) {
  const [outcome, setOutcome] = useState<'pending' | 'added' | 'dismissed'>(
    status === 'accepted' ? 'added' : status === 'dismissed' ? 'dismissed' : 'pending',
  );
  const [saving, setSaving] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = saving || dismissing;

  const confirm = async () => {
    setSaving(true);
    setError(null);

    try {
      await acceptScheduleProposal(messageId);
      setOutcome('added');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setOutcome('added');
        return;
      }
      console.error('[Chat] failed to accept schedule proposal:', err);
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  };

  const dismiss = async () => {
    setDismissing(true);
    setError(null);

    try {
      await dismissScheduleProposal(messageId);
      setOutcome('dismissed');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setOutcome('added');
        return;
      }
      console.error('[Chat] failed to dismiss schedule proposal:', err);
      setError(describeError(err));
    } finally {
      setDismissing(false);
    }
  };

  return (
    <View className="mt-[10px] rounded-[14px] border border-light-accentLine bg-light-sheet p-[14px]">
      <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
        {proposal.summary}
      </Text>

      <Text className="mt-[4px] text-[13px] text-light-muted" style={textStyle('regular')}>
        {formatWhen(proposal)}
      </Text>

      {proposal.location ? (
        <Text className="mt-[2px] text-[13px] text-light-muted" style={textStyle('regular')}>
          {proposal.location}
        </Text>
      ) : null}

      {outcome === 'added' ? (
        <View className="mt-[12px] flex-row items-center gap-[8px]">
          <CheckBadge />
          <Text className="text-[13px] text-light-success" style={textStyle('semibold')}>
            Added to your calendar
          </Text>
        </View>
      ) : outcome === 'dismissed' ? (
        <Text className="mt-[12px] text-[13px] text-light-faint" style={textStyle('regular')}>
          Dismissed
        </Text>
      ) : (
        <View className="mt-[14px] flex-row gap-[10px]">
          <TouchableOpacity
            onPress={confirm}
            disabled={busy}
            activeOpacity={0.8}
            className={`flex-1 items-center rounded-[10px] bg-light-accent py-[10px] ${
              busy ? 'opacity-60' : ''
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-[13px] text-white" style={textStyle('semibold')}>
                Add to calendar
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={dismiss}
            disabled={busy}
            activeOpacity={0.8}
            className={`items-center rounded-[10px] border border-light-line px-[16px] py-[10px] ${
              busy ? 'opacity-60' : ''
            }`}
          >
            {dismissing ? (
              <ActivityIndicator color="#8E8E93" size="small" />
            ) : (
              <Text className="text-[13px] text-light-muted" style={textStyle('semibold')}>
                Not now
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {error ? (
        <Text className="mt-[10px] text-[12px] text-light-ink" style={textStyle('regular')}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
