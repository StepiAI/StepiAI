import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { ChevronLeft } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { FieldLabel } from '../components/FieldLabel';
import { PillInput } from '../components/PillInput';
import { ProgressSteps } from '../components/ProgressSteps';
import { TopicRow } from '../components/TopicRow';
import { STUDY_PLAN_GRADIENT, STUDY_PLAN_TOTAL_STEPS } from '../theme';
import type { StudyPlanTopic } from '../types';

const CURRENT_STEP = 1;

interface CreateStudyPlanScreenProps {
  title: string;
  goal: string;
  topics: StudyPlanTopic[];
  canSubmit: boolean;
  onTitleChange: (title: string) => void;
  onGoalChange: (goal: string) => void;
  onAddTopic: () => void;
  onTopicChange: (id: string, label: string) => void;
  onTopicRemove: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CreateStudyPlanScreen({
  title,
  goal,
  topics,
  canSubmit,
  onTitleChange,
  onGoalChange,
  onAddTopic,
  onTopicChange,
  onTopicRemove,
  onBack,
  onNext,
}: CreateStudyPlanScreenProps) {
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
            className="flex-1 text-center text-[18px] text-light-inkStrong"
            style={textStyle('bold')}
          >
            Create Study Plan
          </Text>

          <View className="w-[24px]" />
        </View>

        <ProgressSteps total={STUDY_PLAN_TOTAL_STEPS} current={CURRENT_STEP} />

        <ScrollView
          className="mt-[26px] flex-1 px-[20px]"
          contentContainerClassName="pb-[24px]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="mb-[22px] text-[22px] text-light-inkStrong"
            style={textStyle('bold')}
          >
            What do you want to achieve?
          </Text>

          <FieldLabel>PLAN TITLE</FieldLabel>
          <PillInput
            value={title}
            onChangeText={onTitleChange}
            placeholder="e.g. Learning React"
            autoFocus
          />

          <View className="h-[20px]" />

          <FieldLabel>GOAL</FieldLabel>
          <PillInput
            value={goal}
            onChangeText={onGoalChange}
            placeholder="e.g. Build one project"
          />

          <View className="h-[20px]" />

          <FieldLabel>TOPICS / CHAPTERS</FieldLabel>
          {topics.map(topic => (
            <TopicRow
              key={topic.id}
              label={topic.label}
              placeholder="e.g. Data Management"
              onChangeLabel={label => onTopicChange(topic.id, label)}
              onRemove={() => onTopicRemove(topic.id)}
            />
          ))}

          <TouchableOpacity
            onPress={onAddTopic}
            activeOpacity={0.7}
            className="h-[54px] items-center justify-center rounded-full border border-light-accent bg-white"
          >
            <Text className="text-[15px] text-light-accent" style={textStyle('semibold')}>
              Add Topic
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="px-[20px] pt-[6px]" style={{ paddingBottom: tabBarSpace }}>
          <TouchableOpacity
            onPress={onNext}
            disabled={!canSubmit}
            activeOpacity={0.85}
            className={`h-[56px] items-center justify-center rounded-[30px] ${
              canSubmit ? '' : 'opacity-50'
            }`}
            style={{ backgroundColor: '#2E7BE0', experimental_backgroundImage: STUDY_PLAN_GRADIENT }}
          >
            <Text className="text-[16px] text-white" style={textStyle('semibold')}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
