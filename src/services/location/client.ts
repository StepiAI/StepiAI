import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: number; // epoch ms
}

export interface ReverseGeocoded {
  shortLabel: string;
  fullLabel: string | null;
  latitude: number;
  longitude: number;
}

const REVERSE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client';

interface BigDataCloudResponse {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
}

// koordinat -> nama tempat, langsung dari app (gk lewat backend biar anti gagal)
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocoded> {
  const url = `${REVERSE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as BigDataCloudResponse;

  const area = data.locality || null; // mis. "Menteng"
  const city = data.city || data.principalSubdivision || null; // mis. "Jakarta"
  const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  const shortLabel =
    [area, city].filter(Boolean).join(', ') ||
    data.city ||
    data.principalSubdivision ||
    data.countryName ||
    fallback;

  const fullLabel =
    [data.locality, data.city, data.principalSubdivision, data.countryName]
      .filter(Boolean)
      .join(', ') || null;

  return { shortLabel, fullLabel, latitude, longitude };
}

export class LocationPermissionDeniedError extends Error {
  constructor() {
    super('Izin lokasi ditolak.');
    this.name = 'LocationPermissionDeniedError';
  }
}

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    Geolocation.requestAuthorization();
    return true;
  }

  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  return (
    granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED ||
    granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED
  );
}

function getPosition(): Promise<CurrentLocation> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          capturedAt: pos.timestamp,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}

export async function getCurrentLocation(): Promise<CurrentLocation> {
  const allowed = await requestPermission();
  if (!allowed) {
    throw new LocationPermissionDeniedError();
  }
  return getPosition();
}

export async function watchCurrentLocation(
  onUpdate: (location: CurrentLocation) => void,
  onError: (error: Error) => void,
): Promise<() => void> {
  const allowed = await requestPermission();
  if (!allowed) {
    onError(new LocationPermissionDeniedError());
    return () => {};
  }

  const watchId = Geolocation.watchPosition(
    (pos) =>
      onUpdate({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
        capturedAt: pos.timestamp,
      }),
    (err) => onError(new Error(err.message)),
    {
      enableHighAccuracy: true,
      distanceFilter: 10,
    },
  );

  return () => Geolocation.clearWatch(watchId);
}
