import { useEffect, useState } from 'react';
import { PlaceSuggestion, searchPlaces } from '../../../services/weather/client';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

// sengaja debounce ny lebi pendek dari cek cuaca biar responsif sambil user ngetik
export function usePlaceSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmed = query.trim();

  useEffect(() => {
    if (!enabled || trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      searchPlaces(trimmed)
        .then(places => {
          if (!cancelled) setResults(places);
        })
        .catch(err => {
          if (cancelled) return;
          console.error('[Places] gagal cari lokasi:', err);
          setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, enabled]);

  return { results, loading };
}
