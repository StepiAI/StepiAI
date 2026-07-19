import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { textStyle } from '../../../shared/theme/typography';
import {
  ChevronDown,
  ChevronLeft,
  ClearIcon,
  ClockIcon,
  MoonIcon,
} from '../../../shared/components/Icons';
import {
  GroupCard,
  RowDivider,
  SectionLabel,
  SettingRow,
} from '../components/SettingsGroup';

const PLACEHOLDER_COLOR = '#B0B0B8';

interface PersonalizeDayScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
}

export function PersonalizeDayScreen({ onBack, onContinue }: PersonalizeDayScreenProps) {
  const [goal, setGoal] = useState('Learning React');
  const tabBarSpace = useTabBarSpace();

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center px-[18px] pt-[6px]">
          <TouchableOpacity onPress={onBack} hitSlop={10} activeOpacity={0.6}>
            <ChevronLeft />
          </TouchableOpacity>

          <Text
            className="flex-1 text-center text-[21px] text-light-inkStrong"
            style={textStyle('bold')}
          >
            Personalize your Day
          </Text>

          <View className="w-[24px]" />
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
              value="07.00 AM"
              icon={<ClockIcon />}
              onPress={() => {}}
            />
            <RowDivider />
            <SettingRow
              label="Sleep Time"
              value="10.00 PM"
              icon={<MoonIcon />}
              onPress={() => {}}
            />
          </GroupCard>

          <View className="h-[26px]" />

          <SectionLabel>WORK/SCHOOL HOURS</SectionLabel>
          <GroupCard>
            <SettingRow label="Starts" value="08.00 AM" onPress={() => {}} />
            <RowDivider />
            <SettingRow label="Ends" value="05.00 PM" onPress={() => {}} />
          </GroupCard>

          <View className="h-[26px]" />

          <SectionLabel>BREAK PREFERENCE</SectionLabel>
          <GroupCard>
            <SettingRow
              label="15 mins every 90 mins"
              trailing={<ChevronDown />}
              onPress={() => {}}
            />
          </GroupCard>

          <View className="h-[26px]" />

          <SectionLabel>MAIN GOAL RIGHT NOW (OPTIONAL)</SectionLabel>
          <View className="h-[54px] flex-row items-center rounded-[16px] bg-white px-[18px]">
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g. Learning React"
              placeholderTextColor={PLACEHOLDER_COLOR}
              className="flex-1 text-[15px] text-light-ink"
              style={textStyle('medium')}
            />
            {goal.length > 0 ? (
              <TouchableOpacity onPress={() => setGoal('')} hitSlop={10} activeOpacity={0.6}>
                <ClearIcon />
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>

        <View className="px-[20px] pt-[6px]" style={{ paddingBottom: tabBarSpace }}>
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
    </SafeAreaView>
  );
}
