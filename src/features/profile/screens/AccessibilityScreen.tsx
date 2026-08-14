import { Linking } from 'react-native';
import { useAccessibilitySettings } from '../../../shared/accessibility/AccessibilitySettingsContext';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsScreenLayout } from '../components/SettingsScreenLayout';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsSwitch } from '../components/SettingsSwitch';

export function AccessibilityScreen() {
  const { settings, setSetting } = useAccessibilitySettings();

  const openSystemSettings = () => {
    Linking.openSettings().catch(() => {

    });
  };

  return (
    <SettingsScreenLayout title="Accessibility">
      <SettingsSection
        title="Display & Text Size"
        caption="Bold Text applies across the app. Larger Text follows your device setting."
      >
        <SettingsRow
          label="Bold Text"
          accessory={
            <SettingsSwitch
              value={settings.boldText}
              onValueChange={next => setSetting('boldText', next)}
            />
          }
        />
        <SettingsRow
          label="Larger Text"
          caption="Follows your device text size setting."
          showChevron
          onPress={openSystemSettings}
        />
      </SettingsSection>

      <SettingsSection caption="Increase color contrast between app foreground and background colors. Icons and placeholders keep their current color.">
        <SettingsRow
          label="Increase Contrast"
          accessory={
            <SettingsSwitch
              value={settings.increaseContrast}
              onValueChange={next => setSetting('increaseContrast', next)}
            />
          }
        />
      </SettingsSection>
    </SettingsScreenLayout>
  );
}
