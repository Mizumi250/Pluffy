// ============================================================
// ARKZEN — Metro Config (NativeWind v4) v1.0
// metro.config.js
//
// NativeWind v4 requires withNativeWind wrapper on Metro config
// to process Tailwind CSS classes through the Metro bundler.
// ============================================================

const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind }   = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, {
  input: './global.css',
})
