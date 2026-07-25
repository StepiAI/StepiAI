// mock @react-native-community/geolocation buat jest — native module-nya gak
// ada di lingkungan test, jadi requestAuthorization default-nya "granted"
module.exports = {
  requestAuthorization: jest.fn((success) => success?.()),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  setRNConfiguration: jest.fn(),
};
