// ============================================================
// ARKZEN GENERATED SCRIPT — kairo
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:11:30.018Z
// ============================================================

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
