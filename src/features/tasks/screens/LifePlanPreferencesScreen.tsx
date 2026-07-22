import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { ChevronLeft, HourglassIcon, ScaleIcon, TargetIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { FieldLabel } from '../components/FieldLabel';
import { FocusOptionCard } from '../components/FocusOptionCard';
import { ProgressSteps } from '../components/ProgressSteps';
import { SelectField } from '../components/SelectField';
import { LIFE_PLAN_GRADIENT, LIFE_PLAN_TOTAL_STEPS } from '../theme';
import type { DifficultyLevel, FocusPreference, StudyPreferences } from '../types';

const CURRENT_STEP = 3;

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

interface LifePlanPreferencesScreenProps {
  preferences: StudyPreferences;
  onFocusChange: (focus: FocusPreference) => void;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onIncludeReviewSessionsChange: (include: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function LifePlanPreferencesScreen({
  preferences,
  onFocusChange,
  onDifficultyChange,
  onIncludeReviewSessionsChange,
  onBack,
  onSubmit,
}: LifePlanPreferencesScreenProps) {
  const tabBarSpace = useTabBarSpace();

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

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
          How should we plan for you?
        </Text>

        <FieldLabel>FOCUS PREFERENCE</FieldLabel>
        <FocusOptionCard
          icon={<TargetIcon />}
          title="Deep Focus"
          description="Longer study blocks, fewer breaks"
          selected={preferences.focus === 'deep-focus'}
          onSelect={() => onFocusChange('deep-focus')}
        />
        <FocusOptionCard
          icon={<ScaleIcon />}
          title="Balanced"
          description="Mix of study and breaks"
          selected={preferences.focus === 'balanced'}
          onSelect={() => onFocusChange('balanced')}
        />
        <FocusOptionCard
          icon={<HourglassIcon />}
          title="Podomoro"
          description="25 mins focus, 5 mins break"
          selected={preferences.focus === 'pomodoro'}
          onSelect={() => onFocusChange('pomodoro')}
        />

        <View className="h-[10px]" />

        <FieldLabel>DIFFICULTY LEVEL</FieldLabel>
        <SelectField value={preferences.difficulty} options={DIFFICULTY_OPTIONS} onChange={onDifficultyChange} />

        <View className="mt-[22px] flex-row items-center justify-between">
          <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
            Include review & practice sessions
          </Text>
          <Switch
            value={preferences.includeReviewSessions}
            onValueChange={onIncludeReviewSessionsChange}
            trackColor={{ false: '#D8D8DE', true: '#2E7BE0' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      <View className="px-[20px] pt-[6px]" style={{ paddingBottom: tabBarSpace }}>
        <TouchableOpacity
          onPress={onSubmit}
          activeOpacity={0.85}
          className="h-[56px] items-center justify-center rounded-[30px]"
          style={{ backgroundColor: '#2E7BE0', experimental_backgroundImage: LIFE_PLAN_GRADIENT }}
        >
          <Text className="text-[16px] text-white" style={textStyle('semibold')}>
            Create Plan
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
