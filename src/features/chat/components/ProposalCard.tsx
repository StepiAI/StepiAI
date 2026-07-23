import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { softGradientCss } from '../../../shared/theme/gradient';
import {
  BookIcon,
  CalendarIcon,
  CheckBadge,
  ClockIcon,
  MoonIcon,
  TargetIcon,
} from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

type ProposalStatus = 'pending' | 'accepted' | 'dismissed';

interface ProposalCardProps {
  messageId: string;
  proposal: ChatProposal;
  status: ProposalStatus;
  variant?: 'chat' | 'voice';
  onStatusChange?: (
    messageId: string,
    status: ProposalStatus,
  ) => void | Promise<void>;
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

function formatHourLabel(date: Date) {
  return date
    .toLocaleTimeString([], {
      hour: 'numeric',
      hour12: true,
    })
    .replace(' ', '');
}

function formatTimeRange(
  proposal: ScheduleProposal | ScheduleUpdateProposal,
  hour12 = false,
) {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  };
  const start = new Date(proposal.startDateTime).toLocaleTimeString(
    [],
    options,
  );
  const end = new Date(proposal.endDateTime).toLocaleTimeString([], options);
  return `${start} - ${end}`;
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

function formatLifePlanTime(
  proposal: LifePlanProposal | LifePlanUpdateProposal,
) {
  const format = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    return new Date(2026, 0, 1, hours, minutes).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return `${format(proposal.startTime)} - ${format(proposal.endTime)}`;
}

function proposalTitle(proposal: ChatProposal) {
  switch (proposal.type) {
    case 'schedule_proposal':
      return 'New Schedule';
    case 'schedule_update_proposal':
      return 'Update Schedule';
    case 'schedule_delete_proposal':
      return 'Delete Schedule';
    case 'life_plan_proposal':
      return 'New Life Plan';
    case 'life_plan_update_proposal':
      return 'Update Life Plan';
    case 'life_plan_delete_proposal':
      return 'Delete Life Plan';
  }
}

function proposalSubtitle(proposal: ChatProposal) {
  switch (proposal.type) {
    case 'schedule_proposal':
      return `We recommend you add ${proposal.summary}`;
    case 'schedule_update_proposal':
      return `We recommend updating ${proposal.summary}`;
    case 'schedule_delete_proposal':
      return `We recommend removing ${proposal.summary}`;
    case 'life_plan_proposal':
      return 'Here’s your detailed life plan recommendation';
    case 'life_plan_update_proposal':
      return 'Here’s your updated life plan recommendation';
    case 'life_plan_delete_proposal':
      return `We recommend removing ${proposal.title}`;
  }
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

function SchedulePreview({
  proposal,
}: {
  proposal: ScheduleProposal | ScheduleUpdateProposal;
}) {
  const start = new Date(proposal.startDateTime);
  const previousStart = new Date(start);
  previousStart.setHours(Math.max(0, start.getHours() - 1), 0, 0, 0);
  const nextStart = new Date(start);
  nextStart.setHours(start.getHours() + 2, 0, 0, 0);

  return (
    <View className="mt-[24px]">
      <View className="flex-row">
        <View className="w-[72px]">
          {[previousStart, start, nextStart].map(time => (
            <Text
              key={time.toISOString()}
              className="h-[64px] text-[14px] text-light-muted"
              style={textStyle('regular')}
            >
              {formatHourLabel(time)}
            </Text>
          ))}
        </View>

        <View className="flex-1">
          <View className="absolute left-0 right-0 top-[16px] border-t border-dashed border-light-accentLine" />
          <View className="absolute left-0 right-0 top-[80px] border-t border-dashed border-light-accentLine" />
          <View className="absolute left-0 right-0 top-[144px] border-t border-dashed border-light-accentLine" />

          <View className="ml-[4px] h-[64px] rounded-[6px] bg-[#F7F7F8] py-[10px] pl-[18px] opacity-70">
            <View className="absolute bottom-0 left-[8px] top-0 w-[2px] bg-[#D9D9DD]" />
            <Text
              className="text-[14px] text-light-muted"
              style={textStyle('semibold')}
            >
              Client Meeting
            </Text>
            <Text
              className="mt-[2px] text-[12px] text-light-muted"
              style={textStyle('regular')}
            >
              Office
            </Text>
            <Text
              className="text-[12px] text-light-muted"
              style={textStyle('regular')}
            >
              09.00 AM - 10.00 AM
            </Text>
          </View>

          <View className="ml-[4px] mt-[22px] h-[76px] rounded-[6px] bg-[#F0EEFF] py-[12px] pl-[18px]">
            <View className="absolute bottom-[6px] left-[8px] top-[6px] w-[4px] rounded-full bg-[#7B6DFF]" />
            <Text
              className="text-[14px] text-[#4E46B4]"
              style={textStyle('semibold')}
            >
              {proposal.summary}
            </Text>
            <Text
              className="mt-[2px] text-[12px] text-[#6D63FF]"
              style={textStyle('regular')}
            >
              {proposal.location ?? 'Zoom'}
            </Text>
            <Text
              className="text-[12px] text-[#6D63FF]"
              style={textStyle('regular')}
            >
              {formatTimeRange(proposal)}
            </Text>
          </View>

          <View className="ml-[4px] mt-[22px] h-[64px] rounded-[6px] bg-[#F7F7F8] py-[10px] pl-[18px] opacity-70">
            <View className="absolute bottom-0 left-[8px] top-0 w-[2px] bg-[#D9D9DD]" />
            <Text
              className="text-[14px] text-light-muted"
              style={textStyle('semibold')}
            >
              Lunch
            </Text>
            <Text
              className="mt-[2px] text-[12px] text-light-muted"
              style={textStyle('regular')}
            >
              Cafetaria, Office
            </Text>
            <Text
              className="text-[12px] text-light-muted"
              style={textStyle('regular')}
            >
              12.00 PM - 1.00 PM
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function LifePlanDetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="h-[38px] w-[38px] items-center justify-center rounded-[6px] bg-[#F3F3F6]">
        {icon}
      </View>
      <View className="ml-[20px] flex-1">
        <Text
          className="text-[14px] text-light-inkStrong"
          style={textStyle('semibold')}
        >
          {label}
        </Text>
        <Text
          className="mt-[6px] text-[14px] text-light-muted"
          style={textStyle('regular')}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function LifePlanPreview({
  proposal,
}: {
  proposal: LifePlanProposal | LifePlanUpdateProposal;
}) {
  return (
    <View className="mt-[28px] gap-[24px]">
      <LifePlanDetailRow
        icon={<BookIcon color="#333338" />}
        label="Title"
        value={proposal.title}
      />
      <LifePlanDetailRow
        icon={<TargetIcon color="#333338" />}
        label="Goal"
        value={proposal.goal}
      />
      <LifePlanDetailRow
        icon={<CalendarIcon color="#333338" />}
        label="Period"
        value={formatDateRange(proposal)}
      />
      <LifePlanDetailRow
        icon={<MoonIcon color="#333338" backdrop="#F3F3F6" />}
        label="Preferred Days"
        value={proposal.availableDays
          .map(day => DAY_LABELS[day] ?? day)
          .join(', ')}
      />
      <LifePlanDetailRow
        icon={<ClockIcon color="#333338" />}
        label="Preferred Time"
        value={formatLifePlanTime(proposal)}
      />
    </View>
  );
}

function VoiceProposalDetails({ proposal }: { proposal: ChatProposal }) {
  if (
    proposal.type === 'schedule_proposal' ||
    proposal.type === 'schedule_update_proposal'
  ) {
    return <SchedulePreview proposal={proposal} />;
  }

  if (
    proposal.type === 'life_plan_proposal' ||
    proposal.type === 'life_plan_update_proposal'
  ) {
    return <LifePlanPreview proposal={proposal} />;
  }

  return (
    <View className="mt-[28px]">
      <ProposalDetails proposal={proposal} />
    </View>
  );
}

export function ProposalCard({
  messageId,
  proposal,
  status,
  variant = 'chat',
  onStatusChange,
  onNeedsFollowUp,
}: ProposalCardProps) {
  const [outcome, setOutcome] = useState<ProposalStatus>(status);
  const [saving, setSaving] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = saving || dismissing;

  useEffect(() => {
    setOutcome(status);
  }, [status]);

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
      await onStatusChange?.(messageId, 'accepted');
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 409 &&
        err.message.toLowerCase().includes('already')
      ) {
        setOutcome('accepted');
        await onStatusChange?.(messageId, 'accepted');
        return;
      }
      console.error('[Chat] failed to accept proposal:', err);
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  };

  const dismiss = async () => {
    if (proposal.type !== 'schedule_proposal') {
      setOutcome('dismissed');
      await onStatusChange?.(messageId, 'dismissed');
      return;
    }

    setDismissing(true);
    setError(null);

    try {
      await dismissScheduleProposal(messageId);
      setOutcome('dismissed');
      await onStatusChange?.(messageId, 'dismissed');
    } catch (err) {
      console.error('[Chat] failed to dismiss schedule proposal:', err);
      setError(describeError(err));
    } finally {
      setDismissing(false);
    }
  };

  if (variant === 'voice') {
    return (
      <View
        className="w-full rounded-[30px] bg-white px-[28px] pb-[28px] pt-[30px]"
        style={styles.voiceCard}
      >
        <Text
          className="text-[20px] text-light-inkStrong"
          style={textStyle('semibold')}
        >
          {proposalTitle(proposal)}
        </Text>
        <Text
          className="mt-[8px] text-[15px] text-light-muted"
          style={textStyle('regular')}
        >
          {proposalSubtitle(proposal)}
        </Text>

        <View className="mt-[28px] h-[1px] bg-light-rule" />

        <VoiceProposalDetails proposal={proposal} />

        {outcome === 'accepted' ? (
          <View className="mt-[28px] flex-row items-center justify-center gap-[8px]">
            <CheckBadge />
            <Text
              className="text-[14px] text-light-success"
              style={textStyle('semibold')}
            >
              {successLabel(proposal)}
            </Text>
          </View>
        ) : outcome === 'dismissed' ? (
          <Text
            className="mt-[28px] text-center text-[14px] text-light-muted"
            style={textStyle('regular')}
          >
            Dismissed
          </Text>
        ) : (
          <View className="mt-[30px] gap-[16px]">
            <TouchableOpacity
              onPress={confirm}
              disabled={busy}
              activeOpacity={0.85}
              className={`h-[56px] items-center justify-center rounded-[28px] ${
                busy ? 'opacity-60' : ''
              }`}
              style={{ experimental_backgroundImage: softGradientCss }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  className="text-[16px] text-white"
                  style={textStyle('semibold')}
                >
                  Accept
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={dismiss}
              disabled={busy}
              activeOpacity={0.85}
              className={`h-[56px] items-center justify-center rounded-[28px] bg-[#F0F0F0] ${
                busy ? 'opacity-60' : ''
              }`}
            >
              {dismissing ? (
                <ActivityIndicator color="#8E8E93" size="small" />
              ) : (
                <Text
                  className="text-[16px] text-[#FF3B30]"
                  style={textStyle('semibold')}
                >
                  Reject
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {error ? (
          <Text
            className="mt-[12px] text-center text-[12px] text-light-ink"
            style={textStyle('regular')}
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

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

const styles = StyleSheet.create({
  voiceCard: {
    shadowColor: '#202027',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 8,
  },
});
