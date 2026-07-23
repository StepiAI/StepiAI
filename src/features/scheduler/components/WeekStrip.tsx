import { useMemo, useRef } from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { isSameDay } from '../utils/day';
import { WeekDay } from '../utils/week';

// geser sejauh ini baru dianggap ganti minggu
const SWIPE_THRESHOLD = 45;
// jarak mulai ambil alih gesture, biar tap tanggal gak ke-trigger
const CLAIM_DISTANCE = 12;
const SLIDE_OFFSET = 26;

interface WeekStripProps {
  week: WeekDay[];
  selected: Date;
  onSelect: (date: Date) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export function WeekStrip({
  week,
  selected,
  onSelect,
  onPrevWeek,
  onNextWeek,
}: WeekStripProps) {
  const slide = useRef(new Animated.Value(0)).current;

  // disimpen di ref biar PanResponder-nya gak perlu dibikin ulang tiap render
  const handlers = useRef({ onPrevWeek, onNextWeek });
  handlers.current = { onPrevWeek, onNextWeek };

  const panResponder = useMemo(() => {
    // geser keluar dikit, ganti minggunya, terus masuk lagi dari sisi sebaliknya
    const swap = (direction: 1 | -1, apply: () => void) => {
      Animated.timing(slide, {
        toValue: -direction * SLIDE_OFFSET,
        duration: 110,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;

        apply();
        slide.setValue(direction * SLIDE_OFFSET);
        Animated.timing(slide, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    };

    return PanResponder.create({
      // cuma ambil gesture yg jelas2 horizontal, biar scroll vertikal tetap jalan
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dx) > CLAIM_DISTANCE &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,

      onPanResponderRelease: (_event, gesture) => {
        const { onPrevWeek: prev, onNextWeek: next } = handlers.current;

        if (gesture.dx <= -SWIPE_THRESHOLD && next) swap(1, next);
        else if (gesture.dx >= SWIPE_THRESHOLD && prev) swap(-1, prev);
      },
    });
  }, [slide]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      className="flex-row justify-between px-[4px]"
      style={{ transform: [{ translateX: slide }] }}
    >
      {week.map(day => {
        const active = isSameDay(day.date, selected);

        return (
          <TouchableOpacity
            key={day.key}
            activeOpacity={0.7}
            onPress={() => onSelect(day.date)}
            className={`h-[58px] w-[42px] items-center justify-center rounded-[14px] ${
              active ? 'bg-light-accentSoft' : ''
            }`}
          >
            <Text
              className={`text-[17px] ${active ? 'text-light-accent' : 'text-light-ink'}`}
              style={textStyle('bold')}
            >
              {day.dayOfMonth}
            </Text>
            <Text
              className={`mt-[2px] text-[12px] ${active ? 'text-light-accent' : 'text-light-faint'}`}
              style={textStyle('medium')}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}
