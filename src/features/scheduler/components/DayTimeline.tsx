import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { ClockGlyph, LocationPinIcon } from '../../../shared/components/Icons';
import { EVENT_PALETTE } from '../eventColors';
import { NOW_INDICATOR_COLOR } from '../theme';
import {
  HOUR_HEIGHT,
  TimelineEvent,
  formatClockRange,
  formatHourLabel,
  hourSlots,
  isWithinTimeline,
  layoutEvents,
  minutesNow,
  offsetForMinutes,
  rangeForEvents,
  timelineHeight,
} from '../utils/timeline';

const GUTTER_WIDTH = 52;
// jarak antar kartu yg tabrakan pas dibagi kolom bersebelahan
const COLUMN_GAP = 6;

// Tinggi kartu ngikut durasi, jadi event pendek (30 menitan) cuma dapet ~40px
// — gak muat buat judul + jam sekaligus. Isinya dipangkas nyesuain tinggi:
// yang penting judulnya kebaca, jamnya udah keliatan dari posisi di timeline.
const MIN_HEIGHT_FOR_TIME = 54;
const MIN_HEIGHT_FOR_LOCATION = 74;

interface DayTimelineProps {
  events: TimelineEvent[];
  nowMinutes?: number;
  onEventPress?: (event: TimelineEvent) => void;
}

export function DayTimeline({ events, nowMinutes, onEventPress }: DayTimelineProps) {
  const now = nowMinutes ?? minutesNow();
  const range = useMemo(() => rangeForEvents(events), [events]);
  const positioned = useMemo(() => layoutEvents(events, range), [events, range]);

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
              <View className="flex-1 border-t border-light-line" />
            )}
          </View>
        );
      })}

      <View className="absolute right-[8px] top-0" style={{ left: GUTTER_WIDTH }}>
        {positioned.map(({ event, top, height, columnIndex, columnCount }) => {
          const tone = EVENT_PALETTE[event.tone % EVENT_PALETTE.length];
          // event yg bentrok dibagi rata jadi kolom bersebelahan (bukan numpuk)
          const columnWidthPct = 100 / columnCount;
          const leftPct = columnIndex * columnWidthPct;

          const showTime = height >= MIN_HEIGHT_FOR_TIME;
          const showLocation = Boolean(event.subtitle) && height >= MIN_HEIGHT_FOR_LOCATION;

          return (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.7}
              disabled={!onEventPress}
              onPress={onEventPress ? () => onEventPress(event) : undefined}
              className="absolute"
              style={{
                top,
                height,
                left: `${leftPct}%`,
                width: `${columnWidthPct}%`,
                paddingRight: columnCount > 1 ? COLUMN_GAP : 0,
              }}
            >
              <View
                className="flex-1 flex-row overflow-hidden rounded-[12px]"
                style={{ backgroundColor: tone.background }}
              >
                <View style={[styles.accentBar, { backgroundColor: tone.text }]} />

                <View
                  className={`flex-1 px-[12px] ${
                    showTime ? 'py-[8px]' : 'justify-center py-[4px]'
                  }`}
                >
                  <Text
                    className="text-[14px] text-light-inkStrong"
                    style={textStyle('bold')}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>

                  {showLocation ? (
                    <View className="mt-[4px] flex-row items-center gap-[5px]">
                      <LocationPinIcon color={tone.text} size={12} />
                      <Text
                        className="flex-1 text-[12px]"
                        style={[textStyle('regular'), { color: tone.text }]}
                        numberOfLines={1}
                      >
                        {event.subtitle}
                      </Text>
                    </View>
                  ) : null}

                  {showTime ? (
                    <View className="mt-[3px] flex-row items-center gap-[5px]">
                      <ClockGlyph color={tone.text} size={12} />
                      <Text
                        className="text-[12px]"
                        style={[textStyle('regular'), { color: tone.text }]}
                        numberOfLines={1}
                      >
                        {formatClockRange(event.startMinutes, event.durationMinutes)}
                      </Text>
                    </View>
                  ) : null}
                </View>
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

const styles = StyleSheet.create({
  accentBar: { width: 5, marginLeft: 8, marginVertical: 8, borderRadius: 3 },
});
