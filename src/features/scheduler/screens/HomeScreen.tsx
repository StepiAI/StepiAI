import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddEventModal } from '../components/AddEventModal';
import { EventCard } from '../components/EventCard';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { useGoogleCalendarEvents } from '../hooks/useGoogleCalendarEvents';
import { groupEventsByDay } from '../utils/agenda';

export function HomeScreen() {
  const { events, loading, refreshing, error, notConnected, refresh } =
    useGoogleCalendarEvents();
  const [adding, setAdding] = useState(false);
  const tabBarSpace = useTabBarSpace();

  const sections = useMemo(() => groupEventsByDay(events), [events]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-lg pb-md pt-md">
        <View className="flex-1">
          <Text className="text-h1 text-text">Your week</Text>
          <Text className="text-caption text-textMuted">
            {notConnected ? 'Google Calendar not connected' : `${events.length} events from Google Calendar`}
          </Text>
        </View>

        {notConnected ? null : (
          <Pressable
            onPress={() => setAdding(true)}
            className="rounded-full bg-primary px-md py-sm"
          >
            <Text className="text-body font-semibold text-onPrimary">+ Add</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-lg"
          contentContainerClassName="pb-xl"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        >
          {notConnected ? (
            <EmptyState
              title="No calendar connected"
              caption="Go to Settings and connect your Google Calendar to see your schedule here."
            />
          ) : error ? (
            <EmptyState title="Something went wrong" caption={error} />
          ) : sections.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              caption="You have no events in the next 7 days. Pull down to refresh."
            />
          ) : (
            sections.map(section => (
              <View key={section.key} className="mb-md">
                <Text className="mb-sm text-h2 text-text">{section.title}</Text>
                {section.events.map((event, index) => (
                  <EventCard key={event.id ?? `${section.key}-${index}`} event={event} />
                ))}
              </View>
            ))
          )}

          <View style={{ height: tabBarSpace }} />
        </ScrollView>
      )}

      <AddEventModal
        visible={adding}
        onClose={() => setAdding(false)}
        onCreated={refresh}
      />
    </SafeAreaView>
  );
}

function EmptyState({ title, caption }: { title: string; caption: string }) {
  return (
    <View className="items-center px-lg py-xl">
      <Text className="text-body text-text">{title}</Text>
      <Text selectable className="mt-xs text-center text-caption text-textMuted">
        {caption}
      </Text>
    </View>
  );
}
