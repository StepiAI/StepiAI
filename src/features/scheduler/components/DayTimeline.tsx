import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { EVENT_PALETTE } from '../eventColors';
import { NOW_INDICATOR_COLOR } from '../theme';
import {
  HOUR_HEIGHT,
  TimelineEvent,
  blockPosition,
  formatDuration,
  formatEventTime,
  formatHourLabel,
  hourSlots,
  isWithinTimeline,
  minutesNow,
  offsetForMinutes,
  rangeForEvents,
  timelineHeight,
} from '../utils/timeline';

const GUTTER_WIDTH = 52;

interface DayTimelineProps {
  events: TimelineEvent[];
  nowMinutes?: number;
  onEventPress?: (event: TimelineEvent) => void;
}

export function DayTimeline({ events, nowMinutes, onEventPress }: DayTimelineProps) {
  const now = nowMinutes ?? minutesNow();
  const range = useMemo(() => rangeForEvents(events), [events]);

  return (
    <View style={{ height: timelineHeight(range) }}>
      {hourSlots(range).map((hour, index) => {
        const isNowHour = isWithinTimeline(now, range) && now === hour * 60;

        return (
          <View
            key={hour}
            className="absolute left-0 right-0 flex-row items-center"
            style={{ top: index * HOUR_HEIGHT }}
          >
            {isNowHour ? (
              <View
                className="items-center justify-center rounded-full px-[10px] py-[3px]"
                style={{ backgroundColor: NOW_INDICATOR_COLOR, marginLeft: -12 }}
              >
                <Text className="text-[11px] text-white" style={textStyle('bold')}>
                  {formatHourLabel(hour)}
                </Text>
              </View>
            ) : (
              <Text
                className="text-[12px] text-light-faint"
                style={[textStyle('regular'), { width: GUTTER_WIDTH }]}
              >
                {formatHourLabel(hour)}
              </Text>
            )}

            {isNowHour ? (
              <View className="flex-1" style={{ height: 1.5, backgroundColor: NOW_INDICATOR_COLOR }} />
            ) : (
              <View className="flex-1 border-t border-dotted border-light-grid" />
            )}
          </View>
        );
      })}

      <View className="absolute right-0 top-0" style={{ left: GUTTER_WIDTH }}>
        {events.map(event => {
          const { top, height } = blockPosition(event, range);
          const tone = EVENT_PALETTE[event.tone % EVENT_PALETTE.length];

          return (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.7}
              disabled={!onEventPress}
              onPress={onEventPress ? () => onEventPress(event) : undefined}
              className="absolute left-0 right-[8px] flex-row items-start rounded-[10px] px-[12px] py-[8px]"
              style={{ top, height, backgroundColor: tone.background }}
            >
              <View className="w-[54px]">
                <Text
                  className="text-[15px]"
                  style={[textStyle('bold'), { color: tone.text }]}
                >
                  {formatEventTime(event.startMinutes)}
                </Text>
                <Text
                  className="text-[9px]"
                  style={[textStyle('regular'), { color: tone.text }]}
                >
                  {formatDuration(event.durationMinutes)}
                </Text>
              </View>

              <View className="flex-1">
                <Text
                  className="text-[14px] text-light-ink"
                  style={textStyle('bold')}
                  numberOfLines={1}
                >
                  {event.title}
                </Text>
                {event.subtitle ? (
                  <Text
                    className="text-[12px] text-light-muted"
                    style={textStyle('regular')}
                    numberOfLines={1}
                  >
                    {event.subtitle}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {isWithinTimeline(now, range) && now % 60 !== 0 ? (
        <View
          className="absolute left-0 right-0 flex-row items-center"
          style={{ top: offsetForMinutes(now, range) }}
          pointerEvents="none"
        >
          <View
            className="h-[9px] w-[9px] rounded-full"
            style={{ marginLeft: GUTTER_WIDTH - 4, backgroundColor: NOW_INDICATOR_COLOR }}
          />
          <View className="h-[1.5px] flex-1" style={{ backgroundColor: NOW_INDICATOR_COLOR }} />
        </View>
      ) : null}
    </View>
  );
}
