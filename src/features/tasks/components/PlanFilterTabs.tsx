import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

export type PlanFilter = 'all' | 'archived';

interface PlanFilterTabsProps {
  value: PlanFilter;
  onChange: (value: PlanFilter) => void;
}

const TABS: { value: PlanFilter; label: string }[] = [
  { value: 'all', label: 'All Plans' },
  { value: 'archived', label: 'Archived' },
];

const TRACK_PADDING = 6;
const TRACK_BORDER = 1;

export function PlanFilterTabs({ value, onChange }: PlanFilterTabsProps) {
  const activeIndex = TABS.findIndex(tab => tab.value === value);
  const [trackWidth, setTrackWidth] = useState(0);
  const anim = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: activeIndex,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [activeIndex, anim]);

  const segmentWidth = trackWidth / TABS.length;
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, segmentWidth],
  });

  return (
    <View
      className="rounded-full"
      style={{
        backgroundColor: '#F2F2F7',
        padding: TRACK_PADDING,
        borderWidth: TRACK_BORDER,
        borderColor: '#E4E4EA',
      }}
      onLayout={(e: LayoutChangeEvent) =>
        setTrackWidth(
          e.nativeEvent.layout.width - TRACK_PADDING * 2 - TRACK_BORDER * 2,
        )
      }
    >
      <View className="relative flex-row">
        {trackWidth > 0 ? (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: segmentWidth,
              transform: [{ translateX }],
              borderWidth: 1,
              borderColor: '#ECECF0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 3,
            }}
            className="rounded-full bg-white"
          />
        ) : null}

        {TABS.map(tab => {
          const active = tab.value === value;

          return (
            <Pressable
              key={tab.value}
              onPress={() => onChange(tab.value)}
              className="flex-1 items-center justify-center py-[15px]"
            >
              <Text
                className={
                  active ? 'text-[17px] text-light-inkStrong' : 'text-[17px] text-light-faint'
                }
                style={textStyle(active ? 'semibold' : 'medium')}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
