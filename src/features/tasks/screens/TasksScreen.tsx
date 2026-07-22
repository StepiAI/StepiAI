import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { textStyle } from '../../../shared/theme/typography';
import { PlanFilterTabs, PlanFilter } from '../components/PlanFilterTabs';
import { StudyPlanCard } from '../components/StudyPlanCard';
import { StudyPlanLogo } from '../components/StudyPlanLogo';
import { useCreateStudyPlan } from '../hooks/useCreateStudyPlan';
import { useStudyPlanDraft } from '../hooks/useStudyPlanDraft';
import { useStudyPlans } from '../hooks/useStudyPlans';
import { CreateStudyPlanScreen } from './CreateStudyPlanScreen';
import { CreatingStudyPlanScreen } from './CreatingStudyPlanScreen';
import { StudyPlanDetailScreen } from './StudyPlanDetailScreen';
import { StudyPlanPreferencesScreen } from './StudyPlanPreferencesScreen';
import { StudyScheduleScreen } from './StudyScheduleScreen';

type CreationStep = 'goals' | 'schedule' | 'preferences' | 'creating';

export function TasksScreen() {
  const [step, setStep] = useState<CreationStep | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const {
    draft,
    setTitle,
    setGoal,
    addTopic,
    updateTopic,
    removeTopic,
    setScheduleStartDate,
    setScheduleEndDate,
    toggleAvailableDay,
    setPreferredStartTime,
    setPreferredEndTime,
    setFocus,
    setDifficulty,
    setIncludeReviewSessions,
    reset,
    canSubmitGoals,
    canSubmitSchedule,
  } = useStudyPlanDraft();
  const { create } = useCreateStudyPlan();
  const { plans, loading, refreshing, error, refresh } = useStudyPlans();

  const exitCreation = () => {
    setStep(null);
    reset();
  };

  const submitDraft = async () => {
    setStep('creating');

    const created = await create(draft);

    if (created) {
      exitCreation();
      refresh();
      return;
    }

    setStep('preferences');
    Alert.alert('Could not create the life plan', 'Please check your details and try again.');
  };

  if (step === 'goals') {
    return (
      <CreateStudyPlanScreen
        title={draft.title}
        goal={draft.goal}
        topics={draft.topics}
        canSubmit={canSubmitGoals}
        onTitleChange={setTitle}
        onGoalChange={setGoal}
        onAddTopic={addTopic}
        onTopicChange={updateTopic}
        onTopicRemove={removeTopic}
        onBack={exitCreation}
        onNext={() => setStep('schedule')}
      />
    );
  }

  if (step === 'schedule') {
    return (
      <StudyScheduleScreen
        schedule={draft.schedule}
        canSubmit={canSubmitSchedule}
        onStartDateChange={setScheduleStartDate}
        onEndDateChange={setScheduleEndDate}
        onToggleDay={toggleAvailableDay}
        onPreferredStartTimeChange={setPreferredStartTime}
        onPreferredEndTimeChange={setPreferredEndTime}
        onBack={() => setStep('goals')}
        onNext={() => setStep('preferences')}
      />
    );
  }

  if (step === 'preferences') {
    return (
      <StudyPlanPreferencesScreen
        preferences={draft.preferences}
        onFocusChange={setFocus}
        onDifficultyChange={setDifficulty}
        onIncludeReviewSessionsChange={setIncludeReviewSessions}
        onBack={() => setStep('schedule')}
        onSubmit={submitDraft}
      />
    );
  }

  if (step === 'creating') {
    return <CreatingStudyPlanScreen />;
  }

  if (selectedPlanId) {
    return (
      <StudyPlanDetailScreen studyPlanId={selectedPlanId} onBack={() => setSelectedPlanId(null)} />
    );
  }

  if (loading) {
    return <StudyPlanLoadingScreen />;
  }

  if (!error && plans.length === 0) {
    return <StudyPlanEmptyState onCreatePress={() => setStep('goals')} />;
  }

  return (
    <StudyPlanListScreen
      plans={plans}
      refreshing={refreshing}
      error={error}
      onRefresh={refresh}
      onCreatePress={() => setStep('goals')}
      onPlanPress={setSelectedPlanId}
    />
  );
}

function ScreenHeader() {
  return (
    <Text className="mt-[6px] text-center text-[21px] text-light-inkStrong" style={textStyle('bold')}>
      Life Plan
    </Text>
  );
}

function StudyPlanLoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader />
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    </SafeAreaView>
  );
}

function StudyPlanEmptyState({ onCreatePress }: { onCreatePress: () => void }) {
  const tabBarSpace = useTabBarSpace();

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader />

      <View
        className="flex-1 items-center justify-center px-[32px]"
        style={{ paddingBottom: tabBarSpace }}
      >
        <StudyPlanLogo />

        <Text className="mt-[26px] text-[18px] text-light-inkStrong" style={textStyle('bold')}>
          No life plan yet
        </Text>

        <Text
          className="mt-[8px] text-center text-[14px] leading-[20px] text-light-muted"
          style={textStyle('regular')}
        >
          You can set your goals and we&apos;ll create a personalized plan that
          automatically added to your calendar.
        </Text>

        <TouchableOpacity
          onPress={onCreatePress}
          activeOpacity={0.8}
          className="mt-[26px] h-[52px] w-full items-center justify-center rounded-full bg-light-accentSoft"
        >
          <Text className="text-[15px] text-light-accent" style={textStyle('semibold')}>
            Create Life Plan
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface StudyPlanListScreenProps {
  plans: ReturnType<typeof useStudyPlans>['plans'];
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreatePress: () => void;
  onPlanPress: (planId: string) => void;
}

function StudyPlanListScreen({
  plans,
  refreshing,
  error,
  onRefresh,
  onCreatePress,
  onPlanPress,
}: StudyPlanListScreenProps) {
  const tabBarSpace = useTabBarSpace();
  const [filter, setFilter] = useState<PlanFilter>('all');

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader />

      <View className="mt-[18px] px-[20px]">
        <PlanFilterTabs value={filter} onChange={setFilter} />
      </View>

      <ScrollView
        className="mt-[18px] flex-1 px-[20px]"
        contentContainerClassName="pb-[24px]"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity
          onPress={onCreatePress}
          activeOpacity={0.7}
          className="h-[64px] items-center justify-center rounded-[16px] border border-dashed border-light-hint"
        >
          <Text className="text-[14px] text-light-muted" style={textStyle('medium')}>
            + Add a Life Plan
          </Text>
        </TouchableOpacity>

        <View className="h-[16px]" />

        {filter === 'archived' ? (
          <Notice title="No archived plans" caption="Plans you archive will show up here." />
        ) : error ? (
          <Notice title="Something went wrong" caption={error} />
        ) : (
          <View className="gap-[14px]">
            {plans.map(plan => (
              <StudyPlanCard key={plan.id} plan={plan} onPress={() => onPlanPress(plan.id)} />
            ))}
          </View>
        )}

        <View style={{ height: tabBarSpace }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Notice({ title, caption }: { title: string; caption: string }) {
  return (
    <View className="items-center px-[12px] py-[24px]">
      <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
        {title}
      </Text>
      <Text className="mt-[4px] text-center text-[13px] text-light-muted" style={textStyle('regular')}>
        {caption}
      </Text>
    </View>
  );
}
