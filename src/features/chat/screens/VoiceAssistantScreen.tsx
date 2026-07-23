import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiError } from '../../../services/api/client';
import {
  sendVoiceMessage,
  type SendVoiceMessageResponse,
} from '../../../services/chat/client';
import { textStyle } from '../../../shared/theme/typography';
import {
  voiceBackgroundCss,
  softGradientCss,
} from '../../../shared/theme/gradient';
import { CloseIcon, MicIcon, SendIcon } from '../../../shared/components/Icons';
import { ProposalCard } from '../components/ProposalCard';
import { readChatProposal } from '../utils/parseAssistantContent';
import { playVoiceSummary, stopVoicePlayback } from '../utils/voicePlayback';

interface VoiceAssistantScreenProps {
  visible: boolean;
  onClose: () => void;
  topInset: number;
  bottomInset: number;
  onConversationChanged?: () => void | Promise<void>;
}

function describeError(err: unknown) {
  if (err instanceof ApiError) return `${err.status} — ${err.message}`;
  return err instanceof Error
    ? err.message
    : 'Could not reach the voice assistant.';
}

export function VoiceAssistantScreen({
  visible,
  onClose,
  topInset,
  bottomInset,
  onConversationChanged,
}: VoiceAssistantScreenProps) {
  const inputRef = useRef<TextInput>(null);
  const visibleRef = useRef(visible);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<SendVoiceMessageResponse | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const stopPlayback = () => {
    stopVoicePlayback().catch(err => {
      console.warn('[Voice] failed to stop playback cleanly:', err);
    });
  };

  useEffect(() => {
    visibleRef.current = visible;
    if (!visible) {
      stopPlayback();
      setSpeaking(false);
    }
  }, [visible]);

  useEffect(
    () => () => {
      stopPlayback();
    },
    [],
  );

  const trimmed = transcript.trim();
  const canSend = trimmed.length > 0 && !submitting;
  const proposal =
    response?.popup?.kind === 'proposal'
      ? readChatProposal(response.popup.data)
      : null;

  const submitTranscript = async () => {
    if (!canSend) return;
    const content = trimmed;
    setSubmitting(true);
    setError(null);
    setAudioError(null);

    try {
      const nextResponse = await sendVoiceMessage(content);
      if (!visibleRef.current) return;

      setResponse(nextResponse);
      setTranscript('');
      await onConversationChanged?.();

      setSpeaking(true);
      try {
        await playVoiceSummary(nextResponse.speech.summary, () =>
          setSpeaking(false),
        );
      } catch (err) {
        console.error('[Voice] failed to synthesize or play response:', err);
        setSpeaking(false);
        setAudioError(describeError(err));
      }
    } catch (err) {
      console.error('[Voice] failed to send transcript:', err);
      setError(describeError(err));
    } finally {
      if (visibleRef.current) setSubmitting(false);
    }
  };

  const close = () => {
    stopPlayback();
    setSpeaking(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          experimental_backgroundImage: voiceBackgroundCss,
          paddingTop: topInset,
          paddingBottom: bottomInset,
        }}
      >
        <View className="flex-row items-center justify-between px-[18px] pb-[14px] pt-[6px]">
          <View className="w-[46px]" />
          <Text
            className="text-[17px] text-light-inkStrong"
            style={textStyle('semibold')}
          >
            Voice Assistant STEPI AI
          </Text>
          <TouchableOpacity
            onPress={close}
            activeOpacity={0.7}
            accessibilityLabel="Close voice assistant"
            className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white/70"
          >
            <CloseIcon size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="items-center px-[24px] pb-[24px]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../../assets/chatbot.gif')}
            className="h-[220px] w-[220px]"
            resizeMode="contain"
          />

          <Text
            className="mb-[14px] text-[15px] text-light-muted"
            style={textStyle('medium')}
          >
            {submitting
              ? 'StepiAI is thinking…'
              : speaking
              ? 'StepiAI is speaking…'
              : 'Send a voice transcript'}
          </Text>

          {response ? (
            <View className="w-full rounded-[18px] border border-light-line bg-white/80 p-[16px]">
              {response.popup ? (
                <Text
                  className="text-[15px] text-light-inkStrong"
                  style={textStyle('semibold')}
                >
                  {response.popup.title}
                </Text>
              ) : null}
              <Text
                className={`${
                  response.popup ? 'mt-[6px]' : ''
                } text-[14px] leading-[20px] text-light-ink`}
                style={textStyle('medium')}
              >
                {response.popup?.message ?? response.speech.summary}
              </Text>

              {proposal ? (
                <ProposalCard
                  messageId={response.assistantMessage.id}
                  proposal={proposal}
                  status="pending"
                  onStatusChange={() => {
                    Promise.resolve(onConversationChanged?.()).catch(err => {
                      console.error('[Voice] failed to refresh chat:', err);
                    });
                  }}
                  onNeedsFollowUp={onConversationChanged}
                />
              ) : null}
            </View>
          ) : null}

          {error ? (
            <Text
              className="mt-[12px] text-center text-[12px] text-light-ink"
              style={textStyle('regular')}
            >
              {error}
            </Text>
          ) : null}
          {audioError ? (
            <Text
              className="mt-[8px] text-center text-[12px] text-light-muted"
              style={textStyle('regular')}
            >
              The response is shown above, but audio playback failed:{' '}
              {audioError}
            </Text>
          ) : null}
        </ScrollView>

        <View className="flex-row items-center gap-[12px] px-[18px] pb-[12px]">
          <View className="min-h-[48px] flex-1 justify-center rounded-[24px] border border-light-line bg-white/80 px-[18px]">
            <TextInput
              ref={inputRef}
              value={transcript}
              onChangeText={setTranscript}
              onSubmitEditing={submitTranscript}
              placeholder="Type or paste your transcript…"
              placeholderTextColor="#A0A0A8"
              returnKeyType="send"
              editable={!submitting}
              className="text-[15px] text-light-ink"
              style={textStyle('regular')}
            />
          </View>
          <TouchableOpacity
            onPress={
              canSend ? submitTranscript : () => inputRef.current?.focus()
            }
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityLabel={
              canSend ? 'Send voice transcript' : 'Enter voice transcript'
            }
            className="h-[56px] w-[56px] items-center justify-center rounded-full"
            style={{ experimental_backgroundImage: softGradientCss }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : canSend ? (
              <SendIcon />
            ) : (
              <MicIcon size={24} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
