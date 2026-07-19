import {
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CarIcon,
  ChevronLeft,
  ClockIcon,
  LockIcon,
} from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { BenefitRow } from '../components/BenefitRow';
import { useLocationPermission } from '../hooks/useLocationPermission';

const ICON_ACCENT = '#2E7BE0';

interface LocationAccessScreenProps {
  onBack?: () => void;
  onAllow?: () => void;
  onSkip?: () => void;
}

export function LocationAccessScreen({
  onBack,
  onAllow,
  onSkip,
}: LocationAccessScreenProps) {
  const { status, requesting, request, openSettings } = useLocationPermission();

  const blocked = status === 'blocked';
  const unavailable = status === 'unavailable';

  const handlePrimary = async () => {
    if (blocked) {
      openSettings();
      return;
    }

    if (await request() === 'granted') onAllow?.();
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center px-[18px] pt-[6px]">
        <TouchableOpacity onPress={onBack} hitSlop={10} activeOpacity={0.6}>
          <ChevronLeft />
        </TouchableOpacity>

        <Text
          className="flex-1 text-center text-[21px] text-light-inkStrong"
          style={textStyle('bold')}
        >
          Location Access
        </Text>

        <View className="w-[24px]" />
      </View>

      <Text
        className="mt-[6px] px-[24px] text-center text-[13px] text-light-muted"
        style={textStyle('regular')}
      >
        We use your location access to various features.
      </Text>

      <View className="mt-[22px] px-[18px]">
        <View className="overflow-hidden rounded-[16px] border border-light-line bg-light-sheet">
          <BenefitRow
            icon={<CarIcon color={ICON_ACCENT} />}
            title="Accurate travel times"
            caption="Get real-time estimates and traffic updates."
          />
          <View className="ml-[52px] h-[1px] bg-light-rule" />
          <BenefitRow
            icon={<ClockIcon color={ICON_ACCENT} />}
            title="Smart scheduling"
            caption="We'll know when to remind you to leave."
          />
          <View className="ml-[52px] h-[1px] bg-light-rule" />
          <BenefitRow
            icon={<LockIcon color={ICON_ACCENT} />}
            title="You're in control"
            caption="Your location is private and never shared."
          />
        </View>
      </View>

      <Text
        className="mt-[18px] px-[24px] text-center text-[13px] text-light-faint"
        style={textStyle('regular')}
      >
        You can change anytime in Settings.
      </Text>

      <View className="flex-1" />

      {blocked ? (
        <Text
          className="mb-[10px] px-[32px] text-center text-[13px] leading-[18px] text-light-muted"
          style={textStyle('regular')}
        >
          Location is turned off for StepiAI. Turn it on in Settings to use travel
          times and leave-now reminders.
        </Text>
      ) : status === 'denied' ? (
        <Text
          className="mb-[10px] px-[32px] text-center text-[13px] text-light-muted"
          style={textStyle('regular')}
        >
          No problem — you can turn this on later in Settings.
        </Text>
      ) : unavailable ? (
        <Text
          className="mb-[10px] px-[32px] text-center text-[13px] text-light-muted"
          style={textStyle('regular')}
        >
          Location isn't available on this device yet.
        </Text>
      ) : null}

      <View className="px-[24px] pb-[10px]">
        <TouchableOpacity
          onPress={handlePrimary}
          disabled={requesting || unavailable}
          activeOpacity={0.85}
          className={`h-[52px] items-center justify-center rounded-full bg-light-accent ${
            requesting || unavailable ? 'opacity-50' : ''
          }`}
        >
          {requesting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] text-white" style={textStyle('semibold')}>
              {blocked ? 'Open Settings' : 'Allow While Using App'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-[24px] pb-[6px]">
        <TouchableOpacity
          onPress={onSkip}
          disabled={requesting}
          activeOpacity={0.85}
          className="h-[52px] items-center justify-center rounded-full bg-light-sheet"
        >
          <Text className="text-[15px] text-light-accent" style={textStyle('semibold')}>
            Don't Allow
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
