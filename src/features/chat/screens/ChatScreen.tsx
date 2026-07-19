import { useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { textStyle } from '../../../shared/theme/typography';
import { ChatComposer } from '../components/ChatComposer';
import { MessageBubble } from '../components/MessageBubble';
import { useChat } from '../hooks/useChat';

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-[24px]">
      <Text
        className="text-center text-[17px] text-light-inkStrong"
        style={textStyle('semibold')}
      >
        Ask me about your schedule
      </Text>
      <Text
        className="mt-[6px] text-center text-[14px] leading-[20px] text-light-muted"
        style={textStyle('regular')}
      >
        Try "add a dentist appointment Friday at 10" or "what's on my plate
        tomorrow?"
      </Text>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View className="mb-[14px] self-start rounded-[18px] bg-light-bubble px-[18px] py-[14px]">
      <Text className="text-[15px] text-light-faint" style={textStyle('medium')}>
        · · ·
      </Text>
    </View>
  );
}

export function ChatScreen() {
  const { messages, loading, sending, error, sendError, send, refresh } = useChat();
  const scrollRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView className="flex-1 bg-light-sheet" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="items-center pb-[14px] pt-[6px]">
        <Text className="text-[19px] text-light-inkStrong" style={textStyle('bold')}>
          Chatbot
        </Text>
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
          <EmptyState />
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

        <ChatComposer onSend={send} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
