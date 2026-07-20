import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshGradient } from '../../../shared/components/MeshGradient';
import { textStyle } from '../../../shared/theme/typography';
import { StudyPlanLogo } from '../components/StudyPlanLogo';
import { PROGRESS_TRACK_COLOR, STUDY_PLAN_GRADIENT } from '../theme';

const BAR_WIDTH_RATIO = 0.32;
const LOOP_DURATION_MS = 1100;

export function CreatingStudyPlanScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const barWidth = trackWidth * BAR_WIDTH_RATIO;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: LOOP_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-barWidth, trackWidth],
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 items-center justify-center px-[40px]">
        <StudyPlanLogo />

        <Text
          className="mt-[26px] text-[16px] text-light-inkStrong"
          style={textStyle('semibold')}
        >
          Creating your study plan...
        </Text>

        <View
          className="mt-[18px] h-[4px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: PROGRESS_TRACK_COLOR }}
          onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
        >
          {trackWidth > 0 ? (
            <Animated.View
              className="absolute h-full rounded-full"
              style={{
                width: barWidth,
                backgroundColor: '#2E7BE0',
                experimental_backgroundImage: STUDY_PLAN_GRADIENT,
                transform: [{ translateX }],
              }}
            />
          ) : null}
        </View>
      </View>

      <MeshGradient className="h-[220px]" />
    </SafeAreaView>
  );
}
