import { useEffect, useRef } from 'react';
import { Animated, Image, StatusBar, Text, View } from 'react-native';
import { MeshGradient } from '../../../shared/components/MeshGradient';
import { textStyle } from '../../../shared/theme/typography';

interface SplashScreenProps {
  onFinish?: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger onFinish callback after 1.8 seconds if provided
    const timer = setTimeout(() => {
      onFinish?.();
    }, 1800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <MeshGradient>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          className="items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View className="h-28 w-28 items-center justify-center rounded-3xl bg-white/80 shadow-2xl shadow-purple-900/30">
            <Image
              source={require('../../../assets/images/Logo_STEPI.png')}
              className="h-20 w-20"
              resizeMode="contain"
            />
          </View>

          <Text
            className="mt-6 text-4xl tracking-[3px] text-white"
            style={textStyle('bold')}
          >
            STEPI AI
          </Text>

          <Text
            className="mt-2 text-md text-white/90 tracking-wide text-center"
            style={textStyle('medium')}
          >
            Your AI-Powered Life & Schedule Assistant
          </Text>
        </Animated.View>

      </View>
    </MeshGradient>
  );
}
