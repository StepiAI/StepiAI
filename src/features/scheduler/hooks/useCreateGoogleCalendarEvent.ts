import { useCallback, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  CreateGoogleCalendarEventInput,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  updateGoogleCalendarEvent,
} from '../../../services/googleCalendar/client';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Could not save the event.';
}

export function useCreateGoogleCalendarEvent() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: CreateGoogleCalendarEventInput) => {
    setSaving(true);
    setError(null);

    try {
      await createGoogleCalendarEvent(input);
      return true;
    } catch (err) {
      console.error('[GoogleCalendar] failed to create event:', err);
      setError(describeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    async (eventId: string, input: CreateGoogleCalendarEventInput) => {
      setSaving(true);
      setError(null);

      try {
        await updateGoogleCalendarEvent(eventId, input);
        return true;
      } catch (err) {
        console.error('[GoogleCalendar] failed to update event:', err);
        setError(describeError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const remove = useCallback(async (eventId: string) => {
    setSaving(true);
    setError(null);

    try {
      await deleteGoogleCalendarEvent(eventId);
      return true;
    } catch (err) {
      console.error('[GoogleCalendar] failed to delete event:', err);
      setError(describeError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { create, update, remove, saving, error, reset };
}
