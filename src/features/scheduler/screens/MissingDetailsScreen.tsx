import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { ChevronLeft } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { useGoogleCalendarEvents } from '../hooks/useGoogleCalendarEvents';
import {
  MissingDetailItem,
  MissingDetailTab,
  analyzeMissingDetails,
  filterMissingDetails,
  groupMissingDetails,
  missingLabel,
  summarizeMissingDetails,
} from '../utils/missingDetails';

const CTA_GRADIENT = 'linear-gradient(90deg, #2E7BE0 0%, #6C5CE7 100%)';
const REQUIRED_RED = '#E14545';
const OPTIONAL_AMBER = '#E8A23D';

// lihat 2 minggu ke depan buat cari event yg belum lengkap
const LOOKAHEAD_DAYS = 14;

export function MissingDetailsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [tab, setTab] = useState<MissingDetailTab>('required');

  const range = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + LOOKAHEAD_DAYS * 86_400_000);
    return { from, to };
  }, []);

  const { events, loading, notConnected } = useGoogleCalendarEvents(range);

  const items = useMemo(() => analyzeMissingDetails(events), [events]);
  const summary = useMemo(() => summarizeMissingDetails(items), [items]);
  const groups = useMemo(
    () => groupMissingDetails(filterMissingDetails(items, tab)),
    [items, tab],
  );

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  const openEvent = (item: MissingDetailItem) => {
    navigation.navigate('EventDetail', {
      event: item.timelineEvent,
      dayIso: item.day.toISOString(),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center px-[16px] pb-[8px] pt-[6px]">
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          accessibilityLabel="Back"
          hitSlop={10}
          className="h-[36px] w-[36px] items-center justify-center"
        >
          <ChevronLeft size={13} />
        </TouchableOpacity>

        <Text
          className="flex-1 text-center text-[18px] text-light-inkStrong"
          style={textStyle('bold')}
        >
          Missing Details
        </Text>

        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          hitSlop={10}
          className="h-[36px] items-end justify-center"
        >
          <Text className="text-[15px] text-light-muted" style={textStyle('regular')}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-[10px] px-[18px] pb-[8px] pt-[10px]">
        <FilterTab
          label={`All (${summary.all})`}
          active={tab === 'all'}
          onPress={() => setTab('all')}
        />
        <FilterTab
          label={`Required (${summary.required})`}
          active={tab === 'required'}
          onPress={() => setTab('required')}
          showDot={summary.required > 0}
        />
        <FilterTab
          label={`Completed (${summary.completed})`}
          active={tab === 'completed'}
          onPress={() => setTab('completed')}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : notConnected ? (
        <EmptyState
          title="No calendar connected"
          caption="Connect your Google Calendar to review event details."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="Nothing to review"
          caption={
            tab === 'completed'
              ? 'Completed events will show up here.'
              : "You're all caught up — no missing details."
          }
        />
      ) : (
        <ScrollView
          className="flex-1 px-[18px]"
          contentContainerClassName="pb-[24px] pt-[8px]"
          showsVerticalScrollIndicator={false}
        >
          {groups.map(group => (
            <View key={group.key} className="mb-[8px]">
              <Text
                className="mb-[10px] mt-[8px] text-[12px] tracking-[0.6px] text-light-muted"
                style={textStyle('semibold')}
              >
                {group.label}
              </Text>

              {group.items.map(item => (
                <MissingDetailCard key={item.id} item={item} onAdd={() => openEvent(item)} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      <View className="px-[18px] pb-[8px] pt-[6px]">
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.85}
          className="items-center justify-center rounded-full py-[17px]"
          style={{ experimental_backgroundImage: CTA_GRADIENT }}
        >
          <Text className="text-[16px] text-white" style={textStyle('semibold')}>
            Continue ({summary.completed}/{summary.all} Completed)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FilterTab({
  label,
  active,
  onPress,
  showDot = false,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  showDot?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-center gap-[6px] rounded-full px-[16px] py-[9px]"
      style={active ? { experimental_backgroundImage: CTA_GRADIENT } : { backgroundColor: '#FFFFFF' }}
    >
      {showDot && !active ? (
        <View className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: REQUIRED_RED }} />
      ) : null}
      <Text
        className={`text-[13px] ${active ? 'text-white' : 'text-light-ink'}`}
        style={textStyle(active ? 'semibold' : 'medium')}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MissingDetailCard({
  item,
  onAdd,
}: {
  item: MissingDetailItem;
  onAdd: () => void;
}) {
  const missingColor = item.required ? REQUIRED_RED : OPTIONAL_AMBER;
  const done = item.missing === null;

  return (
    <View className="mb-[14px] flex-row items-center rounded-[16px] bg-white p-[16px]">
      <View className="flex-1 pr-[12px]">
        <View className="flex-row items-center gap-[8px]">
          <Text
            className="text-[16px] text-light-inkStrong"
            style={textStyle('bold')}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {item.required && !done ? (
            <View className="rounded-full bg-[#FDE7E7] px-[8px] py-[2px]">
              <Text className="text-[11px]" style={[textStyle('semibold'), { color: REQUIRED_RED }]}>
                Required
              </Text>
            </View>
          ) : null}
        </View>

        <Text className="mt-[6px] text-[14px] text-light-muted" style={textStyle('regular')}>
          {item.timeLabel}
        </Text>

        {done ? (
          <Text
            className="mt-[6px] text-[14px] text-light-success"
            style={textStyle('medium')}
          >
            All details added
          </Text>
        ) : item.missing ? (
          <Text
            className="mt-[6px] text-[14px]"
            style={[textStyle('medium'), { color: missingColor }]}
          >
            {missingLabel(item.missing)}
          </Text>
        ) : null}
      </View>

      {done ? null : (
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.7}
          className="rounded-full border border-light-accent px-[22px] py-[10px]"
        >
          <Text className="text-[15px] text-light-accent" style={textStyle('semibold')}>
            Add
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyState({ title, caption }: { title: string; caption: string }) {
  return (
    <View className="flex-1 items-center justify-center px-[32px]">
      <Text className="text-[16px] text-light-ink" style={textStyle('semibold')}>
        {title}
      </Text>
      <Text
        className="mt-[6px] text-center text-[14px] text-light-muted"
        style={textStyle('regular')}
      >
        {caption}
      </Text>
    </View>
  );
}
