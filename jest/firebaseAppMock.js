// mock @react-native-firebase/app buat jest — native module-nya gak ada di
// lingkungan test. getApps() kosong -> isFirebaseConfigured() jadi false,
// jadi seluruh jalur notifikasi aman ke-skip.
module.exports = {
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
  firebase: {},
  utils: jest.fn(),
};
