import { useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import type { EventAttachment } from '../utils/eventNotes';
import { ImagePreviewModal } from './ImagePreviewModal';

interface EventAttachmentsProps {
  attachments: EventAttachment[];
}

export function EventAttachments({ attachments }: EventAttachmentsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View className="mt-[12px] gap-[10px]">
      {attachments.map((attachment, index) =>
        attachment.isImage ? (
          <TouchableOpacity
            key={`${attachment.url}-${index}`}
            activeOpacity={0.85}
            onPress={() => setPreviewUrl(attachment.url)}
          >
            <Image
              source={{ uri: attachment.url }}
              className="h-[180px] w-full rounded-[12px] bg-light-line"
              resizeMode="cover"
            />
            <Text
              className="mt-[6px] text-[12px] text-light-muted"
              style={textStyle('regular')}
              numberOfLines={1}
            >
              {attachment.name}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={`${attachment.url}-${index}`}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(attachment.url)}
            className="flex-row items-center gap-[10px] rounded-[12px] bg-white px-[12px] py-[12px]"
          >
            <Text className="text-[16px]">📄</Text>
            <Text
              className="flex-1 text-[14px] text-light-ink"
              style={textStyle('medium')}
              numberOfLines={1}
            >
              {attachment.name}
            </Text>
            <Text className="text-[12px] text-light-accent" style={textStyle('semibold')}>
              Open
            </Text>
          </TouchableOpacity>
        ),
      )}

      <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </View>
  );
}
