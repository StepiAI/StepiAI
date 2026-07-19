import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import {
  WEEKDAY_HEADINGS,
  addMonths,
  buildMonthGrid,
  formatMonthYear,
  startOfMonth,
} from '../utils/month';
import { isSameDay } from '../utils/day';

// gabisa ambil token tailwidn soalyna ini buat props
const NAV_ICON_COLOR = '#4A4A52';

interface MonthPickerModalProps {
  visible: boolean;
  selected: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export function MonthPickerModal({
  visible,
  selected,
  onClose,
  onSelect,
}: MonthPickerModalProps) {
  const [month, setMonth] = useState(() => startOfMonth(selected));

  useEffect(() => {
    if (visible) {
      setMonth(startOfMonth(selected));
    }
  }, [visible, selected]);

  const today = new Date();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center bg-black/40 px-[24px]" onPress={onClose}>
        <Pressable className="rounded-[20px] bg-white p-[18px]" onPress={() => {}}>
          <View className="mb-[14px] flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setMonth(current => addMonths(current, -1))}
              hitSlop={12}
              activeOpacity={0.6}
            >
              <ChevronLeft color={NAV_ICON_COLOR} />
            </TouchableOpacity>

            <Text className="text-[17px] text-light-inkStrong" style={textStyle('bold')}>
              {formatMonthYear(month)}
            </Text>

            <TouchableOpacity
              onPress={() => setMonth(current => addMonths(current, 1))}
              hitSlop={12}
              activeOpacity={0.6}
            >
              <ChevronRight color={NAV_ICON_COLOR} />
            </TouchableOpacity>
          </View>

          <View className="flex-row">
            {WEEKDAY_HEADINGS.map(heading => (
              <Text
                key={heading}
                className="flex-1 text-center text-[11px] text-light-faint"
                style={textStyle('medium')}
              >
                {heading}
              </Text>
            ))}
          </View>

          {buildMonthGrid(month).map((row, rowIndex) => (
            <View key={rowIndex} className="mt-[6px] flex-row">
              {row.map(cell => {
                const active = isSameDay(cell.date, selected);
                const isToday = !active && isSameDay(cell.date, today);

                return (
                  <TouchableOpacity
                    key={cell.key}
                    activeOpacity={0.6}
                    onPress={() => {
                      onSelect(cell.date);
                      onClose();
                    }}
                    className="flex-1 items-center"
                  >
                    <View
                      className={`h-[36px] w-[36px] items-center justify-center rounded-full ${
                        active ? 'bg-light-accent' : ''
                      }`}
                    >
                      <Text
                        className={`text-[14px] ${
                          active
                            ? 'text-white'
                            : isToday
                            ? 'text-light-accent'
                            : cell.inCurrentMonth
                            ? 'text-light-ink'
                            : 'text-light-disabled'
                        }`}
                        style={textStyle(active || isToday ? 'bold' : 'regular')}
                      >
                        {cell.dayOfMonth}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <TouchableOpacity
            onPress={() => {
              onSelect(new Date());
              onClose();
            }}
            activeOpacity={0.7}
            className="mt-[14px] items-center rounded-[12px] bg-light-fill py-[10px]"
          >
            <Text className="text-[14px] text-light-accent" style={textStyle('semibold')}>
              Today
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
