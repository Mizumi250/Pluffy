// Checks every text/background pair the app uses against WCAG 4.5:1 (body) and 3:1 (icons, large text).
// Run: node scripts/contrast.mjs
const L = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const P = {
  light: { ink: '#212121', bg: '#f3ebe9', surface: '#fbfbfd', chip: '#f3ebe9', chipPress: '#ebe0dd', primary: '#f99e9e', primaryPress: '#f58a8a', primarySoft: '#fde6e6', onPrimary: '#212121', muted: '#6c625f', ok: '#25694b', warn: '#8a4b00', err: '#b02f2f' },
  dark: { ink: '#f3e4e8', bg: '#1e171b', surface: '#2a2025', chip: '#382b31', chipPress: '#45323a', primary: '#f99e9e', primaryPress: '#fbb3b3', primarySoft: '#44292f', onPrimary: '#212121', muted: '#bfaab1', ok: '#7fd4a8', warn: '#f2b765', err: '#ff8a8a' },
}
const T = { bg: '#231a1e', ink: '#f3e4e8', muted: '#b3a3a9', bar: '#2d2227' }
let bad = 0
const check = (name, fg, bg, min = 4.5) => { const r = ratio(fg, bg); const ok = r >= min; if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}  ${name}`) }
for (const [m, c] of Object.entries(P)) {
  for (const on of ['bg', 'surface', 'chip', 'primarySoft']) for (const k of ['ink', 'muted', 'ok', 'warn', 'err']) check(`${m}: ${k} on ${on}`, c[k], c[on])
  check(`${m}: onPrimary on primary`, c.onPrimary, c.primary); check(`${m}: onPrimary on primaryPress`, c.onPrimary, c.primaryPress)
  check(`${m}: ink on chipPress`, c.ink, c.chipPress); check(`${m}: err on chipPress`, c.err, c.chipPress)
  check(`${m}: ink icon on primarySoft (3:1)`, c.ink, c.primarySoft, 3)
}
check('terminal ink', T.ink, T.bg); check('terminal muted', T.muted, T.bg); check('terminal muted on bar', T.muted, T.bar); check('terminal ink on bar', T.ink, T.bar)
// Coral on cream is about 1.7:1, so coral never carries meaning alone: every status has an icon and a word.
console.log(bad ? `\n${bad} pair(s) below the limit` : '\nall pairs pass')
process.exit(bad ? 1 : 0)
