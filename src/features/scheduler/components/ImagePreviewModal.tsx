import {
  Image,
  Modal,
  Pressable,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from '../../../shared/components/Icons';

interface ImagePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ url, onClose }: ImagePreviewModalProps) {
  // SafeAreaView ngukur posisi native-nya sendiri, dan di dalem Modal itu
  // balikannya 0 — makanya tombol X-nya ketiban status bar/notch. Hook-nya
  // baca dari context SafeAreaProvider, jadi tetep bener walau di Modal.
  const insets = useSafeAreaInsets();

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

        {/* box-none biar area kosong di sekitar tombol gak nelen tap ke gambar */}
        <View
          className="absolute left-0 right-0 top-0 px-[12px]"
          style={{ paddingTop: insets.top + 8 }}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            activeOpacity={0.7}
            accessibilityLabel="Close preview"
            className="h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-light-fill"
          >
            <CloseIcon size={11} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
