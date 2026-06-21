import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'
import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss'

export default defineConfig({
  source: {
    // Lynx's runtime (QuickJS) has no Node `process` global at all.
    // Tatemono lynx blocks commonly do `process.env.SOME_VAR ?? 'fallback'`
    // (it works fine on web/Expo where the bundler rewrites it, but not
    // here). Statically replacing `process.env` with `{}` makes every
    // `process.env.X` resolve to `undefined` instead of throwing
    // ReferenceError, so the existing `?? 'fallback'` in tatemono code
    // still does its job — no per-tatemono edits needed, and it covers
    // any env var name future tatemonos reference too.
    define: {
      'process.env': '{}',
    },
  },
  server: {
    port: 3001, // 3000 is reserved for Next.js (web always owns 3000)
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx(),
    pluginTypeCheck(),
    pluginTailwindCSS({
      config: './tailwind.config.ts',
      include: /\.[jt]sx?/,
      exclude: ['./src/store/**', /[\\/]node_modules[\\/]/],
    }),
  ],
})
