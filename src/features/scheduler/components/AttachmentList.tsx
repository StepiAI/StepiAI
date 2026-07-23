import { Text, TouchableOpacity, View } from 'react-native';
import { CloseIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import type { PickedFile } from '../../../services/attachments/client';

function formatSize(bytes: number | null) {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentListProps {
  files: PickedFile[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function AttachmentList({
  files,
  onRemove,
  disabled,
}: AttachmentListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <View>
      {files.map((file, index) => (
        <View
          key={`${file.uri}-${index}`}
          className="flex-row items-center gap-[8px] border-t border-light-rule px-[18px] py-[11px]"
        >
          <Text className="text-[13px]">📄</Text>

          <View className="flex-1">
            <Text
              className="text-[14px] text-light-ink"
              style={textStyle('medium')}
              numberOfLines={1}
            >
              {file.name}
            </Text>
            {file.size !== null ? (
              <Text
                className="text-[12px] text-light-faint"
                style={textStyle('regular')}
              >
                {formatSize(file.size)}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => onRemove(index)}
            disabled={disabled}
            activeOpacity={0.6}
            hitSlop={10}
            className="h-[24px] w-[24px] items-center justify-center rounded-full bg-light-fill"
          >
            <CloseIcon size={9} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
