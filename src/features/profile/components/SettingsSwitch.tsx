import { Platform, Switch } from 'react-native';

interface SettingsSwitchProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
}

/**
 * Switch bawaan Android warnanya beda (thumb ikut ke-tint + track-nya pucat),
 * jadi warnanya dipaksa di sini biar keliatan sama kayak iOS.
 */
export function SettingsSwitch({ value, onValueChange }: SettingsSwitchProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E4E4EA', true: '#2E7BE0' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E4E4EA"
      style={
        Platform.OS === 'android'
          ? { transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }
          : undefined
      }
    />
  );
}
