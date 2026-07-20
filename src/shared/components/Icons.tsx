import { Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const STROKE = '#1C1C1E';

export function ClockIcon({ color = STROKE }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="absolute top-0 h-[3px] w-[8px] rounded-sm"
        style={{ backgroundColor: color }}
      />
      <View
        className="h-[18px] w-[18px] rounded-full border-[1.6px]"
        style={{ borderColor: color, marginTop: 3 }}
      />
      <View
        className="absolute h-[5px] w-[1.6px]"
        style={{ backgroundColor: color, transform: [{ translateY: -1 }] }}
      />
      <View
        className="absolute h-[1.6px] w-[4px]"
        style={{ backgroundColor: color, transform: [{ translateX: 2 }, { translateY: 3 }] }}
      />
    </View>
  );
}

export function MoonIcon({
  color = STROKE,
  backdrop = '#FFFFFF',
}: {
  color?: string;
  backdrop?: string;
}) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="h-[18px] w-[18px] rounded-full border-[1.6px]"
        style={{ borderColor: color }}
      />
      <View
        className="absolute h-[18px] w-[18px] rounded-full"
        style={{
          backgroundColor: backdrop,
          transform: [{ translateX: 6 }, { translateY: -5 }],
        }}
      />
    </View>
  );
}

export function ChevronLeft({ color = STROKE, size = 11 }: { color?: string; size?: number }) {
  return (
    <View className="h-[24px] w-[24px] items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateX: 2 }, { translateY: -2 }],
        }}
      />
    </View>
  );
}

export function ChevronRight({ color = '#B4B4BC', size = 11 }: { color?: string; size?: number }) {
  return (
    <View className="h-[24px] w-[24px] items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRightWidth: 2,
          borderTopWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateX: -2 }, { translateY: 2 }],
        }}
      />
    </View>
  );
}

export function ChevronDown({ color = '#B0B0B8', size = 9 }: { color?: string; size?: number }) {
  return (
    <View className="h-[20px] w-[20px] items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateY: -2 }],
        }}
      />
    </View>
  );
}

export function SendIcon({ color = '#FFFFFF', size = 19 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MenuIcon({ color = STROKE, size = 18 }: { color?: string; size?: number }) {
  return (
    <View className="items-center justify-center gap-[4px]" style={{ width: 22, height: 22 }}>
      {[0, 1, 2].map(row => (
        <View
          key={row}
          style={{ width: row === 1 ? size * 0.7 : size, height: 1.8, borderRadius: 1, backgroundColor: color }}
        />
      ))}
    </View>
  );
}

export function CloseIcon({ color = STROKE, size = 12 }: { color?: string; size?: number }) {
  return (
    <View className="items-center justify-center" style={{ width: 22, height: 22 }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: 1.8,
          borderRadius: 1,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: 1.8,
          borderRadius: 1,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

export function EditIcon({ color = STROKE, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.4 3.4a1.8 1.8 0 0 1 2.5 2.5L13.4 13.4l-3 .8.8-3z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MicIcon({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="2" width="6" height="12" rx="3" fill={color} />
      <Path
        d="M6 11v1a6 6 0 0 0 12 0v-1M12 19v3M9 22h6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckBadge({ color = '#41C46F', size = 15 }: { color?: string; size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <View
        style={{
          width: size * 0.4,
          height: size * 0.22,
          borderLeftWidth: 1.6,
          borderBottomWidth: 1.6,
          borderColor: '#FFFFFF',
          transform: [{ rotate: '-45deg' }, { translateY: -1 }],
        }}
      />
    </View>
  );
}

export function ClearIcon() {
  return (
    <View className="h-[20px] w-[20px] items-center justify-center rounded-full bg-[#D8D8DE]">
      <Text className="text-[13px] leading-[15px] text-white">×</Text>
    </View>
  );
}

const ACCENT = '#2E7BE0';

export function CarIcon({ color = ACCENT }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="absolute h-[7px] w-[12px] rounded-t-[4px] border-[1.6px] border-b-0"
        style={{ borderColor: color, transform: [{ translateY: -4 }] }}
      />
      <View
        className="h-[8px] w-[19px] rounded-[3px] border-[1.6px]"
        style={{ borderColor: color, transform: [{ translateY: 2 }] }}
      />
      <View
        className="absolute h-[4px] w-[4px] rounded-full"
        style={{
          backgroundColor: color,
          transform: [{ translateX: -5 }, { translateY: 7 }],
        }}
      />
      <View
        className="absolute h-[4px] w-[4px] rounded-full"
        style={{
          backgroundColor: color,
          transform: [{ translateX: 5 }, { translateY: 7 }],
        }}
      />
    </View>
  );
}

export function LockIcon({ color = ACCENT }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="absolute h-[10px] w-[10px] rounded-t-full border-[1.6px] border-b-0"
        style={{ borderColor: color, transform: [{ translateY: -5 }] }}
      />
      <View
        className="h-[11px] w-[15px] items-center justify-center rounded-[3px]"
        style={{ backgroundColor: color, transform: [{ translateY: 3 }] }}
      />
    </View>
  );
}

export function HomeIcon({ color = STROKE }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="absolute"
        style={{
          width: 13,
          height: 13,
          borderTopWidth: 1.8,
          borderLeftWidth: 1.8,
          borderColor: color,
          borderTopLeftRadius: 2,
          transform: [{ rotate: '45deg' }, { translateY: 2 }],
        }}
      />
      <View
        className="absolute"
        style={{
          width: 14,
          height: 9,
          borderWidth: 1.8,
          borderTopWidth: 0,
          borderColor: color,
          transform: [{ translateY: 5 }],
        }}
      />
    </View>
  );
}

export function ListIcon({ color = STROKE }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] justify-center gap-[4px]">
      {[0, 1, 2].map(row => (
        <View key={row} className="flex-row items-center gap-[4px]">
          <View
            className="rounded-full"
            style={{ width: 3.5, height: 3.5, backgroundColor: color }}
          />
          <View style={{ width: 12, height: 2, borderRadius: 1, backgroundColor: color }} />
        </View>
      ))}
    </View>
  );
}

export function ChatBubbleIcon({ color = STROKE }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        style={{
          width: 18,
          height: 14,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 7,
          transform: [{ translateY: -1 }],
        }}
      />
      <View
        className="absolute"
        style={{
          width: 5,
          height: 5,
          borderBottomWidth: 1.8,
          borderLeftWidth: 1.8,
          borderColor: color,
          transform: [{ translateX: -4 }, { translateY: 6 }, { rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

export function PersonIcon({ color = STROKE }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="absolute rounded-full"
        style={{
          width: 8,
          height: 8,
          borderWidth: 1.8,
          borderColor: color,
          transform: [{ translateY: -5 }],
        }}
      />
      <View
        className="absolute"
        style={{
          width: 15,
          height: 8,
          borderWidth: 1.8,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          transform: [{ translateY: 6 }],
        }}
      />
    </View>
  );
}

export function CalendarIcon({ color = STROKE }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="h-[17px] w-[18px] rounded-[3px] border-[1.6px]"
        style={{ borderColor: color, transform: [{ translateY: 1 }] }}
      />
      <View
        className="absolute h-[1.6px] w-[18px]"
        style={{ backgroundColor: color, transform: [{ translateY: -2 }] }}
      />
      <View
        className="absolute h-[4px] w-[1.6px]"
        style={{ backgroundColor: color, transform: [{ translateX: -5 }, { translateY: -7 }] }}
      />
      <View
        className="absolute h-[4px] w-[1.6px]"
        style={{ backgroundColor: color, transform: [{ translateX: 5 }, { translateY: -7 }] }}
      />
    </View>
  );
}

export function BookIcon({ color = STROKE }: { color?: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center">
      <View
        className="h-[16px] w-[17px] rounded-[3px] border-[1.6px]"
        style={{ borderColor: color }}
      />
      <View
        className="absolute h-[16px] w-[1.6px]"
        style={{ backgroundColor: color }}
      />
    </View>
  );
}

export function PlusIcon({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) {
  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <View
        className="absolute rounded-full"
        style={{ width: size, height: 2.4, backgroundColor: color }}
      />
      <View
        className="absolute rounded-full"
        style={{ width: 2.4, height: size, backgroundColor: color }}
      />
    </View>
  );
}
