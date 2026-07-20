import { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({ value, options, onChange }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(option => option.value === value)?.label ?? '';

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        className="h-[54px] flex-row items-center justify-between rounded-full bg-white px-[18px]"
      >
        <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
          {selectedLabel}
        </Text>
        <ChevronDown />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-center bg-black/40 px-[24px]" onPress={() => setOpen(false)}>
          <Pressable className="rounded-[20px] bg-white p-[10px]" onPress={() => {}}>
            {options.map(option => {
              const active = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`rounded-[12px] px-[14px] py-[14px] ${active ? 'bg-light-accentSoft' : ''}`}
                >
                  <Text
                    className={active ? 'text-[15px] text-light-accent' : 'text-[15px] text-light-ink'}
                    style={textStyle(active ? 'semibold' : 'regular')}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
