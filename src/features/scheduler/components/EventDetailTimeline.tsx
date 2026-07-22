import { Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { LocationPinIcon } from '../../../shared/components/Icons';
import { EVENT_TONE } from '../theme';
import { TimelineEvent, formatEventTime } from '../utils/timeline';

const ROW_HEIGHT = 48;
const MIN_VISIBLE_HOURS = 4;
const GUTTER_WIDTH = 46;
const MIN_BLOCK_HEIGHT = 44;

interface EventDetailTimelineProps {
  event: TimelineEvent;
}

// mini timeline sejam sejaman di sekitar event, biar keliatan kek di kalender
export function EventDetailTimeline({ event }: EventDetailTimelineProps) {
  const tone = EVENT_TONE[event.tone];

  const eventStartHour = Math.floor(event.startMinutes / 60);
  const eventEndHour = Math.ceil((event.startMinutes + event.durationMinutes) / 60);
  const windowStart = Math.max(eventStartHour - 1, 0);
  const windowEnd = Math.max(windowStart + MIN_VISIBLE_HOURS, eventEndHour + 1);
  const hours = Array.from({ length: windowEnd - windowStart }, (_, index) => windowStart + index);

  const blockTop = ((event.startMinutes - windowStart * 60) / 60) * ROW_HEIGHT;
  const blockHeight = Math.max((event.durationMinutes / 60) * ROW_HEIGHT, MIN_BLOCK_HEIGHT);

  return (
    <View className="rounded-[16px] bg-light-fill p-[16px]">
      <View style={{ height: hours.length * ROW_HEIGHT }}>
        {hours.map((hour, index) => (
          <View
            key={hour}
            className="absolute left-0 right-0 flex-row items-center"
            style={{ top: index * ROW_HEIGHT }}
          >
            <Text
              className="text-[12px] text-light-faint"
              style={[textStyle('regular'), { width: GUTTER_WIDTH }]}
            >
              {`${String(hour % 24).padStart(2, '0')}.00`}
            </Text>
            <View className="h-[1px] flex-1 bg-light-line" />
          </View>
        ))}

        <View
          className="absolute right-0"
          style={{ top: blockTop, height: blockHeight, left: GUTTER_WIDTH }}
        >
          <View
            className="flex-1 justify-center rounded-[8px] px-[12px] py-[6px]"
            style={{ backgroundColor: tone.background }}
          >
            <Text className="text-[12px]" style={[textStyle('bold'), { color: tone.text }]}>
              {formatEventTime(event.startMinutes)}
            </Text>
            <Text
              className="text-[13px] text-light-inkStrong"
              style={textStyle('bold')}
              numberOfLines={1}
            >
              {event.title}
            </Text>
            {event.subtitle ? (
              <View className="mt-[1px] flex-row items-center gap-[4px]">
                <LocationPinIcon color={tone.text} size={11} />
                <Text
                  className="flex-1 text-[11px] text-light-muted"
                  style={textStyle('regular')}
                  numberOfLines={1}
                >
                  {event.subtitle}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
