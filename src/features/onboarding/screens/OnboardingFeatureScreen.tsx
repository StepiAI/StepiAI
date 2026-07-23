import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { textStyle } from '../../../shared/theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const onboardingStep1 = require('../../../assets/images/onboarding/onboarding_step1.png');
const onboardingStep2 = require('../../../assets/images/onboarding/onboarding_step2.png');
const onboardingStep3 = require('../../../assets/images/onboarding/onboarding_step3.png');
const onboardingStep4 = require('../../../assets/images/onboarding/onboarding_step4.png');
const onboardingStep5 = require('../../../assets/images/onboarding/onboarding_step5.png');

interface StepItem {
  id: number;
  image: ImageSourcePropType;

  titlePrefix?: string;
  titleHighlight: string;
  titleSuffix?: string;

  subtitle: string;

  bgCss: string;

  titleHighlightColor?: string;

  hasWhiteFade?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  imageOffsetY?: number;
}

const ONBOARDING_STEPS: StepItem[] = [
  {
    id: 1,
    image: onboardingStep1,
    titleHighlight: 'Plan anything',
    titleSuffix: ', your way',
    subtitle: 'Create schedules manually or simply chat with AI',

    bgCss: 'linear-gradient(180deg, #DDEBFF 0%, #F5F8FF 54%, #FFFFFF 100%)',
    titleHighlightColor: '#1877F2',

    hasWhiteFade: true,
    imageWidth: 0.88,
    imageHeight: 0.9,
    imageOffsetY: -4,
  },
  {
    id: 2,
    image: onboardingStep2,
    titlePrefix: 'Just ',
    titleHighlight: 'tell STEPI',
    titleSuffix: ' your goal',
    subtitle:
      'Our AI Assistant will understand and create the best unoverlapped schedule for you',

    bgCss: 'linear-gradient(180deg, #8EDDFB 0%, #C5B9FA 29%, #F5C7E9 57%, #FFFFFF 92%)',
    titleHighlightColor: '#8B5CF6',

    hasWhiteFade: true,
    imageWidth: 0.94,
    imageHeight: 0.96,
    imageOffsetY: -8,
  },
  {
    id: 3,
    image: onboardingStep3,
    titleHighlight: 'AI Chatbot',
    titleSuffix: ' organizes everything',
    subtitle: 'Tell STEPI AI your plan, and AI will handle the rest',

    bgCss: 'linear-gradient(180deg, #D7EAFF 0%, #F0E6FF 34%, #FFF1F8 66%, #FFFFFF 94%)',
    titleHighlightColor: '#D564DD',

    hasWhiteFade: true,
    imageWidth: 0.94,
    imageHeight: 0.95,
    imageOffsetY: -4,
  },
  {
    id: 4,
    image: onboardingStep4,
    titleHighlight: 'Talk',
    titleSuffix: ' to STEPI',
    subtitle: 'Use your voice and say “Hi, STEPI” to get things done',

    bgCss: 'linear-gradient(180deg, #92DDFB 0%, #C4C5FA 34%, #F2CAE9 65%, #FFFFFF 94%)',
    titleHighlightColor: '#1877F2',

    hasWhiteFade: true,
    imageWidth: 0.91,
    imageHeight: 0.95,
    imageOffsetY: -5,
  },
  {
    id: 5,
    image: onboardingStep5,
    titlePrefix: 'AI Chatbot ',
    titleHighlight: 'checks everything',
    subtitle:
      'No more conflicts, heavy traffic, bad weather, or overloaded days',

    bgCss: 'linear-gradient(180deg, #D4E8FF 0%, #E9E1FF 36%, #FFF3FA 67%, #FFFFFF 94%)',
    titleHighlightColor: '#D45DDB',

    hasWhiteFade: true,
    imageWidth: 0.94,
    imageHeight: 0.96,
    imageOffsetY: -4,
  },
];

interface OnboardingFeatureScreenProps {
  onFinish: () => void;
}

export function OnboardingFeatureScreen({
  onFinish,
}: OnboardingFeatureScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<StepItem>>(null);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);

    if (index >= 0 && index < ONBOARDING_STEPS.length) {
      setCurrentIndex(index);
    }
  };

  const handleContinue = () => {
    const isLastStep = currentIndex === ONBOARDING_STEPS.length - 1;

    if (isLastStep) {
      onFinish();
      return;
    }

    const nextIndex = currentIndex + 1;

    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });

    setCurrentIndex(nextIndex);
  };

  const handleStepPress = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });

    setCurrentIndex(index);
  };

  const renderItem = useCallback(({ item }: { item: StepItem }) => {
    const graphicHeight =
      SCREEN_HEIGHT < 750
        ? SCREEN_HEIGHT * 0.48
        : Math.min(SCREEN_HEIGHT * 0.56, 535);

    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          height: graphicHeight,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      >
        <View className="flex-1 items-center justify-center px-4">
          <Image
            source={item.image}
            resizeMode="contain"
            fadeDuration={0}
            style={{
              width: SCREEN_WIDTH * (item.imageWidth ?? 0.9),
              height: graphicHeight * (item.imageHeight ?? 0.92),
              transform: [
                {
                  translateY: item.imageOffsetY ?? 0,
                },
              ],
            }}
          />
        </View>

        {item.hasWhiteFade && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: graphicHeight * 0.34,
              experimental_backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0.92) 75%, #FFFFFF 100%)',
            }}
          />
        )}
      </View>
    );
  }, []);

  const currentStep = ONBOARDING_STEPS[currentIndex];
  const isLastStep = currentIndex === ONBOARDING_STEPS.length - 1;

  return (
    <View
      style={
        {
          flex: 1,
          experimental_backgroundImage: currentStep.bgCss,
        } as any
      }
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView
        edges={['top', 'bottom']}
        style={{ flex: 1, backgroundColor: 'transparent' }}
      >
        {/* Header */}
        <View className="h-12 flex-row items-center justify-end px-6">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onFinish}
            hitSlop={{
              top: 16,
              bottom: 16,
              left: 16,
              right: 16,
            }}
          >
            <Text
              className="text-[15px] text-gray-500"
              style={textStyle('medium')}
            >
              Skip
            </Text>
          </TouchableOpacity>
        </View>


        {/* Illustration carousel */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_STEPS}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          decelerationRate="fast"
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={false}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={renderItem}
          style={{ flexGrow: 0 }}
        />

        {/* Content */}
        <View className="flex-1 items-center bg-white px-7 pt-4">
          <Text
            className="mb-2 text-center text-[24px] leading-8 text-gray-950"
            style={textStyle('bold')}
          >
            {currentStep.titlePrefix}

            <Text
              style={{
                color: currentStep.titleHighlightColor ?? '#3B82F6',
              }}
            >
              {currentStep.titleHighlight}
            </Text>

            {currentStep.titleSuffix}
          </Text>

          <Text
            className="px-3 text-center text-[14px] leading-[21px] text-gray-500"
            style={textStyle('regular')}
          >
            {currentStep.subtitle}
          </Text>

          {/* Pagination */}
          <View className="mt-7 flex-row items-center justify-center gap-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const isActive = index === currentIndex;

              return (
                <TouchableOpacity
                  key={step.id}
                  activeOpacity={0.7}
                  onPress={() => handleStepPress(index)}
                  hitSlop={{
                    top: 12,
                    bottom: 12,
                    left: 6,
                    right: 6,
                  }}
                >
                  <View
                    className={`h-[5px] rounded-full ${isActive
                        ? 'w-8 bg-[#4F6BFF]'
                        : 'w-[5px] bg-gray-300'
                      }`}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Flexible empty space */}
          <View className="flex-1" />

          {/* Continue button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinue}
            className="mb-2 h-[56px] w-full items-center justify-center overflow-hidden rounded-full shadow-lg shadow-blue-500/30"
            style={{
              experimental_backgroundImage:
                'linear-gradient(90deg, #1877F2 0%, #4D67F5 52%, #7564FA 100%)',
            }}
          >
            <Text
              className="text-[16px] text-white"
              style={textStyle('bold')}
            >
              {isLastStep ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}