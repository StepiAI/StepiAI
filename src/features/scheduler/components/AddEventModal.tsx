import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCreateGoogleCalendarEvent } from '../hooks/useCreateGoogleCalendarEvent';
import {
  addHourToTimeInput,
  nextHourAsTimeInput,
  parseLocalDateTime,
  todayAsDateInput,
} from '../utils/eventForm';

const PLACEHOLDER_COLOR = '#9A9AA5';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddEventModal({ visible, onClose, onCreated }: AddEventModalProps) {
  const { create, saving, error, reset } = useCreateGoogleCalendarEvent();

  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(todayAsDateInput);
  const [startTime, setStartTime] = useState(nextHourAsTimeInput);
  const [endTime, setEndTime] = useState(() => addHourToTimeInput(nextHourAsTimeInput()));
  const [formError, setFormError] = useState<string | null>(null);

  // balikkin ke default tiap buka ulang
  useEffect(() => {
    if (!visible) return;

    const start = nextHourAsTimeInput();
    setSummary('');
    setLocation('');
    setDate(todayAsDateInput());
    setStartTime(start);
    setEndTime(addHourToTimeInput(start));
    setFormError(null);
    reset();
  }, [visible, reset]);

  const submit = async () => {
    setFormError(null);

    if (!summary.trim()) {
      setFormError('Title is required.');
      return;
    }

    const start = parseLocalDateTime(date, startTime);
    const end = parseLocalDateTime(date, endTime);

    if (!start || !end) {
      setFormError('Use YYYY-MM-DD for the date and HH:MM for the times.');
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setFormError('End time must be after the start time.');
      return;
    }

    const created = await create({
      summary: summary.trim(),
      location: location.trim() || undefined,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    });

    if (created) {
      onCreated();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable className="flex-1 bg-black/60" onPress={onClose} />

        <View className="rounded-t-xl bg-surface px-lg pb-xl pt-lg">
          <Text className="mb-md text-h2 text-text">New event</Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Field label="Title">
              <Input
                value={summary}
                onChangeText={setSummary}
                placeholder="Study session"
                autoFocus
              />
            </Field>

            <Field label="Date">
              <Input
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
            </Field>

            <View className="flex-row gap-md">
              <View className="flex-1">
                <Field label="Start">
                  <Input
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="HH:MM"
                    keyboardType="numbers-and-punctuation"
                  />
                </Field>
              </View>
              <View className="flex-1">
                <Field label="End">
                  <Input
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="HH:MM"
                    keyboardType="numbers-and-punctuation"
                  />
                </Field>
              </View>
            </View>

            <Field label="Location (optional)">
              <Input value={location} onChangeText={setLocation} placeholder="Library" />
            </Field>

            {formError || error ? (
              <Text className="mb-sm text-caption text-danger">{formError ?? error}</Text>
            ) : null}

            <View className="mt-sm flex-row gap-md">
              <Pressable
                onPress={onClose}
                disabled={saving}
                className="flex-1 items-center rounded-lg border border-border py-sm"
              >
                <Text className="text-body text-textMuted">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={submit}
                disabled={saving}
                className="flex-1 items-center rounded-lg bg-primary py-sm"
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-body font-semibold text-onPrimary">Add event</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-md">
      <Text className="mb-xs text-caption text-textMuted">{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={PLACEHOLDER_COLOR}
      className="rounded-lg border border-border bg-background px-md py-sm text-body text-text"
      {...props}
    />
  );
}
