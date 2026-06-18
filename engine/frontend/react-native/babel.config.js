module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
        extensions: ['.ios.ts', '.android.ts', '.ts', '.tsx', '.ios.js', '.android.js', '.js', '.jsx', '.json'],
      },
    ],
    'react-native-worklets/plugin', // reanimated 4 moved it here — must be last
  ],
};