import { Modal, Pressable, ScrollView, Text } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';

export interface PickerOption<T extends string> {
  value: T;
  label: string;
}

interface OptionPickerModalProps<T extends string> {
  visible: boolean;
  options: readonly PickerOption<T>[];
  selected: T;
  onClose: () => void;
  onSelect: (value: T) => void;
}

export function OptionPickerModal<T extends string>({
  visible,
  options,
  selected,
  onClose,
  onSelect,
}: OptionPickerModalProps<T>) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center bg-black/40 px-[24px]"
        onPress={onClose}
      >
        <Pressable
          className="max-h-[420px] rounded-[20px] bg-white p-[10px]"
          onPress={() => {}}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map(option => {
              const active = option.value === selected;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  className={`items-center rounded-[12px] py-[12px] ${
                    active ? 'bg-light-accentSoft' : ''
                  }`}
                >
                  <Text
                    className={
                      active
                        ? 'text-[15px] text-light-accent'
                        : 'text-[15px] text-light-ink'
                    }
                    style={textStyle(active ? 'semibold' : 'regular')}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
