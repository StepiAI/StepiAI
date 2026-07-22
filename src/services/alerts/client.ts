import { apiClient } from '../api/client';

const BASE_PATH = '/alerts';

export type ScheduleAlertType = 'HEAVY_TRAFFIC' | 'WEATHER_RAIN';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertTraffic {
  recommendedDeparture: string;
  naiveDeparture: string;
  onTimeBefore: number;
  onTimeAfter: number;
  travelMinutes: number;
  trafficDelayMinutes: number;
}

export interface AlertWeather {
  condition: string;
  category: string;
  precipitationProbability: number | null;
  wetDuringCommute: boolean;
}

export interface ScheduleAlert {
  eventId: string;
  summary: string;
  type: ScheduleAlertType;
  severity: AlertSeverity;
  title: string;
  body: string;
  traffic?: AlertTraffic;
  weather?: AlertWeather;
}

export interface AnalyzeAlertsEvent {
  id: string;
  summary: string;
  location?: string | null;
  startDateTime: string;
  endDateTime: string;
}

export interface AnalyzeAlertsInput {
  origin: { latitude: number; longitude: number };
  events: AnalyzeAlertsEvent[];
  timezone?: string;
}

export function analyzeAlerts(
  input: AnalyzeAlertsInput,
): Promise<ScheduleAlert[]> {
  return apiClient.post<ScheduleAlert[]>(`${BASE_PATH}/analyze`, input);
}
