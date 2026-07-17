module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-google-signin|@react-native-async-storage|react-native-url-polyfill|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-css-interop|nativewind)/)',
  ],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/styleMock.js',
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest',
  },
  setupFiles: ['<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js'],
};
