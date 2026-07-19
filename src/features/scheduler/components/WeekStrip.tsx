import { Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { isSameDay } from '../utils/day';
import { WeekDay } from '../utils/week';

interface WeekStripProps {
  week: WeekDay[];
  selected: Date;
  onSelect: (date: Date) => void;
}

export function WeekStrip({ week, selected, onSelect }: WeekStripProps) {
  return (
    <View className="flex-row justify-between px-[4px]">
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
    </View>
  );
}
