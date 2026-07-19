import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

interface SettingRowProps {
  label: string;
  value?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
}

export function SettingRow({ label, value, icon, trailing, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      className="h-[54px] flex-row items-center px-[18px]"
    >
      {icon ? <View className="mr-[14px]">{icon}</View> : null}

      <Text className="flex-1 text-[15px] text-light-ink" style={textStyle('medium')}>
        {label}
      </Text>

      {value ? (
        <Text className="text-[15px] text-light-faint" style={textStyle('regular')}>
          {value}
        </Text>
      ) : null}

      {trailing}
    </TouchableOpacity>
  );
}

export function RowDivider() {
  return <View className="ml-[18px] h-[1px] bg-light-rule" />;
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      className="mb-[10px] ml-[4px] text-[11px] tracking-[1.1px] text-light-faint"
      style={textStyle('medium')}
    >
      {children}
    </Text>
  );
}

export function GroupCard({ children }: { children: ReactNode }) {
  return <View className="overflow-hidden rounded-[16px] bg-white">{children}</View>;
}
