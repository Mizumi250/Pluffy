// Falling cherry blossom petals. Near petals are bright, spin and sway; far ones are small, dim and slow.

const FLOWERS = ['✿', '❀', '✾', '❁']
const SMALL = ['·', '•', '˙', '∙']
const NEAR = ['38;5;218', '38;5;217', '38;5;211', '38;5;224', '38;5;225']
const FAR = ['38;5;175', '38;5;139', '38;5;132', '38;5;96']
const rnd = (a, b) => a + Math.random() * (b - a)
const pick = (a) => a[Math.floor(Math.random() * a.length)]

export class Petals {
  constructor() { this.list = []; this.w = 0; this.h = 0; this.t = 0 }

  resize(w, h) {
    this.w = w; this.h = h
    const n = Math.max(10, Math.round((w * h) / 55))
    while (this.list.length < n) this.list.push(this.make(true))
    this.list.length = n
  }

  make(anywhere) {
    const near = Math.random() < 0.4
    return {
      near, k: Math.floor(Math.random() * 4),
      bx: rnd(0, this.w), y: anywhere ? rnd(0, this.h) : rnd(-this.h * 0.3, 0),
      vy: near ? rnd(0.12, 0.26) : rnd(0.05, 0.11),
      drift: near ? rnd(0.03, 0.11) : rnd(0.01, 0.05),
      amp: near ? rnd(1.2, 3.2) : rnd(0.4, 1.2),
      ph: rnd(0, 6.28), fr: rnd(0.04, 0.1),
      col: pick(near ? NEAR : FAR),
    }
  }

  step() {
    this.t++
    for (const p of this.list) {
      p.y += p.vy; p.bx += p.drift; p.ph += p.fr
      if (p.y >= this.h + 1) Object.assign(p, this.make(false), { y: -1 })
      if (p.bx >= this.w + 3) p.bx -= this.w + 6
    }
  }

  draw(scr) {
    for (const p of this.list) {
      const x = Math.round(p.bx + Math.sin(p.ph) * p.amp), y = Math.floor(p.y)
      if (x < 0 || y < 0 || x >= scr.w || y >= scr.h) continue
      const i = y * scr.w + x
      if (scr.ch[i] !== null) continue
      scr.ch[i] = p.near ? FLOWERS[(p.k + (this.t >> 3)) % 4] : SMALL[p.k]
      scr.st[i] = p.col
    }
  }
}
