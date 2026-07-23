import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ApiError } from '../../../services/api/client';
import {
  acceptChatProposal,
  dismissScheduleProposal,
  type ChatProposal,
  type LifePlanProposal,
  type LifePlanUpdateProposal,
  type ScheduleProposal,
  type ScheduleUpdateProposal,
} from '../../../services/chat/client';
import { CheckBadge } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

type ProposalStatus = 'pending' | 'accepted' | 'dismissed';

interface ProposalCardProps {
  messageId: string;
  proposal: ChatProposal;
  status: ProposalStatus;
  onStatusChange?: (messageId: string, status: ProposalStatus) => void;
  onNeedsFollowUp?: () => void | Promise<void>;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

function describeError(err: unknown) {
  if (err instanceof ApiError) return `${err.status} — ${err.message}`;
  return err instanceof Error ? err.message : 'Could not save this proposal.';
}

function formatWhen({
  startDateTime,
  endDateTime,
}: ScheduleProposal | ScheduleUpdateProposal) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const day = start.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const time = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  return `${day}  ·  ${time(start)} – ${time(end)}`;
}

function formatDateRange(proposal: LifePlanProposal | LifePlanUpdateProposal) {
  const format = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return `${format(proposal.startDate)} – ${format(proposal.endDate)}`;
}

function actionLabel(proposal: ChatProposal) {
  switch (proposal.type) {
    case 'schedule_proposal':
      return 'Add to calendar';
    case 'schedule_update_proposal':
      return 'Save changes';
    case 'schedule_delete_proposal':
      return 'Delete schedule';
    case 'life_plan_proposal':
      return 'Create study plan';
    case 'life_plan_update_proposal':
      return 'Save changes';
    case 'life_plan_delete_proposal':
      return 'Delete study plan';
  }
}

function successLabel(proposal: ChatProposal) {
  switch (proposal.type) {
    case 'schedule_proposal':
      return 'Added to your calendar';
    case 'schedule_update_proposal':
      return 'Schedule updated';
    case 'schedule_delete_proposal':
      return 'Schedule deleted';
    case 'life_plan_proposal':
      return 'Study plan created';
    case 'life_plan_update_proposal':
      return 'Study plan updated';
    case 'life_plan_delete_proposal':
      return 'Study plan deleted';
  }
}

function ProposalDetails({ proposal }: { proposal: ChatProposal }) {
  if (proposal.type === 'schedule_delete_proposal') {
    return (
      <Text
        className="text-[15px] text-light-inkStrong"
        style={textStyle('semibold')}
      >
        {proposal.summary}
      </Text>
    );
  }

  if (proposal.type === 'life_plan_delete_proposal') {
    return (
      <Text
        className="text-[15px] text-light-inkStrong"
        style={textStyle('semibold')}
      >
        {proposal.title}
      </Text>
    );
  }

  if (
    proposal.type === 'schedule_proposal' ||
    proposal.type === 'schedule_update_proposal'
  ) {
    return (
      <>
        <Text
          className="text-[15px] text-light-inkStrong"
          style={textStyle('semibold')}
        >
          {proposal.summary}
        </Text>
        <Text
          className="mt-[4px] text-[13px] text-light-muted"
          style={textStyle('regular')}
        >
          {formatWhen(proposal)}
        </Text>
        {proposal.location ? (
          <Text
            className="mt-[2px] text-[13px] text-light-muted"
            style={textStyle('regular')}
          >
            {proposal.location}
          </Text>
        ) : null}
        {proposal.description ? (
          <Text
            className="mt-[6px] text-[13px] text-light-ink"
            style={textStyle('regular')}
          >
            {proposal.description}
          </Text>
        ) : null}
      </>
    );
  }

  return (
    <>
      <Text
        className="text-[15px] text-light-inkStrong"
        style={textStyle('semibold')}
      >
        {proposal.title}
      </Text>
      <Text
        className="mt-[4px] text-[13px] text-light-muted"
        style={textStyle('regular')}
      >
        {formatDateRange(proposal)}
      </Text>
      <Text
        className="mt-[2px] text-[13px] text-light-muted"
        style={textStyle('regular')}
      >
        {proposal.availableDays.map(day => DAY_LABELS[day] ?? day).join(', ')} ·{' '}
        {proposal.startTime}–{proposal.endTime}
      </Text>
      <Text
        className="mt-[7px] text-[13px] text-light-ink"
        style={textStyle('regular')}
      >
        {proposal.goal}
      </Text>
      <Text
        className="mt-[7px] text-[12px] text-light-muted"
        style={textStyle('regular')}
      >
        {proposal.topic.join(' · ')}
      </Text>
    </>
  );
}

export function ProposalCard({
  messageId,
  proposal,
  status,
  onStatusChange,
  onNeedsFollowUp,
}: ProposalCardProps) {
  const [outcome, setOutcome] = useState<ProposalStatus>(status);
  const [saving, setSaving] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = saving || dismissing;

  const confirm = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await acceptChatProposal(messageId, proposal);
      if (!result.accepted) {
        setError(
          'StepiAI needs one more choice from you. Answer the new question in chat.',
        );
        await onNeedsFollowUp?.();
        return;
      }

      setOutcome('accepted');
      onStatusChange?.(messageId, 'accepted');
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 409 &&
        err.message.toLowerCase().includes('already')
      ) {
        setOutcome('accepted');
        onStatusChange?.(messageId, 'accepted');
        return;
      }
      console.error('[Chat] failed to accept proposal:', err);
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  };

  const dismiss = async () => {
    if (proposal.type !== 'schedule_proposal') return;
    setDismissing(true);
    setError(null);

    try {
      await dismissScheduleProposal(messageId);
      setOutcome('dismissed');
      onStatusChange?.(messageId, 'dismissed');
    } catch (err) {
      console.error('[Chat] failed to dismiss schedule proposal:', err);
      setError(describeError(err));
    } finally {
      setDismissing(false);
    }
  };

  return (
    <View className="mt-[10px] rounded-[14px] border border-light-accentLine bg-light-sheet p-[14px]">
      <ProposalDetails proposal={proposal} />

      {outcome === 'accepted' ? (
        <View className="mt-[12px] flex-row items-center gap-[8px]">
          <CheckBadge />
          <Text
            className="text-[13px] text-light-success"
            style={textStyle('semibold')}
          >
            {successLabel(proposal)}
          </Text>
        </View>
      ) : outcome === 'dismissed' ? (
        <Text
          className="mt-[12px] text-[13px] text-light-faint"
          style={textStyle('regular')}
        >
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
              <Text
                className="text-[13px] text-white"
                style={textStyle('semibold')}
              >
                {actionLabel(proposal)}
              </Text>
            )}
          </TouchableOpacity>

          {proposal.type === 'schedule_proposal' ? (
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
                <Text
                  className="text-[13px] text-light-muted"
                  style={textStyle('semibold')}
                >
                  Not now
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {error ? (
        <Text
          className="mt-[10px] text-[12px] text-light-ink"
          style={textStyle('regular')}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
