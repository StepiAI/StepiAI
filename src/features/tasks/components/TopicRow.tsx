import { TextInput, TouchableOpacity, View } from 'react-native';
import { ClearIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

const PLACEHOLDER_COLOR = '#B0B0B8';

interface TopicRowProps {
  label: string;
  placeholder?: string;
  onChangeLabel: (label: string) => void;
  onRemove: () => void;
}

export function TopicRow({ label, placeholder, onChangeLabel, onRemove }: TopicRowProps) {
  return (
    <View className="mb-[10px] h-[54px] flex-row items-center gap-[12px] rounded-full bg-white px-[18px]">
      <DragHandleIcon />

      <TextInput
        value={label}
        onChangeText={onChangeLabel}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        className="flex-1 text-[15px] text-light-ink"
        style={textStyle('medium')}
      />

      <TouchableOpacity onPress={onRemove} hitSlop={10} activeOpacity={0.6}>
        <ClearIcon />
      </TouchableOpacity>
    </View>
  );
}

// dekorasi doang buat isyarat "bisa diurutin ulang", belum ngedrag beneran
function DragHandleIcon() {
  return (
    <View className="h-[14px] w-[16px] justify-between py-[1px]">
      {[0, 1, 2].map(row => (
        <View key={row} className="h-[2px] w-full rounded-full bg-light-hint" />
      ))}
    </View>
  );
}
