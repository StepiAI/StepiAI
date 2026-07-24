import { StyleSheet, Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { ClockGlyph, LocationPinIcon } from '../../../shared/components/Icons';
import { EVENT_PALETTE } from '../eventColors';
import { TimelineEvent, formatClockRange } from '../utils/timeline';

const ROW_HEIGHT = 48;
const MIN_VISIBLE_HOURS = 4;
const GUTTER_WIDTH = 46;
const MIN_BLOCK_HEIGHT = 44;

// sama kayak di DayTimeline: blok pendek gak muat semua baris, jadi
// isinya nyesuain tinggi biar gak kepotong
const MIN_HEIGHT_FOR_TIME = 52;
const MIN_HEIGHT_FOR_LOCATION = 72;

interface EventDetailTimelineProps {
  event: TimelineEvent;
}

function hourParts(hour: number) {
  const normalized = hour % 24;
  return {
    display: normalized % 12 === 0 ? 12 : normalized % 12,
    suffix: normalized < 12 ? 'AM' : 'PM',
  };
}

// mini timeline sejam sejaman di sekitar event, biar keliatan kek di kalender
export function EventDetailTimeline({ event }: EventDetailTimelineProps) {
  const tone = EVENT_PALETTE[event.tone % EVENT_PALETTE.length];

  const eventStartHour = Math.floor(event.startMinutes / 60);
  const eventEndHour = Math.ceil((event.startMinutes + event.durationMinutes) / 60);
  const windowStart = Math.max(eventStartHour - 1, 0);
  const windowEnd = Math.max(windowStart + MIN_VISIBLE_HOURS, eventEndHour + 1);
  const hours = Array.from({ length: windowEnd - windowStart }, (_, index) => windowStart + index);

  const blockTop = ((event.startMinutes - windowStart * 60) / 60) * ROW_HEIGHT;
  const blockHeight = Math.max((event.durationMinutes / 60) * ROW_HEIGHT, MIN_BLOCK_HEIGHT);

  const showTime = blockHeight >= MIN_HEIGHT_FOR_TIME;
  const showLocation = Boolean(event.subtitle) && blockHeight >= MIN_HEIGHT_FOR_LOCATION;

  return (
    <View className="overflow-hidden rounded-[16px] bg-white py-[16px] pl-[16px]">
      <View style={{ height: hours.length * ROW_HEIGHT }}>
        {hours.map((hour, index) => {
          const { display, suffix } = hourParts(hour);

          return (
            <View
              key={hour}
              className="absolute left-0 right-0 flex-row items-center"
              style={{ top: index * ROW_HEIGHT }}
            >
              <View
                className="flex-row items-baseline justify-end gap-[3px] pr-[8px]"
                style={{ width: GUTTER_WIDTH }}
              >
                <Text className="text-[15px] text-light-muted" style={textStyle('regular')}>
                  {display}
                </Text>
                <Text className="text-[10px] text-light-faint" style={textStyle('medium')}>
                  {suffix}
                </Text>
              </View>

              <View className="h-[1px] flex-1 bg-light-line" />
            </View>
          );
        })}

        {/* blok solid warna penuh + teks putih, kayak di kalender iOS */}
        <View
          className="absolute right-0"
          style={{ top: blockTop, height: blockHeight, left: GUTTER_WIDTH }}
        >
          <View
            className={`flex-1 overflow-hidden rounded-[6px] px-[10px] ${
              showTime ? 'py-[7px]' : 'justify-center py-[4px]'
            }`}
            style={{ backgroundColor: tone.text }}
          >
            <Text
              className="text-[13px] text-white"
              style={textStyle('bold')}
              numberOfLines={1}
            >
              {event.title}
            </Text>

            {showLocation ? (
              <View className="mt-[3px] flex-row items-center gap-[4px]">
                <LocationPinIcon color="#FFFFFF" size={11} />
                <Text
                  className="flex-1 text-[11px] text-white"
                  style={[textStyle('regular'), styles.subtleOnTone]}
                  numberOfLines={1}
                >
                  {event.subtitle}
                </Text>
              </View>
            ) : null}

            {showTime ? (
              <View className="mt-[2px] flex-row items-center gap-[4px]">
                <ClockGlyph color="#FFFFFF" size={11} />
                <Text
                  className="text-[11px] text-white"
                  style={[textStyle('regular'), styles.subtleOnTone]}
                  numberOfLines={1}
                >
                  {formatClockRange(event.startMinutes, event.durationMinutes)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subtleOnTone: { opacity: 0.92 },
});
