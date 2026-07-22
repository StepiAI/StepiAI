import {
  Image,
  Modal,
  Pressable,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../../../shared/components/Icons';

interface ImagePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ url, onClose }: ImagePreviewModalProps) {
  return (
    <Modal
      visible={url !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-black">
        <Pressable className="flex-1 items-center justify-center" onPress={onClose}>
          {url ? (
            <Image source={{ uri: url }} className="h-full w-full" resizeMode="contain" />
          ) : null}
        </Pressable>

        <SafeAreaView className="absolute left-0 right-0 top-0" edges={['top']}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            activeOpacity={0.7}
            className="m-[12px] h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-light-fill"
          >
            <CloseIcon size={11} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
