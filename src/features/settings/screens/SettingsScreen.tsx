import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import { useGoogleCalendarConnection } from '../hooks/useGoogleCalendarConnection';

const PARKED_SCREENS: { name: keyof MainTabParamList; label: string }[] = [
  { name: 'Calendar', label: 'Calendar' },
  { name: 'Summary', label: 'Summary' },
  { name: 'Personalize', label: 'Personalize your Day' },
  { name: 'Location', label: 'Location Access' },
];

export function SettingsScreen() {
  const { status, busy, error, toggleConnection } = useGoogleCalendarConnection();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const tabBarSpace = useTabBarSpace();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="items-center gap-3 px-6 py-10"
    >
      <Text className="text-body text-textMuted">Connected Apps</Text>

      {status?.connected ? (
        <Text selectable className="text-caption text-text">
          {status.email ?? 'Google account (email unavailable)'}
        </Text>
      ) : null}

      <Pressable
        onPress={toggleConnection}
        disabled={busy || status === null}
        className="rounded-full bg-primary px-6 py-3"
      >
        {busy ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-onPrimary">
            {status?.connected ? 'Disconnect Google Calendar' : 'Connect Google Calendar'}
          </Text>
        )}
      </Pressable>

      {error ? <Text className="text-danger">{error}</Text> : null}

      <View className="mt-lg w-full">
        <Text className="mb-sm text-caption text-textMuted">Other screens</Text>

        {PARKED_SCREENS.map(screen => (
          <Pressable
            key={screen.name}
            onPress={() => navigation.navigate(screen.name)}
            className="mb-sm rounded-lg border border-border bg-surface px-4 py-3"
          >
            <Text className="text-body text-text">{screen.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: tabBarSpace }} />
    </ScrollView>
  );
}
