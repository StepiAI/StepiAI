import { Text, View } from 'react-native';
import { CalendarIcon, CheckIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import type { ScheduleRecord } from '../../../services/lifePlan/client';
import { formatTimeLabel } from '../utils/dateTime';
import { formatSessionDayLabel, isSessionToday } from '../utils/lifePlanMapping';

interface TaskRowProps {
  schedule: ScheduleRecord;
  topic: string | null;
}

export function TaskRow({ schedule, topic }: TaskRowProps) {
  const start = new Date(schedule.startDateTime);
  const end = new Date(schedule.endDateTime);
  const highlighted = isSessionToday(start);

  return (
    <View
      className={`rounded-[16px] border bg-white p-[14px] ${
        highlighted ? 'border-light-accent' : 'border-light-line'
      }`}
    >
      <View className="flex-row items-start">
        <View className="mr-[12px] mt-[2px]">
          <Checkbox checked={highlighted} />
        </View>

        <View className="flex-1">
          <Text className="text-[15px] text-light-inkStrong" style={textStyle('bold')}>
            {formatSessionDayLabel(start)}
          </Text>
          <Text className="mt-[2px] text-[13px] text-light-muted" style={textStyle('regular')}>
            {formatTimeLabel(start)} - {formatTimeLabel(end)}
          </Text>
          {topic ? (
            <Text
              numberOfLines={1}
              className={`mt-[2px] text-[13px] ${highlighted ? 'text-light-accent' : 'text-light-ink'}`}
              style={textStyle('medium')}
            >
              {topic}
            </Text>
          ) : null}
        </View>

        <ViewButton highlighted={highlighted} />
      </View>
    </View>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <View className="h-[24px] w-[24px] items-center justify-center rounded-full bg-light-accent">
        <CheckIcon />
      </View>
    );
  }

  return <View className="h-[24px] w-[24px] rounded-full border-[1.6px] border-light-disabled" />;
}

function ViewButton({ highlighted }: { highlighted: boolean }) {
  return (
    <View
      className={`flex-row items-center gap-[6px] rounded-full border px-[12px] py-[8px] ${
        highlighted ? 'border-light-accent' : 'border-light-disabled'
      }`}
    >
      <CalendarIcon color={highlighted ? '#2E7BE0' : '#B4B4BC'} />
      <Text
        className={highlighted ? 'text-[13px] text-light-accent' : 'text-[13px] text-light-faint'}
        style={textStyle('semibold')}
      >
        View
      </Text>
    </View>
  );
}
