import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { ChevronLeft, ClipboardCheckIcon, ClipboardIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { CircularProgress } from '../components/CircularProgress';
import { TaskRow } from '../components/TaskRow';
import { useLifePlanDetail } from '../hooks/useLifePlanDetail';
import { LIFE_PLAN_PROGRESS_GRADIENT } from '../theme';
import {
  computeElapsedProgress,
  countCompletedSessions,
  countLifePlanSessions,
  getSessionTopic,
  getThisWeekSchedules,
  isSessionToday,
} from '../utils/lifePlanMapping';
import { NewTaskScreen } from './NewTaskScreen';

interface LifePlanDetailScreenProps {
  lifePlanId: string;
  onBack: () => void;
}

export function LifePlanDetailScreen({ lifePlanId, onBack }: LifePlanDetailScreenProps) {
  const { plan, loading, error } = useLifePlanDetail(lifePlanId);
  const tabBarSpace = useTabBarSpace();
  const [addingTask, setAddingTask] = useState(false);

  const thisWeekSchedules = useMemo(
    () => (plan ? getThisWeekSchedules(plan.schedules) : []),
    [plan],
  );

  const defaultSelectedId = useMemo(
    () =>
      thisWeekSchedules.find(schedule => isSessionToday(new Date(schedule.startDateTime)))?.id ??
      null,
    [thisWeekSchedules],
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const effectiveSelectedId = selectedTaskId ?? defaultSelectedId;

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center px-[18px] pt-[6px]">
        <TouchableOpacity onPress={onBack} hitSlop={10} activeOpacity={0.6}>
          <ChevronLeft />
        </TouchableOpacity>

        <Text
          className="flex-1 text-center text-[18px] text-light-inkStrong"
          numberOfLines={1}
          style={textStyle('bold')}
        >
          {plan?.title ?? ' '}
        </Text>

        <View className="w-[24px]" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : !plan ? (
        <View className="flex-1 items-center justify-center px-[32px]">
          <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
            Something went wrong
          </Text>
          <Text
            className="mt-[4px] text-center text-[13px] text-light-muted"
            style={textStyle('regular')}
          >
            {error ?? 'Life plan not found.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="mt-[18px] flex-1 px-[20px]"
          contentContainerClassName="pb-[24px]"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="rounded-[20px] p-[20px]"
            style={{ backgroundColor: '#FFFFFF', experimental_backgroundImage: LIFE_PLAN_PROGRESS_GRADIENT }}
          >
            <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
              Progress
            </Text>

            <View className="mt-[16px] flex-row items-center">
              <CircularProgress progress={computeElapsedProgress(plan)} />

              <View className="ml-[20px] flex-1 gap-[16px]">
                <StatRow icon={<ClipboardIcon />} value={countLifePlanSessions(plan)} label="Total Tasks" />
                <StatRow icon={<ClipboardCheckIcon />} value={countCompletedSessions(plan)} label="Task Completed" />
              </View>
            </View>
          </View>

          <Text className="mb-[14px] mt-[24px] text-[16px] text-light-inkStrong" style={textStyle('bold')}>
            This Week
          </Text>

          <TouchableOpacity
            onPress={() => setAddingTask(true)}
            activeOpacity={0.7}
            className="mb-[14px] h-[64px] items-center justify-center rounded-[16px] border border-dashed border-light-hint"
          >
            <Text className="text-[14px] text-light-muted" style={textStyle('medium')}>
              + Add a Task
            </Text>
          </TouchableOpacity>

          <View className="gap-[12px]">
            {thisWeekSchedules.map((schedule, index) => (
              <TaskRow
                key={schedule.id}
                schedule={schedule}
                topic={getSessionTopic(plan, index)}
                selected={schedule.id === effectiveSelectedId}
                onPress={() => setSelectedTaskId(schedule.id)}
                onViewPress={() => {}}
              />
            ))}
          </View>

          <View style={{ height: tabBarSpace }} />
        </ScrollView>
      )}

      <NewTaskScreen visible={addingTask} onClose={() => setAddingTask(false)} />
    </SafeAreaView>
  );
}

function StatRow({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <View className="flex-row items-center gap-[10px]">
      <View className="h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white">
        {icon}
      </View>
      <View>
        <Text className="text-[16px] text-light-accent" style={textStyle('bold')}>
          {value}
        </Text>
        <Text className="text-[12px] text-light-muted" style={textStyle('regular')}>
          {label}
        </Text>
      </View>
    </View>
  );
}
