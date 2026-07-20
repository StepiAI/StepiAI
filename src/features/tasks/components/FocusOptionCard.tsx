import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

interface FocusOptionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function FocusOptionCard({ icon, title, description, selected, onSelect }: FocusOptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className={`mb-[12px] flex-row items-center rounded-[16px] border bg-white px-[16px] py-[14px] ${
        selected ? 'border-light-accent' : 'border-transparent'
      }`}
    >
      <View className="mr-[14px]">{icon}</View>

      <View className="flex-1">
        <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
          {title}
        </Text>
        <Text className="mt-[2px] text-[13px] text-light-muted" style={textStyle('regular')}>
          {description}
        </Text>
      </View>

      <RadioDot selected={selected} />
    </TouchableOpacity>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-[22px] w-[22px] items-center justify-center rounded-full border-[1.6px] ${
        selected ? 'border-light-accent' : 'border-light-disabled'
      }`}
    >
      {selected ? <View className="h-[11px] w-[11px] rounded-full bg-light-accent" /> : null}
    </View>
  );
}
