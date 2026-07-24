import { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { ChevronLeft } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { MonthPickerModal } from '../../scheduler/components/MonthPickerModal';
import { DayChip } from '../components/DayChip';
import { FieldCard, FieldRow, FieldRowDivider } from '../components/FieldCard';
import { FieldLabel } from '../components/FieldLabel';
import { ProgressSteps } from '../components/ProgressSteps';
import { TimePickerModal } from '../components/TimePickerModal';
import { LIFE_PLAN_GRADIENT, LIFE_PLAN_TOTAL_STEPS } from '../theme';
import { WEEKDAYS, type StudySchedule, type Weekday } from '../types';
import { formatDateLabel, formatTimeLabel } from '../utils/dateTime';

const CURRENT_STEP = 2;

type ActivePicker = 'start-date' | 'end-date' | 'start-time' | 'end-time' | null;

interface StudyScheduleScreenProps {
  schedule: StudySchedule;
  canSubmit: boolean;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onToggleDay: (day: Weekday) => void;
  onPreferredStartTimeChange: (time: Date) => void;
  onPreferredEndTimeChange: (time: Date) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StudyScheduleScreen({
  schedule,
  canSubmit,
  onStartDateChange,
  onEndDateChange,
  onToggleDay,
  onPreferredStartTimeChange,
  onPreferredEndTimeChange,
  onBack,
  onNext,
}: StudyScheduleScreenProps) {
  const tabBarSpace = useTabBarSpace();
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const closePicker = () => setActivePicker(null);

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
          Create Life Plan
        </Text>

        <View className="w-[24px]" />
      </View>

      <ProgressSteps total={LIFE_PLAN_TOTAL_STEPS} current={CURRENT_STEP} />

      <ScrollView
        className="mt-[26px] flex-1 px-[20px]"
        contentContainerClassName="pb-[24px]"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-[22px] text-[22px] text-light-inkStrong" style={textStyle('bold')}>
          When can you study?
        </Text>

        <FieldLabel>STUDY PERIOD</FieldLabel>
        <FieldCard>
          <FieldRow
            label="Starts"
            value={formatDateLabel(schedule.startDate)}
            onPress={() => setActivePicker('start-date')}
          />
          <FieldRowDivider />
          <FieldRow
            label="Ends"
            value={formatDateLabel(schedule.endDate)}
            onPress={() => setActivePicker('end-date')}
          />
        </FieldCard>

        <View className="h-[20px]" />

        <FieldLabel>AVAILABLE DAYS</FieldLabel>
        <View className="flex-row flex-wrap gap-[10px]">
          {WEEKDAYS.map(day => (
            <DayChip
              key={day}
              label={day}
              selected={schedule.availableDays.includes(day)}
              onToggle={() => onToggleDay(day)}
            />
          ))}
        </View>

        <View className="h-[20px]" />

        <FieldLabel>PREFERRED TIME</FieldLabel>
        <FieldCard>
          <FieldRow
            label="Starts"
            value={formatTimeLabel(schedule.preferredStartTime)}
            onPress={() => setActivePicker('start-time')}
          />
          <FieldRowDivider />
          <FieldRow
            label="Ends"
            value={formatTimeLabel(schedule.preferredEndTime)}
            onPress={() => setActivePicker('end-time')}
          />
        </FieldCard>
      </ScrollView>

      <View className="px-[20px] pt-[6px]" style={{ paddingBottom: tabBarSpace }}>
        <TouchableOpacity
          onPress={onNext}
          disabled={!canSubmit}
          activeOpacity={0.85}
          className={`h-[56px] items-center justify-center rounded-[30px] ${
            canSubmit ? '' : 'opacity-50'
          }`}
          style={{ backgroundColor: '#2E7BE0', experimental_backgroundImage: LIFE_PLAN_GRADIENT }}
        >
          <Text className="text-[16px] text-white" style={textStyle('semibold')}>
            Next
          </Text>
        </TouchableOpacity>
      </View>

      <MonthPickerModal
        visible={activePicker === 'start-date'}
        selected={schedule.startDate}
        onClose={closePicker}
        onSelect={onStartDateChange}
      />
      <MonthPickerModal
        visible={activePicker === 'end-date'}
        selected={schedule.endDate}
        onClose={closePicker}
        onSelect={onEndDateChange}
      />
      <TimePickerModal
        visible={activePicker === 'start-time'}
        selected={schedule.preferredStartTime}
        onClose={closePicker}
        onSelect={onPreferredStartTimeChange}
      />
      <TimePickerModal
        visible={activePicker === 'end-time'}
        selected={schedule.preferredEndTime}
        onClose={closePicker}
        onSelect={onPreferredEndTimeChange}
      />
    </SafeAreaView>
  );
}
