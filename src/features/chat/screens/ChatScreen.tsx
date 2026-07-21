import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { textStyle } from '../../../shared/theme/typography';
import { GradientText } from '../../../shared/components/GradientText';
import {
  BookIcon,
  CalendarIcon,
  ChevronLeft,
  ClockIcon,
  EditIcon,
} from '../../../shared/components/Icons';
import { ChatComposer } from '../components/ChatComposer';
import { MessageBubble } from '../components/MessageBubble';
import { VoiceAssistantScreen } from './VoiceAssistantScreen';
import { useChat } from '../hooks/useChat';
import type { MainTabParamList } from '../../../app/navigation/types';

const SUGGESTIONS = [
  { icon: CalendarIcon, label: "Summarize today's schedule" },
  { icon: ClockIcon, label: 'Find free time this week' },
  { icon: BookIcon, label: 'Build a study schedule' },
];

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-between px-[18px] pb-[8px] pt-[20px]">
      <GradientText lines={['Ask me anything about', 'your schedule']} width={320} align="left" />

      <View className="w-full gap-[4px]">
        {SUGGESTIONS.map(({ icon: Icon, label }) => (
          <TouchableOpacity
            key={label}
            activeOpacity={0.6}
            onPress={() => onSuggestion(label)}
            className="flex-row items-center gap-[12px] rounded-[12px] px-[10px] py-[10px]"
          >
            <Icon />
            <Text className="text-[14px] text-light-ink" style={textStyle('regular')}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(600 - delay),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [delay, translateY]);

  return (
    <Animated.View
      style={{
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#A0A0A8',
        transform: [{ translateY }],
      }}
    />
  );
}

function TypingIndicator() {
  return (
    <View className="mb-[14px] flex-row items-center gap-[5px] self-start rounded-[18px] border border-light-line bg-light-bubble px-[18px] py-[16px]">
      <TypingDot delay={0} />
      <TypingDot delay={120} />
      <TypingDot delay={240} />
    </View>
  );
}

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return visible;
}

export function ChatScreen() {
  const { messages, loading, sending, error, sendError, send, refresh, clear } = useChat();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const [voiceVisible, setVoiceVisible] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const confirmClear = () => {
    if (messages.length === 0) return;

    Alert.alert('Start a new chat?', 'This clears your current conversation.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New chat', style: 'destructive', onPress: clear },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-light-canvas" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center justify-between px-[18px] pb-[14px] pt-[6px]">
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
          accessibilityLabel="Back"
          className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white/70"
        >
          <ChevronLeft size={13} />
        </TouchableOpacity>
        <Text className="text-[19px] text-light-inkStrong" style={textStyle('semibold')}>
          Chatbot STEPI AI
        </Text>
        <TouchableOpacity
          onPress={confirmClear}
          activeOpacity={0.7}
          accessibilityLabel="New chat"
          className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white/70"
        >
          <EditIcon size={20} />
        </TouchableOpacity>
      </View>

      <View className="h-[1px] bg-light-line" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-[24px]">
            <Text
              className="text-center text-[15px] text-light-inkStrong"
              style={textStyle('semibold')}
            >
              Couldn't load your chat
            </Text>
            <Text
              className="mt-[6px] text-center text-[13px] text-light-muted"
              style={textStyle('regular')}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={refresh}
              activeOpacity={0.8}
              className="mt-[16px] rounded-[10px] bg-light-accent px-[20px] py-[10px]"
            >
              <Text className="text-[13px] text-white" style={textStyle('semibold')}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        ) : messages.length === 0 && !sending ? (
          <EmptyState onSuggestion={send} />
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-[18px]"
            contentContainerClassName="py-[18px]"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} onQuickReply={send} />
            ))}

            {sending ? <TypingIndicator /> : null}
          </ScrollView>
        )}

        {sendError ? (
          <Text
            className="px-[18px] pb-[6px] text-[12px] text-light-muted"
            style={textStyle('regular')}
          >
            {sendError}
          </Text>
        ) : null}

        <View style={{ paddingBottom: keyboardVisible ? 0 : insets.bottom }}>
          <ChatComposer onSend={send} onVoicePress={() => setVoiceVisible(true)} />
        </View>
      </KeyboardAvoidingView>

      <VoiceAssistantScreen
        visible={voiceVisible}
        onClose={() => setVoiceVisible(false)}
        topInset={insets.top}
        bottomInset={insets.bottom}
      />
    </SafeAreaView>
  );
}
