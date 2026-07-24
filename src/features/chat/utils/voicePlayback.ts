import { AudioContext } from 'react-native-audio-api';

const STREAMING_TTS_URL =
  'wss://azurefoundryttsapi-production.up.railway.app/ws/tts';
const STREAMING_SAMPLE_RATE = 24000;
const STREAMING_CHANNELS = 1;
const FIRST_AUDIO_TIMEOUT_MS = 15000;
const AUDIO_IDLE_TIMEOUT_MS = 500;
const STREAMING_END_MARKER = '**END_OF_AUDIO**';

type AudioContextInstance = InstanceType<typeof AudioContext>;
type AudioQueueSource = ReturnType<
  AudioContextInstance['createBufferQueueSource']
>;

interface RiffParserState {
  mode: 'detecting' | 'pcm';
  pending: Uint8Array<ArrayBuffer>;
}

let activeContext: AudioContextInstance | null = null;
let activeQueueSource: AudioQueueSource | null = null;
let activeSocket: WebSocket | null = null;
let activeCancel: (() => Promise<void>) | null = null;
let playbackGeneration = 0;

function closeSocket(socket: WebSocket) {
  socket.onopen = null;
  socket.onmessage = null;
  socket.onerror = null;
  socket.onclose = null;

  try {
    socket.close(1000);
  } catch {
    // The socket may still be connecting or already closed.
  }
}

export async function stopVoicePlayback() {
  playbackGeneration += 1;
  const cancel = activeCancel;
  activeCancel = null;
  if (cancel) {
    await cancel();
    return;
  }

  const queueSource = activeQueueSource;
  const context = activeContext;
  const socket = activeSocket;
  activeQueueSource = null;
  activeContext = null;
  activeSocket = null;

  if (socket) closeSocket(socket);

  if (queueSource) {
    try {
      queueSource.onBufferEnded = null;
      queueSource.stop();
      queueSource.clearBuffers();
    } catch {
      // The source may already be stopped or detached.
    }
  }

  if (context) {
    await context.close().catch(() => undefined);
  }
}

export async function playVoiceSummary(text: string) {
  const content = text.trim();
  if (!content) return;

  await stopVoicePlayback();
  const generation = playbackGeneration;
  const context = new AudioContext({ sampleRate: STREAMING_SAMPLE_RATE });

  if (generation !== playbackGeneration) {
    await context.close();
    return;
  }

  const queueSource = context.createBufferQueueSource();
  const socket = new WebSocket(STREAMING_TTS_URL);
  const riffState: RiffParserState = {
    mode: 'detecting',
    pending: new Uint8Array(new ArrayBuffer(0)),
  };
  let queuedBuffers = 0;
  let endedBuffers = 0;
  let streamEnded = false;
  let started = false;
  let finished = false;
  let carryByte: number | null = null;
  let pendingBinaryMessages = 0;
  let audioIdleTimer: ReturnType<typeof setTimeout> | null = null;
  let messageQueue = Promise.resolve();

  let resolveCompletion!: () => void;
  let rejectCompletion!: (error: Error) => void;
  const completionPromise = new Promise<void>((resolve, reject) => {
    resolveCompletion = resolve;
    rejectCompletion = reject;
  });
  let completionSettled = false;

  const settleCompletion = (error?: Error) => {
    if (completionSettled) return;
    completionSettled = true;

    if (error) {
      rejectCompletion(error);
      return;
    }

    resolveCompletion();
  };

  const clearActivePlayback = () => {
    const wasActive =
      activeSocket === socket &&
      activeQueueSource === queueSource &&
      activeContext === context;

    if (wasActive) {
      activeSocket = null;
      activeQueueSource = null;
      activeContext = null;
      activeCancel = null;
    }

    return wasActive;
  };

  const clearAudioIdleTimer = () => {
    if (!audioIdleTimer) return;
    clearTimeout(audioIdleTimer);
    audioIdleTimer = null;
  };

  const finishPlayback = (error?: Error) => {
    if (finished) return Promise.resolve();
    finished = true;
    clearTimeout(firstAudioTimer);
    clearAudioIdleTimer();
    clearActivePlayback();
    closeSocket(socket);

    try {
      queueSource.onBufferEnded = null;
      queueSource.stop();
      queueSource.clearBuffers();
    } catch {
      // The queue may already have completed.
    }

    return context
      .close()
      .catch(() => undefined)
      .finally(() => {
        settleCompletion(error);
      });
  };

  const failPlayback = (error: Error) => {
    if (finished) return;
    finishPlayback(error);
  };

  const finishIfReady = () => {
    if (!streamEnded || endedBuffers < queuedBuffers) return;

    if (queuedBuffers === 0) {
      failPlayback(new Error('The TTS server returned no audio.'));
      return;
    }

    finishPlayback();
  };

  const endIncomingStream = () => {
    if (finished || streamEnded) return;
    streamEnded = true;
    clearAudioIdleTimer();
    closeSocket(socket);
    finishIfReady();
  };

  const scheduleAudioIdleEnd = () => {
    clearAudioIdleTimer();

    if (finished || streamEnded || !started || pendingBinaryMessages > 0) {
      return;
    }

    audioIdleTimer = setTimeout(() => {
      audioIdleTimer = null;

      if (finished || streamEnded || pendingBinaryMessages > 0) {
        return;
      }

      endIncomingStream();
    }, AUDIO_IDLE_TIMEOUT_MS);
  };

  const firstAudioTimer = setTimeout(() => {
    failPlayback(
      new Error('Timed out waiting for audio from the TTS websocket.'),
    );
  }, FIRST_AUDIO_TIMEOUT_MS);

  queueSource.connect(context.destination);
  queueSource.onBufferEnded = () => {
    endedBuffers += 1;
    finishIfReady();
  };

  activeContext = context;
  activeQueueSource = queueSource;
  activeSocket = socket;
  activeCancel = () => finishPlayback();

  (socket as WebSocket & { binaryType: 'arraybuffer' }).binaryType =
    'arraybuffer';

  socket.onopen = () => {
    if (generation !== playbackGeneration || finished) return;
    socket.send(content);
  };

  socket.onmessage = event => {
    if (generation !== playbackGeneration || finished) return;
    const isBinaryMessage = typeof event.data !== 'string';

    if (isBinaryMessage) {
      pendingBinaryMessages += 1;
      clearAudioIdleTimer();
    }

    messageQueue = messageQueue
      .then(async () => {
        if (generation !== playbackGeneration || finished) return;
        const data = event.data;

        if (typeof data === 'string') {
          if (!isStreamingEndMarker(data)) return;
          endIncomingStream();
          return;
        }

        const bytes = await readBinaryMessage(data);
        const pcmBytes = extractPcmBytes(bytes, riffState);
        if (pcmBytes.byteLength === 0) return;

        const result = int16PcmToFloat32(pcmBytes, carryByte);
        carryByte = result.carryByte;
        if (result.samples.length === 0) return;

        const buffer = context.createBuffer(
          STREAMING_CHANNELS,
          result.samples.length,
          STREAMING_SAMPLE_RATE,
        );
        buffer.copyToChannel(result.samples, 0);
        queueSource.enqueueBuffer(buffer);
        queuedBuffers += 1;

        if (!started) {
          await context.resume();
          if (generation !== playbackGeneration || finished) return;
          // v0.13 defaults the queue offset to -1 and rejects it; pass zero.
          queueSource.start(context.currentTime, 0);
          started = true;
          clearTimeout(firstAudioTimer);
        }
      })
      .catch(error => failPlayback(describePlaybackError(error)))
      .finally(() => {
        if (!isBinaryMessage) return;
        pendingBinaryMessages = Math.max(0, pendingBinaryMessages - 1);
        scheduleAudioIdleEnd();
      });
  };

  socket.onerror = () => {
    failPlayback(new Error('Could not connect to the TTS websocket.'));
  };

  socket.onclose = event => {
    if (generation !== playbackGeneration || finished || streamEnded) {
      return;
    }

    failPlayback(
      new Error(`The TTS websocket closed unexpectedly (${event.code}).`),
    );
  };

  await completionPromise;
}

function isStreamingEndMarker(value: string) {
  return value.trim().replace(/\\/g, '') === STREAMING_END_MARKER;
}

async function readBinaryMessage(data: unknown): Promise<ArrayBuffer> {
  if (data instanceof ArrayBuffer) return data;

  if (ArrayBuffer.isView(data)) {
    const source = new Uint8Array(
      data.buffer,
      data.byteOffset,
      data.byteLength,
    );
    const copy = new Uint8Array(new ArrayBuffer(data.byteLength));
    copy.set(source);
    return copy.buffer;
  }

  if (data && typeof data === 'object' && 'arrayBuffer' in data) {
    const blob = data as { arrayBuffer: () => Promise<ArrayBuffer> };
    return blob.arrayBuffer();
  }

  throw new Error('Received an unsupported TTS audio chunk.');
}

function extractPcmBytes(
  bytes: ArrayBuffer,
  state: RiffParserState,
): ArrayBuffer {
  if (state.mode === 'pcm') return bytes;

  state.pending = appendBytes(state.pending, new Uint8Array(bytes));
  if (state.pending.byteLength < 4) return new ArrayBuffer(0);

  if (ascii(state.pending, 0, 4) !== 'RIFF') {
    state.mode = 'pcm';
    const rawPcm = state.pending.buffer;
    state.pending = new Uint8Array(new ArrayBuffer(0));
    return rawPcm;
  }

  if (state.pending.byteLength < 12) return new ArrayBuffer(0);
  if (ascii(state.pending, 8, 4) !== 'WAVE') {
    throw new Error('The TTS server returned an invalid WAV stream.');
  }

  let offset = 12;
  while (offset + 8 <= state.pending.byteLength) {
    const chunkName = ascii(state.pending, offset, 4);
    const chunkSize = new DataView(
      state.pending.buffer,
      state.pending.byteOffset + offset + 4,
      4,
    ).getUint32(0, true);
    const dataOffset = offset + 8;

    if (chunkName === 'data') {
      state.mode = 'pcm';
      const payload = state.pending.slice(dataOffset).buffer;
      state.pending = new Uint8Array(new ArrayBuffer(0));
      return payload;
    }

    const nextOffset = dataOffset + chunkSize + (chunkSize % 2);
    if (nextOffset > state.pending.byteLength) return new ArrayBuffer(0);
    offset = nextOffset;
  }

  return new ArrayBuffer(0);
}

function appendBytes(
  left: Uint8Array<ArrayBuffer>,
  right: Uint8Array<ArrayBuffer>,
) {
  const combined = new Uint8Array(
    new ArrayBuffer(left.byteLength + right.byteLength),
  );
  combined.set(left);
  combined.set(right, left.byteLength);
  return combined;
}

function ascii(bytes: Uint8Array<ArrayBuffer>, offset: number, length: number) {
  let value = '';
  for (let index = offset; index < offset + length; index += 1) {
    value += String.fromCharCode(bytes[index]);
  }
  return value;
}

function int16PcmToFloat32(
  bytes: ArrayBuffer,
  carryByte: number | null,
): { samples: Float32Array<ArrayBuffer>; carryByte: number | null } {
  const input = new Uint8Array(bytes);
  const byteLength = input.byteLength + (carryByte === null ? 0 : 1);
  const sampleCount = Math.floor(byteLength / 2);
  const samples = new Float32Array(
    new ArrayBuffer(sampleCount * Float32Array.BYTES_PER_ELEMENT),
  );
  let inputOffset = 0;
  let sampleOffset = 0;

  if (carryByte !== null && input.byteLength > 0) {
    samples[sampleOffset] = pcmSampleToFloat(carryByte, input[0]);
    inputOffset = 1;
    sampleOffset += 1;
  }

  while (inputOffset + 1 < input.byteLength) {
    samples[sampleOffset] = pcmSampleToFloat(
      input[inputOffset],
      input[inputOffset + 1],
    );
    inputOffset += 2;
    sampleOffset += 1;
  }

  return {
    samples,
    carryByte: inputOffset < input.byteLength ? input[inputOffset] : null,
  };
}

function pcmSampleToFloat(lowByte: number, highByte: number) {
  const value = highByte * 256 + lowByte;
  const signed = value >= 0x8000 ? value - 0x10000 : value;
  return Math.max(-1, signed / 0x8000);
}

function describePlaybackError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
