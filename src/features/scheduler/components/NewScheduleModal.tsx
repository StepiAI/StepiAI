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
import { toWallClockUtcIso, updateSchedule } from '../../../services/schedules/client';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { useScheduleWeather } from '../hooks/useScheduleWeather';
import { removeAttachment as removeUploadedAttachment } from '../../../services/attachments/client';
import { useAttachments } from '../hooks/useAttachments';
import { AttachmentList } from './AttachmentList';
import { MonthPickerModal } from './MonthPickerModal';
import { OptionPickerModal } from './OptionPickerModal';
import { PlaceSuggestions } from './PlaceSuggestions';
import { WeatherHint } from './WeatherHint';
import {
  ALERT_MINUTES_BEFORE,
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
import {
  TRAVEL_TIME_OPTIONS,
  TravelTimeValue,
  travelTimeLabel,
} from '../utils/travelTime';

const PLACEHOLDER_COLOR = '#C6C6CC';

export interface ScheduleDraft {
  id: string;
  title: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notesText: string;
  existingAttachments: { name: string; url: string }[];
  start: Date;
  end: Date;
  alert?: AlertValue;
  // true = jadwal lokal STEPI (sesi life plan): simpan lewat /schedules,
  // bukan Google API (id-nya bukan event Google, bakal 404/502 di sana)
  localSchedule?: boolean;
}

interface NewScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
  draft?: ScheduleDraft | null;
  onUpdated?: () => void;
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
  links: { name: string; url: string }[],
): string | undefined {
  if (links.length === 0) {
    return notes || undefined;
  }

  const list = links.map(file => `• ${file.name}\n  ${file.url}`).join('\n');

  return [notes, `📎 Lampiran:\n${list}`].filter(Boolean).join('\n\n');
}

type PickerTarget =
  | 'startDate'
  | 'startTime'
  | 'endDate'
  | 'endTime'
  | 'repeat'
  | 'alert'
  | 'travel'
  | null;

export function NewScheduleModal({
  visible,
  onClose,
  onCreated,
  draft,
  onUpdated,
}: NewScheduleModalProps) {
  const { create, update, saving, error, reset } = useCreateGoogleCalendarEvent();
  const insets = useSafeAreaInsets();
  const isEdit = Boolean(draft);

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
  const [alert, setAlert] = useState<AlertValue>('at_time');
  const [travel, setTravel] = useState<TravelTimeValue>('none');

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

  const busy = saving || uploadingAttachments;
  // centang aktif (biru) begitu title minimal keisi
  const canSubmit = title.trim().length > 0;

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

    if (draft) {
      setTitle(draft.title);
      setLocation(draft.location ?? '');
      setPlace(
        draft.latitude != null && draft.longitude != null
          ? {
              name: draft.location ?? '',
              context: null,
              latitude: draft.latitude,
              longitude: draft.longitude,
            }
          : null,
      );
      setLocationFocused(false);
      setUrl('');
      setNotes(draft.notesText);
      setAllDay(false);
      setStartDate(new Date(draft.start));
      setStartTime(new Date(draft.start));
      setEndDate(new Date(draft.end));
      setEndTime(new Date(draft.end));
      setRepeat('never');
      setAlert(draft.alert ?? 'at_time');
      setTravel('none');
      clearAttachments();
      setFormError(null);
      setPicker(null);
      reset();
      return;
    }

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
    setAlert('at_time');
    setTravel('none');
    clearAttachments();
    setFormError(null);
    setPicker(null);
    reset();
  }, [visible, draft, reset, clearAttachments]);

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

    // pertahanin lampiran lama (mode edit) biar gak ke-timpa, lalu tambah yg baru
    const links = [
      ...(draft?.existingAttachments ?? []),
      ...uploaded.map(a => ({ name: a.name, url: a.signedUrl })),
    ];

    const alertMinutes = ALERT_MINUTES_BEFORE[alert];

    const payload = {
      summary: title.trim(),
      location: location.trim() || undefined,
      description: buildDescription(notes.trim(), links),
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrence: toRecurrence(repeat),
      latitude: place?.latitude,
      longitude: place?.longitude,
      // null = "None" -> server matiin alert; angka = menit sebelum acara
      reminderMinutesBefore: alertMinutes ?? null,
    };

    let ok: boolean;
    if (draft?.localSchedule) {
      // sesi life plan -> simpan ke DB STEPI dgn waktu wall-clock
      try {
        await updateSchedule(draft.id, {
          summary: payload.summary,
          description: payload.description,
          location: payload.location,
          startDateTime: toWallClockUtcIso(start),
          endDateTime: toWallClockUtcIso(end),
        });
        ok = true;
      } catch (err) {
        console.error('[Schedules] gagal update jadwal lokal:', err);
        setFormError('Could not save this session. Please try again.');
        ok = false;
      }
    } else {
      ok = draft ? await update(draft.id, payload) : await create(payload);
    }

    if (ok) {
      (draft ? onUpdated : onCreated)?.();
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
                  accessibilityLabel="Cancel"
                  className="h-[40px] w-[40px] items-center justify-center rounded-full bg-white/70"
                >
                  <CloseIcon size={13} />
                </TouchableOpacity>

                <Text
                  className="text-[18px] text-light-inkStrong"
                  style={textStyle('bold')}
                >
                  {isEdit ? 'Edit Schedule' : 'New Schedule'}
                </Text>

                <TouchableOpacity
                  onPress={submit}
                  disabled={busy || !canSubmit}
                  activeOpacity={0.7}
                  accessibilityLabel="Save"
                  className="h-[40px] w-[40px] items-center justify-center rounded-full bg-white/70"
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#2E7BE0" />
                  ) : (
                    // ikonnya yg biru pas title udah keisi — bukan seluruh tombolnya,
                    // biar bentuknya konsisten sama tombol back di layar lain
                    <CheckIcon size={15} color={canSubmit ? '#2E7BE0' : '#C6C6CC'} />
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
                    {/* dibungkus + centered biar switch-nya gak ketarik ke atas */}
                    <View className="items-center justify-center">
                      <Switch
                        value={allDay}
                        onValueChange={setAllDay}
                        trackColor={{ false: '#E5E5EA', true: '#2E7BE0' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#E5E5EA"
                      />
                    </View>
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

                  <SelectRow
                    label="Travel Time"
                    value={travelTimeLabel(travel)}
                    onPress={() => setPicker('travel')}
                  />
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

      <OptionPickerModal
        visible={picker === 'travel'}
        options={TRAVEL_TIME_OPTIONS}
        selected={travel}
        onClose={() => setPicker(null)}
        onSelect={setTravel}
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
