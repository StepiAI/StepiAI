import { TextInput, TouchableOpacity, View } from 'react-native';
import { ClearIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

const PLACEHOLDER_COLOR = '#B0B0B8';

interface PillInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function PillInput({ value, onChangeText, placeholder, autoFocus }: PillInputProps) {
  return (
    <View className="h-[54px] flex-row items-center rounded-full bg-white px-[18px]">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        autoFocus={autoFocus}
        className="flex-1 text-[15px] text-light-ink"
        style={textStyle('medium')}
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={10} activeOpacity={0.6}>
          <ClearIcon />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
