import { useEffect, useState } from 'react';
import {
  HourlyWeather,
  PlaceSuggestion,
  getForecastByCoords,
} from '../../../services/weather/client';

const HOUR_MS = 3_600_000;
const LOOKAHEAD_HOURS_BEFORE = 3;
const WET_PROBABILITY_THRESHOLD = 40;

export interface ScheduleWeather {
  atStart: HourlyWeather | null;
  wetBefore: HourlyWeather[];
}

function isWetEnough(hour: HourlyWeather) {
  return (
    hour.isWet ||
    (hour.precipitationProbability ?? 0) >= WET_PROBABILITY_THRESHOLD
  );
}

function floorToHour(date: Date) {
  return new Date(Math.floor(date.getTime() / HOUR_MS) * HOUR_MS);
}

export function useScheduleWeather(
  place: PlaceSuggestion | null,
  start: Date,
  end: Date,
): { weather: ScheduleWeather | null; loading: boolean } {
  const [weather, setWeather] = useState<ScheduleWeather | null>(null);
  const [loading, setLoading] = useState(false);

  const latitude = place?.latitude ?? null;
  const longitude = place?.longitude ?? null;
  const startMs = start.getTime();
  const endMs = end.getTime();

  useEffect(() => {
    if (latitude === null || longitude === null) {
      setWeather(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const from = new Date(startMs - LOOKAHEAD_HOURS_BEFORE * HOUR_MS);
    const to = new Date(Math.max(endMs, startMs));

    getForecastByCoords(latitude, longitude, from, to)
      .then(response => {
        if (cancelled) return;

        const startHour = floorToHour(new Date(startMs)).getTime();

        setWeather({
          atStart:
            response.hourly.find(
              hour => new Date(hour.time).getTime() === startHour,
            ) ?? null,
          wetBefore: response.hourly.filter(
            hour =>
              new Date(hour.time).getTime() < startHour && isWetEnough(hour),
          ),
        });
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[Weather] gagal ambil ramalan:', err);
        setWeather(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, startMs, endMs]);

  return { weather, loading };
}
