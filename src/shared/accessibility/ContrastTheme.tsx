import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { useAccessibilitySettings } from './AccessibilitySettingsContext';

const NORMAL = {
  '--color-muted': '#6E6E78',
  '--color-faint': '#A0A0A8',
  '--color-hint': '#B4B4BC',
  '--color-disabled': '#C6C6CC',
  '--color-line': '#EAEAEE',
  '--color-rule': '#F0F0F3',
  '--color-accent': '#2E7BE0',
};

const HIGH = {
  '--color-muted': '#4A4A52',
  '--color-faint': '#5A5A62', 
  '--color-hint': '#6E6E78',
  '--color-disabled': '#8E8E93',
  '--color-line': '#C9C9D0', 
  '--color-rule': '#DCDCE2',
  '--color-accent': '#1F5FB8',
};

export function contrastVars(increaseContrast: boolean) {
  return increaseContrast ? HIGH : NORMAL;
}

export function ContrastTheme({ children }: PropsWithChildren) {
  const { settings } = useAccessibilitySettings();

  return (
    <View style={[{ flex: 1 }, vars(contrastVars(settings.increaseContrast))]}>
      {children}
    </View>
  );
}
