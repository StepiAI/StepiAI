import { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../../app/navigation/types';
import { ChevronLeft } from '../../../shared/components/Icons';
import { textStyle } from '../../../shared/theme/typography';
import { AdjustOptionCard } from '../components/AdjustOptionCard';
import {
  ClockOptionIcon,
  MoveMeetingIcon,
  PushLaterIcon,
  SparkleIcon,
} from '../components/adjustIcons';

// TODO(integrate): semua angka & opsi masih hardcode, nanti ganti dari hasil AI/backend
const RECOMMENDATION = {
  recommended: { time: '08:05 AM', onTime: '91% on-time' },
  previous: { time: '08:20 AM', onTime: '42% on-time' },
};

type OptionId = 'ai' | 'earlier' | 'push' | 'move';

const OPTIONS: {
  id: OptionId;
  icon: React.ReactNode;
  title: string;
  onTime: string;
  description: string;
}[] = [
  {
    id: 'ai',
    icon: <SparkleIcon />,
    title: 'Let AI optimize',
    onTime: '94% on-time',
    description: 'AI will find the best schedule',
  },
  {
    id: 'earlier',
    icon: <ClockOptionIcon />,
    title: 'Leave earlier',
    onTime: '91% on-time',
    description: 'Leave at 08:05 AM',
  },
  {
    id: 'push',
    icon: <PushLaterIcon />,
    title: 'Push everything later',
    onTime: '63% on-time',
    description: 'Delay all events by 15 min',
  },
  {
    id: 'move',
    icon: <MoveMeetingIcon />,
    title: 'Move this meeting',
    onTime: '53% on-time',
    description: 'Reschedule “Client Meeting”',
  },
];

const CTA_GRADIENT = 'linear-gradient(90deg, #2E7BE0 0%, #6C5CE7 100%)';

export function AdjustScheduleScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [selected, setSelected] = useState<OptionId>('push');

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const onAdjust = () => {
    // TODO(integrate): kirim `selected` ke backend buat nge-apply penyesuaian jadwal
    goBack();
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
          Adjust Schedule
        </Text>

        <View className="w-[36px]" />
      </View>

      <ScrollView
        className="flex-1 px-[18px]"
        contentContainerClassName="pb-[24px] pt-[10px]"
        showsVerticalScrollIndicator={false}
      >
        <RecommendationCard />

        <Text
          className="mb-[14px] mt-[24px] text-[17px] text-light-inkStrong"
          style={textStyle('semibold')}
        >
          How would you like to adjust?
        </Text>

        <View className="gap-[12px]">
          {OPTIONS.map(option => (
            <AdjustOptionCard
              key={option.id}
              icon={option.icon}
              title={option.title}
              onTime={option.onTime}
              description={option.description}
              selected={selected === option.id}
              onSelect={() => setSelected(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-[18px] pb-[10px] pt-[8px]">
        <TouchableOpacity
          onPress={onAdjust}
          activeOpacity={0.85}
          className="items-center justify-center rounded-full py-[17px]"
          style={{ experimental_backgroundImage: CTA_GRADIENT }}
        >
          <Text className="text-[16px] text-white" style={textStyle('semibold')}>
            Adjust Schedule
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function RecommendationCard() {
  return (
    <View className="rounded-[18px] bg-white px-[18px] pb-[18px] pt-[16px]">
      <Text className="text-[15px] text-light-inkStrong" style={textStyle('semibold')}>
        Recommended Leaving
      </Text>

      <View className="my-[14px] h-[1px] bg-light-line" />

      <View className="flex-row">
        <TimeColumn
          dotColor="#F34A4D"
          label="Recommended"
          labelClass="text-[#F34A4D]"
          time={RECOMMENDATION.recommended.time}
          timeClass="text-[#F34A4D]"
          onTime={RECOMMENDATION.recommended.onTime}
          onTimeClass="text-[#F34A4D]"
        />
        <TimeColumn
          dotColor="#C6C6CC"
          label="Previous"
          labelClass="text-light-faint"
          time={RECOMMENDATION.previous.time}
          timeClass="text-light-hint"
          onTime={RECOMMENDATION.previous.onTime}
          onTimeClass="text-light-faint"
        />
      </View>
    </View>
  );
}

function TimeColumn({
  dotColor,
  label,
  labelClass,
  time,
  timeClass,
  onTime,
  onTimeClass,
}: {
  dotColor: string;
  label: string;
  labelClass: string;
  time: string;
  timeClass: string;
  onTime: string;
  onTimeClass: string;
}) {
  return (
    <View className="flex-1">
      <View className="flex-row items-center">
        <View className="mr-[6px] h-[7px] w-[7px] rounded-full" style={{ backgroundColor: dotColor }} />
        <Text className={`text-[13px] ${labelClass}`} style={textStyle('semibold')}>
          {label}
        </Text>
      </View>
      <Text className={`mt-[8px] text-[30px] ${timeClass}`} style={textStyle('bold')}>
        {time}
      </Text>
      <Text className={`mt-[4px] text-[12px] ${onTimeClass}`} style={textStyle('medium')}>
        {onTime}
      </Text>
    </View>
  );
}
