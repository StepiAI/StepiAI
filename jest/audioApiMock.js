// mock react-native-audio-api buat jest (native module gak ada di test)
class AudioContext {
  constructor() {
    this.destination = {};
    this.state = 'running';
  }
  async decodeAudioData() { return {}; }
  createBufferSource() {
    return { connect: jest.fn(), start: jest.fn(), stop: jest.fn(), onEnded: null };
  }
  async close() {}
}

module.exports = { AudioContext };
