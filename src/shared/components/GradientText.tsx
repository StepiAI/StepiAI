import { Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { heroGradient } from '../theme/gradient';

interface GradientTextProps {
  lines: string[];
  fontSize?: number;
  lineHeight?: number;
  weight?: '400' | '500' | '600' | '700';
  width?: number;
  colors?: string[];
  align?: 'left' | 'center';
}

const androidFamily: Record<string, string> = {
  '400': 'Inter-Regular',
  '500': 'Inter-Medium',
  '600': 'Inter-SemiBold',
  '700': 'Inter-Bold',
};

export function GradientText({
  lines,
  fontSize = 30,
  lineHeight = 36,
  weight = '600',
  width = 320,
  colors = heroGradient,
  align = 'center',
}: GradientTextProps) {
  const height = lineHeight * lines.length + 4;
  const fontFamily = Platform.OS === 'ios' ? 'System' : androidFamily[weight];
  const x = align === 'left' ? 0 : width / 2;
  const textAnchor = align === 'left' ? 'start' : 'middle';

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          {colors.map((color, index) => (
            <Stop
              key={color}
              offset={`${(index / (colors.length - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </LinearGradient>
      </Defs>

      {lines.map((line, index) => (
        <SvgText
          key={line}
          x={x}
          y={lineHeight * index + fontSize}
          fontSize={fontSize}
          fontWeight={weight}
          fontFamily={fontFamily}
          fill="url(#heroGradient)"
          textAnchor={textAnchor}
        >
          {line}
        </SvgText>
      ))}
    </Svg>
  );
}
