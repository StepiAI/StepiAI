import type { ReactNode } from 'react';
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { ChevronLeft, ChevronUpDownIcon, LocationPinIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { EventAttachments } from '../components/EventAttachments';
import { EventDetailTimeline } from '../components/EventDetailTimeline';
import { EVENT_DETAIL_ACCENT } from '../theme';
import { formatCoordinates } from '../utils/coordinates';
import { parseEventNotes } from '../utils/eventNotes';
import { TimelineEvent } from '../utils/timeline';

const MINUTE_MS = 60_000;
const CALENDAR_DOT_COLOR = '#2E7BE0';

interface EventDetailScreenProps {
  event: TimelineEvent;
  day: Date;
  onBack: () => void;
  onDelete?: (event: TimelineEvent) => void;
}

function startOfDay(day: Date) {
  const result = new Date(day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatClock(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatLength(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}

export function EventDetailScreen({ event, day, onBack, onDelete }: EventDetailScreenProps) {
  const tabBarSpace = useTabBarSpace();

  const { text: notesText, attachments } = parseEventNotes(event.notes);

  const start = new Date(startOfDay(day).getTime() + event.startMinutes * MINUTE_MS);
  const end = new Date(start.getTime() + event.durationMinutes * MINUTE_MS);

  const dateLabel = start.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleDelete = () => {
    Alert.alert('Delete Event', `Hapus "${event.title}" dari kalender kamu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete?.(event);
          onBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="px-[12px] pt-[8px]">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.6}
          hitSlop={10}
          className="flex-row items-center gap-[2px] self-start py-[4px]"
        >
          <ChevronLeft color={CALENDAR_DOT_COLOR} size={11} />
          <Text className="text-[16px] text-light-accent" style={textStyle('regular')}>
            {start.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-[20px]"
        contentContainerClassName="pb-[32px]"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-[16px] text-[26px] text-light-inkStrong" style={textStyle('bold')}>
          {event.title}
        </Text>

        {event.subtitle ? (
          <View className="mt-[8px] flex-row items-center gap-[6px]">
            <LocationPinIcon color={EVENT_DETAIL_ACCENT} size={15} />
            <Text
              className="flex-1 text-[15px]"
              style={[textStyle('medium'), { color: EVENT_DETAIL_ACCENT }]}
            >
              {event.subtitle}
            </Text>
          </View>
        ) : null}

        {event.latitude != null && event.longitude != null ? (
          <Text
            className="mt-[4px] text-[13px]"
            style={[textStyle('regular'), { color: EVENT_DETAIL_ACCENT }]}
          >
            {formatCoordinates(event.latitude, event.longitude)}
          </Text>
        ) : null}

        <Text className="mt-[16px] text-[15px] text-light-inkStrong" style={textStyle('medium')}>
          {dateLabel}
        </Text>
        <Text className="mt-[2px] text-[15px] text-light-muted" style={textStyle('regular')}>
          {formatClock(start)} – {formatClock(end)}
        </Text>
        <Text className="mt-[2px] text-[13px] text-light-faint" style={textStyle('regular')}>
          {formatLength(event.durationMinutes)}
        </Text>

        <View className="mt-[20px]">
          <EventDetailTimeline event={event} />
        </View>

        <SectionCard>
          <InfoRow
            label="Calendar"
            value="Home"
            leading={
              <View
                className="h-[10px] w-[10px] rounded-full"
                style={{ backgroundColor: CALENDAR_DOT_COLOR }}
              />
            }
          />
        </SectionCard>

        <SectionCard>
          <InfoRow label="Alert" value="Time to Leave" />
          <RowDivider />
          <InfoRow label="Second Alert" value="None" />
        </SectionCard>

        <SectionCard>
          <View className="px-[16px] py-[14px]">
            <Text
              className="text-[12px] tracking-[0.5px] text-light-muted"
              style={textStyle('semibold')}
            >
              NOTES
            </Text>
            {notesText ? (
              <Text
                className="mt-[6px] text-[15px] text-light-ink"
                style={textStyle('regular')}
              >
                {notesText}
              </Text>
            ) : attachments.length === 0 ? (
              <Text
                className="mt-[6px] text-[15px] text-light-muted"
                style={textStyle('regular')}
              >
                No notes
              </Text>
            ) : null}

            <EventAttachments attachments={attachments} />
          </View>
        </SectionCard>

        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          className="mt-[20px] items-center rounded-[16px] bg-light-fill py-[16px]"
        >
          <Text
            className="text-[16px]"
            style={[textStyle('semibold'), { color: EVENT_DETAIL_ACCENT }]}
          >
            Delete Event
          </Text>
        </TouchableOpacity>

        <View style={{ height: tabBarSpace }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <View className="mt-[16px] overflow-hidden rounded-[16px] bg-light-fill">{children}</View>
  );
}

function InfoRow({
  label,
  value,
  leading,
}: {
  label: string;
  value: string;
  leading?: ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-[16px] py-[14px]">
      <Text className="text-[15px] text-light-inkStrong" style={textStyle('regular')}>
        {label}
      </Text>
      <View className="flex-row items-center gap-[8px]">
        {leading}
        <Text className="text-[15px] text-light-muted" style={textStyle('regular')}>
          {value}
        </Text>
        <ChevronUpDownIcon />
      </View>
    </View>
  );
}

function RowDivider() {
  return <View className="ml-[16px] h-[1px] bg-light-line" />;
}
