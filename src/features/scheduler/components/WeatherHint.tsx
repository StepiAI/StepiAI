import { ActivityIndicator, Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import type { WeatherCategory } from '../../../services/weather/client';
import type { ScheduleWeather } from '../hooks/useScheduleWeather';

const ICONS: Record<WeatherCategory, string> = {
  clear: '☀️',
  cloudy: '☁️',
  drizzle: '🌦️',
  rain: '🌧️',
  thunderstorm: '⛈️',
  unknown: '❓'
};

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface WeatherHintProps {
  weather: ScheduleWeather | null;
  loading: boolean;
}

export function WeatherHint({ weather, loading }: WeatherHintProps) {
  if (loading) {
    return (
      <View className="flex-row items-center gap-[6px]">
        <ActivityIndicator size="small" color="#C6C6CC" />
        <Text
          className="text-[13px] text-light-faint"
          style={textStyle('regular')}
        >
          Cek cuaca...
        </Text>
      </View>
    );
  }

  if (!weather?.atStart) {
    return null;
  }

  const { atStart, wetBefore } = weather;
  const chance = atStart.precipitationProbability;

  return (
    <View className="gap-[6px]">
      <View className="flex-row items-center gap-[6px]">
        <Text className="text-[13px]">{ICONS[atStart.category]}</Text>
        <Text className="text-[13px] text-light-ink" style={textStyle('medium')}>
          {atStart.condition}
          {atStart.temperature !== null ? ` · ${atStart.temperature}°C` : ''}
          {chance !== null ? ` · hujan ${chance}%` : ''}
        </Text>
      </View>

      {/* inti fiturnya: acaranya sendiri boleh cerah, tapi perjalanannya kgk */}
      {wetBefore.length > 0 ? (
        <View className="flex-row items-start gap-[6px]">
          <Text className="text-[13px]">☔</Text>
          <Text
            className="flex-1 text-[13px] text-danger"
            style={textStyle('medium')}
          >
            {wetBefore[0].condition} sekitar jam {formatHour(wetBefore[0].time)}{' '}
            - berangkat lebih awal atau bawa payung
          </Text>
        </View>
      ) : null}
    </View>
  );
}
