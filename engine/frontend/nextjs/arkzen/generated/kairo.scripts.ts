// ============================================================
// ARKZEN GENERATED SCRIPT — kairo
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T03:16:25.275Z
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

export const pinsOf = (p: Part, lib: Lib) => {
  if (p.kind === 'nand') return { i: 2, o: 1, w: 2, h: 1 }
  if (p.kind === 'in' || p.kind === 'clk') return { i: 0, o: 1, w: 1, h: 1 }
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
  return { gates, n, top, ins, outs, clks }
}

// One tick: every gate reads the previous values, so feedback (latches) works.
export const step = (c: any, v: Uint8Array, sw: Record<number, boolean>, t = 0) => {
  const nv = new Uint8Array(c.n)
  const g = c.gates
  for (let i = 0; i < g.length; i += 4) nv[g[i + 3]] = g[i] ? v[g[i + 1]] : (v[g[i + 1]] & v[g[i + 2]]) ^ 1
  c.ins.forEach((s: any) => {
    nv[s.net] = sw[s.id] ? 1 : 0
  })
  c.clks.forEach((s: any) => {
    nv[s.net] = Math.floor(t / 24) % 2
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
const OFF: Record<string, number> = { in: 0xf6f9f1, out: 0xe9eadf, clk: 0xf6f9f1 }
const LIT: Record<string, number> = { in: 0xf2704f, out: 0xf7cf3d, clk: 0x9be000 }

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
    const slab = new THREE.Mesh(new RoundedBoxGeometry(44, 0.6, 44, 3, 0.28), this.m(0xfbfcf8))
    slab.position.y = -0.3
    slab.receiveShadow = true
    slab.userData.skip = 1
    this.sc.add(slab)
    const grid = new THREE.GridHelper(42, 42, 0xe1e6d9, 0xeaeee4)
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
  }

  world(cx: number, cy: number) {
    const [px, py] = this.xy({ clientX: cx, clientY: cy })
    const g = this.ground(px, py)
    return [Math.round(g.x), Math.round(g.z)]
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
    const at = (m: THREE.Mesh, x: number, y: number, z: number) => {
      m.position.set(p.x + x, y, p.y + z)
      g.add(m)
      return m
    }
    g.userData.kind = p.kind
    if (sel) {
      ;[[0.35, 0.5], [0.8, 0.2]].forEach(([e, o]) => {
        const mat = new THREE.MeshBasicMaterial({ color: 0xc4ea4a, transparent: true, opacity: o, depthWrite: false })
        at(this.mesh(new RoundedBoxGeometry(s.w + e, 0.04, s.h + e, 2, 0.02), mat), 0, 0.02 + o * 0.01, 0)
      })
    }
    if (p.kind === 'nand') {
      const sh = new THREE.Shape()
      sh.moveTo(-0.85, -0.4)
      sh.lineTo(0, -0.4)
      sh.absarc(0, 0, 0.4, -Math.PI / 2, Math.PI / 2, false)
      sh.lineTo(-0.85, 0.4)
      sh.closePath()
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 4, curveSegments: 24 })
      geo.rotateX(-Math.PI / 2)
      geo.translate(0.22, 0.08, 0)
      at(this.mesh(geo, this.m(0xb9e03c), id), 0, 0, 0)
      at(this.mesh(new THREE.SphereGeometry(0.13, 16, 12), this.m(0xf6f9f1), id), 0.82, 0.25, 0)
      ;[-0.25, 0.25].forEach((z) => at(this.rb(0.34, 0.08, 0.08, 0xc9cfc6, id, 0.03), -0.85, 0.25, z))
    } else if (p.kind === 'in') {
      at(this.rb(0.92, 0.2, 0.92, 0xf6c1b0, id, 0.12), 0, 0.1, 0)
      at(this.rb(0.64, 0.05, 0.22, 0x1d2618, id, 0.02), 0, 0.21, 0)
      g.userData.lamp = at(this.rb(0.32, 0.3, 0.32, p.on ? LIT.in : OFF.in, id, 0.1), p.on ? 0.17 : -0.17, 0.33, 0)
    } else if (p.kind === 'out') {
      at(this.mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.16, 24), this.m(0x3a4a2a), id), 0, 0.08, 0)
      at(this.mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.14, 20), this.m(0xc9cfc6), id), 0, 0.22, 0)
      g.userData.lamp = at(this.mesh(new THREE.SphereGeometry(0.32, 24, 18), this.m(OFF.out), id), 0, 0.56, 0)
    } else if (p.kind === 'clk') {
      at(this.rb(0.92, 0.2, 0.92, 0xcfe58a, id, 0.12), 0, 0.1, 0)
      g.userData.lamp = at(this.mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 28), this.m(OFF.clk), id), 0, 0.25, 0)
      const piv = new THREE.Group()
      piv.position.set(p.x, 0.34, p.y)
      const hand = this.rb(0.07, 0.07, 0.3, 0x1d2618, id, 0.02)
      hand.position.z = -0.14
      piv.add(hand)
      g.add(piv)
      g.userData.hand = piv
    } else {
      at(this.rb(2, 0.42, s.h * 0.9, 0x2f3a2c, id, 0.1), 0, 0.21, 0)
      at(this.mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), this.m(0x5d6e55)), -0.75, 0.43, -s.h * 0.34)
      for (let k = 0; k < s.i; k++) at(this.rb(0.5, 0.06, 0.16, 0xc9cfc6, id, 0.02), -1.25, 0.21, pinPos(p, lib, false, k)[1] - p.y)
      for (let k = 0; k < s.o; k++) at(this.rb(0.5, 0.06, 0.16, 0xc9cfc6, id, 0.02), 1.25, 0.21, pinPos(p, lib, true, k)[1] - p.y)
      const lb = this.mesh(new THREE.PlaneGeometry(1.7, 0.64), this.lab((p.chip || '').toUpperCase().slice(0, 9), '#e6f2c8'))
      lb.rotation.x = -Math.PI / 2
      at(lb, 0, 0.44, 0)
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
    add(fill, 0.1, 0.02)
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
    this.objs.forEach((o, k) => {
      const id = +k.slice(1)
      if (k[0] === 'w') {
        const m = o.g.children[0] as THREE.Mesh
        if (m) m.material = s.wsel === id ? this.lit(0xf2704f) : this.v[c.top.get('w' + id) ?? 0] ? this.lit(0x7ccf00) : this.m(0xb4bfb1)
        return
      }
      const u = o.g.userData
      if (u.lamp) u.lamp.material = val[id] ? this.lit(LIT[u.kind]) : this.m(OFF[u.kind])
      if (u.hand) u.hand.rotation.y = -this.t * (Math.PI / 24)
    })
    return val
  }

  ghost(d: any, x: number, y: number) {
    const key = (d.chip || d.k) + '|' + x + '|' + y
    if (key === this.ghKey) return
    this.clearGhost()
    this.ghKey = key
    const st = this.store.getState()
    const g = new THREE.Group()
    const put = (kind: string, px: number, py: number, chip?: string) => g.add(this.mkPart({ id: -1, kind, chip, x: px, y: py } as Part, st.lib, true, 0))
    if (d.chip) {
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
    if (e.button === 2 || (e.button === 1 && !e.shiftKey)) d.mode = 'orbit'
    else if (e.button === 1 || this.space) d.mode = 'pan'
    else if (k === 'pin-in' || k === 'pin-out') d.mode = 'wire'
    else if (k === 'body' || k === 'group') {
      d.mode = 'body'
      d.pid = k === 'body' ? id >> 6 : 0
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
