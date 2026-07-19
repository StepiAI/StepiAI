import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

interface BenefitRowProps {
  icon: ReactNode;
  title: string;
  caption: string;
}

export function BenefitRow({ icon, title, caption }: BenefitRowProps) {
  return (
    <View className="flex-row items-start px-[16px] py-[14px]">
      <View className="mr-[14px] mt-[1px]">{icon}</View>

      <View className="flex-1">
        <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
          {title}
        </Text>
        <Text
          className="mt-[3px] text-[13px] leading-[18px] text-light-muted"
          style={textStyle('regular')}
        >
          {caption}
        </Text>
      </View>
    </View>
  );
}
