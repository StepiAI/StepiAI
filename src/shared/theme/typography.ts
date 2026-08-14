import { useCallback } from 'react';
import { Platform, TextStyle } from 'react-native';
import { useAccessibilitySettings } from '../accessibility/AccessibilitySettingsContext';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

const androidFamily: Record<Weight, string> = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

const iosWeight: Record<Weight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const boldedWeight: Record<Weight, Weight> = {
  regular: 'bold',
  medium: 'bold',
  semibold: 'bold',
  bold: 'bold',
};

export function textStyle(weight: Weight): TextStyle {
  return Platform.OS === 'ios' ? { fontFamily: 'System', fontWeight: iosWeight[weight] } : { fontFamily: androidFamily[weight] };
}

export function useTextStyle() {
  const { settings } = useAccessibilitySettings();
  const bold = settings.boldText;

  return useCallback(
    (weight: Weight) => textStyle(bold ? boldedWeight[weight] : weight),
    [bold],
  );
}
