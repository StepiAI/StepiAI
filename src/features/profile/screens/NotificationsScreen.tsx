import { useState } from 'react';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsScreenLayout } from '../components/SettingsScreenLayout';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsSwitch } from '../components/SettingsSwitch';

const PREVIEW_OPTIONS = ['When Unlocked (Default)', 'Always', 'Never'];

export function NotificationsScreen() {
  // semua masih state lokal, belum ada endpoint buat nyimpen preferensi ini
  const [push, setPush] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [planUpdates, setPlanUpdates] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState(true);
  const [appUpdates, setAppUpdates] = useState(false);
  const [promotions, setPromotions] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  return (
    <SettingsScreenLayout title="Notifications">
      <SettingsSection>
        <SettingsRow
          label="Push Notifications"
          accessory={<SettingsSwitch value={push} onValueChange={setPush} />}
        />
      </SettingsSection>

      <SettingsSection title="Schedule">
        <SettingsRow
          label="Event Reminders"
          value={eventReminders ? 'On' : 'Off'}
          showChevron
          onPress={() => setEventReminders(current => !current)}
        />
        <SettingsRow
          label="Plan Updates"
          accessory={<SettingsSwitch value={planUpdates} onValueChange={setPlanUpdates} />}
        />
        <SettingsRow
          label="Traffic Alerts"
          accessory={<SettingsSwitch value={trafficAlerts} onValueChange={setTrafficAlerts} />}
        />
      </SettingsSection>

      <SettingsSection title="Marketing">
        <SettingsRow
          label="App Updates"
          accessory={<SettingsSwitch value={appUpdates} onValueChange={setAppUpdates} />}
        />
        <SettingsRow
          label="Promotions"
          accessory={<SettingsSwitch value={promotions} onValueChange={setPromotions} />}
        />
      </SettingsSection>

      <SettingsSection title="Lock Screen Appearance">
        <SettingsRow
          label="Show Previews"
          value={PREVIEW_OPTIONS[previewIndex]}
          showChevron
          onPress={() => setPreviewIndex(current => (current + 1) % PREVIEW_OPTIONS.length)}
        />
      </SettingsSection>
    </SettingsScreenLayout>
  );
}
