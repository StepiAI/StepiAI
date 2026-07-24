import { useCallback, useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, Text } from 'react-native';
import { useTextStyle } from '../../../shared/theme/typography';
import { buildTimeSlots, formatTimeLabel, minutesSinceMidnight } from '../utils/dateTime';

const TIME_SLOTS = buildTimeSlots();

interface TimePickerModalProps {
  visible: boolean;
  selected: Date;
  onClose: () => void;
  onSelect: (time: Date) => void;
}

export function TimePickerModal({ visible, selected, onClose, onSelect }: TimePickerModalProps) {
  const textStyle = useTextStyle();
  const scrollRef = useRef<ScrollView>(null);
  const activeRow = useRef<{ y: number; height: number } | null>(null);
  const viewportHeight = useRef(0);

  const selectedMinutes = minutesSinceMidnight(selected);
  const centerActiveRow = useCallback(() => {
    const row = activeRow.current;
    if (!row || !viewportHeight.current) return;

    const offset = row.y + row.height / 2 - viewportHeight.current / 2;
    scrollRef.current?.scrollTo({ y: Math.max(0, offset), animated: false });
  }, []);

  useEffect(() => {
    if (!visible) {
      activeRow.current = null;
      viewportHeight.current = 0;
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center bg-black/40 px-[24px]" onPress={onClose}>
        <Pressable className="max-h-[420px] rounded-[20px] bg-white p-[10px]" onPress={() => {}}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            onLayout={event => {
              viewportHeight.current = event.nativeEvent.layout.height;
              centerActiveRow();
            }}
          >
            {TIME_SLOTS.map(slot => {
              const active = minutesSinceMidnight(slot) === selectedMinutes;

              return (
                <Pressable
                  key={slot.toISOString()}
                  onPress={() => {
                    onSelect(slot);
                    onClose();
                  }}
                  onLayout={
                    active
                      ? event => {
                          const { y, height } = event.nativeEvent.layout;
                          activeRow.current = { y, height };
                          centerActiveRow();
                        }
                      : undefined
                  }
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
