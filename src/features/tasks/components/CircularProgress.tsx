import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { textStyle } from '../../../shared/theme/typography';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ progress, size = 92, strokeWidth = 10 }: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={center} cy={center} r={radius - strokeWidth / 2} fill="#FFFFFF" />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E4EEFF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#2E5FE0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <Text className="text-[24px] text-light-inkStrong" style={textStyle('bold')}>
        {Math.round(clamped)}
        <Text className="text-[14px]" style={textStyle('bold')}>
          %
        </Text>
      </Text>
    </View>
  );
}
