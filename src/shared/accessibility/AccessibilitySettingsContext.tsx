import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilitySettings,
  AccessibilitySettingKey,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  readAccessibilitySettings,
  saveAccessibilitySettings,
} from './storage';

export interface AccessibilitySettingsValue {
  settings: AccessibilitySettings;
  hydrated: boolean;
  setSetting: (key: AccessibilitySettingKey, value: boolean) => void;
}

const AccessibilitySettingsContext = createContext<AccessibilitySettingsValue>({
  settings: DEFAULT_ACCESSIBILITY_SETTINGS,
  hydrated: false,
  setSetting: () => {},
});

export const useAccessibilitySettings = () =>
  useContext(AccessibilitySettingsContext);

export function AccessibilitySettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstWrite = useRef(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const stored = await readAccessibilitySettings();
      if (!active) return;

      setSettings(stored);
      setHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }

    saveAccessibilitySettings(settings);
  }, [settings, hydrated]);

  const setSetting = useCallback(
    (key: AccessibilitySettingKey, value: boolean) => {
      setSettings(current =>
        current[key] === value ? current : { ...current, [key]: value },
      );
    },
    [],
  );

  return (
    <AccessibilitySettingsContext.Provider
      value={{ settings, hydrated, setSetting }}
    >
      {children}
    </AccessibilitySettingsContext.Provider>
  );
}
