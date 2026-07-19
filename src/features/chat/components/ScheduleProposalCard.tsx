import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { ScheduleProposal } from '../../../services/chat/client';
import { CheckBadge } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { useCreateGoogleCalendarEvent } from '../../scheduler/hooks/useCreateGoogleCalendarEvent';

interface ScheduleProposalCardProps {
  proposal: ScheduleProposal;
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

export function ScheduleProposalCard({ proposal }: ScheduleProposalCardProps) {
  const { create, saving, error } = useCreateGoogleCalendarEvent();
  const [outcome, setOutcome] = useState<'pending' | 'added' | 'dismissed'>('pending');

  const confirm = async () => {
    const created = await create({
      summary: proposal.summary,
      description: proposal.description ?? undefined,
      location: proposal.location ?? undefined,
      startDateTime: proposal.startDateTime,
      endDateTime: proposal.endDateTime,
    });

    if (created) setOutcome('added');
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
            disabled={saving}
            activeOpacity={0.8}
            className={`flex-1 items-center rounded-[10px] bg-light-accent py-[10px] ${
              saving ? 'opacity-60' : ''
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
            onPress={() => setOutcome('dismissed')}
            disabled={saving}
            activeOpacity={0.8}
            className="items-center rounded-[10px] border border-light-line px-[16px] py-[10px]"
          >
            <Text className="text-[13px] text-light-muted" style={textStyle('semibold')}>
              Not now
            </Text>
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
