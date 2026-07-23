import { synthesizeVoice } from '../../../services/chat/client';

type AudioContextInstance = InstanceType<
  typeof import('react-native-audio-api')['AudioContext']
>;
type AudioSource = ReturnType<AudioContextInstance['createBufferSource']>;

let activeContext: AudioContextInstance | null = null;
let activeSource: AudioSource | null = null;
let playbackGeneration = 0;

export async function stopVoicePlayback() {
  playbackGeneration += 1;
  const source = activeSource;
  const context = activeContext;
  activeSource = null;
  activeContext = null;

  if (source) {
    try {
      source.stop();
    } catch {
      // The source may already have ended.
    }
  }

  if (context) {
    await context.close().catch(() => undefined);
  }
}

export async function playVoiceSummary(text: string, onEnded?: () => void) {
  await stopVoicePlayback();
  const generation = playbackGeneration;

  const [audioBytes, { AudioContext }] = await Promise.all([
    synthesizeVoice(text),
    import('react-native-audio-api'),
  ]);
  const context = new AudioContext();
  if (generation !== playbackGeneration) {
    await context.close();
    return;
  }

  try {
    const buffer = await context.decodeAudioData(audioBytes);
    const source = context.createBufferSource();

    source.buffer = buffer;
    source.connect(context.destination);
    source.onEnded = () => {
      const wasActive = activeSource === source;
      if (wasActive) {
        activeSource = null;
        activeContext = null;
      }
      context
        .close()
        .catch(() => undefined)
        .finally(() => {
          if (wasActive) onEnded?.();
        });
    };

    activeContext = context;
    activeSource = source;
    await context.resume();
    source.start(context.currentTime);
  } catch (error) {
    if (activeContext === context) {
      activeContext = null;
      activeSource = null;
    }
    await context.close().catch(() => undefined);
    throw error;
  }
}
