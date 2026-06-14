// ============================================================
// ARKZEN — Metro Config (NativeWind v4) v1.0
// metro.config.js
//
// NativeWind v4 requires withNativeWind wrapper on Metro config
// to process Tailwind CSS classes through the Metro bundler.
// ============================================================

const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind }   = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// ── tslib CJS/ESM interop fix ───────────────────────────────────────────────
// Expo Router's web SSR bundles with `resolver.environment=node`, which makes
// Metro prefer tslib's ESM build (tslib.es6.js) via its `exports`/`module`
// field. Libraries like moti / react-native-reanimated call
// `const { __extends } = require('tslib').default` — a CJS interop pattern
// that only works against tslib's CJS build (tslib.js), where
// `module.exports.default` is set to the module itself. Against the ESM
// build there is no `default`, so destructuring it throws:
//   "Cannot destructure property '__extends' of 'tslib.default' as it is undefined"
// Force tslib to always resolve to its CJS entry point, for every platform
// and environment.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  tslib: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
}

module.exports = withNativeWind(config, {
  input: './global.css',
})
