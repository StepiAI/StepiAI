import { Platform, TextStyle } from 'react-native';

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

export function textStyle(weight: Weight): TextStyle {
  return Platform.OS === 'ios' ? { fontFamily: 'System', fontWeight: iosWeight[weight] } : { fontFamily: androidFamily[weight] };
}
