import lynxPreset from '@lynx-js/tailwind-preset'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [lynxPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './arkzen/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Mirror neutral/violet/emerald/amber/rose/blue/red palettes
      // already relied on by the ported components in
      // arkzen/core/components/*.tsx and arkzen/core/layouts/*.tsx
      // — Tailwind's default palette already covers these, so no
      // custom color extension is required unless your tatemono
      // DSL emits brand-specific tokens.
    },
  },
  plugins: [],
}
