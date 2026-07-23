import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { ChevronLeft, ChevronUpDownIcon, LocationPinIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { EventAttachments } from '../components/EventAttachments';
import { EventDetailTimeline } from '../components/EventDetailTimeline';
import { NewScheduleModal, ScheduleDraft } from '../components/NewScheduleModal';
import { useCreateGoogleCalendarEvent } from '../hooks/useCreateGoogleCalendarEvent';
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
  onChanged?: () => void;
}

function startOfDay(day: Date) {
  const result = new Date(day);
  result.setHours(0, 0, 0, 0);
  return result;
}

// format 12 jam kayak kalender iOS: "1.30 PM", tapi yg pas jam bulat "5 PM"
function formatClock(date: Date) {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return minute === 0
    ? `${hour12} ${suffix}`
    : `${hour12}.${String(minute).padStart(2, '0')} ${suffix}`;
}

function formatLength(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}

export function EventDetailScreen({ event, day, onBack, onChanged }: EventDetailScreenProps) {
  const tabBarSpace = useTabBarSpace();
  const { remove, saving } = useCreateGoogleCalendarEvent();
  const [editing, setEditing] = useState(false);

  const { text: notesText, attachments } = parseEventNotes(event.notes);

  const start = new Date(startOfDay(day).getTime() + event.startMinutes * MINUTE_MS);
  const end = new Date(start.getTime() + event.durationMinutes * MINUTE_MS);

  const dateLabel = start.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const draft: ScheduleDraft = {
    id: event.id,
    title: event.title,
    location: event.subtitle,
    latitude: event.latitude,
    longitude: event.longitude,
    notesText,
    existingAttachments: attachments.map(a => ({ name: a.name, url: a.url })),
    start,
    end,
  };

  const handleDelete = () => {
    Alert.alert('Delete Event', `Hapus "${event.title}" dari kalender kamu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const ok = await remove(event.id);
          if (ok) {
            onChanged?.();
            onBack();
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* tombolnya dibikin pill putih biar nempel di atas background abu2 */}
      <View className="flex-row items-center justify-between px-[16px] pt-[8px]">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.6}
          hitSlop={10}
          className="flex-row items-center gap-[4px] rounded-full bg-white py-[8px] pl-[12px] pr-[16px]"
        >
          <ChevronLeft color="#1C1C1E" size={11} />
          <Text className="text-[16px] text-light-inkStrong" style={textStyle('medium')}>
            {start.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setEditing(true)}
          activeOpacity={0.6}
          hitSlop={10}
          className="rounded-full bg-white px-[18px] py-[8px]"
        >
          <Text className="text-[16px] text-light-inkStrong" style={textStyle('medium')}>
            Edit
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
        <View className="mt-[2px] flex-row items-center gap-[8px]">
          <Text className="text-[15px] text-light-inkStrong" style={textStyle('regular')}>
            {formatClock(start)} – {formatClock(end)}
          </Text>
          <Text className="text-[13px] text-light-faint" style={textStyle('regular')}>
            {formatLength(event.durationMinutes)}
          </Text>
        </View>

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
            <Text className="text-[15px] text-light-inkStrong" style={textStyle('medium')}>
              Notes
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
          disabled={saving}
          activeOpacity={0.7}
          className="mt-[20px] items-center rounded-[16px] bg-white py-[16px]"
          style={saving ? { opacity: 0.5 } : undefined}
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

      <NewScheduleModal
        visible={editing}
        draft={draft}
        onClose={() => setEditing(false)}
        onUpdated={() => {
          setEditing(false);
          onChanged?.();
          onBack();
        }}
      />
    </SafeAreaView>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <View className="mt-[16px] overflow-hidden rounded-[16px] bg-white">{children}</View>
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
