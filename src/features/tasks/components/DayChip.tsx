import { Text, TouchableOpacity } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

interface DayChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function DayChip({ label, selected, onToggle }: DayChipProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      className={`h-[44px] flex-row items-center gap-[6px] rounded-full border bg-white px-[18px] ${
        selected ? 'border-light-accent' : 'border-transparent'
      }`}
    >
      <Text
        className={selected ? 'text-[14px] text-light-ink' : 'text-[14px] text-light-muted'}
        style={textStyle(selected ? 'semibold' : 'medium')}
      >
        {label}
      </Text>

      {selected ? (
        <Text className="text-[15px] text-light-ink" style={textStyle('semibold')}>
          ×
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
