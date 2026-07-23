import { useEffect, useRef, useState } from 'react';
import {
  CurrentLocation,
  LocationPermissionDeniedError,
  reverseGeocode,
  watchCurrentLocation,
} from '../../../services/location/client';

function roughDistanceMeters(a: CurrentLocation, b: CurrentLocation): number {
  const dLat = (a.latitude - b.latitude) * 111_320;
  const dLng =
    (a.longitude - b.longitude) *
    111_320 *
    Math.cos((a.latitude * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

export function useCurrentLocation() {
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const lastReversedRef = useRef<CurrentLocation | null>(null);

  useEffect(() => {
    let cancelled = false;

    const maybeReverse = async (loc: CurrentLocation) => {
      const last = lastReversedRef.current;
      if (last && roughDistanceMeters(loc, last) < 30) {
        return;
      }
      try {
        const place = await reverseGeocode(loc.latitude, loc.longitude);
        if (!cancelled) {
          setPlaceName(place.shortLabel);
          lastReversedRef.current = loc; // tandain sukses, biar gak ulang percuma
        }
      } catch (err) {
        console.warn('[Location] reverse geocode gagal:', err);
      }
    };

    watchCurrentLocation(
      (loc) => {
        if (cancelled) return;
        setLocation(loc);
        setBusy(false);
        setError(null);
        void maybeReverse(loc);
      },
      (err) => {
        if (cancelled) return;
        setBusy(false);
        if (err instanceof LocationPermissionDeniedError) {
          setError('Izin lokasi ditolak. Aktifkan lewat Settings HP kamu.');
        } else {
          console.error('[Location] gagal pantau lokasi:', err);
          setError('Gagal ambil lokasi sekarang.');
        }
      },
    ).then((stop) => {
      if (cancelled) {
        stop();
        return;
      }
      stopRef.current = stop;
    });

    return () => {
      cancelled = true;
      stopRef.current?.();
      stopRef.current = null;
    };
  }, []);

  return { location, placeName, busy, error };
}
