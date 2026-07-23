import { Alert } from 'react-native';
import { CalendarIcon, ClockIcon } from '../../../shared/components/Icons';
import { useCurrentLocation } from '../../settings/hooks/useCurrentLocation';
import { useGoogleCalendarConnection } from '../../settings/hooks/useGoogleCalendarConnection';
import { appLogos } from '../appLogos';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsScreenLayout } from '../components/SettingsScreenLayout';
import { SettingsSection } from '../components/SettingsSection';

export function ConnectedAppsScreen() {
  const { status, busy, error, toggleConnection } = useGoogleCalendarConnection();
  const connected = status?.connected ?? false;

  const {location, placeName, busy: locationBusy, error: locationError,} = useCurrentLocation();

  const pressLocation = () => {
    if (!location) return;
    Alert.alert(
      placeName ?? 'Lokasi kamu sekarang',
      `Lat: ${location.latitude.toFixed(5)}\nLng: ${location.longitude.toFixed(5)}` +
        (location.accuracy ? `\nAkurasi: ±${Math.round(location.accuracy)} m` : ''),
    );
  };

  const coordText = location
    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    : null;

  const locationCaption = locationError ? locationError : placeName ? `${placeName} · live` : coordText  ? `${coordText} · live` : locationBusy ? 'Mendeteksi lokasi…' : 'Lokasi belum tersedia';
  const pressGoogleCalendar = () => {
    if (!connected) {
      toggleConnection();
      return;
    }

    Alert.alert(
      'Disconnect Google Calendar?',
      'STEPI will stop syncing your schedule until you connect again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: toggleConnection },
      ],
    );
  };

  return (
    <SettingsScreenLayout title="Connected Apps">
      <SettingsSection title="Calendar" caption={error ?? undefined}>
        <SettingsRow
          label="Google Calendar"
          caption={
            connected
              ? (status && 'email' in status ? status.email : null) ?? 'Connected'
              : 'Not Connected'
          }
          captionTone={connected ? 'muted' : 'danger'}
          logo={appLogos.googleCalendar}
          icon={CalendarIcon}
          busy={busy}
          showChevron={!busy}
          onPress={pressGoogleCalendar}
        />

        <SettingsRow
          label="Outlook Calendar"
          caption="Not Connected"
          captionTone="danger"
          logo={appLogos.outlookCalendar}
          icon={CalendarIcon}
          showChevron
          onPress={() =>
            Alert.alert('Coming soon', 'Outlook Calendar support is not available yet.')
          }
        />
      </SettingsSection>

      <SettingsSection title="Others">
        <SettingsRow
          label="Location"
          caption={locationCaption}
          captionTone={locationError ? 'danger' : 'muted'}
          logo={appLogos.location}
          icon={ClockIcon}
          busy={locationBusy}
          showChevron={!locationBusy}
          onPress={pressLocation}
        />

        <SettingsRow
          label="Weather"
          caption="Sync to weather app"
          logo={appLogos.weather}
          icon={ClockIcon}
          showChevron
          onPress={() => Alert.alert('Coming soon', 'Weather sync is not available yet.')}
        />
      </SettingsSection>
    </SettingsScreenLayout>
  );
}
