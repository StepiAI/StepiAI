import { useState } from 'react';
import { ReactNode } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { ChevronLeft, ChevronRight } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { LIFE_PLAN_GRADIENT } from '../theme';
import type { DifficultyLevel, FocusPreference, LifePlanDraft, Weekday } from '../types';
import { formatDateLabel, formatTimeLabel } from '../utils/dateTime';

const FOCUS_LABELS: Record<FocusPreference, string> = {
  'deep-focus': 'Deep Focus',
  balanced: 'Balanced',
  pomodoro: 'Podomoro',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const WEEKDAY_SHORT: Record<Weekday, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

interface PreviewLifePlanScreenProps {
  draft: LifePlanDraft;
  onBack: () => void;
  onSubmit: () => void;
}

export function PreviewLifePlanScreen({ draft, onBack, onSubmit }: PreviewLifePlanScreenProps) {
  const tabBarSpace = useTabBarSpace();
  const [topicsExpanded, setTopicsExpanded] = useState(false);

  const { schedule, preferences } = draft;
  const period = `${formatDateLabel(schedule.startDate)} - ${formatDateLabel(schedule.endDate)}`;
  const preferredDays =
    schedule.availableDays.length > 0
      ? schedule.availableDays.map(day => WEEKDAY_SHORT[day]).join(', ')
      : '—';
  const preferredTime = `${formatTimeLabel(schedule.preferredStartTime)} - ${formatTimeLabel(
    schedule.preferredEndTime,
  )}`;

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View className="flex-row items-center px-[18px] pt-[6px]">
        <TouchableOpacity onPress={onBack} hitSlop={10} activeOpacity={0.6}>
          <ChevronLeft />
        </TouchableOpacity>

        <Text
          className="flex-1 text-center text-[18px] text-light-inkStrong"
          style={textStyle('bold')}
        >
          Preview Life Plan
        </Text>

        <View className="w-[24px]" />
      </View>

      <ScrollView
        className="mt-[24px] flex-1 px-[20px]"
        contentContainerClassName="pb-[24px]"
        showsVerticalScrollIndicator={false}
      >
        <ReviewCard>
          <ReviewRow label="Title" value={draft.title} />
          <RowDivider />
          <ReviewRow label="Goal" value={draft.goal} />
          <RowDivider />
          <ReviewRow
            label="Topics"
            value={String(draft.topics.length)}
            onPress={draft.topics.length > 0 ? () => setTopicsExpanded(prev => !prev) : undefined}
            trailing={
              draft.topics.length > 0 ? (
                <View style={{ transform: [{ rotate: topicsExpanded ? '90deg' : '0deg' }] }}>
                  <ChevronRight />
                </View>
              ) : null
            }
          />
          {topicsExpanded && draft.topics.length > 0 ? (
            <View className="px-[18px] pb-[14px]">
              {draft.topics.map(topic => (
                <Text
                  key={topic.id}
                  className="mt-[6px] text-[14px] text-light-muted"
                  style={textStyle('regular')}
                >
                  • {topic.label}
                </Text>
              ))}
            </View>
          ) : null}
        </ReviewCard>

        <View className="h-[16px]" />

        <ReviewCard>
          <ReviewRow label="Period" value={period} />
          <RowDivider />
          <ReviewRow label="Preferred Days" value={preferredDays} />
          <RowDivider />
          <ReviewRow label="Preferred Time" value={preferredTime} />
        </ReviewCard>

        <View className="h-[16px]" />

        <ReviewCard>
          <ReviewRow label="Focus Preference" value={FOCUS_LABELS[preferences.focus]} />
          <RowDivider />
          <ReviewRow label="Difficulty Level" value={DIFFICULTY_LABELS[preferences.difficulty]} />
          <RowDivider />
          <ReviewRow
            label="Include review & practice sessions"
            value={preferences.includeReviewSessions ? 'On' : 'Off'}
          />
        </ReviewCard>
      </ScrollView>

      <View className="px-[20px] pt-[6px]" style={{ paddingBottom: tabBarSpace }}>
        <TouchableOpacity
          onPress={onSubmit}
          activeOpacity={0.85}
          className="h-[56px] items-center justify-center rounded-[30px]"
          style={{ backgroundColor: '#2E7BE0', experimental_backgroundImage: LIFE_PLAN_GRADIENT }}
        >
          <Text className="text-[16px] text-white" style={textStyle('semibold')}>
            Create Life Plan
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ReviewCard({ children }: { children: ReactNode }) {
  return <View className="overflow-hidden rounded-[16px] bg-white">{children}</View>;
}

function RowDivider() {
  return <View className="ml-[18px] h-[1px] bg-light-rule" />;
}

interface ReviewRowProps {
  label: string;
  value: string;
  onPress?: () => void;
  trailing?: ReactNode;
}

function ReviewRow({ label, value, onPress, trailing }: ReviewRowProps) {
  const content = (
    <View className="min-h-[56px] flex-row items-center justify-between gap-[16px] px-[18px] py-[16px]">
      <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
        {label}
      </Text>

      <View className="flex-1 flex-row items-center justify-end gap-[6px]">
        <Text
          className="text-right text-[14px] text-light-muted"
          numberOfLines={1}
          style={textStyle('regular')}
        >
          {value}
        </Text>
        {trailing}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
