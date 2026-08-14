module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-google-signin|@react-native-async-storage|@react-native-firebase|@react-native-documents|@react-native-voice|react-native-audio-api|react-native-nitro-modules|react-native-url-polyfill|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-css-interop|nativewind)/)',
  ],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/styleMock.js',
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest',
    '^@react-native-community/geolocation$': '<rootDir>/jest/geolocationMock.js',
    '^@react-native-firebase/app$': '<rootDir>/jest/firebaseAppMock.js',
    '^@react-native-firebase/messaging$': '<rootDir>/jest/firebaseMessagingMock.js',
    '^@react-native-documents/picker$': '<rootDir>/jest/documentPickerMock.js',
    '^@react-native-voice/voice$': '<rootDir>/jest/voiceMock.js',
    '^react-native-audio-api$': '<rootDir>/jest/audioApiMock.js',
  },
  setupFiles: ['<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js'],
};
