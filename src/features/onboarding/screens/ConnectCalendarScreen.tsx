import {
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleLogo } from '../../../shared/components/GoogleLogo';
import {
  CalendarIcon,
  ChevronLeft,
  ClockIcon,
  LockIcon,
} from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { BenefitRow } from '../components/BenefitRow';

const ICON_ACCENT = '#2E7BE0';

interface ConnectCalendarScreenProps {
  busy: boolean;
  error: string | null;
  onConnect: () => void;
  // balik ke halaman login (sign out)
  onBack?: () => void;
}

// gate wajib setelah login: kalau Google Calendar belum kesambung, user harus
// connect dulu di sini sebelum bisa masuk ke Home. Begitu status berubah jadi
// connected, RootNavigator otomatis lanjut (screen ini gak perlu navigate).
export function ConnectCalendarScreen({
  busy,
  error,
  onConnect,
  onBack,
}: ConnectCalendarScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center px-[16px] pt-[6px]">
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Back"
            className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white/70"
          >
            <ChevronLeft size={13} />
          </TouchableOpacity>
        ) : (
          <View className="w-[46px]" />
        )}

        <Text
          className="flex-1 text-center text-[21px] text-light-inkStrong"
          style={textStyle('bold')}
        >
          Connect Calendar
        </Text>

        <View className="w-[46px]" />
      </View>

      <Text
        className="mt-[6px] px-[24px] text-center text-[13px] text-light-muted"
        style={textStyle('regular')}
      >
        STEPI plans around your real schedule. Connect Google Calendar to get
        started.
      </Text>

      <View className="mt-[22px] px-[18px]">
        <View className="overflow-hidden rounded-[16px] border border-light-line bg-light-sheet">
          <BenefitRow
            icon={<CalendarIcon color={ICON_ACCENT} />}
            title="See your schedule"
            caption="Your events show up on the home timeline."
          />
          <View className="ml-[52px] h-[1px] bg-light-rule" />
          <BenefitRow
            icon={<ClockIcon color={ICON_ACCENT} />}
            title="Smart planning"
            caption="We'll find free time and remind you when to leave."
          />
          <View className="ml-[52px] h-[1px] bg-light-rule" />
          <BenefitRow
            icon={<LockIcon color={ICON_ACCENT} />}
            title="You're in control"
            caption="Disconnect anytime from your profile."
          />
        </View>
      </View>

      <Text
        className="mt-[18px] px-[24px] text-center text-[13px] text-light-faint"
        style={textStyle('regular')}
      >
        You can manage this later in Connected Apps.
      </Text>

      <View className="flex-1" />

      {error ? (
        <Text
          className="mb-[10px] px-[32px] text-center text-[13px] text-danger"
          style={textStyle('regular')}
        >
          {error}
        </Text>
      ) : null}

      <View className="px-[24px]" style={{ paddingBottom: insets.bottom + 10 }}>
        <TouchableOpacity
          onPress={onConnect}
          disabled={busy}
          activeOpacity={0.85}
          className={`h-[52px] flex-row items-center justify-center gap-[10px] rounded-full bg-light-accent ${
            busy ? 'opacity-50' : ''
          }`}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <GoogleLogo size={18} />
              <Text className="text-[15px] text-white" style={textStyle('semibold')}>
                Connect Google Calendar
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
