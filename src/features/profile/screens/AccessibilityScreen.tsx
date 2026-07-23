import { useState } from 'react';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsScreenLayout } from '../components/SettingsScreenLayout';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsSwitch } from '../components/SettingsSwitch';

export function AccessibilityScreen() {
  // semua masih state lokal, belum ada endpoint buat nyimpen preferensi ini
  const [boldText, setBoldText] = useState(false);
  const [largerText, setLargerText] = useState(false);
  const [autoBrightness, setAutoBrightness] = useState(false);
  const [increaseContrast, setIncreaseContrast] = useState(false);
  const [colorFilters, setColorFilters] = useState(false);

  return (
    <SettingsScreenLayout title="Accessibility">
      <SettingsSection title="Display & Text Size">
        <SettingsRow
          label="Bold Text"
          accessory={<SettingsSwitch value={boldText} onValueChange={setBoldText} />}
        />
        <SettingsRow
          label="Larger Text"
          value={largerText ? 'On' : 'Off'}
          showChevron
          onPress={() => setLargerText(current => !current)}
        />
        <SettingsRow
          label="Auto-Brightness"
          accessory={
            <SettingsSwitch value={autoBrightness} onValueChange={setAutoBrightness} />
          }
        />
      </SettingsSection>

      <SettingsSection caption="Increase color contrast between app foreground and background colors.">
        <SettingsRow
          label="Increase Contrast"
          accessory={
            <SettingsSwitch value={increaseContrast} onValueChange={setIncreaseContrast} />
          }
        />
      </SettingsSection>

      <SettingsSection caption="Color filters can be used to differentiate colors by users who are color blind and aid users who have difficulty reading text on the display.">
        <SettingsRow
          label="Color Filters"
          value={colorFilters ? 'On' : 'Off'}
          showChevron
          onPress={() => setColorFilters(current => !current)}
        />
      </SettingsSection>
    </SettingsScreenLayout>
  );
}
