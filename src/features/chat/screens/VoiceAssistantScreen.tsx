import Voice, {
  type SpeechErrorEvent,
  type SpeechResultsEvent,
} from '@react-native-voice/voice';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import {
  CloseIcon,
  MicIcon,
  SendIcon,
  StopIcon,
} from '../../../shared/components/Icons';
import {
  softGradientCss,
  voiceBackgroundCss,
} from '../../../shared/theme/gradient';
import { textStyle } from '../../../shared/theme/typography';
import { ProposalCard } from '../components/ProposalCard';
import { readChatProposal } from '../utils/parseAssistantContent';
import {
  playVoiceSummary,
  stopVoicePlayback,
} from '../utils/voicePlayback';

const ANDROID_COMPLETE_SILENCE_MS = 1800;
const ANDROID_POSSIBLE_SILENCE_MS = 1200;

const FINAL_RESULT_GRACE_MS = 450;
const MANUAL_STOP_GRACE_MS = 600;
const EMPTY_TURN_RETRY_MS = 900;
const INITIAL_LISTEN_DELAY_MS = 500;

const NEXT_TURN_DELAY_MS = Platform.OS === 'ios' ? 750 : 450;
const PLAYBACK_WATCHDOG_MS = 90_000;

type VoicePhase =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'proposal';

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

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    return `${err.status} — ${err.message}`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'Could not reach the voice assistant.';
}

function describeSpeechError(event: SpeechErrorEvent): string {
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
  const phaseRef = useRef<VoicePhase>('idle');
  const proposalVisibleRef = useRef(false);

  const transcriptRef = useRef('');
  const partialTranscriptRef = useRef('');
  const finalTranscriptRef = useRef('');
  const speechEndedRef = useRef(false);

  const endTurnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const nextTurnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /*
   * These refs break the circular dependency:
   *
   * scheduleNextTurn -> startListening
   * scheduleRecognitionFinish -> submitTranscript
   */
  const startListeningRef = useRef<() => Promise<void>>(async () => {});
  const submitTranscriptRef = useRef<
    (providedContent?: string) => Promise<void>
  >(async () => {});

  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] =
    useState<SendVoiceMessageResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const proposal =
    response
      ? (readChatProposal(
          response.popup?.kind === 'proposal'
            ? response.popup.data
            : null,
        ) ?? readChatProposal(response.parsed))
      : null;

  const setVoicePhase = useCallback((nextPhase: VoicePhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const clearEndTurnTimer = useCallback(() => {
    if (!endTurnTimerRef.current) {
      return;
    }

    clearTimeout(endTurnTimerRef.current);
    endTurnTimerRef.current = null;
  }, []);

  const clearNextTurnTimer = useCallback(() => {
    if (!nextTurnTimerRef.current) {
      return;
    }

    clearTimeout(nextTurnTimerRef.current);
    nextTurnTimerRef.current = null;
  }, []);

  const clearVoiceTimers = useCallback(() => {
    clearEndTurnTimer();
    clearNextTurnTimer();
  }, [clearEndTurnTimer, clearNextTurnTimer]);

  const clearTranscript = useCallback(() => {
    transcriptRef.current = '';
    partialTranscriptRef.current = '';
    finalTranscriptRef.current = '';

    setTranscript('');
  }, []);

  const stopPlayback = useCallback(() => {
    void stopVoicePlayback().catch(playbackError => {
      console.warn(
        '[Voice] failed to stop playback cleanly:',
        playbackError,
      );
    });
  }, []);

  /**
   * Schedules the next microphone turn.
   *
   * Listening only restarts when the current phase is idle. It never
   * restarts while the assistant is processing, speaking, or showing
   * a proposal.
   */
  const scheduleNextTurn = useCallback(
    (delay = NEXT_TURN_DELAY_MS) => {
      clearNextTurnTimer();

      if (
        !visibleRef.current ||
        phaseRef.current !== 'idle' ||
        proposalVisibleRef.current
      ) {
        return;
      }

      nextTurnTimerRef.current = setTimeout(() => {
        nextTurnTimerRef.current = null;

        if (
          !visibleRef.current ||
          phaseRef.current !== 'idle' ||
          proposalVisibleRef.current
        ) {
          return;
        }

        void startListeningRef.current();
      }, delay);
    },
    [clearNextTurnTimer],
  );

  /**
   * Waits briefly for the native recognizer to send its final result,
   * then submits the completed user turn.
   *
   * iOS often sends onSpeechEnd before the final onSpeechResults event.
   */
  const scheduleRecognitionFinish = useCallback(
    (delay = FINAL_RESULT_GRACE_MS) => {
      clearEndTurnTimer();

      endTurnTimerRef.current = setTimeout(() => {
        endTurnTimerRef.current = null;

        if (
          !visibleRef.current ||
          phaseRef.current !== 'listening'
        ) {
          return;
        }

        const content = (
          finalTranscriptRef.current ||
          partialTranscriptRef.current ||
          transcriptRef.current
        ).trim();

        if (!content) {
          setVoicePhase('idle');
          scheduleNextTurn(EMPTY_TURN_RETRY_MS);
          return;
        }

        void submitTranscriptRef.current(content);
      }, delay);
    },
    [
      clearEndTurnTimer,
      scheduleNextTurn,
      setVoicePhase,
    ],
  );

  const requestMicrophonePermission =
    useCallback(async (): Promise<boolean> => {
      if (Platform.OS !== 'android') {
        return true;
      }

      const permission =
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

      const alreadyGranted =
        await PermissionsAndroid.check(permission);

      if (alreadyGranted) {
        return true;
      }

      const result = await PermissionsAndroid.request(permission, {
        title: 'Microphone permission',
        message:
          'StepiAI needs microphone access to understand your speech.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      });

      return result === PermissionsAndroid.RESULTS.GRANTED;
    }, []);

  const startListening = useCallback(async () => {
    if (
      !visibleRef.current ||
      phaseRef.current !== 'idle' ||
      proposalVisibleRef.current
    ) {
      return;
    }

    clearVoiceTimers();

    setError(null);
    setSpeechError(null);
    setAudioError(null);

    /*
     * Each recognition session is one user turn. A new turn should not
     * contain partial results from the previous turn.
     */
    clearTranscript();
    speechEndedRef.current = false;

    try {
      const hasPermission = await requestMicrophonePermission();

      if (!hasPermission) {
        setSpeechError(
          'Microphone permission is required to use voice input.',
        );
        return;
      }

      const available = await Voice.isAvailable();

      if (!available) {
        setSpeechError(
          'Speech recognition is not available on this device.',
        );
        return;
      }

      /*
       * Clean up any previous native recognition session before starting
       * a new one. cancel() may reject when no session exists, which is
       * safe to ignore.
       */
      await Voice.cancel().catch(() => undefined);

      if (
        !visibleRef.current ||
        phaseRef.current !== 'idle' ||
        proposalVisibleRef.current
      ) {
        return;
      }

      setVoicePhase('listening');

      await Voice.start(
        'id-ID',
        Platform.OS === 'android'
          ? {
              EXTRA_PARTIAL_RESULTS: true,
              EXTRA_MAX_RESULTS: 1,
              EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 800,
              EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS:
                ANDROID_COMPLETE_SILENCE_MS,
              EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS:
                ANDROID_POSSIBLE_SILENCE_MS,
            }
          : undefined,
      );
    } catch (startError) {
      console.error(
        '[Voice] failed to start speech recognition:',
        startError,
      );

      setVoicePhase('idle');
      setSpeechError(describeError(startError));
    }
  }, [
    clearTranscript,
    clearVoiceTimers,
    requestMicrophonePermission,
    setVoicePhase,
  ]);

  const stopListening = useCallback(async () => {
    if (phaseRef.current !== 'listening') {
      return;
    }

    clearEndTurnTimer();
    speechEndedRef.current = true;

    try {
      /*
       * Voice.stop() requests a final result from native recognition.
       * Submission is delayed because iOS may emit that final result
       * shortly after stop() resolves.
       */
      await Voice.stop();
    } catch (stopError) {
      console.error(
        '[Voice] failed to stop speech recognition:',
        stopError,
      );

      setSpeechError(describeError(stopError));
    } finally {
      scheduleRecognitionFinish(MANUAL_STOP_GRACE_MS);
    }
  }, [clearEndTurnTimer, scheduleRecognitionFinish]);

  /**
   * Keeps the assistant in speaking mode until the websocket has ended and
   * every queued native audio buffer has finished playing.
   */
  const playAssistantTurn = useCallback(
    async (summary: string): Promise<void> => {
      if (!summary.trim()) {
        return;
      }

      let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

      try {
        await Promise.race([
          playVoiceSummary(summary),
          new Promise<never>((_resolve, reject) => {
            watchdogTimer = setTimeout(() => {
              reject(
                new Error(
                  'Audio playback timed out before the response finished.',
                ),
              );
            }, PLAYBACK_WATCHDOG_MS);
          }),
        ]);
      } catch (playbackError) {
        console.error(
          '[Voice] TTS websocket playback failed:',
          playbackError,
        );

        await stopVoicePlayback().catch(stopError => {
          console.error(
            '[Voice] failed to stop assistant playback:',
            stopError,
          );
        });

        if (visibleRef.current) {
          setAudioError(describeError(playbackError));
        }
      } finally {
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
        }
      }
    },
    [],
  );

  const submitTranscript = useCallback(
    async (providedContent?: string) => {
      const content = (
        providedContent ||
        finalTranscriptRef.current ||
        partialTranscriptRef.current ||
        transcriptRef.current
      ).trim();

      if (
        !visibleRef.current ||
        !content ||
        phaseRef.current === 'processing' ||
        phaseRef.current === 'speaking' ||
        phaseRef.current === 'proposal'
      ) {
        return;
      }

      clearVoiceTimers();
      setVoicePhase('processing');

      setError(null);
      setSpeechError(null);
      setAudioError(null);

      /*
       * Capture the text before clearing the current recognition turn.
       * This prevents late speech events from modifying the submitted
       * message.
       */
      clearTranscript();

      await Voice.cancel().catch(cancelError => {
        console.warn(
          '[Voice] failed to close voice input before responding:',
          cancelError,
        );
      });

      try {
        const nextResponse = await sendVoiceMessage(content);

        if (!visibleRef.current) {
          return;
        }

        const nextProposal =
          readChatProposal(
            nextResponse.popup?.kind === 'proposal'
              ? nextResponse.popup.data
              : null,
          ) ?? readChatProposal(nextResponse.parsed);

        proposalVisibleRef.current = Boolean(nextProposal);

        setResponse(nextResponse);

        try {
          await onConversationChanged?.();
        } catch (refreshError) {
          console.error(
            '[Voice] failed to refresh the conversation:',
            refreshError,
          );
        }

        if (!visibleRef.current) {
          return;
        }

        setVoicePhase('speaking');

        await playAssistantTurn(nextResponse.speech.summary);

        if (!visibleRef.current) {
          return;
        }

        if (nextProposal) {
          setVoicePhase('proposal');
          return;
        }

        /*
         * The next microphone session starts only after assistant audio
         * has completely finished.
         */
        setVoicePhase('idle');
        scheduleNextTurn();
      } catch (submitError) {
        console.error(
          '[Voice] failed to send transcript:',
          submitError,
        );

        if (!visibleRef.current) {
          return;
        }

        /*
         * Restore the transcript after a failed request so the user can
         * retry without repeating their voice input.
         */
        transcriptRef.current = content;
        setTranscript(content);

        proposalVisibleRef.current = false;

        setError(describeError(submitError));
        setVoicePhase('idle');
      }
    },
    [
      clearTranscript,
      clearVoiceTimers,
      onConversationChanged,
      playAssistantTurn,
      scheduleNextTurn,
      setVoicePhase,
    ],
  );

  /*
   * Keep method refs updated for timer callbacks.
   */
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  useEffect(() => {
    submitTranscriptRef.current = submitTranscript;
  }, [submitTranscript]);

  /*
   * Keep the proposal ref synchronized with the rendered proposal.
   */
  useEffect(() => {
    proposalVisibleRef.current = Boolean(proposal);
  }, [proposal]);

  /*
   * Register native speech recognition event handlers.
   */
  useEffect(() => {
    Voice.onSpeechStart = () => {
      if (
        !visibleRef.current ||
        phaseRef.current !== 'listening'
      ) {
        return;
      }

      speechEndedRef.current = false;
      setSpeechError(null);
    };

    Voice.onSpeechPartialResults = (
      event: SpeechResultsEvent,
    ) => {
      if (
        !visibleRef.current ||
        phaseRef.current !== 'listening'
      ) {
        return;
      }

      const content = event.value?.[0]?.trim();

      if (!content) {
        return;
      }

      partialTranscriptRef.current = content;
      transcriptRef.current = content;

      setTranscript(content);
      setSpeechError(null);
    };

    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      if (
        !visibleRef.current ||
        phaseRef.current !== 'listening'
      ) {
        return;
      }

      const content = event.value?.[0]?.trim();

      if (content) {
        finalTranscriptRef.current = content;
        transcriptRef.current = content;

        setTranscript(content);
        setSpeechError(null);
      }

      if (speechEndedRef.current) {
        scheduleRecognitionFinish(FINAL_RESULT_GRACE_MS);
      }
    };

    Voice.onSpeechEnd = () => {
      if (
        !visibleRef.current ||
        phaseRef.current !== 'listening'
      ) {
        return;
      }

      speechEndedRef.current = true;

      /*
       * iOS may emit onSpeechEnd before onSpeechResults. The grace
       * period lets the final transcript arrive before submission.
       */
      scheduleRecognitionFinish(FINAL_RESULT_GRACE_MS);
    };

    Voice.onSpeechError = (event: SpeechErrorEvent) => {
      /*
       * Voice.cancel() can emit an error after the app has already
       * changed to processing or speaking. Ignore those expected errors.
       */
      if (
        !visibleRef.current ||
        phaseRef.current !== 'listening'
      ) {
        return;
      }

      const currentContent = (
        finalTranscriptRef.current ||
        partialTranscriptRef.current ||
        transcriptRef.current
      ).trim();

      if (currentContent) {
        speechEndedRef.current = true;
        scheduleRecognitionFinish(FINAL_RESULT_GRACE_MS);
        return;
      }

      clearEndTurnTimer();
      speechEndedRef.current = true;
      setVoicePhase('idle');

      setSpeechError(describeSpeechError(event));

      /*
       * Continue the hands-free conversation after a recognition timeout
       * or empty recognition result.
       */
      scheduleNextTurn(EMPTY_TURN_RETRY_MS);
    };

    return () => {
      Voice.removeAllListeners();
    };
  }, [
    clearEndTurnTimer,
    scheduleNextTurn,
    scheduleRecognitionFinish,
    setVoicePhase,
  ]);

  /*
   * Start the first turn when the modal becomes visible, and completely
   * stop native audio when it becomes hidden.
   */
  useEffect(() => {
    visibleRef.current = visible;

    if (visible) {
      if (
        phaseRef.current === 'idle' &&
        !proposalVisibleRef.current
      ) {
        scheduleNextTurn(INITIAL_LISTEN_DELAY_MS);
      }

      return;
    }

    clearVoiceTimers();
    stopPlayback();

    void Voice.cancel().catch(cancelError => {
      console.warn(
        '[Voice] failed to cancel speech recognition:',
        cancelError,
      );
    });

    proposalVisibleRef.current = false;

    clearTranscript();
    setVoicePhase('idle');

    setResponse(null);
    setError(null);
    setSpeechError(null);
    setAudioError(null);
  }, [
    clearTranscript,
    clearVoiceTimers,
    scheduleNextTurn,
    setVoicePhase,
    stopPlayback,
    visible,
  ]);

  /*
   * Destroy the native speech-recognition module when the component
   * unmounts.
   */
  useEffect(
    () => () => {
      visibleRef.current = false;

      clearVoiceTimers();
      stopPlayback();

      void Voice.destroy().catch(destroyError => {
        console.warn(
          '[Voice] failed to destroy speech recognition:',
          destroyError,
        );
      });

      Voice.removeAllListeners();
    },
    [clearVoiceTimers, stopPlayback],
  );

  const close = useCallback(() => {
    visibleRef.current = false;
    proposalVisibleRef.current = false;

    clearVoiceTimers();
    stopPlayback();

    void Voice.cancel().catch(cancelError => {
      console.warn(
        '[Voice] failed to cancel speech recognition:',
        cancelError,
      );
    });

    clearTranscript();
    setVoicePhase('idle');

    setResponse(null);
    setError(null);
    setSpeechError(null);
    setAudioError(null);

    onClose();
  }, [
    clearTranscript,
    clearVoiceTimers,
    onClose,
    setVoicePhase,
    stopPlayback,
  ]);

  const handleVoiceProposalStatusChange = useCallback(
    (
      messageId: string,
      status: 'pending' | 'accepted' | 'dismissed',
    ) => {
      onProposalStatusChange?.(messageId, status);

      const shouldRefresh =
        status !== 'dismissed' ||
        proposal?.type === 'schedule_proposal';

      close();

      if (shouldRefresh) {
        void Promise.resolve(onConversationChanged?.()).catch(
          refreshError => {
            console.error(
              '[Voice] failed to refresh chat:',
              refreshError,
            );
          },
        );
      }
    },
    [
      close,
      onConversationChanged,
      onProposalStatusChange,
      proposal?.type,
    ],
  );

  const listening = phase === 'listening';
  const submitting = phase === 'processing';

  const trimmedTranscript = transcript.trim();

  const canSend =
    trimmedTranscript.length > 0 && phase === 'idle';

  const inputEditable = phase === 'idle';

  const buttonDisabled =
    phase === 'processing' ||
    phase === 'speaking' ||
    phase === 'proposal';

  const statusText =
    phase === 'processing'
      ? 'StepiAI is thinking…'
      : phase === 'listening'
        ? 'Listening…'
        : phase === 'speaking'
          ? 'StepiAI is speaking…'
          : phase === 'proposal'
            ? 'Review the proposal'
            : trimmedTranscript
              ? 'Ready to send'
              : 'Preparing your next turn…';

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
            accessibilityRole="button"
            accessibilityLabel="Close voice assistant"
            className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white/70"
          >
            <CloseIcon size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName={`items-center px-[24px] pb-[24px] ${
            proposal
              ? 'flex-grow justify-center pt-[30px]'
              : ''
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
                {statusText}
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
                {response.popup?.message ??
                  response.speech.summary}
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
              The response is shown above, but audio playback
              failed: {audioError}
            </Text>
          ) : null}
        </ScrollView>

        <View className="flex-row items-center gap-[12px] px-[18px] pb-[12px]">
          <View className="min-h-[48px] flex-1 justify-center rounded-[24px] border border-light-line bg-white/80 px-[18px]">
            <TextInput
              value={transcript}
              onChangeText={value => {
                finalTranscriptRef.current = '';
                partialTranscriptRef.current = '';
                transcriptRef.current = value;

                setTranscript(value);
                setError(null);
                setSpeechError(null);
              }}
              onSubmitEditing={() => {
                if (canSend) {
                  void submitTranscript();
                }
              }}
              placeholder="Type or paste your transcript…"
              placeholderTextColor="#A0A0A8"
              returnKeyType="send"
              editable={inputEditable}
              blurOnSubmit={false}
              className="text-[15px] text-light-ink"
              style={textStyle('regular')}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              if (listening) {
                void stopListening();
                return;
              }

              if (canSend) {
                void submitTranscript();
                return;
              }

              void startListening();
            }}
            disabled={buttonDisabled}
            activeOpacity={0.85}
            accessibilityRole="button"
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
              opacity: buttonDisabled ? 0.65 : 1,
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
