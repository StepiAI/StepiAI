// mock @react-native-firebase/messaging buat jest
const messaging = jest.fn(() => ({
  requestPermission: jest.fn(),
  hasPermission: jest.fn(),
  getToken: jest.fn(),
  onMessage: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
}));

messaging.AuthorizationStatus = {
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  DENIED: 0,
  NOT_DETERMINED: -1,
};

module.exports = { __esModule: true, default: messaging };
