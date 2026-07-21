import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../../config/env';
import { apiClient } from '../api/client';

const BASE_PATH = '/integrations/google-calendar';

// scope id dari google, bukan url yg ditembak
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export type GoogleCalendarStatus =
  | { connected: false }
  | { connected: true; scope: string; connectedAt: string; email?: string | null };

export interface GoogleCalendarEvent {
  id?: string | null;
  summary?: string | null;
  location?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
}

export interface CreateGoogleCalendarEventInput {
  summary: string;
  location?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  recurrence?: string[];
}

export async function connectGoogleCalendar(): Promise<GoogleCalendarStatus | null> {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: CALENDAR_SCOPES,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });

  await GoogleSignin.signOut();

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
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

export function createGoogleCalendarEvent(input: CreateGoogleCalendarEventInput) {
  return apiClient.post<GoogleCalendarEvent>(`${BASE_PATH}/events`, input);
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
