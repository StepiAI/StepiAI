import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccessibilitySettingsProvider } from '../../shared/accessibility/AccessibilitySettingsContext';
import { ContrastTheme } from '../../shared/accessibility/ContrastTheme';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <AccessibilitySettingsProvider>
        <ContrastTheme>{children}</ContrastTheme>
      </AccessibilitySettingsProvider>
    </SafeAreaProvider>
  );
}
