import { useEffect, useState } from 'react';
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
import { useTabBarVisibility } from '../../../app/navigation/TabBarVisibilityContext';
import { textStyle } from '../../../shared/theme/typography';
import { PlanFilterTabs, PlanFilter } from '../components/PlanFilterTabs';
import { LifePlanCard } from '../components/LifePlanCard';
import { LifePlanConflictModal } from '../components/LifePlanConflictModal';
import { LifePlanLogo } from '../components/LifePlanLogo';
import {
  LifePlanConflictOption,
  LifePlanConflictResult,
} from '../../../services/lifePlan/client';
import { LifePlanResolution, useCreateLifePlan } from '../hooks/useCreateLifePlan';
import { useLifePlanDraft } from '../hooks/useLifePlanDraft';
import { useLifePlans } from '../hooks/useLifePlans';
import { isLifePlanCompleted } from '../utils/lifePlanMapping';
import { CreateLifePlanScreen } from './CreateLifePlanScreen';
import { CreatingLifePlanScreen } from './CreatingLifePlanScreen';
import { LifePlanDetailScreen } from './LifePlanDetailScreen';
import { LifePlanPreferencesScreen } from './LifePlanPreferencesScreen';
import { PreviewLifePlanScreen } from './PreviewLifePlanScreen';
import { StudyScheduleScreen } from './StudyScheduleScreen';

type CreationStep = 'goals' | 'schedule' | 'preferences' | 'review' | 'creating';

export function TasksScreen() {
  const [step, setStep] = useState<CreationStep | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { setHidden } = useTabBarVisibility();

  useEffect(() => {
    setHidden(step !== null);
  }, [step, setHidden]);

  useEffect(() => () => setHidden(false), [setHidden]);
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
  } = useLifePlanDraft();
  const { create, saving } = useCreateLifePlan();
  const { plans, loading, refreshing, error, refresh, setArchived, remove } = useLifePlans();
  const [conflict, setConflict] = useState<LifePlanConflictResult | null>(null);

  const exitCreation = () => {
    setStep(null);
    setConflict(null);
    reset();
  };

  const submitDraft = async (resolution?: LifePlanResolution) => {
    setConflict(null);
    setStep('creating');

    const outcome = await create(draft, resolution);

    if (outcome.type === 'created') {
      exitCreation();
      refresh();
      return;
    }

    if (outcome.type === 'conflict') {
      setConflict(outcome.conflict);
      setStep('review');
      return;
    }

    setStep('review');
    Alert.alert('Could not create the life plan', outcome.message);
  };

  const handleSelectResolution = (option: LifePlanConflictOption) => {
    const resolution: LifePlanResolution =
      option.type === 'skip_day_and_extend'
        ? { endDate: option.updatedEndDate, skippedDates: option.skippedDates }
        : { scheduleOverrides: option.scheduleOverrides };

    submitDraft(resolution);
  };

  if (step === 'goals') {
    return (
      <CreateLifePlanScreen
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
      <LifePlanPreferencesScreen
        preferences={draft.preferences}
        onFocusChange={setFocus}
        onDifficultyChange={setDifficulty}
        onIncludeReviewSessionsChange={setIncludeReviewSessions}
        onBack={() => setStep('schedule')}
        onSubmit={() => setStep('review')}
      />
    );
  }

  if (step === 'review') {
    return (
      <>
        <PreviewLifePlanScreen
          draft={draft}
          onBack={() => setStep('preferences')}
          onSubmit={() => submitDraft()}
        />
        <LifePlanConflictModal
          conflict={conflict}
          submitting={saving}
          onSelectOption={handleSelectResolution}
          onCancel={() => setConflict(null)}
        />
      </>
    );
  }

  if (step === 'creating') {
    return <CreatingLifePlanScreen />;
  }

  if (selectedPlanId) {
    return (
      <LifePlanDetailScreen lifePlanId={selectedPlanId} onBack={() => setSelectedPlanId(null)} />
    );
  }

  if (loading) {
    return <LifePlanLoadingScreen />;
  }

  if (!error && plans.length === 0) {
    return <LifePlanEmptyState onCreatePress={() => setStep('goals')} />;
  }

  return (
    <LifePlanListScreen
      plans={plans}
      refreshing={refreshing}
      error={error}
      onRefresh={refresh}
      onCreatePress={() => setStep('goals')}
      onPlanPress={setSelectedPlanId}
      onSetArchived={setArchived}
      onDeletePlan={remove}
    />
  );
}

function ScreenHeader() {
  return (
    <Text className="mt-[20px] text-center text-[21px] text-light-inkStrong" style={textStyle('bold')}>
      Life Plan
    </Text>
  );
}

function LifePlanLoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ScreenHeader />
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    </SafeAreaView>
  );
}

function LifePlanEmptyState({ onCreatePress }: { onCreatePress: () => void }) {
  const tabBarSpace = useTabBarSpace();

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ScreenHeader />

      <View
        className="flex-1 items-center justify-center px-[32px]"
        style={{ paddingBottom: tabBarSpace }}
      >
        <LifePlanLogo />

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

interface LifePlanListScreenProps {
  plans: ReturnType<typeof useLifePlans>['plans'];
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreatePress: () => void;
  onPlanPress: (planId: string) => void;
  onSetArchived: (planId: string, archived: boolean) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
}

function LifePlanListScreen({
  plans,
  refreshing,
  error,
  onRefresh,
  onCreatePress,
  onPlanPress,
  onSetArchived,
  onDeletePlan,
}: LifePlanListScreenProps) {
  const tabBarSpace = useTabBarSpace();
  const [filter, setFilter] = useState<PlanFilter>('all');

  const shelvedPlans = plans.filter(plan => plan.archived || isLifePlanCompleted(plan));
  const activePlans = plans.filter(plan => !shelvedPlans.includes(plan));
  const listedPlans = filter === 'archived' ? shelvedPlans : activePlans;

  const handleArchiveToggle = (plan: (typeof plans)[number]) => {
    onSetArchived(plan.id, !plan.archived).catch(() => {
      Alert.alert('Could not update', 'Please try again in a moment.');
    });
  };

  const confirmDelete = (plan: (typeof plans)[number]) => {
    Alert.alert('Delete life plan', `“${plan.title}” will be removed from your list.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDeletePlan(plan.id).catch(() => {
            Alert.alert('Could not delete', 'Please try again in a moment.');
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
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
        {filter === 'all' ? (
          <>
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
          </>
        ) : null}

        {error ? (
          <Notice title="Something went wrong" caption={error} />
        ) : listedPlans.length === 0 ? (
          filter === 'archived' ? (
            <Notice
              title="No archived plans"
              caption="Completed plans and plans you archive will show up here."
            />
          ) : (
            <Notice title="No active plans" caption="Create a new life plan to get started." />
          )
        ) : (
          <View className="gap-[14px]">
            {listedPlans.map(plan => (
              <LifePlanCard
                key={plan.id}
                plan={plan}
                archived={plan.archived}
                onPress={() => onPlanPress(plan.id)}
                onArchiveToggle={() => handleArchiveToggle(plan)}
                onDelete={() => confirmDelete(plan)}
              />
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
