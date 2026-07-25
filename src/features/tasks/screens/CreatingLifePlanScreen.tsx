import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeshGradient } from '../../../shared/components/MeshGradient';
import { useTextStyle } from '../../../shared/theme/typography';
import { LifePlanLogo } from '../components/LifePlanLogo';
import { PROGRESS_TRACK_COLOR, LIFE_PLAN_GRADIENT } from '../theme';

// The bar creeps toward — but never reaches — 100% while the request is in
// flight, each stage slower than the last. Only `done` fills it the rest of
// the way, so the bar can't claim to be finished before the plan exists.
const CRAWL_STAGES = [
  { toValue: 0.55, duration: 900 },
  { toValue: 0.78, duration: 2200 },
  { toValue: 0.88, duration: 4500 },
  { toValue: 0.94, duration: 9000 },
  { toValue: 0.97, duration: 20000 },
];

const SETTLE_DURATION_MS = 280;

interface CreatingLifePlanScreenProps {
  /** Flips to true once the create request has settled. */
  done?: boolean;
  /** Called after the bar has animated to 100%. */
  onComplete?: () => void;
}

export function CreatingLifePlanScreen({
  done = false,
  onComplete,
}: CreatingLifePlanScreenProps) {
  const textStyle = useTextStyle();

  const progress = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (done) {
      return;
    }

    const anim = Animated.sequence(
      CRAWL_STAGES.map(stage =>
        Animated.timing(progress, {
          toValue: stage.toValue,
          duration: stage.duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [done, progress]);

  useEffect(() => {
    if (!done) {
      return;
    }

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: SETTLE_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) {
        onCompleteRef.current?.();
      }
    });
    return () => anim.stop();
  }, [done, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

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
