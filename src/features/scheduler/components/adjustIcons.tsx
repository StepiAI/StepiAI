import Svg, { Path } from 'react-native-svg';

const ACCENT = '#2E7BE0';
const VIOLET = '#7B70EE';

export function SparkleIcon({ color = VIOLET, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.6 4.6a4 4 0 0 0 2.8 2.8L21 12l-4.6 1.6a4 4 0 0 0-2.8 2.8L12 21l-1.6-4.6a4 4 0 0 0-2.8-2.8L3 12l4.6-1.6a4 4 0 0 0 2.8-2.8L12 3z"
        fill={color}
      />
      <Path d="M19 4l.7 2 .7-2 .6 2 .6-2" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function ClockOptionIcon({ color = ACCENT, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M12 7v5l3.5 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PushLaterIcon({ color = ACCENT, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6l6 6-6 6M12 6l6 6-6 6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M20 5v14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function MoveMeetingIcon({ color = ACCENT, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12h11M11 7l5 5-5 5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M20 5v14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
