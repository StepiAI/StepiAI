import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useGoogleCalendarConnection } from '../hooks/useGoogleCalendarConnection';

export function SettingsScreen() {
  const { status, busy, error, toggleConnection } = useGoogleCalendarConnection();

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
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
    </View>
  );
}
