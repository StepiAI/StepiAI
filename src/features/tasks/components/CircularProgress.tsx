import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { textStyle } from '../../../shared/theme/typography';

interface CircularProgressProps {
  progress: number;
  size?: number;
  outerStrokeWidth?: number;
  arcStrokeWidth?: number;
  outerInset?: number;
  gap?: number;
}

export function CircularProgress({
  progress,
  size = 122,
  outerStrokeWidth = 14,
  arcStrokeWidth = 16,
  outerInset = 3,
  gap = 2,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const center = size / 2;

  const outerRadius = center - outerInset - outerStrokeWidth / 2;
  const outerInnerEdge = outerRadius - outerStrokeWidth / 2;

  const arcRadius = outerInnerEdge - gap - arcStrokeWidth / 2;
  const circumference = 2 * Math.PI * arcRadius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2E7BE0" />
            <Stop offset="1" stopColor="#7B61FF" />
          </LinearGradient>
        </Defs>

        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="#FFFFFF"
          strokeWidth={outerStrokeWidth}
          fill="none"
        />

        <Circle
          cx={center}
          cy={center}
          r={arcRadius}
          stroke="url(#progressGradient)"
          strokeWidth={arcStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <Text className="text-[26px]" style={[textStyle('bold'), { color: '#2E6FE3' }]}>
        {Math.round(clamped)}
        <Text className="text-[15px]" style={[textStyle('bold'), { color: '#6E63E8' }]}>
          %
        </Text>
      </Text>
    </View>
  );
}
