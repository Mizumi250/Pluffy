// Turns command output with colour codes (SGR) into coloured spans for the output pane.
// The pane is always dark, so every colour is lightened until it reads at 4.5:1 on it.

const BG = '#231a1e'
export type Span = { text: string; color: string; bold: boolean }

const BASE = ['#8f7f86', '#ff8a8a', '#7fd4a8', '#f2b765', '#8ab4ff', '#f5a0d8', '#7ad7e8', '#f3e4e8']
const BRIGHT = ['#b3a3a9', '#ffa3a3', '#9be6bf', '#ffd08a', '#a9c6ff', '#ffb8e6', '#9be8f4', '#ffffff']
export const DEFAULT = '#f3e4e8', DIM = '#b3a3a9'

const lin = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const hex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const bgLum = (() => { const [r, g, b] = parse(BG); return lum(r, g, b) })()

const cache = new Map<string, string>()
export function readable(color: string): string {
  const hit = cache.get(color); if (hit) return hit
  let [r, g, b] = parse(color)
  for (let i = 0; i < 20 && (lum(r, g, b) + 0.05) / (bgLum + 0.05) < 4.5; i++) { r += (255 - r) * 0.15; g += (255 - g) * 0.15; b += (255 - b) * 0.15 }
  const out = hex(r, g, b); cache.set(color, out); return out
}

export function xterm256(n: number): string {
  if (n < 8) return BASE[n]
  if (n < 16) return BRIGHT[n - 8]
  if (n < 232) { const i = n - 16, q = [0, 95, 135, 175, 215, 255]; return hex(q[Math.floor(i / 36)], q[Math.floor(i / 6) % 6], q[i % 6]) }
  const v = 8 + (n - 232) * 10; return hex(v, v, v)
}

export function parseAnsi(line: string): Span[] {
  const out: Span[] = []
  let color = DEFAULT, bold = false, dim = false, last = 0
  const re = /\x1b\[([0-9;]*)m/g
  const emit = (text: string) => { if (text) out.push({ text, color: dim ? DIM : readable(color), bold }) }
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    emit(line.slice(last, m.index)); last = re.lastIndex
    const codes = m[1] === '' ? [0] : m[1].split(';').map(Number)
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i]
      if (c === 0) { color = DEFAULT; bold = false; dim = false }
      else if (c === 1) bold = true
      else if (c === 2) dim = true
      else if (c === 22) { bold = false; dim = false }
      else if (c >= 30 && c <= 37) color = BASE[c - 30]
      else if (c >= 90 && c <= 97) color = BRIGHT[c - 90]
      else if (c === 39) color = DEFAULT
      else if (c === 38 && codes[i + 1] === 5) { color = xterm256(codes[i + 2] ?? 7); i += 2 }
      else if (c === 38 && codes[i + 1] === 2) { color = hex(codes[i + 2] ?? 255, codes[i + 3] ?? 255, codes[i + 4] ?? 255); i += 4 }
    }
  }
  emit(line.slice(last))
  return out
}

export const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '')
