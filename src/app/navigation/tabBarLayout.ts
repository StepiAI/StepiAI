import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 62;
export const FAB_SIZE = 56;
export const FAB_LIFT = 28;
export const NOTCH_DEPTH = 40;

export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + insets.bottom;
}
