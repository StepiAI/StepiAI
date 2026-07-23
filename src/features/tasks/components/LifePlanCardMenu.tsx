import { Modal, Pressable, Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

export interface CardMenuAnchor {
  x: number;
  y: number;
}

interface LifePlanCardMenuProps {
  visible: boolean;
  anchor: CardMenuAnchor | null;
  archived: boolean;
  onClose: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}

const MENU_WIDTH = 168;

export function LifePlanCardMenu({
  visible,
  anchor,
  archived,
  onClose,
  onArchiveToggle,
  onDelete,
}: LifePlanCardMenuProps) {
  const left = anchor ? Math.max(12, anchor.x - MENU_WIDTH) : 0;
  const top = anchor ? anchor.y + 8 : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1" onPress={onClose}>
        <View
          style={{
            position: 'absolute',
            top,
            left,
            width: MENU_WIDTH,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 8,
          }}
          className="rounded-[14px] bg-white py-[6px]"
        >
          <Pressable
            onPress={() => {
              onClose();
              onArchiveToggle();
            }}
            className="px-[16px] py-[12px] active:bg-light-fill"
          >
            <Text className="text-[14px] text-light-ink" style={textStyle('medium')}>
              {archived ? 'Unarchive' : 'Archive'}
            </Text>
          </Pressable>

          <View className="mx-[12px] h-[1px] bg-light-rule" />

          <Pressable
            onPress={() => {
              onClose();
              onDelete();
            }}
            className="px-[16px] py-[12px] active:bg-light-fill"
          >
            <Text className="text-[14px] text-danger" style={textStyle('medium')}>
              Delete
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
