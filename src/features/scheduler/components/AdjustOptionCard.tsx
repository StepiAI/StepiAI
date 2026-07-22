import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

interface AdjustOptionCardProps {
  icon: ReactNode;
  title: string;
  onTime?: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function AdjustOptionCard({
  icon,
  title,
  onTime,
  description,
  selected,
  onSelect,
}: AdjustOptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className={`flex-row items-center rounded-[16px] border bg-white px-[16px] py-[16px] ${
        selected ? 'border-light-accent' : 'border-transparent'
      }`}
    >
      <View className="mr-[14px]">{icon}</View>

      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
            {title}
          </Text>
          {onTime ? (
            <View className="ml-[8px] rounded-full bg-light-accentSoft px-[8px] py-[2px]">
              <Text className="text-[11px] text-light-accent" style={textStyle('semibold')}>
                {onTime}
              </Text>
            </View>
          ) : null}
        </View>
        <Text className="mt-[3px] text-[13px] text-light-muted" style={textStyle('regular')}>
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
      className={`ml-[12px] h-[22px] w-[22px] items-center justify-center rounded-full border-[1.6px] ${
        selected ? 'border-light-accent' : 'border-light-disabled'
      }`}
    >
      {selected ? <View className="h-[11px] w-[11px] rounded-full bg-light-accent" /> : null}
    </View>
  );
}
