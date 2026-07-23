import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../../config/env';
import { apiClient } from '../api/client';
import { bumpCalendarRevision } from './revision';

const BASE_PATH = '/integrations/google-calendar';

// tiap mutasi sukses -> naikin revisi biar list event auto refresh
function bumpAfter<T>(promise: Promise<T>): Promise<T> {
  return promise.then(result => {
    bumpCalendarRevision();
    return result;
  });
}

// scope id dari google, bukan url yg ditembak
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export type GoogleCalendarStatus =
  | { connected: false }
  | {
      connected: true;
      scope: string;
      connectedAt: string;
      email?: string | null;
    };

export interface GoogleCalendarEvent {
  id?: string | null;
  summary?: string | null;
  location?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
  // true = jadwal lokal STEPI (sesi life plan), bukan event Google — edit/
  // delete-nya harus lewat endpoint /schedules, bukan API Google
  isLifePlanSession?: boolean;
  reminders?: {
    useDefault?: boolean | null;
    overrides?: Array<{ method?: string | null; minutes?: number | null }> | null;
  } | null;
}

export interface CreateGoogleCalendarEventInput {
  summary: string;
  location?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  recurrence?: string[];
  latitude?: number;
  longitude?: number;
  // menit-sebelum reminder; null = tanpa alert. dikirim tiap save (create/edit)
  reminderMinutesBefore?: number | null;
}

export async function connectGoogleCalendar(): Promise<GoogleCalendarStatus | null> {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: CALENDAR_SCOPES,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });

  await GoogleSignin.signOut();

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      return null;
    }
    throw error;
  }

  if (response.type === 'cancelled') {
    return null;
  }

  const serverAuthCode = response.data.serverAuthCode;
  if (!serverAuthCode) {
    throw new Error('Google did not return a server auth code.');
  }

  return apiClient.post<GoogleCalendarStatus>(`${BASE_PATH}/connect`, {
    serverAuthCode,
  });
}

export function getGoogleCalendarStatus() {
  return apiClient.get<GoogleCalendarStatus>(`${BASE_PATH}/status`);
}

export function disconnectGoogleCalendar() {
  return apiClient.delete<GoogleCalendarStatus>(BASE_PATH);
}

export function createGoogleCalendarEvent(
  input: CreateGoogleCalendarEventInput,
) {
  return bumpAfter(
    apiClient.post<GoogleCalendarEvent>(`${BASE_PATH}/events`, input),
  );
}

export function updateGoogleCalendarEvent(
  eventId: string,
  input: CreateGoogleCalendarEventInput,
) {
  return bumpAfter(
    apiClient.put<GoogleCalendarEvent>(
      `${BASE_PATH}/events/${encodeURIComponent(eventId)}`,
      input,
    ),
  );
}

export function deleteGoogleCalendarEvent(eventId: string) {
  return bumpAfter(
    apiClient.delete<void>(
      `${BASE_PATH}/events/${encodeURIComponent(eventId)}`,
    ),
  );
}

export function rescheduleGoogleCalendarEvent(
  eventId: string,
  startDateTime: string,
  endDateTime: string,
) {
  return bumpAfter(
    apiClient.patch<GoogleCalendarEvent>(
      `${BASE_PATH}/events/${encodeURIComponent(eventId)}`,
      { startDateTime, endDateTime },
    ),
  );
}

export function pushGoogleCalendarEventsLater(
  fromDateTime: string,
  toDateTime: string,
  delayMinutes: number,
) {
  return bumpAfter(
    apiClient.post<{ shifted: number; delayMinutes: number }>(
      `${BASE_PATH}/events/push-later`,
      { fromDateTime, toDateTime, delayMinutes },
    ),
  );
}

export function listGoogleCalendarEvents(timeMin?: string, timeMax?: string) {
  const params = new URLSearchParams();
  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);
  const query = params.toString();
  return apiClient.get<GoogleCalendarEvent[]>(
    `${BASE_PATH}/events${query ? `?${query}` : ''}`,
  );
}
