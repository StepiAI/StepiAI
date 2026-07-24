import { useMemo, useState } from 'react';
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { ChevronLeft } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { AdjustOptionCard } from '../components/AdjustOptionCard';
import { TimePickerModal } from '../../tasks/components/TimePickerModal';
import {
  pushGoogleCalendarEventsLater,
  rescheduleGoogleCalendarEvent,
} from '../../../services/googleCalendar/client';
import {
  ClockOptionIcon,
  MoveMeetingIcon,
  PushLaterIcon,
  SparkleIcon,
} from '../components/adjustIcons';

// fallback kalau screen dibuka tanpa data alert (mis. dari dev tab).
const RECOMMENDATION = {
  recommended: { time: '08:05 AM', onTime: '91% on-time' },
  previous: { time: '08:20 AM', onTime: '42% on-time' },
};

type Recommendation = typeof RECOMMENDATION;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

type OptionId = 'ai' | 'earlier' | 'push' | 'move';

interface AdjustOption {
  id: OptionId;
  icon: React.ReactNode;
  title: string;
  onTime?: string;
  description: string;
}

const CTA_GRADIENT = 'linear-gradient(90deg, #2E7BE0 0%, #6C5CE7 100%)';
const PUSH_DELAY_MIN = 15;

export function AdjustScheduleScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'AdjustSchedule'>>();
  // heavy traffic, klo mo tes, bikin aja jadwal workhour, cb ke bandara soekarno hatta jam 8-9 pagi
  const alert = route.params?.alert;
  const traffic = alert?.traffic;
  const eventSummary = alert?.summary ?? null;
  const recommendation: Recommendation = traffic
    ? {
        recommended: {
          time: formatTime(traffic.recommendedDeparture),
          onTime: `${Math.round(traffic.onTimeAfter * 100)}% on-time`,
        },
        previous: {
          time: formatTime(traffic.naiveDeparture),
          onTime: `${Math.round(traffic.onTimeBefore * 100)}% on-time`,
        },
      }
    : RECOMMENDATION;

  const options = useMemo<AdjustOption[]>(
    () => [
      {
        id: 'ai',
        icon: <SparkleIcon />,
        title: 'Let AI optimize',
        onTime: '94% on-time',
        description: 'AI will find the best schedule',
      },
      {
        id: 'earlier',
        icon: <ClockOptionIcon />,
        title: 'Leave earlier',
        onTime: recommendation.recommended.onTime,
        description: `Leave at ${recommendation.recommended.time}`,
      },
      {
        id: 'push',
        icon: <PushLaterIcon />,
        title: 'Push everything later',
        onTime: traffic
          ? `${Math.round(traffic.pushOnTime * 100)}% on-time`
          : undefined,
        description: `Delay all events by ${PUSH_DELAY_MIN} min`,
      },
      {
        id: 'move',
        icon: <MoveMeetingIcon />,
        title: 'Move this meeting',
        description: eventSummary
          ? `Reschedule “${eventSummary}”`
          : 'Pilih jam baru buat meeting ini',
      },
    ],
    [recommendation, eventSummary, traffic],
  );

  const [selected, setSelected] = useState<OptionId>(traffic ? 'earlier' : 'push');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const applyLeaveEarlier = () => {
    const onTimePct = recommendation.recommended.onTime.replace(' on-time', '');
    const forEvent = eventSummary ? ` buat "${eventSummary}"` : '';
    Alert.alert(
      'Berangkat lebih awal',
      `Oke - berangkat jam ${recommendation.recommended.time}${forEvent} biar peluang tepat waktu kamu ${onTimePct}.`,
      [{ text: 'Siap', onPress: goBack }],
    );
  };

  const startMoveMeeting = () => {
    if (!alert?.eventId || !alert.eventStart || !alert.eventEnd) {
      Alert.alert('Nggak bisa pindah', 'Buka Adjust dari kartu alert dulu ya.');
      return;
    }
    setPickerOpen(true);
  };

  const onPickNewTime = async (slot: Date) => {
    setPickerOpen(false);
    if (!alert?.eventId || !alert.eventStart || !alert.eventEnd || busy) {
      return;
    }

    const originalStart = new Date(alert.eventStart);
    const durationMs =
      new Date(alert.eventEnd).getTime() - originalStart.getTime();

    // pindahin jam:menit ke tanggal event yang sama
    const newStart = new Date(originalStart);
    newStart.setHours(slot.getHours(), slot.getMinutes(), 0, 0);
    const newEnd = new Date(newStart.getTime() + durationMs);

    setBusy(true);
    try {
      await rescheduleGoogleCalendarEvent(
        alert.eventId,
        newStart.toISOString(),
        newEnd.toISOString(),
      );
      const label = newStart.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      Alert.alert(
        'Meeting dipindah',
        `${eventSummary ? `"${eventSummary}" ` : 'Meeting '}sekarang jam ${label}.`,
        [{ text: 'Oke', onPress: goBack }],
      );
    } catch (err) {
      console.error('[Adjust] gagal reschedule:', err);
      Alert.alert('Gagal memindah', 'Coba lagi sebentar ya.');
    } finally {
      setBusy(false);
    }
  };

  const applyPushLater = async () => {
    if (!alert?.eventStart) {
      Alert.alert('Nggak bisa geser', 'Buka Adjust dari kartu alert dulu ya.');
      return;
    }
    if (busy) return;

    const from = new Date(alert.eventStart);
    const endOfDay = new Date(from);
    endOfDay.setHours(23, 59, 59, 999);

    setBusy(true);
    try {
      const res = await pushGoogleCalendarEventsLater(
        from.toISOString(),
        endOfDay.toISOString(),
        PUSH_DELAY_MIN,
      );
      Alert.alert(
        'Jadwal digeser',
        `${res.shifted} acara digeser ${res.delayMinutes} menit lebih lambat.`,
        [{ text: 'Oke', onPress: goBack }],
      );
    } catch (err) {
      console.error('[Adjust] gagal push later:', err);
      Alert.alert('Gagal menggeser', 'Coba lagi sebentar ya.');
    } finally {
      setBusy(false);
    }
  };

  const onAdjust = () => {
    if (busy) return;
    if (selected === 'earlier') {
      applyLeaveEarlier();
      return;
    }
    if (selected === 'move') {
      startMoveMeeting();
      return;
    }
    if (selected === 'push') {
      applyPushLater();
      return;
    }
    // TODO(integrate): opsi "Let AI optimize" belum di-apply — tahap berikutnya
    goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View className="flex-row items-center px-[18px] pb-[10px] pt-[6px]">
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
          Adjust Schedule
        </Text>

        <View className="w-[36px]" />
      </View>

      <ScrollView
        className="flex-1 px-[18px]"
        contentContainerClassName="pb-[24px] pt-[10px]"
        showsVerticalScrollIndicator={false}
      >
        <RecommendationCard recommendation={recommendation} />

        <Text
          className="mb-[14px] mt-[24px] text-[17px] text-light-inkStrong"
          style={textStyle('semibold')}
        >
          How would you like to adjust?
        </Text>

        <View className="gap-[12px]">
          {options.map(option => (
            <AdjustOptionCard
              key={option.id}
              icon={option.icon}
              title={option.title}
              onTime={option.onTime}
              description={option.description}
              selected={selected === option.id}
              onSelect={() => setSelected(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-[18px] pb-[10px] pt-[8px]">
        <TouchableOpacity
          onPress={onAdjust}
          disabled={busy}
          activeOpacity={0.85}
          className="items-center justify-center rounded-full py-[17px]"
          style={{ experimental_backgroundImage: CTA_GRADIENT, opacity: busy ? 0.6 : 1 }}
        >
          <Text className="text-[16px] text-white" style={textStyle('semibold')}>
            {busy ? 'Menyimpan…' : 'Adjust Schedule'}
          </Text>
        </TouchableOpacity>
      </View>

      <TimePickerModal
        visible={pickerOpen}
        selected={alert?.eventStart ? new Date(alert.eventStart) : new Date()}
        onClose={() => setPickerOpen(false)}
        onSelect={onPickNewTime}
      />
    </SafeAreaView>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <View className="rounded-[18px] bg-white px-[18px] pb-[18px] pt-[16px]">
      <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
        Recommended Leaving
      </Text>

      <View className="my-[14px] h-[1px] bg-light-line" />

      <View className="flex-row">
        <TimeColumn
          dotColor="#F34A4D"
          label="Recommended"
          labelClass="text-[#F34A4D]"
          time={recommendation.recommended.time}
          timeClass="text-[#F34A4D]"
          onTime={recommendation.recommended.onTime}
          onTimeClass="text-[#F34A4D]"
        />
        <TimeColumn
          dotColor="#C6C6CC"
          label="Previous"
          labelClass="text-light-faint"
          time={recommendation.previous.time}
          timeClass="text-light-hint"
          onTime={recommendation.previous.onTime}
          onTimeClass="text-light-faint"
        />
      </View>
    </View>
  );
}

function TimeColumn({
  dotColor,
  label,
  labelClass,
  time,
  timeClass,
  onTime,
  onTimeClass,
}: {
  dotColor: string;
  label: string;
  labelClass: string;
  time: string;
  timeClass: string;
  onTime: string;
  onTimeClass: string;
}) {
  return (
    <View className="flex-1">
      <View className="flex-row items-center">
        <View className="mr-[6px] h-[7px] w-[7px] rounded-full" style={{ backgroundColor: dotColor }} />
        <Text className={`text-[13px] ${labelClass}`} style={textStyle('semibold')}>
          {label}
        </Text>
      </View>
      <Text className={`mt-[8px] text-[30px] ${timeClass}`} style={textStyle('bold')}>
        {time}
      </Text>
      <Text className={`mt-[4px] text-[12px] ${onTimeClass}`} style={textStyle('medium')}>
        {onTime}
      </Text>
    </View>
  );
}
