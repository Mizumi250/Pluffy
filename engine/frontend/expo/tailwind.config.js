// ============================================================
// ARKZEN — Tailwind Config (NativeWind v4) v1.0
// tailwind.config.js
//
// NativeWind v4 requires Tailwind CSS v3 config.
// Content paths cover all generated screens + src components.
// ============================================================

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 target
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [
    require('nativewind/preset'),
  ],
  theme: {
    extend: {
      // ── Arkzen brand tokens ──────────────────────────────
      colors: {
        arkzen: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans: ['System'],
        mono: ['Courier New'],
      },
      // ── Spacing scale ────────────────────────────────────
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
      },
      // ── Border radius ────────────────────────────────────
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
}
