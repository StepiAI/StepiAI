import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

export function FieldCard({ children }: { children: ReactNode }) {
  return <View className="overflow-hidden rounded-[16px] bg-white">{children}</View>;
}

export function FieldRowDivider() {
  return <View className="ml-[18px] h-[1px] bg-light-rule" />;
}

interface FieldRowProps {
  label: string;
  value: string;
  onPress: () => void;
}

export function FieldRow({ label, value, onPress }: FieldRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className="h-[64px] flex-row items-center justify-between px-[18px]"
    >
      <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
        {label}
      </Text>

      <View className="rounded-full bg-light-fill px-[16px] py-[8px]">
        <Text className="text-[14px] text-light-ink" style={textStyle('semibold')}>
          {value}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface FieldRowDoubleProps {
  label: string;
  primaryValue: string;
  secondaryValue: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}

export function FieldRowDouble({
  label,
  primaryValue,
  secondaryValue,
  onPrimaryPress,
  onSecondaryPress,
}: FieldRowDoubleProps) {
  return (
    <View className="h-[64px] flex-row items-center justify-between px-[18px]">
      <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
        {label}
      </Text>

      <View className="flex-row gap-[8px]">
        <TouchableOpacity
          onPress={onPrimaryPress}
          activeOpacity={0.6}
          className="rounded-full bg-light-fill px-[14px] py-[8px]"
        >
          <Text className="text-[13px] text-light-ink" style={textStyle('semibold')}>
            {primaryValue}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSecondaryPress}
          activeOpacity={0.6}
          className="rounded-full bg-light-fill px-[14px] py-[8px]"
        >
          <Text className="text-[13px] text-light-ink" style={textStyle('semibold')}>
            {secondaryValue}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
