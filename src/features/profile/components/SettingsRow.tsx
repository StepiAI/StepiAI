import { ComponentType, ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronRight } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

interface SettingsRowProps {
  label: string;
  caption?: string;
  captionTone?: 'muted' | 'danger';
  value?: string;
  icon?: ComponentType<{ color?: string; size?: number }>;
  logo?: ImageSourcePropType;
  accessory?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  busy?: boolean;
}

export function SettingsRow({
  label,
  caption,
  captionTone = 'muted',
  value,
  icon: Icon,
  logo,
  accessory,
  onPress,
  showChevron = false,
  danger = false,
  busy = false,
}: SettingsRowProps) {
  const body = (
    <View className="flex-row items-center gap-[12px] px-[16px] py-[14px]">
      {logo ? (
        <Image source={logo} className="h-[26px] w-[26px]" resizeMode="contain" />
      ) : Icon ? (
        <Icon color={danger ? '#E14545' : '#1C1C1E'} />
      ) : null}

      <View className="flex-1">
        <Text
          className={`text-[15px] ${danger ? 'text-[#E14545]' : 'text-light-ink'}`}
          style={textStyle(danger ? 'semibold' : 'medium')}
        >
          {label}
        </Text>

        {caption ? (
          <Text
            className={`mt-[2px] text-[13px] ${
              captionTone === 'danger' ? 'text-[#E14545]' : 'text-light-muted'
            }`}
            style={textStyle('regular')}
          >
            {caption}
          </Text>
        ) : null}
      </View>

      {busy ? <ActivityIndicator size="small" color="#8E8E93" /> : null}

      {value ? (
        <Text className="text-[14px] text-light-muted" style={textStyle('regular')}>
          {value}
        </Text>
      ) : null}

      {accessory}

      {showChevron ? <ChevronRight /> : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} disabled={busy}>
      {body}
    </TouchableOpacity>
  );
}
