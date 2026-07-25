// mock @react-native-documents/picker buat jest (native module gak ada di test)
module.exports = {
  pick: jest.fn(async () => []),
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  isErrorWithCode: jest.fn(() => false),
  isKnownType: jest.fn(() => true),
  types: {},
};
