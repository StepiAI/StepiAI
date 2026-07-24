import type { ColorProp } from 'react-native-android-widget';

// apparently widget tu ternyata di render sama android lewat remoteviews, jadi tailwind ga bisa ikut jalan disana.
export interface WidgetTheme {
  canvas: ColorProp; 
  dateFrom: ColorProp; 
  dateTo: ColorProp;
  dateInk: ColorProp; 
  dateSub: ColorProp;
  label: ColorProp;
  ink: ColorProp;
  muted: ColorProp;
  bar: ColorProp;
  barNow: ColorProp;
  line: ColorProp;
  onAccent: ColorProp;
}

export const lightTheme: WidgetTheme = {
  canvas: '#FFFFFF',
  dateFrom: '#EEF3FF',
  dateTo: '#CBDBFF',
  dateInk: '#2B4CDB',
  dateSub: '#4C6BE6',
  label: '#93A4C4',
  ink: '#1C2333',
  muted: '#8A97AE',
  bar: '#7FA0F5',
  barNow: '#2B5BE0',
  line: '#EAEFF8',
  onAccent: '#FFFFFF',
};

export const darkTheme: WidgetTheme = {
  canvas: '#12131A',
  dateFrom: '#22305C',
  dateTo: '#141B33',
  dateInk: '#9CB8FF',
  dateSub: '#6E8FE8',
  label: '#5D6B85',
  ink: '#EDEFF6',
  muted: '#8A93A8',
  bar: '#3F5CA8',
  barNow: '#6E93FF',
  line: '#242634',
  onAccent: '#FFFFFF',
};
