import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { textStyle } from '../../../shared/theme/typography';
import {
  LifePlanConflictOption,
  LifePlanConflictResult,
} from '../../../services/lifePlan/client';

interface LifePlanConflictModalProps {
  conflict: LifePlanConflictResult | null;
  submitting: boolean;
  onSelectOption: (option: LifePlanConflictOption) => void;
  onCancel: () => void;
}

const OPTION_TITLES: Record<LifePlanConflictOption['type'], string> = {
  skip_day_and_extend: 'Skip hari bentrok & perpanjang',
  change_time_for_day: 'Ganti jam di hari itu',
};

function formatIsoDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatIsoTimeRange(startIso: string, endIso: string): string {
  const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const start = new Date(startIso).toLocaleTimeString('en-US', options);
  const end = new Date(endIso).toLocaleTimeString('en-US', options);
  return `${start} – ${end}`;
}

export function LifePlanConflictModal({
  conflict,
  submitting,
  onSelectOption,
  onCancel,
}: LifePlanConflictModalProps) {
  return (
    <Modal
      visible={conflict !== null}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[85%] rounded-t-[28px] bg-white px-[22px] pb-[28px] pt-[20px]">
          <View className="mb-[14px] items-center">
            <View className="h-[4px] w-[40px] rounded-full bg-light-inkStrong/15" />
          </View>

          <Text
            className="text-[20px] text-light-inkStrong"
            style={textStyle('bold')}
          >
            Jadwal bentrok
          </Text>

          {conflict !== null ? (
            <Text className="mt-[8px] text-[14px] leading-[20px] text-light-inkStrong/70">
              {conflict.content}
            </Text>
          ) : null}

          <ScrollView
            className="mt-[18px]"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {conflict?.conflicts.length ? (
              <View className="mb-[18px] rounded-[18px] bg-light-canvas px-[16px] py-[14px]">
                <Text
                  className="mb-[10px] text-[12px] tracking-[0.5px] text-light-inkStrong/50"
                  style={textStyle('semibold')}
                >
                  TANGGAL BENTROK
                </Text>

                {conflict.conflicts.map(item => (
                  <View key={item.date} className="mb-[10px]">
                    <Text
                      className="text-[14px] text-light-inkStrong"
                      style={textStyle('semibold')}
                    >
                      {formatIsoDate(item.date)}
                    </Text>
                    {item.conflictingSchedules.map(schedule => (
                      <Text
                        key={schedule.id}
                        className="mt-[2px] text-[13px] text-light-inkStrong/60"
                      >
                        {schedule.summary} ·{' '}
                        {formatIsoTimeRange(
                          schedule.startDateTime,
                          schedule.endDateTime,
                        )}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {conflict?.options.map(option => (
              <Pressable
                key={option.type}
                disabled={submitting}
                onPress={() => onSelectOption(option)}
                className="mb-[12px] rounded-[18px] border border-light-accent/40 bg-white px-[16px] py-[14px] active:opacity-70"
              >
                <Text
                  className="text-[15px] text-light-accent"
                  style={textStyle('semibold')}
                >
                  {OPTION_TITLES[option.type]}
                </Text>
                <Text className="mt-[4px] text-[13px] leading-[19px] text-light-inkStrong/70">
                  {option.content}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            disabled={submitting}
            onPress={onCancel}
            className="mt-[8px] h-[52px] items-center justify-center rounded-[26px] bg-light-canvas active:opacity-70"
          >
            {submitting ? (
              <ActivityIndicator color="#2E7BE0" />
            ) : (
              <Text
                className="text-[15px] text-light-inkStrong/70"
                style={textStyle('semibold')}
              >
                Batalkan
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
