import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
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
import type { PlaceSuggestion } from '../../../services/weather/client';
import { useCreateGoogleCalendarEvent } from '../hooks/useCreateGoogleCalendarEvent';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { useScheduleWeather } from '../hooks/useScheduleWeather';
import type { UploadedAttachment } from '../../../services/attachments/client';
import { removeAttachment as removeUploadedAttachment } from '../../../services/attachments/client';
import { useAttachments } from '../hooks/useAttachments';
import { AttachmentList } from './AttachmentList';
import { MonthPickerModal } from './MonthPickerModal';
import { OptionPickerModal } from './OptionPickerModal';
import { PlaceSuggestions } from './PlaceSuggestions';
import { WeatherHint } from './WeatherHint';
import {
  ALERT_OPTIONS,
  AlertValue,
  alertLabel,
} from '../utils/alert';
import {
  REPEAT_OPTIONS,
  RepeatValue,
  repeatLabel,
  toRecurrence,
} from '../utils/recurrence';

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

// gw nemu edge case, method atas ini cuma abil jam ama menit, jd acara cross midnight gitu kek jam 11 malem selsai 00 bisa bikin "selesai" sebelom "mulai". 
// solusi gw: date++
function resolveRange(
  startDate: Date,
  startTime: Date,
  endDate: Date,
  endTime: Date,
) {
  const start = combineDateAndTime(startDate, startTime);
  const end = combineDateAndTime(endDate, endTime);

  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
}


function buildDescription(
  notes: string,
  attachments: UploadedAttachment[],
): string | undefined {
  if (attachments.length === 0) {
    return notes || undefined;
  }

  const list = attachments
    .map(file => `• ${file.name}\n  ${file.signedUrl}`)
    .join('\n');

  return [notes, `📎 Lampiran:\n${list}`].filter(Boolean).join('\n\n');
}

type PickerTarget =
  | 'startDate'
  | 'startTime'
  | 'endDate'
  | 'endTime'
  | 'repeat'
  | 'alert'
  | null;

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
  const [repeat, setRepeat] = useState<RepeatValue>('never');
  const [alert, setAlert] = useState<AlertValue>('none');

  const {
    files: attachments,
    add: addAttachment,
    remove: removeAttachment,
    clear: clearAttachments,
    uploadAll: uploadAttachments,
    uploading: uploadingAttachments,
    error: attachmentError,
  } = useAttachments();

  const [place, setPlace] = useState<PlaceSuggestion | null>(null);
  const [locationFocused, setLocationFocused] = useState(false);

  const { results: placeResults, loading: placesLoading } = usePlaceSearch(
    location,
    locationFocused && !place && !allDay,
  );

  const { start: weatherStart, end: weatherEnd } = resolveRange(
    startDate,
    startTime,
    endDate,
    endTime,
  );

  const { weather, loading: weatherLoading } = useScheduleWeather(
    allDay ? null : place,
    weatherStart,
    weatherEnd,
  );

  useEffect(() => {
    if (!visible) return;

    const start = nextHour();
    const end = new Date(start.getTime() + 3_600_000);
    setTitle('');
    setLocation('');
    setPlace(null);
    setLocationFocused(false);
    setUrl('');
    setNotes('');
    setAllDay(false);
    setStartDate(new Date(start));
    setStartTime(start);
    // pake tanggal milik 'end', bukan hari ini, jadiny acara jam 11 malam gk ke set selesai di tanggal yg sama
    setEndDate(new Date(end));
    setEndTime(end);
    setRepeat('never');
    setAlert('none');
    clearAttachments();
    setFormError(null);
    setPicker(null);
    reset();
  }, [visible, reset, clearAttachments]);

  const submit = async () => {
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }

    const { start, end } = resolveRange(startDate, startTime, endDate, endTime);

    if (end.getTime() <= start.getTime()) {
      setFormError('End time must be after the start time.');
      return;
    }

    const uploaded = await uploadAttachments();
    if (uploaded === null) {
      return;
    }

    const created = await create({
      summary: title.trim(),
      location: location.trim() || undefined,
      description: buildDescription(notes.trim(), uploaded),
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrence: toRecurrence(repeat),
    });

    if (created) {
      onCreated?.();
      onClose();
      return;
    }

    await Promise.all(
      uploaded.map(a => removeUploadedAttachment(a.path).catch(() => {})),
    );
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
                  disabled={saving || uploadingAttachments}
                  activeOpacity={0.7}
                  className="h-[36px] w-[36px] items-center justify-center rounded-full bg-light-disabled"
                >
                  {saving || uploadingAttachments ? (
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
                {formError || error || attachmentError ? (
                  <View className="mb-[16px] rounded-[14px] bg-danger/10 px-[16px] py-[12px]">
                    <Text
                      className="text-[13px] text-danger"
                      style={textStyle('medium')}
                    >
                      {formError ?? attachmentError ?? error}
                    </Text>
                  </View>
                ) : null}
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
                    onChangeText={text => {
                      setLocation(text);
                      // ngetik lagi = batal pilih, biar cuaca gk nyangkut di koordinat lokasi lama
                      setPlace(null);
                    }}
                    onFocus={() => setLocationFocused(true)}
                    placeholder="Location or Video Call"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    maxLength={500}
                    className="px-[18px] py-[14px] text-[15px] text-light-ink"
                    style={textStyle('regular')}
                  />

                  {locationFocused && !place && !allDay ? (
                    <View className="border-t border-light-rule">
                      <PlaceSuggestions
                        results={placeResults}
                        loading={placesLoading}
                        emptyQuery={location.trim().length >= 2}
                        onPick={picked => {
                          setPlace(picked);
                          setLocation(picked.name);
                          setLocationFocused(false);
                          Keyboard.dismiss();
                        }}
                      />
                    </View>
                  ) : null}

                  {place || weatherLoading ? (
                    <View className="border-t border-light-rule px-[18px] py-[12px]">
                      {place ? (
                        <Text
                          className="mb-[6px] text-[12px] text-light-faint"
                          style={textStyle('regular')}
                          numberOfLines={1}
                        >
                          {place.context ?? place.name}
                        </Text>
                      ) : null}
                      <WeatherHint weather={weather} loading={weatherLoading} />
                    </View>
                  ) : null}
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
                      trackColor={{ false: '#E5E5EA', true: '#2E7BE0' }}
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
                  <SelectRow
                    label="Repeat"
                    value={repeatLabel(repeat)}
                    onPress={() => setPicker('repeat')}
                  />
                </View>

                <View className="mt-[16px] overflow-hidden rounded-[18px] bg-white">
                  <SelectRow
                    label="Alert"
                    value={alertLabel(alert)}
                    onPress={() => setPicker('alert')}
                  />
                </View>

                <View className="mt-[16px] overflow-hidden rounded-[18px] bg-white">
                  <TouchableOpacity
                    onPress={addAttachment}
                    disabled={uploadingAttachments}
                    activeOpacity={0.6}
                    className="h-[54px] flex-row items-center justify-between px-[18px]"
                  >
                    <Text
                      className="text-[15px] text-light-ink"
                      style={textStyle('medium')}
                    >
                      Add attachment...
                    </Text>
                    {uploadingAttachments ? (
                      <ActivityIndicator size="small" color="#C6C6CC" />
                    ) : (
                      <Text
                        className="text-[15px] text-light-faint"
                        style={textStyle('regular')}
                      >
                        {attachments.length > 0 ? attachments.length : ''}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <AttachmentList
                    files={attachments}
                    onRemove={removeAttachment}
                    disabled={uploadingAttachments}
                  />
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

      <OptionPickerModal
        visible={picker === 'repeat'}
        options={REPEAT_OPTIONS}
        selected={repeat}
        onClose={() => setPicker(null)}
        onSelect={setRepeat}
      />

      <OptionPickerModal
        visible={picker === 'alert'}
        options={ALERT_OPTIONS}
        selected={alert}
        onClose={() => setPicker(null)}
        onSelect={setAlert}
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

function SelectRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className="h-[54px] flex-row items-center justify-between px-[18px]"
    >
      <Text className="text-[15px] text-light-ink" style={textStyle('medium')}>
        {label}
      </Text>
      <View className="flex-row items-center gap-[4px]">
        <Text
          className="text-[15px] text-light-faint"
          style={textStyle('regular')}
        >
          {value}
        </Text>
        <ChevronUpDownIcon />
      </View>
    </TouchableOpacity>
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
