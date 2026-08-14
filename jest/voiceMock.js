// mock @react-native-voice/voice buat jest (native module gak ada di test)
const listeners = {};

module.exports = {
  __esModule: true,
  default: {
    start: jest.fn(async () => {}),
    stop: jest.fn(async () => {}),
    cancel: jest.fn(async () => {}),
    destroy: jest.fn(async () => {}),
    removeAllListeners: jest.fn(),
    isAvailable: jest.fn(async () => true),
    set onSpeechStart(fn) { listeners.onSpeechStart = fn; },
    set onSpeechEnd(fn) { listeners.onSpeechEnd = fn; },
    set onSpeechResults(fn) { listeners.onSpeechResults = fn; },
    set onSpeechPartialResults(fn) { listeners.onSpeechPartialResults = fn; },
    set onSpeechError(fn) { listeners.onSpeechError = fn; },
  },
};
