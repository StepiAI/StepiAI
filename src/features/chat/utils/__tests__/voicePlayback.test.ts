interface MockAudioQueue {
  buffers: unknown[];
  onBufferEnded: ((event: { bufferId: string }) => void) | null;
  connect: jest.Mock<void, [unknown]>;
  disconnect: jest.Mock<void, []>;
  enqueueBuffer: jest.Mock<string, [unknown]>;
  start: jest.Mock<void, [number, number]>;
  stop: jest.Mock<void, []>;
  clearBuffers: jest.Mock<void, []>;
}

const mockAudioContexts: Array<{
  close: jest.Mock<Promise<void>, []>;
  options: { sampleRate: number };
  queue: MockAudioQueue;
}> = [];

jest.doMock('react-native-audio-api', () => {
  class AudioContext {
    currentTime = 0;
    destination = {};
    close = jest.fn(async () => {});
    queue: MockAudioQueue = {
      buffers: [] as unknown[],
      onBufferEnded: null as ((event: { bufferId: string }) => void) | null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      enqueueBuffer: jest.fn((buffer: unknown): string => {
        this.queue.buffers.push(buffer);
        return String(this.queue.buffers.length);
      }),
      start: jest.fn(),
      stop: jest.fn(),
      clearBuffers: jest.fn(),
    };

    constructor(readonly options: { sampleRate: number }) {
      mockAudioContexts.push(this);
    }

    createBufferQueueSource() {
      return this.queue;
    }

    createBuffer(_channels: number, length: number, _sampleRate: number) {
      return {
        length,
        copyToChannel: jest.fn(),
      };
    }

    async resume() {}
  }

  return { AudioContext };
});

const { playVoiceSummary, stopVoicePlayback } =
  require('../voicePlayback') as typeof import('../voicePlayback');

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  binaryType = '';
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  sent: string[] = [];
  closed = false;

  constructor(readonly url: string) {
    MockWebSocket.instances.push(this);
  }

  send(value: string) {
    this.sent.push(value);
  }

  close() {
    this.closed = true;
  }

  open() {
    this.onopen?.();
  }

  message(data: unknown) {
    this.onmessage?.({ data });
  }
}

const originalWebSocket = globalThis.WebSocket;

function wavChunk(samples: number[]) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      bytes[offset + index] = value.charCodeAt(index);
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 48000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  samples.forEach((sample, index) => {
    view.setInt16(44 + index * 2, sample, true);
  });

  return buffer;
}

function pcmChunk(samples: number[]) {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);

  samples.forEach((sample, index) => {
    view.setInt16(index * 2, sample, true);
  });

  return buffer;
}

function binaryStringChunk(samples: number[]) {
  const bytes = new Uint8Array(pcmChunk(samples));
  let value = '';

  bytes.forEach(byte => {
    value += String.fromCharCode(byte);
  });

  return value;
}

async function flushPromises() {
  for (let index = 0; index < 20; index += 1) {
    await Promise.resolve();
  }
}

describe('playVoiceSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    MockWebSocket.instances = [];
    mockAudioContexts.length = 0;
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterEach(async () => {
    await stopVoicePlayback();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    globalThis.WebSocket = originalWebSocket;
  });

  it('streams PCM audio chunks into the native queue', async () => {
    let completed = false;
    const playback = playVoiceSummary('Halo dari Stepi').then(() => {
      completed = true;
    });

    await flushPromises();

    const socket = MockWebSocket.instances[0];
    expect(socket.url).toBe(
      'wss://azure-datafoundry-sdk-production.up.railway.app/ws/tts',
    );
    expect(socket.binaryType).toBe('arraybuffer');

    socket.open();
    expect(socket.sent).toEqual(['Halo dari Stepi']);

    socket.message(wavChunk([1000, -1000, 500, -500]));
    socket.message(pcmChunk([250, -250, 750, -750]));
    await flushPromises();

    const context = mockAudioContexts[0];
    expect(context.options.sampleRate).toBe(24000);
    expect(context.queue.start).toHaveBeenCalledTimes(1);
    expect(context.queue.start).toHaveBeenCalledWith(0, 0);
    expect(context.queue.buffers).toHaveLength(2);

    socket.message('**END\\_OF\\_AUDIO**');
    await flushPromises();

    expect(completed).toBe(false);

    context.queue.onBufferEnded?.({ bufferId: '1' });
    await flushPromises();

    expect(completed).toBe(false);

    context.queue.onBufferEnded?.({ bufferId: '2' });
    await playback;

    expect(completed).toBe(true);
    expect(socket.closed).toBe(true);
    expect(context.close).toHaveBeenCalledTimes(1);
  });

  it('treats non-marker string websocket frames as PCM audio', async () => {
    const playback = playVoiceSummary('String audio');

    await flushPromises();

    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.message(binaryStringChunk([1000, -1000, 500, -500]));
    await flushPromises();

    const context = mockAudioContexts[0];
    expect(context.queue.buffers).toHaveLength(1);
    expect(context.queue.start).toHaveBeenCalledTimes(1);

    socket.message('**END\\_OF\\_AUDIO**');
    context.queue.onBufferEnded?.({ bufferId: '1' });
    await playback;

    expect(context.close).toHaveBeenCalledTimes(1);
  });

  it('uses audio-idle fallback only after audio starts', async () => {
    let completed = false;
    const playback = playVoiceSummary('Tes tanpa end marker').then(() => {
      completed = true;
    });

    await flushPromises();

    const socket = MockWebSocket.instances[0];
    socket.open();

    jest.advanceTimersByTime(5000);
    await flushPromises();

    expect(socket.closed).toBe(false);
    expect(completed).toBe(false);

    socket.message(pcmChunk([1000, -1000, 500, -500]));
    await flushPromises();

    jest.advanceTimersByTime(499);
    socket.message(binaryStringChunk([250, -250, 750, -750]));
    await flushPromises();

    jest.advanceTimersByTime(499);
    await flushPromises();

    expect(socket.closed).toBe(false);
    expect(completed).toBe(false);

    jest.advanceTimersByTime(1);
    await flushPromises();

    const context = mockAudioContexts[0];
    expect(socket.closed).toBe(true);
    expect(context.queue.buffers).toHaveLength(2);
    expect(completed).toBe(false);

    context.queue.onBufferEnded?.({ bufferId: '1' });
    context.queue.onBufferEnded?.({ bufferId: '2' });
    await playback;

    expect(completed).toBe(true);
    expect(context.close).toHaveBeenCalledTimes(1);
  });

  it('reports when the socket opens but no audio ever arrives', async () => {
    const playback = playVoiceSummary('Server diam');

    await flushPromises();

    const socket = MockWebSocket.instances[0];
    socket.open();

    jest.advanceTimersByTime(15000);
    await expect(playback).rejects.toThrow(
      'The TTS websocket opened but returned no audio within 15000ms.',
    );
  });
});
