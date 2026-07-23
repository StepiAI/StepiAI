import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { textStyle } from '../../../shared/theme/typography';
import { ChevronLeft, ChevronRight } from '../../../shared/components/Icons';
import { EVENT_PALETTE } from '../eventColors';
import { isSameDay } from '../utils/day';
import { buildMonthGrid } from '../utils/month';
import {
  CalendarWeek,
  DayChip,
  buildWeekWindow,
  chipKey,
  initialWeekIndex,
} from '../utils/monthChips';

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAY_HEADINGS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const WEEK_HEIGHT = 120;
const LABEL_HEIGHT = 40;
const MAX_CHIPS = 3;

const DEPTH_YEAR = 0;
const DEPTH_MONTH = 1;
const DEPTH_DAY = 2;

const DURATION = 340;
const EASE = Easing.bezier(0.33, 0, 0.2, 1);

type Level = 'month' | 'year';

interface CalendarZoomProps {
  visible: boolean;
  selected: Date;
  month: Date;
  dayChips: Map<string, DayChip[]>;
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export function CalendarZoom({
  visible,
  selected,
  month,
  dayChips,
  onMonthChange,
  onSelectDate,
  onClose,
}: CalendarZoomProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const depth = useRef(new Animated.Value(DEPTH_DAY)).current;
  const [level, setLevel] = useState<Level>('month');

  const animateTo = useCallback(
    (value: number, after?: () => void) => {
      Animated.timing(depth, {
        toValue: value,
        duration: DURATION,
        easing: EASE,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) after?.();
      });
    },
    [depth],
  );

  useEffect(() => {
    if (!visible) return;
    setLevel('month');
    depth.setValue(DEPTH_DAY);
    animateTo(DEPTH_MONTH);
  }, [visible, animateTo, depth]);

  const goToYear = () => {
    setLevel('year');
    animateTo(DEPTH_YEAR);
  };

  const goToMonth = (monthIndex: number) => {
    onMonthChange(new Date(month.getFullYear(), monthIndex, 1));
    setLevel('month');
    animateTo(DEPTH_MONTH);
  };

  const zoomIntoDay = (date: Date) => {
    animateTo(DEPTH_DAY, () => {
      onSelectDate(date);
      onClose();
    });
  };

  const handleBack = () => {
    if (level === 'year') {
      setLevel('month');
      animateTo(DEPTH_MONTH);
    } else {
      zoomIntoDay(selected);
    }
  };

  const bgOpacity = depth.interpolate({
    inputRange: [DEPTH_YEAR, DEPTH_MONTH, DEPTH_DAY],
    outputRange: [1, 1, 0],
  });

  const yearStyle = {
    opacity: depth.interpolate({
      inputRange: [DEPTH_YEAR, DEPTH_MONTH, DEPTH_DAY],
      outputRange: [1, 0, 0],
    }),
    transform: [
      {
        scale: depth.interpolate({
          inputRange: [DEPTH_YEAR, DEPTH_MONTH, DEPTH_DAY],
          outputRange: [1, 1.12, 1.12],
        }),
      },
    ],
  };

  const monthStyle = {
    opacity: depth.interpolate({
      inputRange: [DEPTH_YEAR, DEPTH_MONTH, DEPTH_DAY],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        scale: depth.interpolate({
          inputRange: [DEPTH_YEAR, DEPTH_MONTH, DEPTH_DAY],
          outputRange: [0.9, 1, 1.12],
        }),
      },
    ],
  };

  const topPad = insets.top + 8;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleBack}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: bgOpacity }]}
        />

        <Animated.View
          pointerEvents={level === 'year' ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, { paddingTop: topPad }, yearStyle]}
        >
          <YearView
            year={month.getFullYear()}
            selected={selected}
            onPickMonth={goToMonth}
            onPrevYear={() => onMonthChange(new Date(month.getFullYear() - 1, month.getMonth(), 1))}
            onNextYear={() => onMonthChange(new Date(month.getFullYear() + 1, month.getMonth(), 1))}
            onClose={handleBack}
          />
        </Animated.View>

        <Animated.View
          pointerEvents={level === 'month' ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, { paddingTop: topPad }, monthStyle]}
        >
          <MonthView
            month={month}
            selected={selected}
            width={width}
            dayChips={dayChips}
            onOpenYear={goToYear}
            onPickDay={zoomIntoDay}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

function MonthView({
  month,
  selected,
  width,
  dayChips,
  onOpenYear,
  onPickDay,
}: {
  month: Date;
  selected: Date;
  width: number;
  dayChips: Map<string, DayChip[]>;
  onOpenYear: () => void;
  onPickDay: (date: Date) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const scrolledFor = useRef('');
  const cellWidth = (width - 32) / 7;

  const weeks = useMemo(() => buildWeekWindow(month), [month]);

  const tops = useMemo(() => {
    const list: number[] = [];
    let y = 0;
    for (const week of weeks) {
      list.push(y);
      y += (week.monthLabel ? LABEL_HEIGHT : 0) + WEEK_HEIGHT;
    }
    return list;
  }, [weeks]);

  const startIndex = useMemo(() => initialWeekIndex(weeks, month), [weeks, month]);

  const [visibleMonth, setVisibleMonth] = useState(() => month);
  useEffect(() => setVisibleMonth(month), [month]);

  const scrollToStart = () => {
    scrollRef.current?.scrollTo({ y: tops[startIndex] ?? 0, animated: false });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y + LABEL_HEIGHT;
    let index = 0;
    for (let i = 0; i < tops.length; i++) {
      if (tops[i] <= y) index = i;
      else break;
    }
    const midDay = weeks[index]?.days[3];
    if (midDay && (midDay.getMonth() !== visibleMonth.getMonth() || midDay.getFullYear() !== visibleMonth.getFullYear())) {
      setVisibleMonth(new Date(midDay.getFullYear(), midDay.getMonth(), 1));
    }
  };

  return (
    <View className="flex-1 px-[16px]">
      <TouchableOpacity
        onPress={onOpenYear}
        activeOpacity={0.6}
        className="flex-row items-center gap-[2px] py-[6px] pr-[8px] self-start"
      >
        <ChevronLeft color="#2E7BE0" size={10} />
        <Text className="text-[16px] text-light-accent" style={textStyle('medium')}>
          {visibleMonth.getFullYear()}
        </Text>
      </TouchableOpacity>

      <Text
        className="mb-[8px] mt-[2px] text-[30px] text-light-inkStrong"
        style={textStyle('bold')}
      >
        {MONTHS_FULL[visibleMonth.getMonth()]}
      </Text>

      <View className="flex-row border-b border-light-line pb-[6px]">
        {WEEKDAY_HEADINGS.map(heading => (
          <Text
            key={heading}
            className="text-center text-[10px] text-light-faint"
            style={[textStyle('semibold'), { width: cellWidth }]}
          >
            {heading.toUpperCase()}
          </Text>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onContentSizeChange={() => {
          const target = chipKey(month);
          if (scrolledFor.current !== target) {
            scrolledFor.current = target;
            requestAnimationFrame(scrollToStart);
          }
        }}
        contentContainerStyle={styles.weekListContent}
      >
        {weeks.map(week => (
          <WeekRow
            key={week.key}
            week={week}
            selected={selected}
            cellWidth={cellWidth}
            dayChips={dayChips}
            onPickDay={onPickDay}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function WeekRow({
  week,
  selected,
  cellWidth,
  dayChips,
  onPickDay,
}: {
  week: CalendarWeek;
  selected: Date;
  cellWidth: number;
  dayChips: Map<string, DayChip[]>;
  onPickDay: (date: Date) => void;
}) {
  const today = new Date();

  return (
    <View>
      {week.monthLabel ? (
        <View style={{ height: LABEL_HEIGHT }} className="justify-end pb-[6px]">
          <Text className="text-[19px] text-light-inkStrong" style={textStyle('bold')}>
            {week.monthLabel}
          </Text>
        </View>
      ) : null}

      <View style={{ height: WEEK_HEIGHT }} className="flex-row border-b border-light-rule">
        {week.days.map(date => {
          const key = chipKey(date);
          const chips = dayChips.get(key) ?? [];
          const active = isSameDay(date, selected);
          const isToday = !active && isSameDay(date, today);
          const visibleChips = chips.length > MAX_CHIPS ? chips.slice(0, MAX_CHIPS - 1) : chips;
          const overflow = chips.length - visibleChips.length;

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.6}
              onPress={() => onPickDay(date)}
              style={{ width: cellWidth }}
              className="items-stretch pt-[5px]"
            >
              <View className="items-center">
                <View
                  className={`h-[24px] w-[24px] items-center justify-center rounded-full ${
                    active ? 'bg-light-accent' : isToday ? 'bg-light-accentSoft' : ''
                  }`}
                >
                  <Text
                    className={`text-[13px] ${
                      active ? 'text-white' : isToday ? 'text-light-accent' : 'text-light-ink'
                    }`}
                    style={textStyle(active || isToday ? 'semibold' : 'regular')}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              </View>

              <View className="mt-[3px] px-[1px]">
                {visibleChips.map(chip => (
                  <Chip key={chip.id} chip={chip} />
                ))}
                {overflow > 0 ? (
                  <Text
                    className="text-center text-[9px] text-light-muted"
                    style={textStyle('semibold')}
                  >
                    +{overflow}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function Chip({ chip }: { chip: DayChip }) {
  const tone = EVENT_PALETTE[chip.tone % EVENT_PALETTE.length];

  return (
    <View className="mb-[2px] rounded-[3px] px-[3px] py-[2px]" style={{ backgroundColor: tone.background }}>
      <Text numberOfLines={1} style={[textStyle('semibold'), styles.chipTitle, { color: tone.text }]}>
        {chip.title}
      </Text>
      {chip.time ? (
        <Text numberOfLines={1} style={[textStyle('medium'), styles.chipTime, { color: tone.text }]}>
          {chip.time}
        </Text>
      ) : null}
    </View>
  );
}

function YearView({
  year,
  selected,
  onPickMonth,
  onPrevYear,
  onNextYear,
  onClose,
}: {
  year: number;
  selected: Date;
  onPickMonth: (monthIndex: number) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onClose: () => void;
}) {
  const today = new Date();

  return (
    <View className="flex-1 px-[20px]">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.6}
          className="flex-row items-center gap-[2px] py-[6px] pr-[8px]"
        >
          <ChevronLeft color="#2E7BE0" size={10} />
          <Text className="text-[16px] text-light-accent" style={textStyle('medium')}>
            Today
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-[18px]">
          <TouchableOpacity onPress={onPrevYear} hitSlop={10} activeOpacity={0.6}>
            <ChevronLeft color="#2E7BE0" size={11} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNextYear} hitSlop={10} activeOpacity={0.6}>
            <ChevronRight color="#2E7BE0" size={11} />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="mb-[6px] mt-[6px] text-[30px] text-light-inkStrong" style={textStyle('bold')}>
        {year}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.yearContent}>
        <View className="flex-row flex-wrap">
          {MONTHS_SHORT.map((_, monthIndex) => (
            <TouchableOpacity
              key={monthIndex}
              activeOpacity={0.6}
              onPress={() => onPickMonth(monthIndex)}
              className="w-1/3 px-[4px] py-[10px]"
            >
              <MiniMonth year={year} monthIndex={monthIndex} selected={selected} today={today} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function MiniMonth({
  year,
  monthIndex,
  selected,
  today,
}: {
  year: number;
  monthIndex: number;
  selected: Date;
  today: Date;
}) {
  const grid = useMemo(() => buildMonthGrid(new Date(year, monthIndex, 1)), [year, monthIndex]);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;

  return (
    <View>
      <Text
        className={`mb-[4px] text-[13px] ${isCurrentMonth ? 'text-light-accent' : 'text-light-inkStrong'}`}
        style={textStyle('semibold')}
      >
        {MONTHS_SHORT[monthIndex]}
      </Text>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map(cell => {
            const show = cell.inCurrentMonth;
            const active = show && isSameDay(cell.date, selected);
            const isToday = show && !active && isSameDay(cell.date, today);
            return (
              <View key={cell.key} className="flex-1 items-center py-[1px]">
                <View
                  className={`h-[13px] w-[13px] items-center justify-center rounded-full ${
                    active ? 'bg-light-accent' : ''
                  }`}
                >
                  <Text
                    className={`text-[8px] ${
                      active ? 'text-white' : isToday ? 'text-light-accent' : 'text-light-hint'
                    }`}
                    style={textStyle(active || isToday ? 'semibold' : 'regular')}
                  >
                    {show ? cell.dayOfMonth : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#FFFFFF' },
  weekListContent: { paddingBottom: 60 },
  yearContent: { paddingBottom: 40 },
  chipTitle: { fontSize: 8.5, lineHeight: 11 },
  chipTime: { fontSize: 8, lineHeight: 10, opacity: 0.85 },
});
