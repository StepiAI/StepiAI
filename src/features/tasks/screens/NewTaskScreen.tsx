import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, CheckIcon, CloseIcon } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { FieldCard, FieldRowDivider, FieldRowDouble } from '../components/FieldCard';
import { MonthPickerModal } from '../../scheduler/components/MonthPickerModal';
import { useCreateGoogleCalendarEvent } from '../../scheduler/hooks/useCreateGoogleCalendarEvent';
import { TimePickerModal } from '../components/TimePickerModal';
import { addOneMonth, formatDateLabel, formatTimeLabel, startOfToday, timeOfDay } from '../utils/dateTime';

const PLACEHOLDER_COLOR = '#B0B0B8';

type ActivePicker = 'start-date' | 'start-time' | 'end-date' | 'end-time' | null;

interface NewTaskScreenProps {
  visible: boolean;
  onClose: () => void;
}

function combine(date: Date, time: Date) {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

export function NewTaskScreen({ visible, onClose }: NewTaskScreenProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(startOfToday);
  const [startTime, setStartTime] = useState(() => timeOfDay(7));
  const [endDate, setEndDate] = useState(() => addOneMonth(startOfToday()));
  const [endTime, setEndTime] = useState(() => timeOfDay(22));
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const closePicker = () => setActivePicker(null);

  // task dibikin sebagai event Google Calendar biasa, jadi otomatis muncul
  // di kalender (dan auto-refresh lewat calendar revision)
  const { create, saving } = useCreateGoogleCalendarEvent();
  const canSubmit = title.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || saving) return;

    const start = allDay
      ? combine(startDate, timeOfDay(0))
      : combine(startDate, startTime);
    const end = allDay
      ? combine(endDate, timeOfDay(23))
      : combine(endDate, endTime);

    if (end.getTime() <= start.getTime()) {
      Alert.alert('Invalid time', 'End time must be after the start time.');
      return;
    }

    const description = [notes.trim(), url.trim()].filter(Boolean).join('\n');

    const ok = await create({
      summary: title.trim(),
      description: description || undefined,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    if (ok) {
      setTitle('');
      setUrl('');
      setNotes('');
      onClose();
    } else {
      Alert.alert('Could not create task', 'Please try again in a moment.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* SafeAreaView di dalem Modal ngukurnya 0 (window native beda), jadi
          insets-nya dipasang manual biar header gak ketutup notch */}
      <View
        className="flex-1 bg-light-canvas"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <StatusBar barStyle="dark-content" />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-row items-center px-[18px] pt-[6px]">
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              activeOpacity={0.6}
              className="h-[36px] w-[36px] items-center justify-center rounded-full bg-white"
            >
              <CloseIcon />
            </TouchableOpacity>

            <Text
              className="flex-1 text-center text-[18px] text-light-inkStrong"
              style={textStyle('bold')}
            >
              New Task
            </Text>

            <TouchableOpacity
              onPress={submit}
              disabled={saving || !canSubmit}
              hitSlop={10}
              activeOpacity={0.6}
              accessibilityLabel="Save task"
              className="h-[36px] w-[36px] items-center justify-center rounded-full bg-white"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#2E7BE0" />
              ) : (
                <CheckIcon color={canSubmit ? '#2E7BE0' : '#C6C6CC'} />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            className="mt-[20px] flex-1 px-[20px]"
            contentContainerClassName="pb-[24px]"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="h-[54px] flex-row items-center rounded-full bg-white px-[18px]">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor={PLACEHOLDER_COLOR}
                autoFocus
                className="flex-1 text-[15px] text-light-ink"
                style={textStyle('medium')}
              />
            </View>

            <View className="h-[16px]" />

            <FieldCard>
              <View className="h-[54px] flex-row items-center justify-between px-[18px]">
                <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
                  All-day
                </Text>
                {/* dibungkus + centered biar switch-nya gak ketarik ke atas */}
                <View className="items-center justify-center">
                  <Switch
                    value={allDay}
                    onValueChange={setAllDay}
                    trackColor={{ false: '#D8D8DE', true: '#2E7BE0' }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#D8D8DE"
                  />
                </View>
              </View>

              <FieldRowDivider />

              {allDay ? (
                <View className="h-[64px] flex-row items-center justify-between px-[18px]">
                  <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
                    Starts
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActivePicker('start-date')}
                    activeOpacity={0.6}
                    className="rounded-full bg-light-fill px-[14px] py-[8px]"
                  >
                    <Text className="text-[13px] text-light-ink" style={textStyle('semibold')}>
                      {formatDateLabel(startDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FieldRowDouble
                  label="Starts"
                  primaryValue={formatDateLabel(startDate)}
                  secondaryValue={formatTimeLabel(startTime)}
                  onPrimaryPress={() => setActivePicker('start-date')}
                  onSecondaryPress={() => setActivePicker('start-time')}
                />
              )}

              <FieldRowDivider />

              {allDay ? (
                <View className="h-[64px] flex-row items-center justify-between px-[18px]">
                  <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
                    Ends
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActivePicker('end-date')}
                    activeOpacity={0.6}
                    className="rounded-full bg-light-fill px-[14px] py-[8px]"
                  >
                    <Text className="text-[13px] text-light-ink" style={textStyle('semibold')}>
                      {formatDateLabel(endDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FieldRowDouble
                  label="Ends"
                  primaryValue={formatDateLabel(endDate)}
                  secondaryValue={formatTimeLabel(endTime)}
                  onPrimaryPress={() => setActivePicker('end-date')}
                  onSecondaryPress={() => setActivePicker('end-time')}
                />
              )}
            </FieldCard>

            <View className="h-[16px]" />

            <View className="h-[54px] flex-row items-center justify-between rounded-full bg-white px-[18px]">
              <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
                Alert
              </Text>
              <View className="flex-row items-center gap-[6px]">
                <Text className="text-[14px] text-light-faint" style={textStyle('regular')}>
                  None
                </Text>
                <ChevronDown />
              </View>
            </View>

            <View className="h-[16px]" />

            <View className="h-[54px] justify-center rounded-full bg-white px-[18px]">
              <Text className="text-[15px] text-light-faint" style={textStyle('medium')}>
                Add attachment...
              </Text>
            </View>

            <View className="h-[16px]" />

            <View className="rounded-[16px] bg-white px-[18px] py-[6px]">
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="URL"
                placeholderTextColor={PLACEHOLDER_COLOR}
                className="h-[44px] text-[15px] text-light-ink"
                style={textStyle('medium')}
              />

              <View className="h-[1px] bg-light-rule" />

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes"
                placeholderTextColor={PLACEHOLDER_COLOR}
                multiline
                textAlignVertical="top"
                className="min-h-[120px] py-[12px] text-[15px] text-light-ink"
                style={textStyle('medium')}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <MonthPickerModal
          visible={activePicker === 'start-date'}
          selected={startDate}
          onClose={closePicker}
          onSelect={setStartDate}
        />
        <MonthPickerModal
          visible={activePicker === 'end-date'}
          selected={endDate}
          onClose={closePicker}
          onSelect={setEndDate}
        />
        <TimePickerModal
          visible={activePicker === 'start-time'}
          selected={startTime}
          onClose={closePicker}
          onSelect={setStartTime}
        />
        <TimePickerModal
          visible={activePicker === 'end-time'}
          selected={endTime}
          onClose={closePicker}
          onSelect={setEndTime}
        />
      </View>
    </Modal>
  );
}
