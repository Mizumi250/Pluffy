// A tiny cell-buffer renderer: draw into a grid, then flush only what changed.
// A cell with ch === null is "empty": the petals are allowed to drift through it.

export const C = {
  pink: '38;5;211', rose: '38;5;205', blush: '38;5;218', mute: '38;5;245', dim: '38;5;240',
  white: '38;5;255', green: '38;5;114', red: '38;5;203', cyan: '38;5;117', yellow: '38;5;222',
  sel: '48;5;236', field: '48;5;237', bold: '1',
}
export const st = (...a) => a.filter(Boolean).join(';')

export function charW(cp) {
  if (cp === 0 || cp < 32 || (cp >= 0x7f && cp < 0xa0) || (cp >= 0x300 && cp <= 0x36f)) return 0
  if (cp < 0x1100) return 1
  if ((cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) || (cp >= 0xac00 && cp <= 0xd7a3) ||
      (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xfe30 && cp <= 0xfe6f) || (cp >= 0xff00 && cp <= 0xff60) ||
      (cp >= 0xffe0 && cp <= 0xffe6) || (cp >= 0x1f300 && cp <= 0x1faff)) return 2
  return 1
}
export const strW = (s) => { let w = 0; for (const g of s) w += charW(g.codePointAt(0)); return w }

export function fit(s, w) {
  if (w <= 0) return ''
  if (strW(s) <= w) return s
  let out = '', cur = 0
  for (const g of s) { const cw = charW(g.codePointAt(0)); if (cur + cw > w - 1) break; out += g; cur += cw }
  return out + '…'
}

export function wrap(text, w) {
  const out = []
  for (const para of String(text).split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (!line) line = word
      else if (strW(line) + 1 + strW(word) <= w) line += ' ' + word
      else { out.push(line); line = word }
    }
    out.push(line)
  }
  return out
}

export class Screen {
  constructor(w, h) { this.resize(w, h) }

  resize(w, h) {
    this.w = w; this.h = h
    const n = w * h
    this.ch = new Array(n).fill(null); this.st = new Array(n).fill('')
    this.pch = new Array(n).fill(undefined); this.pst = new Array(n).fill(undefined)
  }

  clear() { this.ch.fill(null); this.st.fill('') }
  invalidate() { this.pch.fill(undefined) }

  put(x, y, str, style = '') {
    if (y < 0 || y >= this.h) return x
    for (const g of String(str)) {
      const cw = charW(g.codePointAt(0))
      if (cw === 0) continue
      if (x >= 0 && x + cw <= this.w) {
        const i = y * this.w + x
        this.ch[i] = g; this.st[i] = style
        if (cw === 2) { this.ch[i + 1] = ''; this.st[i + 1] = style }
      }
      x += cw
      if (x >= this.w) break
    }
    return x
  }

  fill(x, y, w, h, style = '', ch = ' ') {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      if (xx < 0 || yy < 0 || xx >= this.w || yy >= this.h) continue
      const i = yy * this.w + xx
      this.ch[i] = ch; this.st[i] = style
    }
  }

  // Draw a string that may contain SGR colour codes (command output). Other escapes are ignored.
  ansi(x, y, str, maxW, base = '') {
    let fg = '', bold = false, dim = false, cx = x
    const end = x + maxW
    const re = /\x1b\[([0-9;]*)m/g
    let last = 0, m
    const emit = (text) => {
      const style = st(base, fg, bold && '1', dim && '2')
      for (const g of text) {
        const cw = charW(g.codePointAt(0))
        if (cw === 0) continue
        if (cx + cw > end) return false
        this.put(cx, y, g, style); cx += cw
      }
      return true
    }
    while ((m = re.exec(str))) {
      if (!emit(str.slice(last, m.index))) return
      last = re.lastIndex
      const codes = m[1] === '' ? [0] : m[1].split(';').map(Number)
      for (let i = 0; i < codes.length; i++) {
        const c = codes[i]
        if (c === 0) { fg = ''; bold = false; dim = false }
        else if (c === 1) bold = true
        else if (c === 2) dim = true
        else if (c === 22) { bold = false; dim = false }
        else if ((c >= 30 && c <= 37) || (c >= 90 && c <= 97)) fg = String(c)
        else if (c === 39) fg = ''
        else if (c === 38 && codes[i + 1] === 5) { fg = `38;5;${codes[i + 2]}`; i += 2 }
        else if (c === 38 && codes[i + 1] === 2) { fg = `38;2;${codes[i + 2]};${codes[i + 3]};${codes[i + 4]}`; i += 4 }
      }
    }
    emit(str.slice(last))
  }

  box(x, y, w, h, style = '', title = '') {
    if (w < 2 || h < 2) return
    this.put(x, y, '╭' + '─'.repeat(w - 2) + '╮', style)
    this.put(x, y + h - 1, '╰' + '─'.repeat(w - 2) + '╯', style)
    for (let r = 1; r < h - 1; r++) { this.put(x, y + r, '│', style); this.put(x + w - 1, y + r, '│', style) }
    if (title) this.put(x + 2, y, fit(` ${title} `, w - 4), style)
  }

  toText() {
    const rows = []
    for (let y = 0; y < this.h; y++) {
      let r = ''
      for (let x = 0; x < this.w; x++) { const c = this.ch[y * this.w + x]; r += c === null ? ' ' : c }
      rows.push(r.replace(/\s+$/, ''))
    }
    return rows.join('\n')
  }

  flush() {
    let out = '', cx = -1, cy = -1, cur = null
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const i = y * this.w + x
        let c = this.ch[i]
        if (c === '') continue
        if (c === null) c = ' '
        const s = this.ch[i] === null ? '' : this.st[i]
        if (this.pch[i] === c && this.pst[i] === s) continue
        this.pch[i] = c; this.pst[i] = s
        if (cx !== x || cy !== y) out += `\x1b[${y + 1};${x + 1}H`
        if (s !== cur) { out += `\x1b[0${s ? ';' + s : ''}m`; cur = s }
        out += c
        cx = x + charW(c.codePointAt(0)); cy = y
        if (this.ch[i + 1] === '') this.pch[i + 1] = '', this.pst[i + 1] = s
      }
    }
    if (out) process.stdout.write(out + '\x1b[0m')
  }
}
