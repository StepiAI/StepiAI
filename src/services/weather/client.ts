import { apiClient } from '../api/client';

const BASE_PATH = '/weather';

export type WeatherCategory =
  | 'clear'
  | 'cloudy'
  | 'drizzle'
  | 'rain'
  | 'thunderstorm'
  | 'unknown';

export interface HourlyWeather {
  time: string;
  temperature: number | null;
  // > 0.1mm di jam itu, pake 0-100
  precipitationProbability: number | null;
  precipitation: number | null;
  weatherCode: number | null;
  category: WeatherCategory;
  condition: string;
  isWet: boolean;
}

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  label: string | null;
  provider: string;
}

export interface ForecastResponse {
  resolvedLocation: ResolvedLocation | null;
  latitude: number;
  longitude: number;
  hourly: HourlyWeather[];
}

export interface PlaceSuggestion {
  name: string;
  context: string | null;
  latitude: number;
  longitude: number;
}

export function searchPlaces(q: string): Promise<PlaceSuggestion[]> {
  return apiClient.get<PlaceSuggestion[]>(
    `${BASE_PATH}/places?${new URLSearchParams({ q })}`,
  );
}

export function getForecastByCoords(
  latitude: number,
  longitude: number,
  from: Date,
  to: Date,
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    from: from.toISOString(),
    to: to.toISOString(),
  });
  return apiClient.get<ForecastResponse>(`${BASE_PATH}/forecast?${params}`);
}

export function getForecastByLocation(
  location: string,
  from: Date,
  to: Date,
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    location,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  return apiClient.get<ForecastResponse>(`${BASE_PATH}/forecast?${params}`);
}
