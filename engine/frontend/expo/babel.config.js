// ============================================================
// ARKZEN — Expo Babel Config v1.0
// babel.config.js
//
// Required for:
//   - expo-router  (babel-preset-expo)
//   - NativeWind v4 (nativewind/babel plugin)
//   - Reanimated   (react-native-reanimated/plugin — must be LAST)
// ============================================================

module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      'nativewind/babel',
      // Reanimated plugin MUST always be the last plugin
      'react-native-reanimated/plugin',
    ],
  }
}
