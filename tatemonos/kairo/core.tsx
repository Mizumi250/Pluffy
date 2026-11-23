/* @arkzen:meta
name: kairo
version: 1.0.0
description: Kairo, a 3D circuit board. Wire NAND gates, save the result as a chip, and reuse that chip as a part in bigger circuits.
auth: false
*/

/* @arkzen:meta:web
title: Kairo - build chips from gates
label: Kairo
description: Wire NAND gates on a 3D board, save the result as a chip, and reuse it as a part.
favicon: /tatemonos/kairo/assets/images/favicon.svg
*/

/* @arkzen:database:chips
table: chips
timestamps: true
softDeletes: false
columns:
  name:
    type: string
    length: 60
    nullable: false
  author:
    type: string
    length: 60
    default: guest
  note:
    type: string
    length: 160
    nullable: true
  blueprint:
    type: longText
    nullable: false
seeder:
  count: 2
  data:
    - name: half-adder
      author: Haruto Sakamoto
      note: Adds two bits. The first lamp is SUM, the second is CARRY.
      blueprint: '{"parts":[{"id":1,"kind":"in","x":0,"y":0},{"id":2,"kind":"in","x":0,"y":3},{"id":3,"kind":"nand","x":4,"y":1},{"id":4,"kind":"nand","x":8,"y":0},{"id":5,"kind":"nand","x":8,"y":3},{"id":6,"kind":"nand","x":12,"y":1},{"id":7,"kind":"nand","x":8,"y":6},{"id":8,"kind":"out","x":16,"y":1},{"id":9,"kind":"out","x":12,"y":6}],"wires":[{"id":1,"from":[1,0],"to":[3,0]},{"id":2,"from":[2,0],"to":[3,1]},{"id":3,"from":[1,0],"to":[4,0]},{"id":4,"from":[3,0],"to":[4,1]},{"id":5,"from":[2,0],"to":[5,0]},{"id":6,"from":[3,0],"to":[5,1]},{"id":7,"from":[4,0],"to":[6,0]},{"id":8,"from":[5,0],"to":[6,1]},{"id":9,"from":[6,0],"to":[8,0]},{"id":10,"from":[3,0],"to":[7,0]},{"id":11,"from":[3,0],"to":[7,1]},{"id":12,"from":[7,0],"to":[9,0]}]}'
    - name: sr-latch
      author: Dmitri Volkov
      note: One bit of memory. Both inputs high keeps the last state.
      blueprint: '{"parts":[{"id":1,"kind":"in","x":0,"y":0},{"id":2,"kind":"in","x":0,"y":4},{"id":3,"kind":"nand","x":4,"y":0},{"id":4,"kind":"nand","x":4,"y":4},{"id":5,"kind":"out","x":8,"y":0},{"id":6,"kind":"out","x":8,"y":4}],"wires":[{"id":1,"from":[1,0],"to":[3,0]},{"id":2,"from":[4,0],"to":[3,1]},{"id":3,"from":[2,0],"to":[4,0]},{"id":4,"from":[3,0],"to":[4,1]},{"id":5,"from":[3,0],"to":[5,0]},{"id":6,"from":[4,0],"to":[6,0]}]}'
*/

/* @arkzen:api:chips
model: Chip
controller: ChipController
prefix: /api/kairo
middleware: []
endpoints:
  index:
    method: GET
    route: /chips
    description: List chips saved to the shared library
    query:
      per_page: integer|default:100
    response:
      type: paginated
  store:
    method: POST
    route: /chips
    description: Save a chip blueprint to the shared library
    validation:
      name: required|string|max:60
      author: sometimes|string|max:60
      note: sometimes|string|max:160
      blueprint: required|string
    response:
      type: single
*/

/* @arkzen:web:script */

import * as THREE from 'three'

// Concept: a tabletop where logic gates sit like physical blocks you can pick up.
// Signature device: the board is a 3D scene, and every click is resolved by reading
// one pixel from an id-coloured copy of that scene (GPU picking), the way Figma
// decides between selecting, dragging and drawing.
// Objects behind the scene: the document is plain data (Part, Wire, Def). Meshes are
// rebuilt from it, and the simulator is compiled from it, so none of them know each other.

export type Part = { id: number; kind: string; x: number; y: number; chip?: string; on?: boolean }
export type Wire = { id: number; from: number[]; to: number[] }
export type Def = { parts: Part[]; wires: Wire[] }
export type Lib = Record<string, Def>

export const START: Def = {
  parts: [
    { id: 1, kind: 'in', x: 0, y: 0 },
    { id: 2, kind: 'in', x: 0, y: 3 },
    { id: 3, kind: 'nand', x: 4, y: 1 },
    { id: 4, kind: 'out', x: 8, y: 1 },
  ],
  wires: [
    { id: 1, from: [1, 0], to: [3, 0] },
    { id: 2, from: [2, 0], to: [3, 1] },
    { id: 3, from: [3, 0], to: [4, 0] },
  ],
}

export const pinsOf = (p: Part, lib: Lib) => {
  if (p.kind === 'nand') return { i: 2, o: 1, w: 2, h: 1 }
  if (p.kind === 'in') return { i: 0, o: 1, w: 1, h: 1 }
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
  const run = (d: Def, inNets: number[], depth: number, isTop: boolean): number[] => {
    const src = new Map<string, number>()
    const ord = (k: string) => d.parts.filter((p) => p.kind === k).sort((a, b) => a.y - b.y || a.x - b.x)
    ord('in').forEach((p, i) => {
      const net = isTop ? n++ : inNets[i] ?? 0
      src.set(p.id + ':0', net)
      if (isTop) ins.push({ id: p.id, net })
    })
    d.parts.forEach((p) => {
      if (p.kind === 'nand') src.set(p.id + ':0', n++)
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
      if (p.kind === 'nand') gates.push(0, get(p.id, 0), get(p.id, 1), src.get(p.id + ':0') as number)
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
  return { gates, n, top, ins, outs }
}

// One tick: every gate reads the previous values, so feedback (latches) works.
export const step = (c: any, v: Uint8Array, sw: Record<number, boolean>) => {
  const nv = new Uint8Array(c.n)
  const g = c.gates
  for (let i = 0; i < g.length; i += 4) nv[g[i + 3]] = g[i] ? v[g[i + 1]] : (v[g[i + 1]] & v[g[i + 2]]) ^ 1
  c.ins.forEach((s: any) => {
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
const BODY: Record<string, number> = { nand: 0xb9e03c, chip: 0x86c1ea, in: 0xf2a08a, out: 0xd8dccb }
const LIT: Record<string, number> = { in: 0xf2704f, out: 0xf7cf3d }

export class Stage {
  cv: HTMLCanvasElement
  store: any
  r: THREE.WebGLRenderer
  sc = new THREE.Scene()
  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 300)
  pk = new THREE.WebGLRenderTarget(1, 1)
  tgt = new THREE.Vector3(5, 0, 1.5)
  zoom = 40
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
    this.sc.add(new THREE.HemisphereLight(0xffffff, 0xcfd8c0, 1.9))
    const dl = new THREE.DirectionalLight(0xffffff, 1.0)
    dl.position.set(-5, 10, 4)
    this.sc.add(dl)
    const slab = new THREE.Mesh(new THREE.BoxGeometry(90, 0.4, 90), this.m(0xf6f9f1))
    slab.position.y = -0.2
    slab.userData.skip = 1
    this.sc.add(slab)
    const grid = new THREE.GridHelper(90, 90, 0xcfdac3, 0xdde6d2)
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
    this.cam.position.copy(this.tgt).add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(80))
    this.cam.lookAt(this.tgt)
    this.cam.updateProjectionMatrix()
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

  lab(t: string) {
    let m = this.mats.get('l' + t)
    if (!m) {
      const c = document.createElement('canvas')
      c.width = 256
      c.height = 96
      const q = c.getContext('2d') as CanvasRenderingContext2D
      q.fillStyle = '#1d2618'
      q.font = '700 54px "Bricolage Grotesque", system-ui, sans-serif'
      q.textAlign = 'center'
      q.textBaseline = 'middle'
      q.fillText(t, 128, 50)
      m = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true })
      this.mats.set('l' + t, m)
    }
    return m
  }

  mesh(geo: THREE.BufferGeometry, mat: THREE.Material, pid?: number) {
    const x = new THREE.Mesh(geo, mat)
    if (pid) x.userData.pid = pid
    else x.userData.skip = 1
    return x
  }

  mkPart(p: Part, lib: Lib, sel: boolean, hp: number) {
    const g = new THREE.Group()
    const s = pinsOf(p, lib)
    const H = p.kind === 'nand' ? 0.5 : 0.7
    const body = this.mesh(new THREE.BoxGeometry(s.w * 0.94, H, s.h * 0.92), this.m(BODY[p.kind]), p.id * 64)
    body.position.set(p.x, H / 2, p.y)
    g.add(body)
    g.userData.kind = p.kind
    if (sel) {
      const pad = this.mesh(new THREE.BoxGeometry(s.w + 0.4, 0.06, s.h + 0.4), this.m(0x4f6b09))
      pad.position.set(p.x, 0.03, p.y)
      g.add(pad)
    }
    const t = p.kind === 'nand' ? 'NAND' : p.kind === 'in' ? 'SW' : p.kind === 'out' ? 'LED' : (p.chip || '').toUpperCase().slice(0, 9)
    const lb = this.mesh(new THREE.PlaneGeometry(Math.min(s.w * 0.8, 2.4), (Math.min(s.w * 0.8, 2.4) * 96) / 256), this.lab(t))
    lb.rotation.x = -Math.PI / 2
    lb.position.set(p.x, H + 0.01, p.y)
    g.add(lb)
    const pin = (out: boolean, k: number) => {
      const slot = out ? 33 + k : 1 + k
      const q = pinPos(p, lib, out, k)
      const c = this.mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 10), this.m(hp === p.id * 64 + slot ? 0xf2704f : out ? 0x4f6b09 : 0x1d2618), p.id * 64 + slot)
      c.position.set(q[0], H / 2, q[1])
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
    ;[[A[0], A[1]], [mx, A[1]], [mx, B[1]], [B[0], B[1]]].forEach((q) => {
      const v = new THREE.Vector3(q[0], 0.3, q[1])
      if (!pts.length || pts[pts.length - 1].distanceTo(v) > 0.01) pts.push(v)
    })
    if (pts.length < 2) return g
    const path = new THREE.CurvePath<THREE.Vector3>()
    for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(pts[i - 1], pts[i]))
    g.add(this.mesh(new THREE.TubeGeometry(path, pts.length * 12, 0.07, 6, false), this.m(0x8d9b8b), WB + w.id))
    return g
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
      this.put('p' + p.id, [p.x, p.y, p.kind, p.chip, sel, hp, lib[p.chip || ''] ? 1 : 0].join(), () => this.mkPart(p, lib, sel, hp))
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
    Array.from(this.objs.keys()).forEach((k) => {
      if (!keep.has(k)) this.drop(k)
    })
  }

  paint() {
    const c = this.comp
    if (!c) return
    const s = this.store.getState()
    const val = new Map<number, number>()
    c.ins.forEach((q: any) => val.set(q.id, this.v[q.net]))
    c.outs.forEach((q: any) => val.set(q.id, this.v[q.net]))
    this.objs.forEach((o, k) => {
      const m = o.g.children[0] as THREE.Mesh
      if (!m) return
      const id = +k.slice(1)
      if (k[0] === 'w') m.material = this.m(s.wsel === id ? 0xf2704f : this.v[c.top.get('w' + id) ?? 0] ? 0x5aa800 : 0x8d9b8b)
      else if (o.g.userData.kind === 'in' || o.g.userData.kind === 'out') m.material = this.m(val.get(id) ? LIT[o.g.userData.kind] : BODY[o.g.userData.kind])
    })
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const s = this.store.getState()
    if (s.run && this.comp) {
      const sw = this.sw()
      for (let i = 0; i < s.speed; i++) this.v = step(this.comp, this.v, sw)
    }
    this.paint()
    this.r.render(this.sc, this.cam)
  }

  inRect(r: any) {
    const out: number[] = []
    this.store.getState().parts.forEach((p: Part) => {
      const v = new THREE.Vector3(p.x, 0.3, p.y).project(this.cam)
      const sx = ((v.x + 1) / 2) * this.w
      const sy = ((1 - v.y) / 2) * this.h
      if (sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) out.push(p.id)
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
    const d: any = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, id, k, mv: false, mode: 'none', shift: e.shiftKey }
    if (e.button === 1 || this.space) d.mode = 'pan'
    else if (k === 'pin-in' || k === 'pin-out') d.mode = 'wire'
    else if (k === 'body') {
      d.mode = 'body'
      d.pid = id >> 6
      let sel: number[] = st.sel
      if (!sel.includes(d.pid)) sel = e.shiftKey ? [...sel, d.pid] : [d.pid]
      st.select(sel)
      d.g0 = this.ground(px, py)
      d.st = {}
      st.parts.forEach((p: Part) => {
        if (sel.includes(p.id)) d.st[p.id] = [p.x, p.y]
      })
    } else if (k === 'wire') {
      st.pickWire(id - WB)
      d.mode = 'click'
    } else {
      d.mode = 'marq'
      d.p0 = [px, py]
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
        this.cv.style.cursor = this.space ? 'grab' : k === 'none' ? 'default' : k.startsWith('pin') ? 'crosshair' : k === 'body' ? 'move' : 'pointer'
      })
      return
    }
    if (!d.mv && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) d.mv = true
    if (!d.mv) return
    if (d.mode === 'pan') {
      const dx = e.clientX - d.lx
      const dy = e.clientY - d.ly
      d.lx = e.clientX
      d.ly = e.clientY
      const k = 0.7071 / this.zoom
      this.tgt.x += (-dx - dy / 0.577) * k
      this.tgt.z += (dx - dy / 0.577) * k
      this.view()
    } else if (d.mode === 'body') {
      const g = this.ground(px, py)
      this.store.getState().moveTo(d.st, Math.round(g.x - d.g0.x), Math.round(g.z - d.g0.z))
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
    if (!d) return
    const [px, py] = this.xy(e)
    const st = this.store.getState()
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
        st.select(d.shift ? Array.from(new Set([...st.sel, ...ids])) : ids)
      } else st.select([])
    } else if (d.mode === 'body' && !d.mv) {
      const p = st.parts.find((q: Part) => q.id === d.pid)
      if (p && p.kind === 'in') st.toggle(p.id)
    } else if (d.mode === 'pan' && d.mv) st.setView([Math.round(this.tgt.x), Math.round(this.tgt.z)])
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
    on(
      cv,
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault()
        this.zoom = Math.min(90, Math.max(16, this.zoom * Math.exp(-e.deltaY * 0.0015)))
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
    this.off.forEach((f) => f())
    Array.from(this.objs.keys()).forEach((k) => this.drop(k))
    this.r.dispose()
    this.pk.dispose()
  }
}

/* @arkzen:web:script:end */

/* @arkzen:web:style */

@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap');

.kr-root {
  --ink: #1d2618;
  --ink2: #4b5a45;
  --paper: #f6f9f1;
  --shell: #d5e2c4;
  --board: #eaf0e3;
  --line: #d3dec7;
  --lime: #b9e03c;
  --lime-d: #4f6b09;
  min-height: 100dvh;
  padding: 20px;
  background: var(--shell);
  color: var(--ink);
  font-family: 'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 16px;
}
.kr-root *, .kr-root *::before, .kr-root *::after { box-sizing: border-box; }
.kr-root :focus-visible { outline: 2px solid var(--ink); outline-offset: -2px; }
.kr-win {
  height: calc(100dvh - 40px);
  min-height: 560px;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr) 312px;
  background: var(--paper);
  border-radius: 28px;
  overflow: hidden;
}
.kr-side, .kr-insp { overflow-y: auto; padding: 24px 0; }
.kr-side { border-right: 1px solid var(--line); }
.kr-insp { border-left: 1px solid var(--line); }
.kr-brand, .kr-sec { padding: 0 20px; }
.kr-brand h1 { margin: 0 0 8px; font: 700 34px/1.05 'Bricolage Grotesque', system-ui, sans-serif; }
.kr-brand p, .kr-note, .kr-help { margin: 0; max-width: 36ch; font-size: 15px; line-height: 1.5; color: var(--ink2); }
.kr-note { padding: 0 20px; }
.kr-h { margin: 28px 20px 10px; font: 700 19px/1.2 'Bricolage Grotesque', system-ui, sans-serif; }
.kr-sec { margin-bottom: 28px; }
.kr-sec .kr-h { margin: 0 0 12px; }
.kr-row {
  display: flex; gap: 12px; align-items: center; width: 100%;
  padding: 12px 20px; border: 0; border-top: 1px solid var(--line);
  background: none; color: inherit; font: inherit; text-align: left; cursor: pointer;
}
.kr-row:hover { background: #ebf3dc; }
.kr-row b { display: block; font-weight: 600; }
.kr-row small { display: block; font-size: 14px; line-height: 1.35; color: var(--ink2); }
.kr-sw { flex: none; width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; color: var(--ink); }
.kr-board { position: relative; min-width: 0; overflow: hidden; background: var(--board); }
.kr-board canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; outline: none; }
.kr-board canvas:focus-visible { outline: 2px solid var(--lime-d); outline-offset: -4px; }
.kr-hint {
  position: absolute; left: 20px; top: 20px; max-width: 300px; margin: 0; padding: 12px 14px;
  background: var(--paper); border: 1px solid var(--line); border-radius: 12px;
  font-size: 15px; line-height: 1.45;
}
.kr-marq { position: absolute; border: 1.5px solid var(--lime-d); background: rgba(185, 224, 60, 0.2); pointer-events: none; }
.kr-bar {
  position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%);
  display: flex; gap: 4px; padding: 6px; background: var(--paper);
  border: 1px solid var(--line); border-radius: 14px;
}
.kr-btn {
  display: inline-flex; gap: 8px; align-items: center; justify-content: center; min-height: 44px;
  padding: 10px 14px; border: 0; border-radius: 10px; background: var(--lime); color: var(--ink);
  font: 600 15px 'Instrument Sans', system-ui, sans-serif; cursor: pointer;
}
.kr-btn:hover { background: #c8ea52; }
.kr-btn[disabled] { opacity: 0.45; cursor: default; }
.kr-btn.ghost { background: none; border: 1px solid #b8c8a6; }
.kr-seg { min-width: 44px; min-height: 44px; border: 0; border-radius: 10px; background: none; color: var(--ink); font: 600 15px 'Instrument Sans', system-ui, sans-serif; cursor: pointer; }
.kr-seg.on { background: var(--ink); color: var(--paper); }
.kr-tt { width: 100%; border-collapse: collapse; font-size: 15px; font-variant-numeric: tabular-nums; }
.kr-tt th { padding: 6px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid var(--ink); }
.kr-tt td { padding: 6px 8px; border-bottom: 1px solid var(--line); }
.kr-tt td.kr-1 { background: var(--lime); font-weight: 600; }
.kr-in { width: 100%; margin-bottom: 10px; padding: 10px 12px; border: 1px solid #b8c8a6; border-radius: 10px; background: #fbfdf8; color: var(--ink); font: inherit; }
.kr-msg { margin: 10px 0 0; font-size: 15px; line-height: 1.45; color: var(--lime-d); }
@media (max-width: 980px) {
  .kr-root { padding: 10px; }
  .kr-win { grid-template-columns: 1fr; height: auto; }
  .kr-board { order: -1; height: 70dvh; }
  .kr-side, .kr-insp { border: 0; border-top: 1px solid var(--line); }
}

/* @arkzen:web:style:end */

/* @arkzen:web:components:board */

'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { create } from 'zustand'
import { Play, Pause, ToggleRight, Cpu, Lightbulb, Package, Trash2 } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Stage, START, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Part, Wire, Lib } from '@/arkzen/generated/kairo.scripts'

type KairoState = {
  parts: Part[]
  wires: Wire[]
  sel: number[]
  wsel: number
  run: boolean
  speed: number
  lib: Lib
  libVer: number
  nid: number
  view: number[]
  msg: string
  [k: string]: any
}

export const useKairo = create<KairoState>((set, get) => ({
  parts: START.parts,
  wires: START.wires,
  sel: [],
  wsel: 0,
  run: true,
  speed: 2,
  lib: {},
  libVer: 0,
  nid: 10,
  view: [5, 1],
  msg: '',
  select: (sel: number[]) => set({ sel, wsel: 0 }),
  pickWire: (id: number) => set({ wsel: id, sel: [] }),
  setView: (view: number[]) => set({ view }),
  toggle: (id: number) => set({ parts: get().parts.map((p) => (p.id === id ? { ...p, on: !p.on } : p)) }),
  moveTo: (st: Record<number, number[]>, dx: number, dy: number) =>
    set({ parts: get().parts.map((p) => (st[p.id] ? { ...p, x: st[p.id][0] + dx, y: st[p.id][1] + dy } : p)) }),
  add: (kind: string, chip?: string) => {
    const s = get()
    const o = s.nid % 3
    set({ nid: s.nid + 1, sel: [s.nid], wsel: 0, parts: [...s.parts, { id: s.nid, kind, chip, x: s.view[0] + o, y: s.view[1] + o }] })
  },
  connect: (a: number[], b: number[]) => {
    const s = get()
    if (!s.parts.find((p) => p.id === a[0]) || !s.parts.find((p) => p.id === b[0])) return
    const rest = s.wires.filter((w) => !(w.to[0] === b[0] && w.to[1] === b[1]))
    set({ nid: s.nid + 1, wires: [...rest, { id: s.nid, from: [a[0], a[1]], to: [b[0], b[1]] }] })
  },
  remove: () => {
    const s = get()
    if (s.wsel) set({ wires: s.wires.filter((w) => w.id !== s.wsel), wsel: 0 })
    else if (s.sel.length)
      set({
        parts: s.parts.filter((p) => !s.sel.includes(p.id)),
        wires: s.wires.filter((w) => !s.sel.includes(w.from[0]) && !s.sel.includes(w.to[0])),
        sel: [],
      })
  },
  load: async () => {
    try {
      const r = await arkzenFetch('/api/kairo/chips?per_page=100')
      const d = await r.json()
      const lib: Lib = {}
      ;(d?.data ?? []).forEach((c: any) => {
        try {
          const b = JSON.parse(c.blueprint)
          if (b && b.parts && b.wires) lib[c.name] = b
        } catch (e) {}
      })
      set({ lib: { ...get().lib, ...lib }, libVer: get().libVer + 1 })
    } catch (e) {
      set({ msg: 'Could not reach the chip library. Chips you save will stay in this tab.' })
    }
  },
  save: async (raw: string) => {
    const s = get()
    const name = raw.trim()
    const pick = s.sel.length ? s.parts.filter((p) => s.sel.includes(p.id)) : s.parts
    const ids = new Set(pick.map((p) => p.id))
    const def = {
      parts: pick.map((p) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip })),
      wires: s.wires.filter((w) => ids.has(w.from[0]) && ids.has(w.to[0])),
    }
    if (!name) return set({ msg: 'Give the chip a name first.' })
    if (!pick.some((p) => p.kind === 'in') || !pick.some((p) => p.kind === 'out'))
      return set({ msg: 'A chip needs at least one switch and one lamp. They become its input and output pins.' })
    set({ lib: { ...s.lib, [name]: def }, libVer: s.libVer + 1, msg: 'Saved ' + name + '. Add it from Your chips.' })
    try {
      await arkzenFetch('/api/kairo/chips', { method: 'POST', body: JSON.stringify({ name, author: 'guest', blueprint: JSON.stringify(def) }) })
    } catch (e) {}
  },
}))

export const Parts = () => {
  const add = useKairo((s) => s.add)
  const lib = useKairo((s) => s.lib)
  const names = Object.keys(lib)
  const rows = [
    { k: 'in', t: 'Switch', d: 'An input you flip by clicking it.', I: ToggleRight, c: '#f2a08a' },
    { k: 'nand', t: 'NAND gate', d: 'Outputs 0 only when both inputs are 1.', I: Cpu, c: '#b9e03c' },
    { k: 'out', t: 'Lamp', d: 'Lights up when its input is 1.', I: Lightbulb, c: '#f7cf3d' },
  ]
  return (
    <aside className="kr-side">
      <header className="kr-brand">
        <h1>Kairo</h1>
        <p>Wire gates together, save the result as a chip, then use that chip as a part.</p>
      </header>
      <h2 className="kr-h">Parts</h2>
      {rows.map((r) => (
        <button key={r.k} className="kr-row" onClick={() => add(r.k)}>
          <span className="kr-sw" style={{ background: r.c }}><r.I size={18} /></span>
          <span><b>{r.t}</b><small>{r.d}</small></span>
        </button>
      ))}
      <h2 className="kr-h">Your chips</h2>
      {names.length === 0 && <p className="kr-note">Nothing yet. Build a circuit, name it on the right, and it shows up here.</p>}
      {names.map((n) => {
        const d = lib[n]
        const i = d.parts.filter((p) => p.kind === 'in').length
        const o = d.parts.filter((p) => p.kind === 'out').length
        return (
          <button key={n} className="kr-row" onClick={() => add('chip', n)}>
            <span className="kr-sw" style={{ background: '#86c1ea' }}><Package size={18} /></span>
            <span><b>{n}</b><small>{i} in, {o} out</small></span>
          </button>
        )
      })}
    </aside>
  )
}

export const BoardView = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const [rect, setRect] = useState<any>(null)
  const run = useKairo((s) => s.run)
  const speed = useKairo((s) => s.speed)
  const fresh = useKairo((s) => s.parts.length <= 4 && s.wires.length <= 3)
  useEffect(() => {
    const st = new Stage(ref.current as HTMLCanvasElement, useKairo)
    st.onMarquee = setRect
    return () => st.dispose()
  }, [])
  return (
    <section className="kr-board">
      <canvas ref={ref} tabIndex={0} aria-label="Circuit board. Drag a part to move it, drag from a pin to wire, scroll to zoom, hold space and drag to pan." />
      {rect && <div className="kr-marq" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />}
      {fresh && <p className="kr-hint">Drag from a dark green output pin to an input pin to wire two parts. Click a switch to flip it. Scroll to zoom, hold space and drag to pan.</p>}
      <div className="kr-bar">
        <button className="kr-btn" onClick={() => useKairo.setState({ run: !run })}>
          {run ? <Pause size={18} /> : <Play size={18} />}
          {run ? 'Pause' : 'Run'}
        </button>
        {[1, 2, 4, 8].map((n) => (
          <button key={n} className={'kr-seg' + (speed === n ? ' on' : '')} aria-pressed={speed === n} onClick={() => useKairo.setState({ speed: n })}>
            {n}x
          </button>
        ))}
      </div>
    </section>
  )
}

export const Inspector = () => {
  const parts = useKairo((s) => s.parts)
  const wires = useKairo((s) => s.wires)
  const lib = useKairo((s) => s.lib)
  const sel = useKairo((s) => s.sel)
  const wsel = useKairo((s) => s.wsel)
  const msg = useKairo((s) => s.msg)
  const remove = useKairo((s) => s.remove)
  const save = useKairo((s) => s.save)
  const [name, setName] = useState('')
  const key = JSON.stringify([parts.map((p) => [p.id, p.kind, p.chip]), wires]) + Object.keys(lib).join()
  const tt = useMemo(() => truthTable({ parts, wires }, lib), [key])
  const picked = sel.length ? sel.length + (sel.length > 1 ? ' parts selected' : ' part selected') : wsel ? '1 wire selected' : 'Nothing selected'
  return (
    <aside className="kr-insp">
      <div className="kr-sec">
        <h2 className="kr-h">What this board does</h2>
        {tt ? (
          <table className="kr-tt">
            <thead><tr>{tt.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {tt.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className={c ? 'kr-1' : ''}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="kr-help">A truth table appears when the board has 1 to 4 switches and at least one lamp.</p>
        )}
      </div>
      <div className="kr-sec">
        <h2 className="kr-h">Selection</h2>
        <p className="kr-help" style={{ marginBottom: 10 }}>{picked}</p>
        <button className="kr-btn ghost" disabled={!sel.length && !wsel} onClick={() => remove()}>
          <Trash2 size={18} />
          Delete
        </button>
      </div>
      <div className="kr-sec">
        <h2 className="kr-h">Save as chip</h2>
        <input className="kr-in" aria-label="Chip name" placeholder="Chip name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="kr-btn" onClick={() => save(name)}>
          <Package size={18} />
          Save chip
        </button>
        <p className="kr-help" style={{ marginTop: 10 }}>Saves the selected parts, or the whole board if nothing is selected. Switches become input pins and lamps become output pins, top to bottom.</p>
        {msg && <p className="kr-msg" role="status">{msg}</p>}
      </div>
    </aside>
  )
}

export const KairoApp = () => {
  const load = useKairo((s) => s.load)
  useEffect(() => {
    load()
  }, [load])
  return (
    <div className="kr-root">
      <div className="kr-win">
        <Parts />
        <BoardView />
        <Inspector />
      </div>
    </div>
  )
}

/* @arkzen:web:components:board:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => <KairoApp />

/* @arkzen:web:page:index:end */
