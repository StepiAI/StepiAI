import { Text, TouchableOpacity, View } from 'react-native';
import { MoreIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import type { StudyPlanRecord } from '../../../services/studyPlan/client';
import { PROGRESS_TRACK_COLOR } from '../theme';
import { formatDateLabel } from '../utils/dateTime';
import { countStudyPlanSessions, getStudyPlanDurationDays } from '../utils/studyPlanMapping';

interface StudyPlanCardProps {
  plan: StudyPlanRecord;
  onPress: () => void;
}

export function StudyPlanCard({ plan, onPress }: StudyPlanCardProps) {
  const totalSessions = countStudyPlanSessions(plan);
  const durationDays = getStudyPlanDurationDays(plan);
  const completedSessions = 0;
  const progressRatio = totalSessions > 0 ? completedSessions / totalSessions : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="rounded-[16px] bg-white p-[18px]">
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 pr-[10px] text-[16px] text-light-inkStrong" style={textStyle('bold')}>
          {plan.title}
        </Text>
        <MoreIcon />
      </View>

      <Text className="mt-[4px] text-[13px] text-light-muted" style={textStyle('regular')}>
        {formatDateLabel(new Date(plan.startDate))} - {formatDateLabel(new Date(plan.endDate))}
      </Text>

      <View className="mt-[16px] flex-row items-center justify-between">
        <Text className="text-[13px] text-light-muted" style={textStyle('medium')}>
          {durationDays}d Sessions
        </Text>
        <Text className="text-[13px] text-light-muted" style={textStyle('medium')}>
          {completedSessions} / {totalSessions}
        </Text>
      </View>

      <View
        className="mt-[10px] h-[4px] flex-row items-center rounded-full"
        style={{ backgroundColor: PROGRESS_TRACK_COLOR }}
      >
        <View
          className="h-[8px] w-[8px] rounded-full bg-light-accent"
          style={{ marginLeft: `${progressRatio * 100}%` }}
        />
      </View>
    </TouchableOpacity>
  );
}
