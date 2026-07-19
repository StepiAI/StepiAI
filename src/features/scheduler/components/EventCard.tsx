import { Text, View } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { GoogleCalendarEvent } from '../../../services/googleCalendar/client';
import { formatTimeRange } from '../utils/agenda';

export function EventCard({ event }: { event: GoogleCalendarEvent }) {
  return (
    <Card className="mb-sm flex-row gap-md">
      <View className="w-1 rounded-full bg-primary" />

      <View className="flex-1">
        <Text className="text-caption text-primary">{formatTimeRange(event)}</Text>
        <Text className="text-body text-text" numberOfLines={2}>
          {event.summary ?? '(no title)'}
        </Text>
        {event.location ? (
          <Text className="text-caption text-textMuted" numberOfLines={1}>
            {event.location}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
