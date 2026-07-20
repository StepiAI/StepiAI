import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { AlertTriangleIcon, ChevronLeft, CloseIcon, PersonIcon } from '../../../shared/components/Icons';
import { useAuthSession } from '../../auth/hooks/useAuthSession';
import { DayTimeline } from '../components/DayTimeline';
import { MonthPickerModal } from '../components/MonthPickerModal';
import { WeekStrip } from '../components/WeekStrip';
import { useGoogleCalendarEvents } from '../hooks/useGoogleCalendarEvents';
import { ALERT_TONE } from '../theme';
import { toDayEvents } from '../utils/calendarMapping';
import { buildWeek, startOfWeek } from '../utils/week';

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const { session } = useAuthSession();
  const [selected, setSelected] = useState(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [trafficDismissed, setTrafficDismissed] = useState(false);
  const tabBarSpace = useTabBarSpace();

  const week = useMemo(() => buildWeek(selected), [selected]);

  // ambil seminggu sekali, jd klo ganti hari ga hit api lg
  const { from, to } = useMemo(() => {
    const weekStart = startOfWeek(selected);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return { from: weekStart, to: weekEnd };
  }, [selected]);

  const { events, loading, refreshing, error, notConnected, refresh } =
    useGoogleCalendarEvents({ from, to });

  const { timed, allDay } = useMemo(
    () => toDayEvents(events, selected),
    [events, selected],
  );

  const metadata = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const firstName = (metadata.full_name ?? metadata.name ?? '').split(' ')[0] || 'there';
  const avatarUrl = metadata.avatar_url ?? metadata.picture;
  const greeting = greetingForHour(new Date().getHours());

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="px-[20px] pt-[12px]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.6}
            className="flex-row items-center gap-[2px] py-[4px]"
          >
            <ChevronLeft color="#8E8E93" size={9} />
            <Text className="text-[15px] text-light-muted" style={textStyle('medium')}>
              {selected.toLocaleDateString('en-US', { month: 'long' })}
            </Text>
          </TouchableOpacity>

          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="h-[40px] w-[40px] rounded-full" />
          ) : (
            <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-light-fill">
              <PersonIcon color="#8E8E93" />
            </View>
          )}
        </View>

        <Text className="mt-[14px] text-[22px] text-light-inkStrong" style={textStyle('bold')}>
          {greeting}, {firstName}
        </Text>
        <Text className="mt-[2px] text-[14px] text-light-muted" style={textStyle('regular')}>
          Here&apos;s your plan today!
        </Text>

        <View className="mt-[16px]">
          <WeekStrip week={week} selected={selected} onSelect={setSelected} />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-[20px]"
        contentContainerClassName="pb-[32px]"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {trafficDismissed ? null : (
          <View
            className="mt-[16px] flex-row items-start gap-[10px] rounded-[14px] p-[14px]"
            style={{ backgroundColor: ALERT_TONE.background }}
          >
            <View className="mt-[2px]">
              <AlertTriangleIcon />
            </View>

            <View className="flex-1">
              <Text
                className="text-[14px]"
                style={[textStyle('semibold'), { color: ALERT_TONE.title }]}
              >
                Heavy traffic detected
              </Text>
              <Text
                className="mt-[4px] text-[12px] leading-[17px]"
                style={[textStyle('regular'), { color: ALERT_TONE.body }]}
              >
                Leaving at 08:05 instead of 08:20 increases your on-time probability from 42% to
                91%.
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                className="mt-[10px] self-start rounded-full bg-white px-[14px] py-[6px]"
              >
                <Text
                  className="text-[12px]"
                  style={[textStyle('semibold'), { color: ALERT_TONE.action }]}
                >
                  Adjust
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setTrafficDismissed(true)} hitSlop={10}>
              <CloseIcon color={ALERT_TONE.body} size={10} />
            </TouchableOpacity>
          </View>
        )}

        <View className="mt-[20px] h-[1px] bg-light-line" />

        <View className="mt-[18px]">
          {allDay.length > 0 ? (
            <View className="mb-[16px] flex-row flex-wrap gap-[8px]">
              {allDay.map((event, index) => (
                <View
                  key={event.id ?? `all-day-${index}`}
                  className="rounded-[8px] bg-light-accentSoft px-[10px] py-[6px]"
                >
                  <Text
                    className="text-[12px] text-light-accent"
                    style={textStyle('medium')}
                  >
                    All day · {event.summary ?? '(no title)'}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {loading ? (
            <View className="py-[40px]">
              <ActivityIndicator />
            </View>
          ) : notConnected ? (
            <Notice
              title="No calendar connected"
              caption="Connect your Google Calendar in Settings to see your schedule here."
            />
          ) : error ? (
            <Notice title="Something went wrong" caption={error} />
          ) : (
            <DayTimeline events={timed} />
          )}
        </View>

        <View style={{ height: tabBarSpace }} />
      </ScrollView>

      <MonthPickerModal
        visible={pickerOpen}
        selected={selected}
        onClose={() => setPickerOpen(false)}
        onSelect={setSelected}
      />
    </SafeAreaView>
  );
}

function Notice({ title, caption }: { title: string; caption: string }) {
  return (
    <View className="items-center px-[20px] py-[24px]">
      <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
        {title}
      </Text>
      <Text
        selectable
        className="mt-[4px] text-center text-[13px] text-light-muted"
        style={textStyle('regular')}
      >
        {caption}
      </Text>
    </View>
  );
}
