import { Image, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { useTabBarSpace } from '../../../app/navigation/tabBarLayout';
import {
  AccessibilityIcon,
  BellIcon,
  GridIcon,
  HelpIcon,
  PersonIcon,
} from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { useAuthSession } from '../../auth/hooks/useAuthSession';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsSection } from '../components/SettingsSection';
import { useSignOut } from '../hooks/useSignOut';

// sementara masih dipajang biar gampang dibuka pas ngerjain UI, nanti dihapus.
// dibatasi ke route tanpa params biar navigate-nya aman di TS.
type ParamlessRoute = 'Summary' | 'Personalize' | 'Location';

const PARKED_SCREENS: { name: ParamlessRoute; label: string }[] = [
  { name: 'Summary', label: 'Summary' },
  { name: 'Personalize', label: 'Personalize your Day' },
  { name: 'Location', label: 'Location Access' },
];

export function ProfileScreen() {
  const { session } = useAuthSession();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const tabBarSpace = useTabBarSpace();
  const { busy, confirmSignOut } = useSignOut();

  const metadata = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const fullName = metadata.full_name ?? metadata.name ?? 'Your profile';
  const email = session?.user?.email ?? '';
  const avatarUrl = metadata.avatar_url ?? metadata.picture;

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        className="flex-1 px-[18px]"
        contentContainerClassName="gap-[22px] pt-[10px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between px-[4px]">
          <View className="flex-1 pr-[12px]">
            <Text
              className="text-[22px] text-light-inkStrong"
              style={textStyle('bold')}
              numberOfLines={1}
            >
              {fullName}
            </Text>
            {email ? (
              <Text
                className="mt-[2px] text-[13px] text-light-muted"
                style={textStyle('regular')}
                numberOfLines={1}
              >
                {email}
              </Text>
            ) : null}
          </View>

          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="h-[52px] w-[52px] rounded-full" />
          ) : (
            <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-light-fill">
              <PersonIcon color="#8E8E93" />
            </View>
          )}
        </View>

        <SettingsSection>
          <SettingsRow
            label="Connected Apps"
            icon={GridIcon}
            showChevron
            onPress={() => navigation.navigate('ConnectedApps')}
          />
          <SettingsRow
            label="Accessibility"
            icon={AccessibilityIcon}
            showChevron
            onPress={() => navigation.navigate('Accessibility')}
          />
          <SettingsRow
            label="Notifications"
            icon={BellIcon}
            showChevron
            onPress={() => navigation.navigate('Notifications')}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            label="Help Center"
            icon={HelpIcon}
            showChevron
            onPress={() => navigation.navigate('HelpCenter')}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow label="Log Out" danger busy={busy} onPress={confirmSignOut} />
        </SettingsSection>

        <SettingsSection title="Other screens">
          {PARKED_SCREENS.map(screen => (
            <SettingsRow
              key={screen.name}
              label={screen.label}
              showChevron
              onPress={() => navigation.navigate(screen.name)}
            />
          ))}
        </SettingsSection>

        <View style={{ height: tabBarSpace }} />
      </ScrollView>
    </SafeAreaView>
  );
}
