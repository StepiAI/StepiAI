import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { textStyle } from '../../../shared/theme/typography';
import {
  ChevronDown,
  ChevronLeft,
  ClockIcon,
  MoonIcon,
} from '../../../shared/components/Icons';
import { TimePickerModal } from '../../tasks/components/TimePickerModal';
import { formatTimeLabel } from '../../tasks/utils/dateTime';
import {
  OptionPickerModal,
  PickerOption,
} from '../../scheduler/components/OptionPickerModal';
import {
  GroupCard,
  RowDivider,
  SectionLabel,
  SettingRow,
} from '../components/SettingsGroup';

type BreakValue = 'none' | '5-25' | '10-50' | '15-90';

const BREAK_OPTIONS: readonly PickerOption<BreakValue>[] = [
  { value: 'none', label: 'No breaks' },
  { value: '5-25', label: '5 mins every 25 mins' },
  { value: '10-50', label: '10 mins every 50 mins' },
  { value: '15-90', label: '15 mins every 90 mins' },
];

function breakLabel(value: BreakValue) {
  return BREAK_OPTIONS.find(option => option.value === value)?.label ?? '';
}

function timeAt(hour: number, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

type TimeTarget = 'wake' | 'sleep' | 'workStart' | 'workEnd';

interface PersonalizeDayScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
}

export function PersonalizeDayScreen({ onBack, onContinue }: PersonalizeDayScreenProps) {
  const insets = useSafeAreaInsets();

  const [wakeTime, setWakeTime] = useState(() => timeAt(7));
  const [sleepTime, setSleepTime] = useState(() => timeAt(22));
  const [workStart, setWorkStart] = useState(() => timeAt(8));
  const [workEnd, setWorkEnd] = useState(() => timeAt(17));
  const [breakPref, setBreakPref] = useState<BreakValue>('15-90');

  // baris waktu mana yg lagi dibuka pickernya (null = ketutup)
  const [timeTarget, setTimeTarget] = useState<TimeTarget | null>(null);
  const [breakOpen, setBreakOpen] = useState(false);

  const timeSetters: Record<TimeTarget, (value: Date) => void> = {
    wake: setWakeTime,
    sleep: setSleepTime,
    workStart: setWorkStart,
    workEnd: setWorkEnd,
  };
  const timeValues: Record<TimeTarget, Date> = {
    wake: wakeTime,
    sleep: sleepTime,
    workStart: workStart,
    workEnd: workEnd,
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center px-[16px] pt-[6px]">
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityLabel="Back"
              className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white/70"
            >
              <ChevronLeft size={13} />
            </TouchableOpacity>
          ) : (
            <View className="w-[46px]" />
          )}

          <Text
            className="flex-1 text-center text-[21px] text-light-inkStrong"
            style={textStyle('bold')}
          >
            Personalize your Day
          </Text>

          <View className="w-[46px]" />
        </View>

        <Text
          className="mt-[6px] px-[24px] text-center text-[13px] text-light-muted"
          style={textStyle('regular')}
        >
          This helps STEPI create a plan that fits you perfectly.
        </Text>

        <ScrollView
          className="mt-[26px] flex-1 px-[20px]"
          contentContainerClassName="pb-[24px]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel>ROUTINE TIME</SectionLabel>
          <GroupCard>
            <SettingRow
              label="Wake Up Time"
              value={formatTimeLabel(wakeTime)}
              icon={<ClockIcon />}
              onPress={() => setTimeTarget('wake')}
            />
            <RowDivider />
            <SettingRow
              label="Sleep Time"
              value={formatTimeLabel(sleepTime)}
              icon={<MoonIcon />}
              onPress={() => setTimeTarget('sleep')}
            />
          </GroupCard>

          <View className="h-[26px]" />

          <SectionLabel>WORK/SCHOOL HOURS</SectionLabel>
          <GroupCard>
            <SettingRow
              label="Starts"
              value={formatTimeLabel(workStart)}
              onPress={() => setTimeTarget('workStart')}
            />
            <RowDivider />
            <SettingRow
              label="Ends"
              value={formatTimeLabel(workEnd)}
              onPress={() => setTimeTarget('workEnd')}
            />
          </GroupCard>

          <View className="h-[26px]" />

          <SectionLabel>BREAK PREFERENCE</SectionLabel>
          <GroupCard>
            <SettingRow
              label={breakLabel(breakPref)}
              trailing={<ChevronDown />}
              onPress={() => setBreakOpen(true)}
            />
          </GroupCard>

          <View className="h-[26px]" />
        </ScrollView>

        <View className="px-[20px] pt-[6px]" style={{ paddingBottom: insets.bottom + 10 }}>
          <TouchableOpacity
            onPress={onContinue}
            activeOpacity={0.85}
            className="h-[56px] items-center justify-center rounded-[30px] bg-light-cta"
          >
            <Text className="text-[16px] text-white" style={textStyle('semibold')}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <TimePickerModal
        visible={timeTarget !== null}
        selected={timeTarget ? timeValues[timeTarget] : wakeTime}
        onClose={() => setTimeTarget(null)}
        onSelect={time => {
          if (timeTarget) timeSetters[timeTarget](time);
        }}
      />

      <OptionPickerModal
        visible={breakOpen}
        options={BREAK_OPTIONS}
        selected={breakPref}
        onClose={() => setBreakOpen(false)}
        onSelect={setBreakPref}
      />
    </SafeAreaView>
  );
}
