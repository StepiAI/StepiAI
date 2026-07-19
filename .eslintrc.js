module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['src/features/widget/**/*.tsx'],
      rules: {
        'react-native/no-inline-styles': 'off',
      },
    },
  ],
};
