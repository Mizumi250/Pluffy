import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'
import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss'

export default defineConfig({
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
