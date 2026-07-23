import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
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
import {
  CloseIcon,
  MicIcon,
  SendIcon,
  StopIcon,
} from '../../../shared/components/Icons';
import { ProposalCard } from '../components/ProposalCard';
import { readChatProposal } from '../utils/parseAssistantContent';
import { playVoiceSummary, stopVoicePlayback } from '../utils/voicePlayback';
import Voice, {
  type SpeechErrorEvent,
  type SpeechResultsEvent,
} from '@react-native-voice/voice';

interface VoiceAssistantScreenProps {
  visible: boolean;
  onClose: () => void;
  topInset: number;
  bottomInset: number;
  onConversationChanged?: () => void | Promise<void>;
  onProposalStatusChange?: (
    messageId: string,
    status: 'pending' | 'accepted' | 'dismissed',
  ) => void;
}

function describeError(err: unknown) {
  if (err instanceof ApiError) return `${err.status} — ${err.message}`;
  return err instanceof Error
    ? err.message
    : 'Could not reach the voice assistant.';
}

function describeSpeechError(event: SpeechErrorEvent) {
  return (
    event.error?.message ??
    'Speech recognition stopped. Please try again or type the transcript.'
  );
}

export function VoiceAssistantScreen({
  visible,
  onClose,
  topInset,
  bottomInset,
  onConversationChanged,
  onProposalStatusChange,
}: VoiceAssistantScreenProps) {
  const visibleRef = useRef(visible);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<SendVoiceMessageResponse | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
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
      Voice.cancel().catch(err => {
        console.warn('[Voice] failed to cancel speech recognition:', err);
      });
      setListening(false);
      setSpeaking(false);
    }
  }, [visible]);

  useEffect(
    () => () => {
      stopPlayback();
      Voice.destroy().catch(err => {
        console.warn('[Voice] failed to destroy speech recognition:', err);
      });
      Voice.removeAllListeners();
    },
    [],
  );

  useEffect(() => {
    const applySpeechResult = (event: SpeechResultsEvent) => {
      const nextTranscript = event.value?.[0]?.trim();
      if (!nextTranscript) return;

      setTranscript(nextTranscript);
      setSpeechError(null);
    };

    Voice.onSpeechStart = () => {
      setListening(true);
      setSpeechError(null);
    };
    Voice.onSpeechEnd = () => {
      setListening(false);
    };
    Voice.onSpeechResults = applySpeechResult;
    Voice.onSpeechPartialResults = applySpeechResult;
    Voice.onSpeechError = event => {
      setListening(false);
      setSpeechError(describeSpeechError(event));
    };

    return () => {
      Voice.removeAllListeners();
    };
  }, []);

  const trimmed = transcript.trim();
  const busy = submitting || listening;
  const canSend = trimmed.length > 0 && !busy;
  const proposal =
    response?.popup?.kind === 'proposal'
      ? readChatProposal(response.popup.data)
      : null;

  const requestMicrophonePermission = async () => {
    if (Platform.OS !== 'android') return true;

    const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) return true;

    const result = await PermissionsAndroid.request(permission, {
      title: 'Microphone permission',
      message: 'StepiAI needs microphone access to turn your speech into text.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    });

    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const startListening = async () => {
    if (submitting || listening) return;

    setError(null);
    setAudioError(null);
    setSpeechError(null);

    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setSpeechError('Microphone permission is required to use voice input.');
        return;
      }

      const available = await Voice.isAvailable();
      if (!available) {
        setSpeechError('Speech recognition is not available on this device.');
        return;
      }

      setListening(true);
      await Voice.start('id-ID');
    } catch (err) {
      console.error('[Voice] failed to start speech recognition:', err);
      setListening(false);
      setSpeechError(describeError(err));
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (err) {
      console.error('[Voice] failed to stop speech recognition:', err);
      setSpeechError(describeError(err));
    } finally {
      setListening(false);
    }
  };

  const submitTranscript = async () => {
    if (!canSend) return;
    const content = trimmed;
    setSubmitting(true);
    setError(null);
    setSpeechError(null);
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
    setListening(false);
    setResponse(null);
    setError(null);
    setSpeechError(null);
    setAudioError(null);
    onClose();
  };

  const handleVoiceProposalStatusChange = (
    messageId: string,
    status: 'pending' | 'accepted' | 'dismissed',
  ) => {
    onProposalStatusChange?.(messageId, status);
    setResponse(null);
    setError(null);
    setSpeechError(null);
    setAudioError(null);
    close();

    const shouldRefresh =
      status !== 'dismissed' || proposal?.type === 'schedule_proposal';
    if (shouldRefresh) {
      Promise.resolve(onConversationChanged?.()).catch(err => {
        console.error('[Voice] failed to refresh chat:', err);
      });
    }
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
          contentContainerClassName={`items-center px-[24px] pb-[24px] ${
            proposal ? 'flex-grow justify-center pt-[30px]' : ''
          }`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {response && proposal ? (
            <ProposalCard
              messageId={response.assistantMessage.id}
              proposal={proposal}
              status="pending"
              variant="voice"
              onStatusChange={handleVoiceProposalStatusChange}
              onNeedsFollowUp={onConversationChanged}
            />
          ) : (
            <>
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
                  : listening
                  ? 'Listening…'
                  : speaking
                  ? 'StepiAI is speaking…'
                  : 'Speak or send a transcript'}
              </Text>
            </>
          )}

          {response && !proposal ? (
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
          {speechError ? (
            <Text
              className="mt-[8px] text-center text-[12px] text-light-ink"
              style={textStyle('regular')}
            >
              {speechError}
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
              value={transcript}
              onChangeText={setTranscript}
              onSubmitEditing={submitTranscript}
              placeholder="Type or paste your transcript…"
              placeholderTextColor="#A0A0A8"
              returnKeyType="send"
              editable={!busy}
              className="text-[15px] text-light-ink"
              style={textStyle('regular')}
            />
          </View>
          <TouchableOpacity
            onPress={
              listening
                ? stopListening
                : canSend
                ? submitTranscript
                : startListening
            }
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityLabel={
              listening
                ? 'Stop voice input'
                : canSend
                ? 'Send voice transcript'
                : 'Start voice input'
            }
            className={`h-[56px] w-[56px] items-center justify-center rounded-full ${
              listening ? 'bg-[#E85D75]' : ''
            }`}
            style={{
              experimental_backgroundImage: listening
                ? undefined
                : softGradientCss,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : listening ? (
              <StopIcon />
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
