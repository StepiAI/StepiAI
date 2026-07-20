import { Modal, Pressable, ScrollView, Text } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import { buildTimeSlots, formatTimeLabel, minutesSinceMidnight } from '../utils/dateTime';

const TIME_SLOTS = buildTimeSlots();

interface TimePickerModalProps {
  visible: boolean;
  selected: Date;
  onClose: () => void;
  onSelect: (time: Date) => void;
}

export function TimePickerModal({ visible, selected, onClose, onSelect }: TimePickerModalProps) {
  const selectedMinutes = minutesSinceMidnight(selected);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center bg-black/40 px-[24px]" onPress={onClose}>
        <Pressable className="max-h-[420px] rounded-[20px] bg-white p-[10px]" onPress={() => {}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {TIME_SLOTS.map(slot => {
              const active = minutesSinceMidnight(slot) === selectedMinutes;

              return (
                <Pressable
                  key={slot.toISOString()}
                  onPress={() => {
                    onSelect(slot);
                    onClose();
                  }}
                  className={`items-center rounded-[12px] py-[12px] ${active ? 'bg-light-accentSoft' : ''}`}
                >
                  <Text
                    className={active ? 'text-[15px] text-light-accent' : 'text-[15px] text-light-ink'}
                    style={textStyle(active ? 'semibold' : 'regular')}
                  >
                    {formatTimeLabel(slot)}
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
