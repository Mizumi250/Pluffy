// ============================================================
// ARKZEN GENERATED SCRIPT — kairo
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:41.927Z
// ============================================================

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Concept: a tabletop where logic gates sit like physical blocks you can pick up.
// Signature device: the board is a 3D scene, and every click is resolved by reading
// one pixel from an id-coloured copy of that scene (GPU picking), the way Figma
// decides between selecting, dragging and drawing.
// Objects behind the scene: the document is plain data (Part, Wire, Def). Meshes are
// rebuilt from it, and the simulator is compiled from it, so none of them know each other.

export type Part = { id: number; kind: string; x: number; y: number; chip?: string; on?: boolean; g?: number; gn?: string }
export type Wire = { id: number; from: number[]; to: number[] }
export type Def = { parts: Part[]; wires: Wire[] }
export type Lib = Record<string, Def>

export const START: Def = {
  parts: [
    { id: 1, kind: 'in', x: 0, y: 0, on: true },
    { id: 2, kind: 'clk', x: 0, y: 3 },
    { id: 3, kind: 'nand', x: 4, y: 1 },
    { id: 4, kind: 'out', x: 8, y: 1 },
  ],
  wires: [
    { id: 1, from: [1, 0], to: [3, 0] },
    { id: 2, from: [2, 0], to: [3, 1] },
    { id: 3, from: [3, 0], to: [4, 0] },
  ],
}

// Gate ops: 0 NAND, 3 NOT, 4 AND, 5 OR, 6 NOR, 7 XOR, 8 XNOR. Also 1 copy, 2 D flip-flop, 9 constant 1.
export const buildSample = (name: string): Def => {
  const parts: Part[] = []
  const wires: Wire[] = []
  let n = 1
  const P = (kind: string, x: number, y: number, o?: { on?: boolean; g?: number; gn?: string }) => {
    parts.push({ id: n, kind, x, y, ...o })
    return n++
  }
  const W = (a: number, ak: number, b: number, bk: number) => {
    wires.push({ id: n++, from: [a, ak], to: [b, bk] })
  }
  const cell = (X: number, a: boolean, b: boolean, cin: number, gn: string, grp: boolean) => {
    const o = grp ? { g: n++, gn } : {}
    const A = P('in', X, 0, { on: a, ...o })
    const B = P('in', X, 2, { on: b, ...o })
    const x1 = P('xor', X + 3, 1, o)
    const a1 = P('and', X + 3, 4, o)
    const x2 = P('xor', X + 7, 1, o)
    const a2 = P('and', X + 7, 4, o)
    const or = P('or', X + 11, 5, o)
    const s = P('out', X + 11, 1, o)
    W(A, 0, x1, 0)
    W(B, 0, x1, 1)
    W(A, 0, a1, 0)
    W(B, 0, a1, 1)
    W(x1, 0, x2, 0)
    W(cin, 0, x2, 1)
    W(x1, 0, a2, 0)
    W(cin, 0, a2, 1)
    W(a1, 0, or, 0)
    W(a2, 0, or, 1)
    W(x2, 0, s, 0)
    return or
  }
  if (name === 'fulladder') {
    const cin = P('in', 3, 9)
    W(cell(0, true, false, cin, '', false), 0, P('out', 15, 5), 0)
  } else if (name === 'adder') {
    let c = P('in', 3, 9)
    const a = [1, 0, 1, 0]
    const b = [1, 1, 0, 0]
    for (let i = 0; i < 4; i++) c = cell(i * 14, !!a[i], !!b[i], c, 'Bit ' + i, true)
    W(c, 0, P('out', 57, 5), 0)
  } else if (name === 'counter') {
    let prev = P('clk', 0, 3)
    let pin = 0
    for (let i = 0; i < 4; i++) {
      const X = 6 + i * 7
      const ff = P('dff', X, 3)
      W(prev, pin, ff, 1)
      W(ff, 1, ff, 0)
      W(ff, 0, P('out', X + 3.5, -1), 0)
      prev = ff
      pin = 1
    }
  } else if (name === 'traffic') {
    const c = { g: n++, gn: 'Counter' }
    const clk = P('clk', 0, 6, c)
    const f0 = P('dff', 5, 6, c)
    const f1 = P('dff', 11, 6, c)
    W(clk, 0, f0, 1)
    W(f0, 1, f0, 0)
    W(f0, 1, f1, 1)
    W(f1, 1, f1, 0)
    const d = { g: n++, gn: 'Decoder' }
    const n1 = P('not', 16, 9, d)
    const yl = P('and', 21, 9, d)
    const gr = P('nor', 21, 12, d)
    const tl = P('tl', 28, 8)
    W(f1, 0, n1, 0)
    W(n1, 0, yl, 0)
    W(f0, 0, yl, 1)
    W(f1, 0, gr, 0)
    W(f0, 0, gr, 1)
    W(f1, 0, tl, 0)
    W(yl, 0, tl, 1)
    W(gr, 0, tl, 2)
  } else if (name === 'fan') {
    const pw = P('in', 0, 0, { on: true })
    const hot = P('btn', 0, 3)
    const nb = P('not', 4, 3)
    const an = P('and', 8, 1)
    const fan = P('fan', 14, 1)
    W(hot, 0, nb, 0)
    W(pw, 0, an, 0)
    W(nb, 0, an, 1)
    W(an, 0, fan, 0)
    const ck = P('clk', 0, 9)
    const mo = P('motor', 8, 9)
    W(ck, 0, mo, 0)
  } else {
    const gc = n++
    const gd = n++
    const clk = P('clk', 0, 6, { g: gc, gn: 'Counter' })
    const f0 = P('dff', 5, 6, { g: gc, gn: 'Counter' })
    const f1 = P('dff', 11, 6, { g: gc, gn: 'Counter' })
    W(clk, 0, f0, 1)
    W(f0, 1, f0, 0)
    W(f0, 1, f1, 1)
    W(f1, 1, f1, 0)
    const d = { g: gd, gn: 'Decoder' }
    const n1 = P('not', 16, 9, d)
    const n0 = P('not', 16, 12, d)
    const a1 = P('nand', 21, 9, d)
    const c1 = P('nand', 21, 12, d)
    const fx = P('nor', 21, 15, d)
    const hi = P('hi', 21, 3, d)
    const sg = P('seg', 29, 9)
    W(f1, 0, n1, 0)
    W(f0, 0, n0, 0)
    W(n1, 0, a1, 0)
    W(f0, 0, a1, 1)
    W(f1, 0, c1, 0)
    W(n0, 0, c1, 1)
    W(f1, 0, fx, 0)
    W(f0, 0, fx, 1)
    W(a1, 0, sg, 0)
    W(hi, 0, sg, 1)
    W(c1, 0, sg, 2)
    W(a1, 0, sg, 3)
    W(n0, 0, sg, 4)
    W(fx, 0, sg, 5)
    W(f1, 0, sg, 6)
  }
  return { parts, wires }
}

export const GATE: Record<string, number> = { nand: 0, buf: 1, not: 3, and: 4, or: 5, nor: 6, xor: 7, xnor: 8 }
export const GATE_COL: Record<string, number> = { nand: 0xb9e03c, and: 0xa7d8f0, or: 0xf7d28a, not: 0xf4b6c2, nor: 0xf2a08a, xor: 0x9fe0c9, xnor: 0xe6d27a, buf: 0xd5dcc8 }

export const PROBE: Record<string, number> = { seg: 7, bar: 4, tl: 3, fan: 1, motor: 1 }

export const pinsOf = (p: Part, lib: Lib) => {
  if (GATE[p.kind] !== undefined) return { i: p.kind === 'not' || p.kind === 'buf' ? 1 : 2, o: 1, w: 2, h: 1 }
  if (p.kind === 'in' || p.kind === 'clk' || p.kind === 'btn' || p.kind === 'hi') return { i: 0, o: 1, w: 1, h: 1 }
  if (p.kind === 'dff') return { i: 2, o: 2, w: 3, h: 2 }
  if (p.kind === 'seg') return { i: 7, o: 0, w: 3, h: 5 }
  if (p.kind === 'bar') return { i: 4, o: 0, w: 2, h: 4 }
  if (p.kind === 'tl') return { i: 3, o: 0, w: 2, h: 3 }
  if (p.kind === 'fan') return { i: 1, o: 0, w: 2, h: 2 }
  if (p.kind === 'motor') return { i: 1, o: 0, w: 2, h: 1 }
  if (p.kind === 'out') return { i: 1, o: 0, w: 1, h: 1 }
  const d = lib[p.chip || '']
  const i = d ? d.parts.filter((q) => q.kind === 'in').length : 0
  const o = d ? d.parts.filter((q) => q.kind === 'out').length : 0
  return { i, o, w: 3, h: Math.max(1, i, o) }
}

export const pinPos = (p: Part, lib: Lib, out: boolean, k: number): number[] => {
  const s = pinsOf(p, lib)
  const n = out ? s.o : s.i
  const sp = s.h / Math.max(n, 1)
  return [p.x + (out ? s.w / 2 : -s.w / 2), p.y - s.h / 2 + sp * (k + 0.5)]
}

// Flattens a board and every chip inside it into one list of gates. Gate rows are
// [op, a, b, out]: op 0 is NAND, op 1 copies a (used to join a chip's outputs).
export const compile = (def: Def, lib: Lib) => {
  const gates: number[] = []
  let n = 1
  const top = new Map<string, number>()
  const ins: { id: number; net: number }[] = []
  const outs: { id: number; net: number }[] = []
  const clks: { id: number; net: number }[] = []
  const btns: { id: number; net: number }[] = []
  const segs: { id: number; nets: number[] }[] = []
  const run = (d: Def, inNets: number[], depth: number, isTop: boolean): number[] => {
    const src = new Map<string, number>()
    const ord = (k: string) => d.parts.filter((p) => p.kind === k).sort((a, b) => a.y - b.y || a.x - b.x)
    ord('in').forEach((p, i) => {
      const net = isTop ? n++ : inNets[i] ?? 0
      src.set(p.id + ':0', net)
      if (isTop) ins.push({ id: p.id, net })
    })
    d.parts.forEach((p) => {
      if (GATE[p.kind] !== undefined || p.kind === 'hi') src.set(p.id + ':0', n++)
      if (p.kind === 'btn') {
        src.set(p.id + ':0', n)
        if (isTop) btns.push({ id: p.id, net: n })
        n++
      }
      if (p.kind === 'dff') {
        src.set(p.id + ':0', n)
        src.set(p.id + ':1', n + 1)
        n += 3
      }
      if (p.kind === 'clk') {
        src.set(p.id + ':0', n)
        clks.push({ id: isTop ? p.id : 0, net: n++ })
      }
      if (p.kind === 'chip') {
        const s = pinsOf(p, lib)
        for (let k = 0; k < s.o; k++) src.set(p.id + ':' + k, n++)
      }
    })
    const get = (id: number, k: number) => {
      const w = d.wires.find((q) => q.to[0] === id && q.to[1] === k)
      return w ? src.get(w.from[0] + ':' + w.from[1]) ?? 0 : 0
    }
    d.parts.forEach((p) => {
      const o = src.get(p.id + ':0') as number
      if (GATE[p.kind] !== undefined) gates.push(GATE[p.kind], get(p.id, 0), p.kind === 'not' || p.kind === 'buf' ? 0 : get(p.id, 1), o)
      if (p.kind === 'hi') gates.push(9, 0, 0, o)
      if (p.kind === 'dff') gates.push(2, get(p.id, 0), get(p.id, 1), o, 3, o, 0, src.get(p.id + ':1') as number)
      if (PROBE[p.kind] && isTop) segs.push({ id: p.id, nets: Array.from({ length: PROBE[p.kind] }, (_, k) => get(p.id, k)) })
      if (p.kind === 'chip' && depth < 12 && lib[p.chip || '']) {
        const s = pinsOf(p, lib)
        const feed: number[] = []
        for (let k = 0; k < s.i; k++) feed.push(get(p.id, k))
        run(lib[p.chip as string], feed, depth + 1, false).forEach((net, k) => gates.push(1, net, 0, src.get(p.id + ':' + k) as number))
      }
    })
    if (isTop) {
      d.wires.forEach((w) => top.set('w' + w.id, src.get(w.from[0] + ':' + w.from[1]) ?? 0))
      ord('out').forEach((p) => outs.push({ id: p.id, net: get(p.id, 0) }))
    }
    return ord('out').map((p) => get(p.id, 0))
  }
  run(def, [], 0, true)
  return { gates, n, top, ins, outs, clks, btns, segs }
}

// One tick: every gate reads the previous values, so feedback (latches) works.
export const step = (c: any, v: Uint8Array, sw: Record<number, boolean>, t = 0) => {
  const nv = new Uint8Array(c.n)
  const g = c.gates
  for (let i = 0; i < g.length; i += 4) {
    const op = g[i]
    const a = v[g[i + 1]]
    const b = v[g[i + 2]]
    const o = g[i + 3]
    if (op === 2) {
      nv[o] = b && !v[o + 2] ? a : v[o]
      nv[o + 2] = b
    } else nv[o] = op === 0 ? (a & b) ^ 1 : op === 1 ? a : op === 3 ? a ^ 1 : op === 4 ? a & b : op === 5 ? a | b : op === 6 ? (a | b) ^ 1 : op === 7 ? a ^ b : op === 8 ? (a ^ b) ^ 1 : 1
  }
  c.ins.forEach((s: any) => {
    nv[s.net] = sw[s.id] ? 1 : 0
  })
  c.clks.forEach((s: any) => {
    nv[s.net] = Math.floor(t / 24) % 2
  })
  c.btns.forEach((s: any) => {
    nv[s.net] = sw[s.id] ? 1 : 0
  })
  return nv
}

// Rows run in order and keep their state, so a latch shows what it remembers.
export const truthTable = (def: Def, lib: Lib) => {
  const c = compile(def, lib)
  const ni = c.ins.length
  if (!ni || ni > 4 || !c.outs.length) return null
  let v = new Uint8Array(c.n)
  const rows: number[][] = []
  for (let m = 0; m < 1 << ni; m++) {
    const sw: Record<number, boolean> = {}
    c.ins.forEach((s: any, i: number) => {
      sw[s.id] = ((m >> (ni - 1 - i)) & 1) === 1
    })
    for (let t = 0; t < 40; t++) v = step(c, v, sw)
    rows.push([...c.ins.map((s: any) => (sw[s.id] ? 1 : 0)), ...c.outs.map((o: any) => v[o.net])])
  }
  return { head: [...c.ins.map((_: any, i: number) => 'ABCD'[i]), ...c.outs.map((_: any, i: number) => 'Q' + (i + 1))], rows }
}

const WB = 0x800000
const GB = 0xc00000
export const GCOL = [0x6c9a0a, 0xe8643f, 0x3f93d0, 0xd99a0b, 0x24a08a, 0xd6477f]
export const gcol = (n: string) => GCOL[Array.from(n).reduce((a, c) => a + c.charCodeAt(0), 0) % GCOL.length]
const OFF: Record<string, number> = { in: 0xf6f9f1, out: 0xe9eadf, clk: 0xf6f9f1, btn: 0xf2a08a }
const LIT: Record<string, number> = { in: 0xf2704f, out: 0xf7cf3d, clk: 0x9be000, btn: 0xf2704f }

export class Stage {
  cv: HTMLCanvasElement
  store: any
  r: THREE.WebGLRenderer
  sc = new THREE.Scene()
  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 300)
  pk = new THREE.WebGLRenderTarget(1, 1)
  tgt = new THREE.Vector3(5, 0, 1.5)
  zoom = 40
  az = Math.PI / 4
  el = 0.6155
  t = 0
  fr = 0
  gh: THREE.Group | null = null
  ghKey = ''
  ghMats: THREE.Material[] = []
  tagHost: HTMLElement | null = null
  dl: THREE.DirectionalLight | null = null
  spin = new Map<number, { w: number; a: number }>()
  onTick: (t: number, vals: any, tags: any[]) => void = () => {}
  w = 1
  h = 1
  objs = new Map<string, { g: THREE.Group; sig: string }>()
  mats = new Map<any, THREE.Material>()
  tex = new Map<string, THREE.Texture>()
  prev: THREE.Line
  comp: any = null
  v = new Uint8Array(1)
  topo = ''
  hover = 0
  space = false
  busy = false
  d: any = null
  raf = 0
  off: Array<() => void> = []
  onMarquee: (r: any) => void = () => {}

  constructor(cv: HTMLCanvasElement, store: any) {
    THREE.ColorManagement.enabled = false
    this.cv = cv
    this.store = store
    this.r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true })
    this.r.outputColorSpace = THREE.LinearSRGBColorSpace
    this.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.r.shadowMap.enabled = true
    this.r.shadowMap.type = THREE.PCFSoftShadowMap
    this.r.shadowMap.autoUpdate = false
    this.sc.add(new THREE.HemisphereLight(0xffffff, 0xd9dfd0, 1.9))
    const dl = new THREE.DirectionalLight(0xffffff, 1.1)
    dl.position.set(-8, 14, 6)
    dl.castShadow = true
    dl.shadow.mapSize.set(2048, 2048)
    Object.assign(dl.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 60 })
    dl.shadow.radius = 4
    this.sc.add(dl)
    this.sc.add(dl.target)
    this.dl = dl
    const slab = new THREE.Mesh(new RoundedBoxGeometry(400, 0.6, 400, 3, 0.28), this.m(0xfbfcf8))
    slab.position.y = -0.3
    slab.receiveShadow = true
    slab.userData.skip = 1
    this.sc.add(slab)
    const grid = new THREE.GridHelper(240, 240, 0xe1e6d9, 0xeaeee4)
    grid.position.y = 0.01
    grid.userData.skip = 1
    this.sc.add(grid)
    this.prev = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x4f6b09 }))
    this.prev.visible = false
    this.prev.userData.skip = 1
    this.sc.add(this.prev)
    this.bind()
    this.resize()
    this.sync()
    this.loop()
  }

  m(c: any) {
    let x = this.mats.get(c)
    if (!x) {
      x = new THREE.MeshLambertMaterial({ color: c })
      this.mats.set(c, x)
    }
    return x
  }

  lit(c: number) {
    let x = this.mats.get('i' + c)
    if (!x) {
      x = new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.55 })
      this.mats.set('i' + c, x)
    }
    return x
  }

  sw() {
    const o: Record<number, boolean> = {}
    this.store.getState().parts.forEach((p: Part) => {
      if (p.on) o[p.id] = true
    })
    return o
  }

  view() {
    const a = this.w / 2 / this.zoom
    const b = this.h / 2 / this.zoom
    Object.assign(this.cam, { left: -a, right: a, top: b, bottom: -b })
    const ce = Math.cos(this.el)
    this.cam.position.copy(this.tgt).add(new THREE.Vector3(ce * Math.sin(this.az), Math.sin(this.el), ce * Math.cos(this.az)).multiplyScalar(80))
    this.cam.lookAt(this.tgt)
    this.cam.updateProjectionMatrix()
    this.cam.updateMatrixWorld(true)
    if (this.dl) {
      this.dl.position.set(this.tgt.x - 8, 14, this.tgt.z + 6)
      this.dl.target.position.set(this.tgt.x, 0, this.tgt.z)
      this.r.shadowMap.needsUpdate = true
    }
  }

  world(cx: number, cy: number) {
    const [px, py] = this.xy({ clientX: cx, clientY: cy })
    const g = this.ground(px, py)
    return [Math.round(g.x), Math.round(g.z)]
  }

  panBy(dx: number, dy: number) {
    const sa = Math.sin(this.az)
    const ca = Math.cos(this.az)
    const z = 1 / this.zoom
    const f = 1 / (this.zoom * Math.sin(this.el))
    this.tgt.x += -dx * z * ca - dy * f * sa
    this.tgt.z += dx * z * sa - dy * f * ca
    this.view()
  }

  fit() {
    const st = this.store.getState()
    if (!st.parts.length) return
    let x0 = 1e9
    let x1 = -1e9
    let y0 = 1e9
    let y1 = -1e9
    st.parts.forEach((p: Part) => {
      const q = pinsOf(p, st.lib)
      x0 = Math.min(x0, p.x - q.w / 2 - 0.6)
      x1 = Math.max(x1, p.x + q.w / 2 + 0.6)
      y0 = Math.min(y0, p.y - q.h / 2 - 0.6)
      y1 = Math.max(y1, p.y + q.h / 2 + 0.6)
    })
    this.tgt.set((x0 + x1) / 2, 0, (y0 + y1) / 2)
    this.view()
    const box = () => {
      let a = 1e9
      let b = -1e9
      let c = 1e9
      let d = -1e9
      ;[x0, x1].forEach((x) =>
        [y0, y1].forEach((z) =>
          [0, 0.8].forEach((h) => {
            const v = new THREE.Vector3(x, h, z).project(this.cam)
            const sx = ((v.x + 1) / 2) * this.w
            const sy = ((1 - v.y) / 2) * this.h
            a = Math.min(a, sx)
            b = Math.max(b, sx)
            c = Math.min(c, sy)
            d = Math.max(d, sy)
          }),
        ),
      )
      return [a, b, c, d]
    }
    const ui = st.ui || { l: 76, r: 56 }
    const fw = Math.max(this.w - ui.l - ui.r, 240)
    const fh = Math.max(this.h - 170, 240)
    let [a, b, c, d] = box()
    this.zoom = Math.min(56, Math.max(8, this.zoom * Math.min(fw / (b - a || 1), fh / (d - c || 1))))
    this.view()
    ;[a, b, c, d] = box()
    this.panBy(ui.l + fw / 2 - (a + b) / 2, 86 + fh / 2 - (c + d) / 2)
  }

  orbitBy(dx: number, dy: number) {
    this.az -= dx * 0.01
    this.el = Math.min(1.5, Math.max(0.12, this.el + dy * 0.01))
    this.view()
  }

  snap(az: number, el: number) {
    this.az = az
    this.el = el
    this.view()
  }

  resize() {
    const p = this.cv.parentElement as HTMLElement
    this.w = Math.max(p.clientWidth, 1)
    this.h = Math.max(p.clientHeight, 1)
    this.r.setSize(this.w, this.h, false)
    this.view()
  }

  xy(e: { clientX: number; clientY: number }) {
    const b = this.cv.getBoundingClientRect()
    return [e.clientX - b.left, e.clientY - b.top]
  }

  ground(px: number, py: number) {
    const rc = new THREE.Raycaster()
    rc.setFromCamera(new THREE.Vector2((px / this.w) * 2 - 1, -(py / this.h) * 2 + 1), this.cam)
    const o = new THREE.Vector3()
    rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), o)
    return o
  }

  kind(id: number) {
    if (!id) return 'none'
    if (id >= GB) return 'group'
    if (id >= WB) return 'wire'
    const s = id & 63
    return s === 0 ? 'body' : s <= 32 ? 'pin-in' : 'pin-out'
  }

  // The pixel detection: draw the scene with flat id colours, read the one pixel under the cursor.
  pickAt(px: number, py: number) {
    const hid: Array<[THREE.Object3D, boolean]> = []
    const swp: Array<[any, any]> = []
    this.sc.traverse((o: any) => {
      if (o.userData.skip) {
        hid.push([o, o.visible])
        o.visible = false
      } else if (o.isMesh && o.userData.pid) {
        swp.push([o, o.material])
        o.material = o.userData.idm || (o.userData.idm = new THREE.MeshBasicMaterial({ color: o.userData.pid }))
      }
    })
    this.cam.setViewOffset(this.w, this.h, Math.floor(px), Math.floor(py), 1, 1)
    this.r.setRenderTarget(this.pk)
    this.r.render(this.sc, this.cam)
    const b = new Uint8Array(4)
    this.r.readRenderTargetPixels(this.pk, 0, 0, 1, 1, b)
    this.r.setRenderTarget(null)
    this.cam.clearViewOffset()
    hid.forEach(([o, v]) => {
      o.visible = v
    })
    swp.forEach(([o, m]) => {
      o.material = m
    })
    return (b[0] << 16) | (b[1] << 8) | b[2]
  }

  lab(t: string, col = '#1d2618') {
    let m = this.mats.get('l' + t + col)
    if (!m) {
      const c = document.createElement('canvas')
      c.width = 256
      c.height = 96
      const q = c.getContext('2d') as CanvasRenderingContext2D
      q.fillStyle = col
      q.font = '700 54px "Bricolage Grotesque", system-ui, sans-serif'
      q.textAlign = 'center'
      q.textBaseline = 'middle'
      q.fillText(t, 128, 50)
      m = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true })
      this.mats.set('l' + t + col, m)
    }
    return m
  }

  mesh(geo: THREE.BufferGeometry, mat: THREE.Material, pid?: number) {
    const x = new THREE.Mesh(geo, mat)
    x.receiveShadow = true
    if (pid) {
      x.userData.pid = pid
      x.castShadow = true
    } else x.userData.skip = 1
    return x
  }

  rb(w: number, h: number, d: number, c: number, pid?: number, r = 0.1) {
    const k = Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002)
    return this.mesh(new RoundedBoxGeometry(w, h, d, 3, k), this.m(c), pid)
  }

  mkPart(p: Part, lib: Lib, sel: boolean, hp: number) {
    const g = new THREE.Group()
    const s = pinsOf(p, lib)
    const id = p.id * 64
    const MET = 0xc9cfc6
    const at = (m: THREE.Mesh, x: number, y: number, z: number) => {
      m.position.set(p.x + x, y, p.y + z)
      g.add(m)
      return m
    }
    const cyl = (r: number, h: number, c: number, pid?: number, seg = 20) => this.mesh(new THREE.CylinderGeometry(r, r, h, seg), this.m(c), pid)
    const ring = (r: number, t: number, c: number, y: number) => {
      const m = this.mesh(new THREE.TorusGeometry(r, t, 8, 28), this.m(c), id)
      m.rotation.x = -Math.PI / 2
      return at(m, 0, y, 0)
    }
    const zs = (out: boolean, k: number) => pinPos(p, lib, out, k)[1] - p.y
    const text = (t: string, w: number, h: number, x: number, y: number, z: number, col?: string) => {
      const m = this.mesh(new THREE.PlaneGeometry(w, h), this.lab(t, col))
      m.rotation.x = -Math.PI / 2
      return at(m, x, y, z)
    }
    const led = (x: number, z: number, lit?: boolean) => at(this.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), lit ? this.lit(0x7ccf00) : this.m(0xb4bfb1), id), x, 0.29, z)
    g.userData.kind = p.kind
    if (sel) {
      ;[[0.35, 0.5], [0.8, 0.2]].forEach(([e, o]) => {
        const mat = new THREE.MeshBasicMaterial({ color: 0xc4ea4a, transparent: true, opacity: o, depthWrite: false })
        at(this.mesh(new RoundedBoxGeometry(s.w + e, 0.04, s.h + e, 2, 0.02), mat), 0, 0.02 + o * 0.01, 0)
      })
    }
    if (p.kind !== 'chip') {
      at(this.rb(s.w * 0.96, 0.06, s.h * 0.94, 0xdde6d0, id, 0.04), 0, 0.03, 0)
      ;[-1, 1].forEach((a) => [-1, 1].forEach((b) => at(cyl(0.05, 0.03, MET, undefined, 10), a * s.w * 0.44, 0.07, b * s.h * 0.4)))
    }
    const kind = p.kind
    if (GATE[kind] !== undefined) {
      const sh = new THREE.Shape()
      if (kind === 'and' || kind === 'nand') {
        sh.moveTo(-0.85, -0.4)
        sh.lineTo(0, -0.4)
        sh.absarc(0, 0, 0.4, -Math.PI / 2, Math.PI / 2, false)
        sh.lineTo(-0.85, 0.4)
        sh.closePath()
      } else if (kind === 'not' || kind === 'buf') {
        sh.moveTo(-0.7, -0.42)
        sh.lineTo(0.35, 0)
        sh.lineTo(-0.7, 0.42)
        sh.closePath()
      } else {
        const ox = kind === 'xor' || kind === 'xnor' ? 0.06 : 0
        sh.moveTo(-0.85 + ox, -0.4)
        sh.quadraticCurveTo(-0.45 + ox, 0, -0.85 + ox, 0.4)
        sh.quadraticCurveTo(-0.1 + ox, 0.4, 0.4 + ox, 0)
        sh.quadraticCurveTo(-0.1 + ox, -0.4, -0.85 + ox, -0.4)
      }
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 4, curveSegments: 24 })
      geo.rotateX(-Math.PI / 2)
      geo.translate(0.22, 0.1, 0)
      at(this.mesh(geo, this.m(GATE_COL[kind]), id), 0, 0, 0)
      if (kind === 'xor' || kind === 'xnor') {
        const cs = new THREE.Shape()
        cs.moveTo(-0.99, -0.4)
        cs.quadraticCurveTo(-0.59, 0, -0.99, 0.4)
        cs.lineTo(-0.94, 0.4)
        cs.quadraticCurveTo(-0.54, 0, -0.94, -0.4)
        cs.closePath()
        const cg = new THREE.ExtrudeGeometry(cs, { depth: 0.3, bevelEnabled: false })
        cg.rotateX(-Math.PI / 2)
        cg.translate(0.22, 0.1, 0)
        at(this.mesh(cg, this.m(0x1d2618), id), 0, 0, 0)
      }
      if (kind === 'nand' || kind === 'nor' || kind === 'xnor' || kind === 'not') at(this.mesh(new THREE.SphereGeometry(0.13, 16, 12), this.m(0xf6f9f1), id), 0.82, 0.3, 0)
      else at(this.rb(0.3, 0.08, 0.08, MET, id, 0.03), 0.85, 0.28, 0)
      for (let k = 0; k < s.i; k++) at(this.rb(0.36, 0.08, 0.08, MET, id, 0.03), -0.83, 0.28, zs(false, k))
      text(kind.toUpperCase(), 0.72, 0.27, -0.18, 0.53, 0)
    } else if (kind === 'in') {
      at(this.rb(0.8, 0.2, 0.8, 0xf6c1b0, id, 0.1), 0, 0.16, 0)
      at(this.rb(0.56, 0.05, 0.2, 0x1d2618, id, 0.02), 0, 0.27, 0)
      const kx = p.on ? 0.17 : -0.17
      g.userData.lamp = at(this.rb(0.3, 0.3, 0.3, p.on ? LIT.in : OFF.in, id, 0.1), kx, 0.4, 0)
      ;[-0.06, 0, 0.06].forEach((dx) => at(this.rb(0.015, 0.02, 0.24, 0x14180f, undefined, 0.005), kx + dx, 0.56, 0))
      g.userData.lamp2 = led(0.3, -0.3)
    } else if (kind === 'btn') {
      at(this.rb(0.8, 0.2, 0.8, 0xf6c1b0, id, 0.1), 0, 0.16, 0)
      ring(0.27, 0.05, 0x1d2618, 0.27)
      g.userData.lamp = at(cyl(0.22, p.on ? 0.08 : 0.16, OFF.btn, id, 28), 0, p.on ? 0.31 : 0.35, 0)
      g.userData.lamp2 = led(0.3, -0.3)
    } else if (kind === 'hi') {
      at(this.rb(0.8, 0.2, 0.8, 0xd7e87a, id, 0.1), 0, 0.16, 0)
      text('HIGH', 0.7, 0.26, 0, 0.27, 0.05)
      led(0.3, -0.3, true)
    } else if (kind === 'out') {
      at(cyl(0.38, 0.14, 0x3a4a2a, id, 28), 0, 0.13, 0)
      at(cyl(0.26, 0.12, MET, id), 0, 0.26, 0)
      ring(0.27, 0.025, 0x8c948a, 0.22)
      ring(0.27, 0.025, 0x8c948a, 0.3)
      g.userData.lamp = at(this.mesh(new THREE.SphereGeometry(0.33, 28, 20), this.m(OFF.out), id), 0, 0.6, 0)
    } else if (kind === 'clk') {
      at(this.rb(0.8, 0.2, 0.8, 0xcfe58a, id, 0.1), 0, 0.16, 0)
      g.userData.lamp = at(cyl(0.32, 0.08, OFF.clk, id, 32), 0, 0.3, 0)
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6
        const t = at(this.rb(0.03, 0.02, 0.08, 0x1d2618, undefined, 0.005), Math.sin(a) * 0.26, 0.35, Math.cos(a) * 0.26)
        t.rotation.y = a
      }
      at(cyl(0.07, 0.14, MET, id, 12), 0.3, 0.33, 0.3)
      const piv = new THREE.Group()
      piv.position.set(p.x, 0.38, p.y)
      const hand = this.rb(0.07, 0.07, 0.3, 0x1d2618, id, 0.02)
      hand.position.z = -0.14
      piv.add(hand)
      g.add(piv)
      g.userData.hand = piv
    } else if (kind === 'fan') {
      at(cyl(0.45, 0.1, 0x3a4a2a, id, 28), 0, 0.11, 0)
      at(cyl(0.07, 0.75, MET, id, 14), 0, 0.5, 0)
      at(cyl(0.2, 0.22, 0x39433a, id, 24), 0, 0.95, 0)
      at(this.rb(0.55, 0.05, 0.12, MET, id, 0.02), -0.75, 0.2, 0)
      const piv = new THREE.Group()
      piv.position.set(p.x, 1.1, p.y)
      piv.add(this.mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 20), this.m(MET), id))
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2
        const b = this.rb(0.95, 0.03, 0.26, 0xf6f9f1, id, 0.012)
        b.position.set(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55)
        b.rotation.y = -a
        b.rotation.z = 0.12
        piv.add(b)
      }
      g.add(piv)
      g.userData.spinner = piv
    } else if (kind === 'motor') {
      at(this.rb(1.0, 0.46, 0.62, 0x39433a, id, 0.1), 0.2, 0.29, 0)
      at(this.rb(0.7, 0.05, 0.12, MET, id, 0.02), -0.65, 0.2, 0)
      at(cyl(0.05, 0.12, MET, id, 10), 0.2, 0.56, 0)
      const piv = new THREE.Group()
      piv.position.set(p.x + 0.2, 0.64, p.y)
      piv.add(this.mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 28), this.m(0xe6d27a), id))
      piv.add(this.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 12), this.m(MET), id))
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        const t = this.rb(0.1, 0.07, 0.1, 0xe6d27a, id, 0.01)
        t.position.set(Math.cos(a) * 0.33, 0, Math.sin(a) * 0.33)
        t.rotation.y = -a
        piv.add(t)
      }
      g.add(piv)
      g.userData.spinner = piv
    } else if (kind === 'tl') {
      at(this.rb(0.34, 1.75, 0.34, 0x262c22, id, 0.1), 0.2, 0.93, 0)
      g.userData.segLit = [0xff4d3a, 0xffd23a, 0x4cd964]
      g.userData.segOff = [0x5a2a26, 0x5a4a22, 0x2a4a2c]
      g.userData.segs = [0, 1, 2].map((k) => at(this.mesh(new THREE.SphereGeometry(0.25, 22, 16), this.m(g.userData.segOff[k]), id), 0.2, 1.5 - k * 0.5, 0))
      for (let k = 0; k < 3; k++) at(this.rb(0.7, 0.05, 0.12, MET, id, 0.02), -0.65, 0.2, zs(false, k))
      ;['R', 'Y', 'G'].forEach((t, k) => text(t, 0.26, 0.2, -0.55, 0.07, zs(false, k)))
    } else if (kind === 'bar') {
      at(this.rb(1.3, 0.4, 3.7, 0x1b2118, id, 0.12), 0.1, 0.26, 0)
      for (let k = 0; k < 4; k++) at(this.rb(0.5, 0.06, 0.1, MET, id, 0.02), -0.95, 0.2, zs(false, k))
      g.userData.segLit = 0x9be000
      g.userData.segs = [0, 1, 2, 3].map((k) => at(this.rb(0.8, 0.05, 0.56, 0x2a3326, id, 0.06), 0.1, 0.5, zs(false, k)))
      text('BAR', 0.5, 0.2, 0.1, 0.47, -1.7, '#e6f2c8')
    } else if (kind === 'seg') {
      at(this.rb(2.2, 0.5, 4.6, 0x1b2118, id, 0.14), 0, 0.31, 0)
      at(this.rb(1.5, 0.05, 3.2, 0x0f130c, id, 0.05), 0.15, 0.58, 0)
      for (let k = 0; k < 7; k++) at(this.rb(0.46, 0.06, 0.16, MET, id, 0.02), -1.3, 0.2, zs(false, k))
      const cx = 0.15
      const spec: number[][] = [[0, -1.15, 1], [0.5, -0.58, 0], [0.5, 0.58, 0], [0, 1.15, 1], [-0.5, 0.58, 0], [-0.5, -0.58, 0], [0, 0, 1]]
      g.userData.segs = spec.map(([x, z, h]) => at(this.rb(h ? 0.9 : 0.18, 0.05, h ? 0.18 : 0.9, 0x2a3326, id, 0.04), cx + x, 0.62, z))
      at(cyl(0.07, 0.05, 0x2a3326, id, 12), cx + 0.62, 0.62, 1.15)
      text('7SEG', 0.6, 0.22, -0.6, 0.58, -2.0, '#e6f2c8')
    } else {
      at(this.rb(2, 0.42, s.h * 0.9, 0x2f3a2c, id, 0.1), 0, 0.21, 0)
      at(this.mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), this.m(0x5d6e55)), -0.75, 0.43, -s.h * 0.34)
      for (let k = 0; k < s.i; k++) at(this.rb(0.5, 0.06, 0.16, MET, id, 0.02), -1.25, 0.21, zs(false, k))
      for (let k = 0; k < s.o; k++) at(this.rb(0.5, 0.06, 0.16, MET, id, 0.02), 1.25, 0.21, zs(true, k))
      if (kind === 'dff') {
        ;['D', 'CK'].forEach((t, k) => text(t, 0.34, 0.2, -0.72, 0.44, zs(false, k), '#e6f2c8'))
        ;['Q', 'NQ'].forEach((t, k) => text(t, 0.34, 0.2, 0.72, 0.44, zs(true, k), '#e6f2c8'))
        text('D-FF', 0.9, 0.34, 0, 0.44, 0, '#e6f2c8')
      } else text((p.chip || '').toUpperCase().slice(0, 9), 1.7, 0.64, 0, 0.44, 0, '#e6f2c8')
    }
    const pin = (out: boolean, k: number) => {
      const slot = out ? 33 + k : 1 + k
      const q = pinPos(p, lib, out, k)
      const c = this.mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 14), this.m(hp === id + slot ? 0xf2704f : out ? 0x4f6b09 : 0x1d2618), id + slot)
      c.position.set(q[0], 0.25, q[1])
      g.add(c)
    }
    for (let k = 0; k < s.i; k++) pin(false, k)
    for (let k = 0; k < s.o; k++) pin(true, k)
    return g
  }

  mkWire(w: Wire, A: number[], B: number[]) {
    const g = new THREE.Group()
    const mx = (A[0] + B[0]) / 2
    const pts: THREE.Vector3[] = []
    const back = B[0] < A[0] + 0.4
    const tz = Math.min(A[1], B[1]) - 1.6
    const route = back
      ? [[A[0], A[1]], [A[0] + 0.7, A[1]], [A[0] + 0.7, tz], [B[0] - 0.7, tz], [B[0] - 0.7, B[1]], [B[0], B[1]]]
      : [[A[0], A[1]], [mx, A[1]], [mx, B[1]], [B[0], B[1]]]
    route.forEach((q) => {
      const v = new THREE.Vector3(q[0], 0.3, q[1])
      if (!pts.length || pts[pts.length - 1].distanceTo(v) > 0.01) pts.push(v)
    })
    if (pts.length < 2) return g
    const path = new THREE.CurvePath<THREE.Vector3>()
    for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(pts[i - 1], pts[i]))
    g.add(this.mesh(new THREE.TubeGeometry(path, pts.length * 12, 0.07, 6, false), this.m(0x8d9b8b), WB + w.id))
    return g
  }

  groups() {
    const m = new Map<number, any>()
    const st = this.store.getState()
    st.parts.forEach((p: Part) => {
      if (!p.g) return
      const q = pinsOf(p, st.lib)
      const o = m.get(p.g) || { name: p.gn || 'Group', ids: [], x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 }
      o.ids.push(p.id)
      o.x0 = Math.min(o.x0, p.x - q.w / 2 - 0.7)
      o.x1 = Math.max(o.x1, p.x + q.w / 2 + 0.7)
      o.y0 = Math.min(o.y0, p.y - q.h / 2 - 0.7)
      o.y1 = Math.max(o.y1, p.y + q.h / 2 + 0.7)
      m.set(p.g, o)
    })
    return m
  }

  mkGroup(id: number, g: any, sel: boolean) {
    const grp = new THREE.Group()
    const w = g.x1 - g.x0
    const h = g.y1 - g.y0
    const t = sel ? 0.2 : 0.14
    const col = gcol(g.name)
    const sh = new THREE.Shape()
    sh.moveTo(0, 0)
    sh.lineTo(w, 0)
    sh.lineTo(w, h)
    sh.lineTo(0, h)
    sh.closePath()
    const fill = new THREE.ShapeGeometry(sh)
    const hole = new THREE.Path()
    hole.moveTo(t, t)
    hole.lineTo(t, h - t)
    hole.lineTo(w - t, h - t)
    hole.lineTo(w - t, t)
    hole.closePath()
    sh.holes.push(hole)
    const add = (geo: THREE.BufferGeometry, op: number, y: number, pid?: number) => {
      const m = this.mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false }), pid)
      m.castShadow = false
      m.rotation.x = -Math.PI / 2
      m.position.set(g.x0, y, g.y1)
      grp.add(m)
    }
    add(fill, 0.12, 0.02, GB + id)
    add(new THREE.ShapeGeometry(sh), sel ? 1 : 0.85, 0.03, GB + id)
    return grp
  }

  put(k: string, sig: string, mk: () => THREE.Group) {
    const o = this.objs.get(k)
    if (o && o.sig === sig) return
    if (o) this.drop(k)
    const g = mk()
    this.sc.add(g)
    this.objs.set(k, { g, sig })
  }

  drop(k: string) {
    const o = this.objs.get(k)
    if (!o) return
    this.sc.remove(o.g)
    o.g.traverse((m: any) => {
      if (m.geometry) m.geometry.dispose()
      if (m.userData.idm) m.userData.idm.dispose()
    })
    this.objs.delete(k)
  }

  sync() {
    const s = this.store.getState()
    const lib: Lib = s.lib
    const topo = JSON.stringify([s.parts.map((p: Part) => [p.id, p.kind, p.chip]), s.wires, s.libVer])
    if (topo !== this.topo) {
      this.topo = topo
      this.comp = compile({ parts: s.parts, wires: s.wires }, lib)
      this.v = new Uint8Array(this.comp.n)
      for (let i = 0; i < 12; i++) this.v = step(this.comp, this.v, this.sw())
    }
    const keep = new Set<string>()
    const pm = new Map<number, Part>(s.parts.map((p: Part) => [p.id, p]))
    s.parts.forEach((p: Part) => {
      const sel = s.sel.includes(p.id)
      const hp = this.hover < WB && this.hover >> 6 === p.id ? this.hover : 0
      keep.add('p' + p.id)
      this.put('p' + p.id, [p.x, p.y, p.kind, p.chip, sel, hp, lib[p.chip || ''] ? 1 : 0, p.on ? 1 : 0].join(), () => this.mkPart(p, lib, sel, hp))
    })
    s.wires.forEach((w: Wire) => {
      const a = pm.get(w.from[0])
      const b = pm.get(w.to[0])
      if (!a || !b) return
      const A = pinPos(a, lib, true, w.from[1])
      const B = pinPos(b, lib, false, w.to[1])
      keep.add('w' + w.id)
      this.put('w' + w.id, [A, B].join(), () => this.mkWire(w, A, B))
    })
    this.groups().forEach((g, gid) => {
      keep.add('g' + gid)
      this.put('g' + gid, [g.x0, g.x1, g.y0, g.y1, g.name, g.ids.every((i: number) => s.sel.includes(i))].join(), () => this.mkGroup(gid, g, g.ids.every((i: number) => s.sel.includes(i))))
    })
    Array.from(this.objs.keys()).forEach((k) => {
      if (!keep.has(k)) this.drop(k)
    })
    this.r.shadowMap.needsUpdate = true
  }

  paint() {
    const c = this.comp
    if (!c) return {}
    const s = this.store.getState()
    const val: Record<number, number> = {}
    c.ins.forEach((q: any) => (val[q.id] = this.v[q.net]))
    c.outs.forEach((q: any) => (val[q.id] = this.v[q.net]))
    c.clks.forEach((q: any) => {
      if (q.id) val[q.id] = this.v[q.net]
    })
    c.btns.forEach((q: any) => (val[q.id] = this.v[q.net]))
    const segv: Record<number, number[]> = {}
    c.segs.forEach((q: any) => (segv[q.id] = q.nets))
    this.objs.forEach((o, k) => {
      const id = +k.slice(1)
      if (k[0] === 'w') {
        const m = o.g.children[0] as THREE.Mesh
        if (m) m.material = s.wsel === id ? this.lit(0xf2704f) : this.v[c.top.get('w' + id) ?? 0] ? this.lit(0x7ccf00) : this.m(0xb4bfb1)
        return
      }
      const u = o.g.userData
      if (u.lamp2) u.lamp2.material = val[id] ? this.lit(0x7ccf00) : this.m(0xb4bfb1)
      if (u.segs && segv[id])
        u.segs.forEach((m: THREE.Mesh, i: number) => {
          const on = Array.isArray(u.segLit) ? u.segLit[i] : u.segLit || 0xff5a36
          const off = Array.isArray(u.segOff) ? u.segOff[i] : 0x2a3326
          m.material = this.v[segv[id][i]] ? this.lit(on) : this.m(off)
        })
      if (u.spinner && segv[id]) {
        const sp = this.spin.get(id) || { w: 0, a: 0 }
        if (s.run) {
          sp.w += ((this.v[segv[id][0]] ? 14 : 0) - sp.w) * 0.05
          sp.a += sp.w * 0.016
        }
        this.spin.set(id, sp)
        u.spinner.rotation.y = sp.a
      }
      if (u.lamp) u.lamp.material = val[id] ? this.lit(LIT[u.kind]) : this.m(OFF[u.kind])
      if (u.hand) u.hand.rotation.y = -this.t * (Math.PI / 24)
    })
    return val
  }

  ghost(d: any, x: number, y: number) {
    const key = (d.sample || d.chip || d.k) + '|' + x + '|' + y
    if (key === this.ghKey) return
    this.clearGhost()
    this.ghKey = key
    const st = this.store.getState()
    const g = new THREE.Group()
    const put = (kind: string, px: number, py: number, chip?: string) => g.add(this.mkPart({ id: -1, kind, chip, x: px, y: py } as Part, st.lib, true, 0))
    if (d.sample) {
      const def = buildSample(d.sample)
      const mx = Math.min(...def.parts.map((p: Part) => p.x))
      const my = Math.min(...def.parts.map((p: Part) => p.y))
      def.parts.forEach((p: Part) => put(p.kind, p.x - mx + x, p.y - my + y))
    } else if (d.chip) {
      const def = st.lib[d.chip]
      if (!def || !def.parts.length) return
      const mx = Math.min(...def.parts.map((p: Part) => p.x))
      const my = Math.min(...def.parts.map((p: Part) => p.y))
      def.parts.forEach((p: Part) => put(p.kind, p.x - mx + x, p.y - my + y, p.chip))
    } else put(d.k, x, y)
    g.traverse((m: any) => {
      if (!m.isMesh) return
      m.userData.skip = 1
      m.castShadow = false
      if (!m.material.transparent) {
        m.material = m.material.clone()
        m.material.transparent = true
        m.material.opacity = 0.62
        m.material.depthWrite = false
        this.ghMats.push(m.material)
      }
    })
    this.sc.add(g)
    this.gh = g
  }

  clearGhost() {
    if (!this.gh) return
    this.sc.remove(this.gh)
    this.gh.traverse((m: any) => {
      if (m.geometry) m.geometry.dispose()
    })
    this.ghMats.forEach((m) => m.dispose())
    this.ghMats = []
    this.gh = null
    this.ghKey = ''
  }

  place() {
    const h = this.tagHost
    if (!h) return
    const st = this.store.getState()
    const gm = this.groups()
    h.querySelectorAll<HTMLElement>('[data-t]').forEach((el) => {
      const [t, id] = (el.dataset.t as string).split(':')
      let v: THREE.Vector3 | null = null
      if (t === 'p') {
        const p = st.parts.find((q: Part) => q.id === +id)
        if (p) v = new THREE.Vector3(p.x, 1.1, p.y)
      } else {
        const g = gm.get(+id)
        if (g) v = new THREE.Vector3(g.x0, 0.1, g.y0)
      }
      if (!v) {
        el.style.display = 'none'
        return
      }
      v.project(this.cam)
      el.style.display = ''
      el.style.transform = 'translate(' + ((v.x + 1) / 2) * this.w + 'px, ' + ((1 - v.y) / 2) * this.h + 'px) translate(' + (t === 'p' ? '-50%' : '0') + ', -100%)'
    })
  }

  tags() {
    const st = this.store.getState()
    const out: any[] = []
    st.sel.slice(0, 6).forEach((id: number) => {
      const p = st.parts.find((q: Part) => q.id === id)
      if (!p) return
      const v = new THREE.Vector3(p.x, 1.1, p.y).project(this.cam)
      out.push({ id, k: p.kind === 'chip' ? p.chip : p.kind, x: ((v.x + 1) / 2) * this.w, y: ((1 - v.y) / 2) * this.h })
    })
    this.groups().forEach((g, gid) => {
      const v = new THREE.Vector3(g.x0, 0.1, g.y0).project(this.cam)
      out.push({ id: 'g' + gid, gid, grp: true, k: g.name, c: '#' + gcol(g.name).toString(16).padStart(6, '0'), x: ((v.x + 1) / 2) * this.w, y: ((1 - v.y) / 2) * this.h })
    })
    return out
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const s = this.store.getState()
    if (s.drag && s.dragPos) {
      const [gx, gy] = this.world(s.dragPos[0], s.dragPos[1])
      this.ghost(s.drag, gx, gy)
    } else if (this.gh) this.clearGhost()
    if (s.run && this.comp) {
      const sw = this.sw()
      for (let i = 0; i < s.speed; i++) {
        this.v = step(this.comp, this.v, sw, this.t)
        this.t++
      }
    }
    const val = this.paint()
    if (++this.fr % 2 === 0) this.onTick(this.t, val, [])
    this.r.render(this.sc, this.cam)
    this.place()
  }

  inRect(r: any) {
    const out: number[] = []
    const st = this.store.getState()
    st.parts.forEach((p: Part) => {
      const q = pinsOf(p, st.lib)
      let x0 = 1e9
      let y0 = 1e9
      let x1 = -1e9
      let y1 = -1e9
      ;[-1, 1].forEach((a) =>
        [-1, 1].forEach((b) =>
          [0, 0.7].forEach((h) => {
            const v = new THREE.Vector3(p.x + (a * (q.w + 0.3)) / 2, h, p.y + (b * q.h) / 2).project(this.cam)
            const sx = ((v.x + 1) / 2) * this.w
            const sy = ((1 - v.y) / 2) * this.h
            x0 = Math.min(x0, sx)
            x1 = Math.max(x1, sx)
            y0 = Math.min(y0, sy)
            y1 = Math.max(y1, sy)
          }),
        ),
      )
      if (x1 >= r.x && x0 <= r.x + r.w && y1 >= r.y && y0 <= r.y + r.h) out.push(p.id)
    })
    return out
  }

  down(e: PointerEvent) {
    const [px, py] = this.xy(e)
    this.cv.setPointerCapture(e.pointerId)
    this.cv.focus()
    const id = this.pickAt(px, py)
    const k = this.kind(id)
    const st = this.store.getState()
    const d: any = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, id, k, mv: false, mode: 'none', shift: e.shiftKey, alt: e.altKey }
    if (e.button === 1 && !e.shiftKey) d.mode = 'orbit'
    else if (e.button === 2 || e.button === 1 || this.space) d.mode = 'pan'
    else if (k === 'pin-in' || k === 'pin-out') d.mode = 'wire'
    else if (k === 'body' || k === 'group') {
      d.mode = 'body'
      d.pid = k === 'body' ? id >> 6 : 0
      const bp = st.parts.find((q: Part) => q.id === d.pid)
      if (bp && bp.kind === 'btn' && !e.altKey) {
        st.hold(bp.id, true)
        d.btn = bp.id
      }
      const mem: number[] = k === 'body' ? [d.pid] : st.parts.filter((p: Part) => p.g === id - GB).map((p: Part) => p.id)
      let sel: number[] = st.sel
      const has = mem.every((x) => sel.includes(x))
      if (e.altKey) sel = has ? sel.filter((x) => !mem.includes(x)) : Array.from(new Set([...sel, ...mem]))
      else if (!has) sel = e.shiftKey ? Array.from(new Set([...sel, ...mem])) : mem
      st.select(sel)
      d.g0 = this.ground(px, py)
      d.st = {}
      st.parts.forEach((p: Part) => {
        if (sel.includes(p.id)) d.st[p.id] = [p.x, p.y]
      })
    } else if (k === 'wire') {
      st.pickWire(id - WB)
      d.mode = 'click'
    } else if (e.shiftKey || e.altKey || st.tool === 'select') {
      d.mode = 'marq'
      d.p0 = [px, py]
    } else {
      d.mode = 'orbit'
      d.empty = true
    }
    this.d = d
  }

  move(e: PointerEvent) {
    const [px, py] = this.xy(e)
    const d = this.d
    if (!d) {
      if (this.busy) return
      this.busy = true
      requestAnimationFrame(() => {
        this.busy = false
        const id = this.pickAt(px, py)
        const k = this.kind(id)
        if (id !== this.hover) {
          this.hover = id
          this.sync()
        }
        this.cv.style.cursor = this.space ? 'grab' : k === 'none' ? (this.store.getState().tool === 'select' ? 'crosshair' : 'default') : k.startsWith('pin') ? 'crosshair' : k === 'body' || k === 'group' ? 'move' : 'pointer'
      })
      return
    }
    if (!d.mv && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) d.mv = true
    if (d.mv && (d.mode === 'orbit' || d.mode === 'pan')) this.cv.style.cursor = 'grabbing'
    if (!d.mv) return
    if (d.mode === 'pan' || d.mode === 'orbit') {
      const dx = e.clientX - d.lx
      const dy = e.clientY - d.ly
      d.lx = e.clientX
      d.ly = e.clientY
      if (d.mode === 'orbit') {
        this.az -= dx * 0.008
        this.el = Math.min(1.5, Math.max(0.12, this.el + dy * 0.008))
      } else {
        const sa = Math.sin(this.az)
        const ca = Math.cos(this.az)
        const z = 1 / this.zoom
        const f = 1 / (this.zoom * Math.sin(this.el))
        this.tgt.x += -dx * z * ca - dy * f * sa
        this.tgt.z += dx * z * sa - dy * f * ca
      }
      this.view()
    } else if (d.mode === 'body') {
      const g = this.ground(px, py)
      const dx = Math.round(g.x - d.g0.x)
      const dz = Math.round(g.z - d.g0.z)
      if (!d.marked && (dx || dz)) {
        d.marked = true
        this.store.getState().mark()
      }
      this.store.getState().moveTo(d.st, dx, dz)
    } else if (d.mode === 'wire') {
      const st = this.store.getState()
      const p = st.parts.find((q: Part) => q.id === d.id >> 6)
      if (!p) return
      const sl = d.id & 63
      const out = sl > 32
      const A = pinPos(p, st.lib, out, out ? sl - 33 : sl - 1)
      const g = this.ground(px, py)
      this.prev.geometry.setFromPoints([new THREE.Vector3(A[0], 0.3, A[1]), new THREE.Vector3(g.x, 0.3, g.z)])
      this.prev.visible = true
    } else if (d.mode === 'marq') {
      d.r = { x: Math.min(px, d.p0[0]), y: Math.min(py, d.p0[1]), w: Math.abs(px - d.p0[0]), h: Math.abs(py - d.p0[1]) }
      this.onMarquee(d.r)
    }
  }

  up(e: PointerEvent) {
    const d = this.d
    this.d = null
    this.cv.style.cursor = 'default'
    if (!d) return
    const [px, py] = this.xy(e)
    const st = this.store.getState()
    if (d.btn) st.hold(d.btn, false)
    this.prev.visible = false
    this.onMarquee(null)
    if (d.mode === 'wire' && d.mv) {
      const id = this.pickAt(px, py)
      const k = this.kind(id)
      if (k.startsWith('pin') && k !== d.k) {
        const a = d.k === 'pin-out' ? d.id : id
        const b = d.k === 'pin-out' ? id : d.id
        st.connect([a >> 6, (a & 63) - 33], [b >> 6, (b & 63) - 1])
      }
    } else if (d.mode === 'marq') {
      if (d.mv && d.r) {
        const ids = this.inRect(d.r)
        st.select(d.shift || d.alt ? Array.from(new Set([...st.sel, ...ids])) : ids)
      } else if (!(d.shift || d.alt)) st.select([])
    } else if (d.mode === 'body' && !d.mv) {
      const p = st.parts.find((q: Part) => q.id === d.pid)
      if (p && p.kind === 'in' && !d.alt) st.toggle(p.id)
    } else if (d.empty && !d.mv) st.select([])
    else if (d.mode === 'pan' && d.mv) st.setView([Math.round(this.tgt.x), Math.round(this.tgt.z)])
  }

  bind() {
    const cv = this.cv
    const on = (t: any, n: string, f: any, o?: any) => {
      t.addEventListener(n, f, o)
      this.off.push(() => t.removeEventListener(n, f, o))
    }
    on(cv, 'pointerdown', (e: PointerEvent) => this.down(e))
    on(cv, 'pointermove', (e: PointerEvent) => this.move(e))
    on(cv, 'pointerup', (e: PointerEvent) => this.up(e))
    on(cv, 'contextmenu', (e: Event) => e.preventDefault())
    const reset = () => {
      if (this.d && this.d.btn) this.store.getState().hold(this.d.btn, false)
      this.d = null
      this.prev.visible = false
      this.onMarquee(null)
      cv.style.cursor = 'default'
    }
    on(cv, 'pointercancel', reset)
    on(cv, 'lostpointercapture', reset)
    on(window, 'blur', () => {
      this.space = false
      reset()
    })
    on(
      cv,
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault()
        const [px, py] = this.xy(e)
        const g0 = this.ground(px, py)
        this.zoom = Math.min(90, Math.max(8, this.zoom * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))))
        this.view()
        const g1 = this.ground(px, py)
        this.tgt.x += g0.x - g1.x
        this.tgt.z += g0.z - g1.z
        this.view()
      },
      { passive: false },
    )
    on(window, 'keydown', (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t !== cv && t !== document.body) return
      if (e.code === 'Space') {
        this.space = true
        cv.style.cursor = 'grab'
        e.preventDefault()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') this.store.getState().remove()
      if (e.key === 'Escape') this.store.getState().select([])
      const mod = e.ctrlKey || e.metaKey
      const k = e.key.toLowerCase()
      if (mod && k === 'z') {
        e.preventDefault()
        if (e.shiftKey) this.store.getState().redo()
        else this.store.getState().undo()
      }
      if (mod && k === 'y') {
        e.preventDefault()
        this.store.getState().redo()
      }
      if (!mod && k === 'v') this.store.setState({ tool: this.store.getState().tool === 'select' ? 'orbit' : 'select' })
      if (!mod && k === 'f') this.fit()
      const pn: Record<string, number[]> = { arrowleft: [90, 0], a: [90, 0], arrowright: [-90, 0], d: [-90, 0], arrowup: [0, 90], w: [0, 90], arrowdown: [0, -90], s: [0, -90] }
      if (!mod && pn[k]) {
        e.preventDefault()
        this.panBy(pn[k][0], pn[k][1])
      }
    })
    on(window, 'keyup', (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        this.space = false
        cv.style.cursor = 'default'
      }
    })
    const ro = new ResizeObserver(() => this.resize())
    ro.observe(cv.parentElement as Element)
    this.off.push(() => ro.disconnect())
    this.off.push(this.store.subscribe(() => this.sync()))
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.clearGhost()
    this.off.forEach((f) => f())
    Array.from(this.objs.keys()).forEach((k) => this.drop(k))
    this.r.dispose()
    this.pk.dispose()
  }
}
