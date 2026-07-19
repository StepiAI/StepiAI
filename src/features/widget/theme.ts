import type { HexColor } from 'react-native-android-widget';

// apparently widget tu ternyata di render sama android lewat remoteviews, jadi tailwind ga bisa ikut jalan disana.
export interface WidgetTheme {
  canvas: HexColor;
  card: HexColor;
  ink: HexColor;
  muted: HexColor;
  faint: HexColor;
  accent: HexColor;
  onAccent: HexColor;
  line: HexColor;
}

export const darkTheme: WidgetTheme = {
  canvas: '#0B0B0F',
  card: '#16161D',
  ink: '#F5F5F7',
  muted: '#9A9AA5',
  faint: '#6E6E78',
  accent: '#6C5CE7',
  onAccent: '#FFFFFF',
  line: '#26262E',
};

export const lightTheme: WidgetTheme = {
  canvas: '#FFFFFF',
  card: '#F2F2F5',
  ink: '#1C1C1E',
  muted: '#8E8E93',
  faint: '#A0A0A8',
  accent: '#6C5CE7',
  onAccent: '#FFFFFF',
  line: '#EAEAEE',
};
