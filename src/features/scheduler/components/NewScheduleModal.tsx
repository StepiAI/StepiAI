import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  CheckIcon,
  ChevronUpDownIcon,
  CloseIcon,
} from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { TimePickerModal } from '../../tasks/components/TimePickerModal';
import { formatDateLabel, formatTimeLabel } from '../../tasks/utils/dateTime';
import { useCreateGoogleCalendarEvent } from '../hooks/useCreateGoogleCalendarEvent';
import { MonthPickerModal } from './MonthPickerModal';

const PLACEHOLDER_COLOR = '#C6C6CC';

interface NewScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

function nextHour(date = new Date()) {
  const result = new Date(date);
  result.setMinutes(0, 0, 0);
  result.setHours(result.getHours() + 1);
  return result;
}

function combineDateAndTime(date: Date, time: Date) {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

type PickerTarget = 'startDate' | 'startTime' | 'endDate' | 'endTime' | null;

export function NewScheduleModal({
  visible,
  onClose,
  onCreated,
}: NewScheduleModalProps) {
  const { create, saving, error, reset } = useCreateGoogleCalendarEvent();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date());
  const [startTime, setStartTime] = useState(nextHour);
  const [endDate, setEndDate] = useState(() => new Date());
  const [endTime, setEndTime] = useState(
    () => new Date(nextHour().getTime() + 3_600_000),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerTarget>(null);

  // balikkin ke default tiap buka ulang
  useEffect(() => {
    if (!visible) return;

    const start = nextHour();
    setTitle('');
    setLocation('');
    setUrl('');
    setNotes('');
    setAllDay(false);
    setStartDate(new Date());
    setStartTime(start);
    setEndDate(new Date());
    setEndTime(new Date(start.getTime() + 3_600_000));
    setFormError(null);
    setPicker(null);
    reset();
  }, [visible, reset]);

  const submit = async () => {
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }

    const start = combineDateAndTime(startDate, startTime);
    const end = combineDateAndTime(endDate, endTime);

    if (end.getTime() <= start.getTime()) {
      setFormError('End time must be after the start time.');
      return;
    }

    const created = await create({
      summary: title.trim(),
      location: location.trim() || undefined,
      description: notes.trim() || undefined,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    });

    if (created) {
      onCreated?.();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30">
        <View style={{ height: insets.top + 40 }} />

        <View className="flex-1 overflow-hidden rounded-t-[28px] bg-light-canvas">
          <SafeAreaView className="flex-1" edges={['bottom']}>
            <KeyboardAvoidingView
              className="flex-1"
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View className="flex-row items-center justify-between px-[20px] pb-[14px] pt-[18px]">
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  className="h-[36px] w-[36px] items-center justify-center rounded-full bg-white"
                >
                  <CloseIcon size={12} />
                </TouchableOpacity>

                <Text
                  className="text-[18px] text-light-inkStrong"
                  style={textStyle('bold')}
                >
                  New Schedule
                </Text>

                <TouchableOpacity
                  onPress={submit}
                  disabled={saving}
                  activeOpacity={0.7}
                  className="h-[36px] w-[36px] items-center justify-center rounded-full bg-light-disabled"
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <CheckIcon size={14} />
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 px-[20px]"
                contentContainerClassName="pb-[32px]"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View className="overflow-hidden rounded-[18px] bg-white">
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    maxLength={255}
                    className="px-[18px] py-[14px] text-[16px] text-light-ink"
                    style={textStyle('medium')}
                  />
                  <View className="ml-[18px] h-[1px] bg-light-rule" />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Location or Video Call"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    maxLength={500}
                    className="px-[18px] py-[14px] text-[15px] text-light-ink"
                    style={textStyle('regular')}
                  />
                </View>

                <View className="mt-[16px] overflow-hidden rounded-[18px] bg-white">
                  <View className="h-[54px] flex-row items-center justify-between px-[18px]">
                    <Text
                      className="text-[15px] text-light-ink"
                      style={textStyle('medium')}
                    >
                      All-day
                    </Text>
                    <Switch
                      value={allDay}
                      onValueChange={setAllDay}
                      trackColor={{ false: '#E5E5EA', true: '#1C1C1E' }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#E5E5EA"
                    />
                  </View>

                  <View className="ml-[18px] h-[1px] bg-light-rule" />

                  <View className="h-[54px] flex-row items-center justify-between px-[18px]">
                    <Text
                      className="text-[15px] text-light-ink"
                      style={textStyle('medium')}
                    >
                      Starts
                    </Text>
                    <View className="flex-row gap-[8px]">
                      <Pill
                        label={formatDateLabel(startDate)}
                        onPress={() => setPicker('startDate')}
                      />
                      {allDay ? null : (
                        <Pill
                          label={formatTimeLabel(startTime)}
                          onPress={() => setPicker('startTime')}
                        />
                      )}
                    </View>
                  </View>

                  <View className="ml-[18px] h-[1px] bg-light-rule" />

                  <View className="h-[54px] flex-row items-center justify-between px-[18px]">
                    <Text
                      className="text-[15px] text-light-ink"
                      style={textStyle('medium')}
                    >
                      Ends
                    </Text>
                    <View className="flex-row gap-[8px]">
                      <Pill
                        label={formatDateLabel(endDate)}
                        onPress={() => setPicker('endDate')}
                      />
                      {allDay ? null : (
                        <Pill
                          label={formatTimeLabel(endTime)}
                          onPress={() => setPicker('endTime')}
                        />
                      )}
                    </View>
                  </View>

                  <View className="ml-[18px] h-[1px] bg-light-rule" />

                  <View className="h-[54px] flex-row items-center justify-between px-[18px]">
                    <Text
                      className="text-[15px] text-light-ink"
                      style={textStyle('medium')}
                    >
                      Travel Time
                    </Text>
                    <View className="flex-row items-center gap-[4px]">
                      <Text
                        className="text-[15px] text-light-faint"
                        style={textStyle('regular')}
                      >
                        None
                      </Text>
                      <ChevronUpDownIcon />
                    </View>
                  </View>
                </View>

                <View className="mt-[16px] overflow-hidden rounded-[18px] bg-white">
                  <View className="h-[54px] flex-row items-center justify-between px-[18px]">
                    <Text
                      className="text-[15px] text-light-ink"
                      style={textStyle('medium')}
                    >
                      Repeat
                    </Text>
                    <View className="flex-row items-center gap-[4px]">
                      <Text
                        className="text-[15px] text-light-faint"
                        style={textStyle('regular')}
                      >
                        Never
                      </Text>
                      <ChevronUpDownIcon />
                    </View>
                  </View>
                </View>

                <View className="mt-[16px] overflow-hidden rounded-[18px] bg-white">
                  <View className="h-[54px] flex-row items-center justify-between px-[18px]">
                    <Text
                      className="text-[15px] text-light-ink"
                      style={textStyle('medium')}
                    >
                      Alert
                    </Text>
                    <View className="flex-row items-center gap-[4px]">
                      <Text
                        className="text-[15px] text-light-faint"
                        style={textStyle('regular')}
                      >
                        None
                      </Text>
                      <ChevronUpDownIcon />
                    </View>
                  </View>
                </View>

                <View className="mt-[16px] h-[54px] justify-center overflow-hidden rounded-[18px] bg-white px-[18px]">
                  <Text
                    className="text-[15px] text-light-ink"
                    style={textStyle('medium')}
                  >
                    Add attachment...
                  </Text>
                </View>

                <View className="mt-[16px] overflow-hidden rounded-[18px] bg-white">
                  <TextInput
                    value={url}
                    onChangeText={setUrl}
                    placeholder="URL"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    autoCapitalize="none"
                    keyboardType="url"
                    className="px-[18px] py-[14px] text-[15px] text-light-ink"
                    style={textStyle('regular')}
                  />
                  <View className="ml-[18px] h-[1px] bg-light-rule" />
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Notes"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    maxLength={2000}
                    multiline
                    textAlignVertical="top"
                    className="min-h-[120px] px-[18px] py-[14px] text-[15px] text-light-ink"
                    style={textStyle('regular')}
                  />
                </View>

                {formError || error ? (
                  <Text className="mt-[14px] text-center text-[13px] text-danger">
                    {formError ?? error}
                  </Text>
                ) : null}
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </View>

      <MonthPickerModal
        visible={picker === 'startDate' || picker === 'endDate'}
        selected={picker === 'endDate' ? endDate : startDate}
        onClose={() => setPicker(null)}
        onSelect={date =>
          picker === 'endDate' ? setEndDate(date) : setStartDate(date)
        }
      />

      <TimePickerModal
        visible={picker === 'startTime' || picker === 'endTime'}
        selected={picker === 'endTime' ? endTime : startTime}
        onClose={() => setPicker(null)}
        onSelect={time =>
          picker === 'endTime' ? setEndTime(time) : setStartTime(time)
        }
      />
    </Modal>
  );
}

function Pill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-full bg-light-fill px-[14px] py-[8px]"
    >
      <Text
        className="text-[14px] text-light-ink"
        style={textStyle('semibold')}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
