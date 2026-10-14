module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|react-native-.*))',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js',
  ],
};
