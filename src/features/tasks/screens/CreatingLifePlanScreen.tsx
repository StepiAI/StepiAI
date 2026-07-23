import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshGradient } from '../../../shared/components/MeshGradient';
import { textStyle } from '../../../shared/theme/typography';
import { LifePlanLogo } from '../components/LifePlanLogo';
import { PROGRESS_TRACK_COLOR, LIFE_PLAN_GRADIENT } from '../theme';

const FILL_DURATION_MS = 1600;

export function CreatingLifePlanScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: FILL_DURATION_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 items-center justify-center px-[40px]">
        <LifePlanLogo />

        <Text
          className="mt-[26px] text-[16px] text-light-inkStrong"
          style={textStyle('semibold')}
        >
          Creating your life plan...
        </Text>

        <View
          className="mt-[18px] h-[4px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: PROGRESS_TRACK_COLOR }}
          onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
        >
          {trackWidth > 0 ? (
            <Animated.View
              className="absolute left-0 h-full rounded-full"
              style={{
                width: fillWidth,
                backgroundColor: '#2E7BE0',
                experimental_backgroundImage: LIFE_PLAN_GRADIENT,
              }}
            />
          ) : null}
        </View>
      </View>

      <MeshGradient className="h-[220px]" />
    </SafeAreaView>
  );
}
