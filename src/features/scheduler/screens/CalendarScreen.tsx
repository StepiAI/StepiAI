import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { ChevronRight } from '../../../shared/components/Icons';
import { DayTimeline } from '../components/DayTimeline';
import { MonthPickerModal } from '../components/MonthPickerModal';
import { WeekStrip } from '../components/WeekStrip';
import { useGoogleCalendarEvents } from '../hooks/useGoogleCalendarEvents';
import { EVENT_TONE } from '../theme';
import { toDayEvents } from '../utils/calendarMapping';
import { buildWeek, formatWeekRange, startOfWeek } from '../utils/week';

export function CalendarScreen() {
  const [selected, setSelected] = useState(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="px-[20px] pt-[12px]">
        <Text className="mb-[10px] text-[13px] text-light-muted" style={textStyle('medium')}>
          Calendar
        </Text>

        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          activeOpacity={0.6}
          className="flex-row items-center justify-between"
        >
          <Text className="text-[20px] text-light-inkStrong" style={textStyle('bold')}>
            {formatWeekRange(week)}
          </Text>
          <ChevronRight />
        </TouchableOpacity>

        <View className="mt-[14px]">
          <WeekStrip week={week} selected={selected} onSelect={setSelected} />
        </View>
      </View>

      <View className="mt-[16px] h-[1px] bg-light-line" />

      <ScrollView
        className="flex-1 px-[20px]"
        contentContainerClassName="pb-[32px]"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <Text
          className="mb-[18px] mt-[18px] text-[20px] text-light-inkStrong"
          style={textStyle('bold')}
        >
          Ongoing
        </Text>

        {allDay.length > 0 ? (
          <View className="mb-[16px] flex-row flex-wrap gap-[8px]">
            {allDay.map((event, index) => (
              <View
                key={event.id ?? `all-day-${index}`}
                className="rounded-[8px] px-[10px] py-[6px]"
                style={{ backgroundColor: EVENT_TONE.purple.background }}
              >
                <Text
                  className="text-[12px]"
                  style={[textStyle('medium'), { color: EVENT_TONE.purple.text }]}
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
          <>
            {timed.length === 0 && allDay.length === 0 ? (
              <Notice
                title="Nothing scheduled"
                caption="No events on this day. Pull down to refresh."
              />
            ) : null}
            <DayTimeline events={timed} />
          </>
        )}

        {/* navbar */}
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
