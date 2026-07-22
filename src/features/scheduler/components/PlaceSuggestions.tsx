import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import type { PlaceSuggestion } from '../../../services/weather/client';

interface PlaceSuggestionsProps {
  results: PlaceSuggestion[];
  loading: boolean;
  emptyQuery: boolean;
  onPick: (place: PlaceSuggestion) => void;
}

export function PlaceSuggestions({
  results,
  loading,
  emptyQuery,
  onPick,
}: PlaceSuggestionsProps) {
  if (loading && results.length === 0) {
    return (
      <View className="flex-row items-center gap-[6px] px-[18px] py-[12px]">
        <ActivityIndicator size="small" color="#C6C6CC" />
        <Text
          className="text-[13px] text-light-faint"
          style={textStyle('regular')}
        >
          Cari lokasi...
        </Text>
      </View>
    );
  }

  if (results.length === 0) {
    if (!emptyQuery) return null;
    return (
      <View className="px-[18px] py-[12px]">
        <Text
          className="text-[13px] text-light-faint"
          style={textStyle('regular')}
        >
          Location not found - try other keywords
        </Text>
      </View>
    );
  }

  return (
    <View>
      {results.map((place, index) => (
        <TouchableOpacity
          key={`${place.latitude},${place.longitude},${index}`}
          onPress={() => onPick(place)}
          activeOpacity={0.6}
          className="flex-row items-start gap-[8px] px-[18px] py-[11px]"
        >
          <View className="flex-1">
            <Text
              className="text-[14px] text-light-ink"
              style={textStyle('medium')}
              numberOfLines={1}
            >
              {place.name}
            </Text>
            {place.context ? (
              <Text
                className="text-[12px] text-light-faint"
                style={textStyle('regular')}
                numberOfLines={1}
              >
                {place.context}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
