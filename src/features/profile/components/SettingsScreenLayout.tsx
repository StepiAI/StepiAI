import { PropsWithChildren } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { ChevronLeft } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';

interface SettingsScreenLayoutProps extends PropsWithChildren {
  title: string;
}

// dipakai semua sub-screen profile biar header + spacing-nya seragam
export function SettingsScreenLayout({ title, children }: SettingsScreenLayoutProps) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  // semua screen ini anaknya Profile, jadi kalau gak ada history balikin ke Profile
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center px-[18px] pb-[10px] pt-[6px]">
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          accessibilityLabel="Back"
          hitSlop={10}
          className="h-[36px] w-[36px] items-center justify-center"
        >
          <ChevronLeft size={13} />
        </TouchableOpacity>

        <Text
          className="flex-1 text-center text-[18px] text-light-inkStrong"
          style={textStyle('bold')}
        >
          {title}
        </Text>

        <View className="w-[36px]" />
      </View>

      <ScrollView
        className="flex-1 px-[18px]"
        contentContainerClassName="gap-[22px] pb-[40px] pt-[10px]"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
