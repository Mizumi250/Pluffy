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

/* @arkzen:web:script:end */

/* @arkzen:web:style */

@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap');

.kr-root {
  --ink: #14180f; --ink2: #6b7266; --line: rgba(20, 24, 15, 0.09); --lime: #b9e03c; --lime-d: #4f6b09;
  --glass: rgba(255, 255, 255, 0.55); --edge: rgba(255, 255, 255, 0.8);
  --soft: 0 8px 24px rgba(30, 40, 20, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  min-height: 100dvh; padding: 28px; background: #eceee8; color: var(--ink);
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  font-family: 'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 14px;
}
.kr-root *, .kr-root *::before, .kr-root *::after { box-sizing: border-box; }
.kr-root :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.kr-win {
  position: relative; height: calc(100dvh - 56px); min-height: 620px; overflow: hidden; border-radius: 32px; isolation: isolate;
  background: linear-gradient(135deg, #dfe6d3 0%, #f3f5ef 46%, #e9efe9 100%);
  box-shadow: 0 24px 60px rgba(40, 50, 30, 0.14), 0 2px 6px rgba(40, 50, 30, 0.06);
}
.kr-win::before, .kr-win::after { content: ''; position: absolute; z-index: -1; border-radius: 50%; filter: blur(70px); pointer-events: none; }
.kr-win::before { left: -80px; top: -80px; width: 380px; height: 380px; background: rgba(185, 224, 60, 0.42); }
.kr-win::after { right: -60px; bottom: -90px; width: 360px; height: 360px; background: rgba(134, 193, 234, 0.4); }
.kr-x, .kr-rail, .kr-col, .kr-card, .kr-pill, .kr-dock, .kr-tl, .kr-bubble, .kr-orb, .kr-rb, .kr-gtag {
  background: var(--glass); border: 1px solid var(--edge); box-shadow: var(--soft);
  -webkit-backdrop-filter: blur(16px) saturate(1.3); backdrop-filter: blur(16px) saturate(1.3);
}
.kr-rail { position: absolute; left: 20px; top: 20px; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 10px 8px; border-radius: 20px; }
.kr-rail .kr-rb { background: none; border-color: transparent; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
.kr-rail .kr-rb.on { background: var(--lime); }
.kr-logo { width: 32px; height: 32px; margin-bottom: 10px; }
.kr-rb { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 11px; color: var(--ink); cursor: pointer; }
.kr-rb.on { background: var(--lime); border-color: var(--lime); }
.kr-col { position: absolute; top: 20px; z-index: 2; max-height: calc(100% - 118px); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; padding: 14px; border-radius: 22px; }
.kr-l { left: 84px; width: 216px; }
.kr-r { right: 20px; width: 256px; }
.kr-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.kr-x { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; color: var(--ink); cursor: pointer; }
.kr-open { position: absolute; right: 20px; top: 20px; z-index: 2; width: 34px; height: 34px; }
.kr-tabs .kr-x { margin-left: auto; }
.kr-ttl { margin: 0; font: 700 20px/1.1 'Bricolage Grotesque', system-ui, sans-serif; }
.kr-lbl { display: flex; justify-content: space-between; margin: 24px 4px 10px; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: var(--ink2); }
.kr-card { display: flex; gap: 10px; align-items: center; width: 100%; margin-bottom: 8px; padding: 9px 11px; border-radius: 14px; color: inherit; font: inherit; text-align: left; }
.kr-col .kr-card, .kr-col .kr-tl { background: rgba(255, 255, 255, 0.5); box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
.kr-card.btn { cursor: pointer; }
.kr-card.btn:hover { border-color: var(--lime-d); }
.kr-card b { display: block; font-weight: 600; font-size: 13.5px; }
.kr-card small { display: block; font-size: 12px; line-height: 1.4; color: var(--ink2); }
.kr-card.col { display: block; }
.kr-tile { flex: none; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 10px; color: var(--ink); }
.kr-tag { display: inline-block; padding: 2px 7px; border-radius: 6px; background: var(--ink); color: #f3f7ea; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
.kr-state { margin-left: auto; padding: 2px 8px; border: 1px solid var(--line); border-radius: 999px; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; color: var(--lime-d); }
.kr-board { position: absolute; inset: 0; overflow: hidden; }
.kr-board canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; outline: none; }
.kr-bh { position: absolute; left: 50%; top: 22px; transform: translateX(-50%); text-align: center; pointer-events: none; }
.kr-bh h2 { margin: 0; font: 700 20px/1.1 'Bricolage Grotesque', system-ui, sans-serif; }
.kr-bh p { margin: 4px 0 0; font-size: 12px; color: var(--ink2); }
.kr-live { position: absolute; left: 50%; top: 72px; transform: translateX(-50%); display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--ink2); font-variant-numeric: tabular-nums; }
.kr-live i { width: 7px; height: 7px; border-radius: 50%; background: #b4bfb1; }
.kr-live i.on { background: #7ccf00; }
.kr-orb { position: absolute; right: 24px; bottom: 24px; width: 56px; height: 56px; display: grid; place-items: center; border-radius: 50%; cursor: grab; touch-action: none; }
.kr-orb:active { cursor: grabbing; }
.kr-orb svg { position: absolute; inset: 7px; fill: none; stroke: var(--ink); stroke-opacity: 0.35; stroke-width: 1.2; pointer-events: none; }
.kr-bubble { position: absolute; left: 50%; top: 112px; width: 260px; transform: translateX(-50%); padding: 12px 14px; border: 2px solid var(--ink); border-radius: 18px; background: rgba(253, 254, 251, 0.85); font-size: 13px; line-height: 1.45; }
.kr-bubble::after { content: ''; position: absolute; left: 34px; bottom: -10px; width: 16px; height: 16px; background: rgba(253, 254, 251, 0.95); border-right: 2px solid var(--ink); border-bottom: 2px solid var(--ink); transform: rotate(45deg); }
.kr-bubble p { margin: 8px 0 10px; }
.kr-tags { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.kr-ptag { position: absolute; left: 0; top: 0; pointer-events: none; white-space: nowrap; will-change: transform; }
.kr-gtag { position: absolute; left: 0; top: 0; pointer-events: auto; will-change: transform; display: inline-flex; gap: 6px; align-items: center; padding: 3px 9px 3px 7px; border: 1.5px solid; border-radius: 999px; color: var(--ink); font: 600 11px 'Instrument Sans', system-ui, sans-serif; cursor: pointer; }
.kr-gtag i { width: 7px; height: 7px; border-radius: 2px; }
.kr-marq { position: absolute; border: 1.5px solid var(--lime-d); background: rgba(185, 224, 60, 0.2); pointer-events: none; }
.kr-pill { display: inline-flex; gap: 6px; align-items: center; justify-content: center; min-height: 32px; padding: 0 12px; border-radius: 999px; color: var(--ink); font: 600 12px 'Instrument Sans', system-ui, sans-serif; cursor: pointer; }
.kr-pill:hover { border-color: var(--lime-d); }
.kr-pill.dark { background: var(--ink); border-color: var(--ink); color: #f3f7ea; }
.kr-pill.lime { background: var(--lime); border-color: var(--lime); }
.kr-dock { position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%); display: flex; gap: 2px; align-items: center; padding: 5px; border-radius: 999px; max-width: calc(100% - 120px); }
.kr-dock .kr-pill { background: none; border-color: transparent; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
.kr-dock .kr-pill:hover { background: rgba(255, 255, 255, 0.6); }
.kr-dock .kr-pill.dark { background: var(--ink); }
.kr-pill[disabled] { opacity: 0.4; cursor: default; }
.kr-dock .kr-pill.on { background: var(--lime); }
.kr-sep { width: 1px; height: 18px; margin: 0 4px; background: var(--line); }
.kr-seg { min-width: 38px; min-height: 32px; border: 0; border-radius: 999px; background: none; color: var(--ink); font: 600 12px 'Instrument Sans', system-ui, sans-serif; cursor: pointer; }
.kr-seg.on { background: var(--lime); }
.kr-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.kr-tl { padding: 14px 14px 2px; border-radius: 14px; }
.kr-step { position: relative; display: flex; gap: 10px; padding-bottom: 12px; }
.kr-step:not(:last-child)::before { content: ''; position: absolute; left: 8px; top: 20px; bottom: 2px; width: 1.5px; background: var(--line); }
.kr-dot { flex: none; width: 18px; height: 18px; display: grid; place-items: center; border-radius: 50%; background: var(--ink); color: #f3f7ea; }
.kr-dot.lo { background: none; border: 2px solid #c9cfc2; }
.kr-dot.act { background: var(--lime); color: var(--ink); }
.kr-step b { display: block; font-size: 13px; }
.kr-step small { display: block; font-size: 11px; color: var(--ink2); }
.kr-prog { height: 4px; margin-top: 7px; border-radius: 4px; background: var(--line); overflow: hidden; }
.kr-prog span { display: block; height: 100%; background: var(--lime); }
.kr-tt { width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.kr-tt th { padding: 5px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid var(--ink); }
.kr-tt td { padding: 5px 8px; border-bottom: 1px solid var(--line); }
.kr-tt td.kr-1 { background: var(--lime); font-weight: 600; }
.kr-in { user-select: text; -webkit-user-select: text; width: 100%; margin: 10px 0; padding: 8px 12px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255, 255, 255, 0.6); color: var(--ink); font: inherit; }
.kr-row2 { display: flex; gap: 8px; justify-content: flex-end; }
.kr-msg { margin: 10px 0 0; font-size: 12px; line-height: 1.4; color: var(--lime-d); }
@media (max-width: 1020px) {
  .kr-root { padding: 8px; }
  .kr-win { display: flex; flex-direction: column; height: auto; }
  .kr-board { position: relative; height: 72dvh; }
  .kr-rail, .kr-col, .kr-open { position: static; max-height: none; width: auto; margin: 10px; flex-direction: row; }
}

/* @arkzen:web:style:end */

/* @arkzen:web:components:board */

'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { create } from 'zustand'
import { Play, Pause, ToggleRight, Cpu, Lightbulb, Package, Trash2, Timer, Layers, Info, RotateCcw, RotateCw, Check, ChevronLeft, ChevronRight, Undo2, Redo2, MousePointer2, Download, Upload } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Stage, START, truthTable, gcol } from '@/arkzen/generated/kairo.scripts'
import type { Part, Wire, Lib } from '@/arkzen/generated/kairo.scripts'

export const KR_NAME: Record<string, string> = { in: 'Switch', clk: 'Clock', nand: 'NAND gate', out: 'Lamp', chip: 'Chip' }
export const KR_DESC: Record<string, string> = {
  in: 'An input you flip by clicking it.',
  clk: 'Swaps between 0 and 1 on its own while the board runs.',
  nand: 'Outputs 0 only when both inputs are 1.',
  out: 'Lights up when its input is 1.',
  chip: 'A saved circuit that works as one part.',
}
export const KR_TILE: Record<string, string> = { in: '#f6c1b0', clk: '#cfe58a', nand: '#b9e03c', out: '#f7cf3d', chip: '#86c1ea' }

export const useLive = create<any>(() => ({ t: 0, vals: {}, tags: [] }))

export const useKairo = create<any>((set, get) => ({
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
  past: [],
  future: [],
  tool: 'orbit',
  drag: null,
  dragPos: null,
  stage: null,
  select: (sel: number[]) => set({ sel, wsel: 0 }),
  pickWire: (id: number) => set({ wsel: id, sel: [] }),
  setView: (view: number[]) => set({ view }),
  mark: () => {
    const s = get()
    set({ past: [...s.past.slice(-99), { parts: s.parts, wires: s.wires }], future: [] })
  },
  undo: () => {
    const s = get()
    const p = s.past[s.past.length - 1]
    if (!p) return
    const on = new Map<number, any>(s.parts.map((q: Part) => [q.id, q.on]))
    set({ past: s.past.slice(0, -1), future: [...s.future, { parts: s.parts, wires: s.wires }], parts: p.parts.map((q: Part) => ({ ...q, on: on.get(q.id) })), wires: p.wires, sel: [], wsel: 0 })
  },
  redo: () => {
    const s = get()
    const f = s.future[s.future.length - 1]
    if (!f) return
    const on = new Map<number, any>(s.parts.map((q: Part) => [q.id, q.on]))
    set({ future: s.future.slice(0, -1), past: [...s.past, { parts: s.parts, wires: s.wires }], parts: f.parts.map((q: Part) => ({ ...q, on: on.get(q.id) })), wires: f.wires, sel: [], wsel: 0 })
  },
  toggle: (id: number) => set({ parts: get().parts.map((p: Part) => (p.id === id ? { ...p, on: !p.on } : p)) }),
  moveTo: (st: Record<number, number[]>, dx: number, dy: number) =>
    set({ parts: get().parts.map((p: Part) => (st[p.id] ? { ...p, x: st[p.id][0] + dx, y: st[p.id][1] + dy } : p)) }),
  add: (kind: string, chip?: string, x?: number, y?: number) => {
    get().mark()
    const s = get()
    const o = s.nid % 3
    set({ nid: s.nid + 1, sel: [s.nid], wsel: 0, parts: [...s.parts, { id: s.nid, kind, chip, x: x ?? s.view[0] + o, y: y ?? s.view[1] + o }] })
  },
  download: (name: string, data: any) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  },
  exportBoard: () => {
    const s = get()
    const clean = (p: Part) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip, on: p.on, g: p.g, gn: p.gn })
    get().download('kairo-board.json', { format: 'kairo-board', version: 1, parts: s.parts.map(clean), wires: s.wires, lib: s.lib })
    set({ msg: 'Exported kairo-board.json.' })
  },
  exportChip: (name: string) => {
    const d = get().lib[name]
    if (!d) return
    get().download('kairo-chip-' + name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.json', { format: 'kairo-chip', version: 1, name, parts: d.parts, wires: d.wires })
    set({ msg: 'Exported ' + name + '.' })
  },
  importFile: (text: string) => {
    let d: any
    try {
      d = JSON.parse(text)
    } catch (e) {
      return set({ msg: 'That file is not valid JSON.' })
    }
    const okp = (a: any) => Array.isArray(a) && a.every((p: any) => p && p.id > 0 && p.id < 131072 && ['in', 'out', 'nand', 'clk', 'chip'].includes(p.kind) && typeof p.x === 'number' && typeof p.y === 'number')
    const okw = (a: any) => Array.isArray(a) && a.every((w: any) => w && typeof w.id === 'number' && Array.isArray(w.from) && Array.isArray(w.to))
    if (!d || !okp(d.parts) || !okw(d.wires)) return set({ msg: 'That does not look like a Kairo file.' })
    const s = get()
    const parts = d.parts.map((p: Part) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip, on: !!p.on, g: p.g, gn: p.gn }))
    if (d.format === 'kairo-chip' && d.name) {
      set({ lib: { ...s.lib, [d.name]: { parts, wires: d.wires } }, libVer: s.libVer + 1, msg: 'Added ' + d.name + ' to Your chips.' })
      return
    }
    const lib: Lib = {}
    Object.entries(d.lib || {}).forEach(([k, v]: any) => {
      if (v && okp(v.parts) && okw(v.wires)) lib[k] = { parts: v.parts, wires: v.wires }
    })
    const top = Math.max(s.nid, ...parts.map((p: Part) => Math.max(p.id, p.g || 0)), ...d.wires.map((w: Wire) => w.id))
    get().mark()
    set({ parts, wires: d.wires, sel: [], wsel: 0, lib: { ...s.lib, ...lib }, libVer: s.libVer + 1, nid: top + 1, msg: 'Imported ' + parts.length + ' parts.' })
  },
  connect: (a: number[], b: number[]) => {
    const s = get()
    if (!s.parts.find((p: Part) => p.id === a[0]) || !s.parts.find((p: Part) => p.id === b[0])) return
    get().mark()
    const rest = s.wires.filter((w: Wire) => !(w.to[0] === b[0] && w.to[1] === b[1]))
    set({ nid: s.nid + 1, wires: [...rest, { id: s.nid, from: [a[0], a[1]], to: [b[0], b[1]] }] })
  },
  remove: () => {
    const s = get()
    if (!s.wsel && !s.sel.length) return
    get().mark()
    if (s.wsel) set({ wires: s.wires.filter((w: Wire) => w.id !== s.wsel), wsel: 0 })
    else if (s.sel.length)
      set({
        parts: s.parts.filter((p: Part) => !s.sel.includes(p.id)),
        wires: s.wires.filter((w: Wire) => !s.sel.includes(w.from[0]) && !s.sel.includes(w.to[0])),
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
      set({ msg: 'Could not reach the chip library. Chips you save stay in this tab.' })
    }
  },
  save: async (raw: string) => {
    const s = get()
    const name = raw.trim()
    const pick = s.sel.length ? s.parts.filter((p: Part) => s.sel.includes(p.id)) : s.parts
    if (!name) return set({ msg: 'Give the chip a name first.' })
    if (!pick.length) return set({ msg: 'Place at least one part first.' })
    get().mark()
    const ids = new Set(pick.map((p: Part) => p.id))
    const def = {
      parts: pick.map((p: Part) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip })),
      wires: s.wires.filter((w: Wire) => ids.has(w.from[0]) && ids.has(w.to[0])),
    }
    set({
      nid: s.nid + 1,
      lib: { ...s.lib, [name]: def },
      libVer: s.libVer + 1,
      sel: pick.map((p: Part) => p.id),
      parts: s.parts.map((p: Part) => (ids.has(p.id) ? { ...p, g: s.nid, gn: name } : p)),
      msg: 'Saved ' + name + '. Add copies from Your chips.',
    })
    try {
      await arkzenFetch('/api/kairo/chips', { method: 'POST', body: JSON.stringify({ name, author: 'guest', blueprint: JSON.stringify(def) }) })
    } catch (e) {}
  },
  stamp: (name: string, ox?: number, oy?: number) => {
    const s = get()
    const d = s.lib[name]
    if (!d || !d.parts.length) return
    const mx = Math.min(...d.parts.map((p: Part) => p.x))
    const my = Math.min(...d.parts.map((p: Part) => p.y))
    let n = s.nid
    const gid = n++
    const map: Record<number, number> = {}
    const np = d.parts.map((p: Part) => {
      map[p.id] = n
      return { id: n++, kind: p.kind, chip: p.chip, x: p.x - mx + (ox ?? s.view[0]), y: p.y - my + (oy ?? s.view[1]), g: gid, gn: name }
    })
    const nw = d.wires.filter((w: Wire) => map[w.from[0]] && map[w.to[0]]).map((w: Wire) => ({ id: n++, from: [map[w.from[0]], w.from[1]], to: [map[w.to[0]], w.to[1]] }))
    get().mark()
    set({ nid: n, sel: np.map((p: Part) => p.id), wsel: 0, parts: [...s.parts, ...np], wires: [...s.wires, ...nw] })
  },
  ungroup: () => {
    const s = get()
    get().mark()
    set({ parts: s.parts.map((p: Part) => (s.sel.includes(p.id) ? { ...p, g: undefined, gn: undefined } : p)) })
  },
  selectGroup: (g: number) => set({ sel: get().parts.filter((p: Part) => p.g === g).map((p: Part) => p.id), wsel: 0 }),
}))

export const PartTile = ({ kind }: { kind: string }) => {
  const I: any = { in: ToggleRight, clk: Timer, nand: Cpu, out: Lightbulb, chip: Package }[kind] || Package
  return <span className="kr-tile" style={{ background: KR_TILE[kind] }}><I size={18} /></span>
}

export const Rail = ({ tab, open, pick }: any) => (
  <nav className="kr-rail" aria-label="Sections">
    <svg className="kr-logo" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#b9e03c" />
      <path d="M7 9h9a7 7 0 0 1 0 14H7z" fill="#14180f" />
      <circle cx="25.6" cy="16" r="2.3" fill="#14180f" />
    </svg>
    {[['parts', Layers, 'Parts'], ['chips', Package, 'Your chips'], ['help', Info, 'How to']].map(([k, I, t]: any) => (
      <button key={k} className={'kr-rb' + (tab === k && open ? ' on' : '')} aria-label={t} aria-pressed={tab === k && open} onClick={() => pick(k)}>
        <I size={18} />
      </button>
    ))}
  </nav>
)

export const Hd = ({ t, onHide }: { t: string; onHide: () => void }) => (
  <div className="kr-hd">
    <h1 className="kr-ttl">{t}</h1>
    <button className="kr-x" aria-label="Hide panel" onClick={onHide}><ChevronLeft size={16} /></button>
  </div>
)

export const SidePanel = ({ tab, onHide }: { tab: string; onHide: () => void }) => {
  const add = useKairo((s: any) => s.add)
  const stamp = useKairo((s: any) => s.stamp)
  const lib: Lib = useKairo((s: any) => s.lib)
  const n = useKairo((s: any) => s.parts.length)
  const exportChip = useKairo((s: any) => s.exportChip)
  const names = Object.keys(lib)
  const dragged = useRef(false)
  const begin = (e: React.PointerEvent, k: string, chip?: string) => {
    if (e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    let on = false
    const over = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      return !!el && !el.closest('.kr-col, .kr-rail, .kr-dock, .kr-open, .kr-orb')
    }
    const mv = (ev: PointerEvent) => {
      if (!on && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return
      if (!on) {
        on = true
        document.body.style.cursor = 'grabbing'
        useKairo.setState({ drag: { k, chip } })
      }
      useKairo.setState({ dragPos: over(ev.clientX, ev.clientY) ? [ev.clientX, ev.clientY] : null })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', mv)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!on) return
      document.body.style.cursor = ''
      const g = useKairo.getState().stage
      if (ev.type === 'pointerup' && g && over(ev.clientX, ev.clientY)) {
        const [x, y] = g.world(ev.clientX, ev.clientY)
        if (chip) stamp(chip, x, y)
        else add(k, undefined, x, y)
      }
      useKairo.setState({ drag: null, dragPos: null })
      dragged.current = true
      setTimeout(() => {
        dragged.current = false
      }, 50)
    }
    window.addEventListener('pointermove', mv)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }
  const card = (k: string, chip?: string) => (
    <div
      key={chip || k}
      role="button"
      tabIndex={0}
      className="kr-card btn"
      onPointerDown={(e) => begin(e, k, chip)}
      onClick={() => {
        if (dragged.current) return
        if (chip) stamp(chip)
        else add(k)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (chip) stamp(chip)
          else add(k)
        }
      }}
    >
      <PartTile kind={k} />
      <span>
        <b>{chip || KR_NAME[k]}</b>
        <small>{chip ? lib[chip].parts.length + ' parts, ' + lib[chip].wires.length + ' wires' : KR_DESC[k]}</small>
      </span>
      {chip && (
        <button
          className="kr-x"
          style={{ marginLeft: 'auto' }}
          title="Export chip"
          aria-label={'Export ' + chip}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            exportChip(chip)
          }}
        >
          <Download size={14} />
        </button>
      )}
    </div>
  )
  if (tab === 'help')
    return (
      <aside className="kr-col kr-l">
        <Hd t="How to" onHide={onHide} />
        {[
          ['Move a part', 'Drag it.'],
          ['Wire two parts', 'Drag from a dark green output pin to an input pin.'],
          ['Flip a switch', 'Click it.'],
          ['Orbit the board', 'Drag empty space, or use the orbit disc.'],
          ['Pan', 'Hold Space and drag, or Shift and middle-drag.'],
          ['Select several', 'Press V or the pointer button, then drag a box. Shift-drag works anytime.'],
          ['Add or remove one', 'Alt-click a part.'],
          ['Undo and redo', 'Ctrl+Z and Ctrl+Shift+Z.'],
          ['Drag from the list', 'Drag a part or chip onto the board.'],
          ['Export and import', 'Use Board file in the inspector. Each chip has its own export button.'],
          ['Select a whole chip', 'Click its colored outline or its name tag.'],
          ['Zoom', 'Scroll.'],
          ['Delete', 'Select, then press Delete.'],
        ].map(([t, d]) => (
          <div key={t} className="kr-card col"><b>{t}</b><small>{d}</small></div>
        ))}
      </aside>
    )
  if (tab === 'chips')
    return (
      <aside className="kr-col kr-l">
        <Hd t="Your chips" onHide={onHide} />
        {names.length === 0 && <div className="kr-card col"><small>Nothing yet. Build a circuit, name it on the right, and it shows up here.</small></div>}
        {names.map((c) => card('chip', c))}
      </aside>
    )
  return (
    <aside className="kr-col kr-l">
      <Hd t="Parts" onHide={onHide} />
      {card('in')}
      {card('clk')}
      <div className="kr-lbl"><span>GATES AND OUTPUTS</span><span>{n} ON BOARD</span></div>
      {card('nand')}
      {card('out')}
    </aside>
  )
}

export const BoardView = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const st = useRef<any>(null)
  const [rect, setRect] = useState<any>(null)
  const [gone, setGone] = useState(false)
  const op = useRef<number[] | null>(null)
  const th = useRef<HTMLDivElement>(null)
  const parts: Part[] = useKairo((s: any) => s.parts)
  const tool = useKairo((s: any) => s.tool)
  const canU = useKairo((s: any) => s.past.length > 0)
  const canR = useKairo((s: any) => s.future.length > 0)
  const sel: number[] = useKairo((s: any) => s.sel)
  const groups = useMemo(() => {
    const m = new Map<number, string>()
    parts.forEach((q) => {
      if (q.g) m.set(q.g, q.gn || 'Group')
    })
    return Array.from(m, ([id, name]) => ({ id, name, c: '#' + gcol(name).toString(16).padStart(6, '0') }))
  }, [parts])
  const run = useKairo((s: any) => s.run)
  const speed = useKairo((s: any) => s.speed)
  const np = useKairo((s: any) => s.parts.length)
  const nw = useKairo((s: any) => s.wires.length)
  const fresh = np <= 4 && nw <= 3
  const t = useLive((s: any) => s.t)
  useEffect(() => {
    const g = new Stage(ref.current as HTMLCanvasElement, useKairo)
    let c = 0
    g.onMarquee = setRect
    g.onTick = (tk: number, vals: any, tg: any[]) => {
      const cur = useLive.getState()
      if (c++ % 3 === 0) useLive.setState({ t: tk, vals })
      if (tg.length || cur.tags.length) useLive.setState({ tags: tg })
    }
    g.tagHost = th.current
    st.current = g
    useKairo.setState({ stage: g })
    return () => {
      useKairo.setState({ stage: null })
      g.dispose()
    }
  }, [])
  const snap = (a: number, e: number) => st.current && st.current.snap(a, e)
  return (
    <section className="kr-board">
      <canvas ref={ref} tabIndex={0} aria-label="Circuit board. Drag a part to move it, drag from a pin to wire, right-drag to orbit, scroll to zoom." />
      <div className="kr-bh"><h2>Kairo board</h2><p>{np} parts, {nw} wires</p></div>
      <div className="kr-live"><i className={run ? 'on' : ''} />{run ? 'live' : 'paused'} <span>t {String(t).padStart(5, '0')}</span></div>
      <div
        className="kr-orb"
        aria-label="Orbit. Drag to rotate the board."
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          op.current = [e.clientX, e.clientY]
        }}
        onPointerMove={(e) => {
          if (!op.current || !st.current) return
          st.current.orbitBy(e.clientX - op.current[0], e.clientY - op.current[1])
          op.current = [e.clientX, e.clientY]
        }}
        onPointerUp={() => {
          op.current = null
        }}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" /><ellipse cx="32" cy="32" rx="30" ry="11" /><ellipse cx="32" cy="32" rx="11" ry="30" /></svg>
      </div>
      <div className="kr-tags" ref={th}>
        {sel.slice(0, 6).map((id) => {
          const q = parts.find((x) => x.id === id)
          return q ? <span key={'p' + id} data-t={'p:' + id} className="kr-tag kr-ptag">{(KR_NAME[q.kind] || q.kind).toUpperCase()}</span> : null
        })}
        {groups.map((g) => (
          <button key={'g' + g.id} data-t={'g:' + g.id} className="kr-gtag" style={{ borderColor: g.c }} onClick={() => useKairo.getState().selectGroup(g.id)}><i style={{ background: g.c }} />{g.name}</button>
        ))}
      </div>
      {rect && <div className="kr-marq" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />}
      {fresh && !gone && (
        <div className="kr-bubble">
          <span className="kr-tag">TRY THIS</span>
          <p>Click the switch. With it on, the lamp blinks with the clock through the NAND gate. With it off, the lamp stays lit.</p>
          <button className="kr-pill lime" onClick={() => setGone(true)}>Got it</button>
        </div>
      )}
      <div className="kr-dock">
        <button className="kr-pill dark" onClick={() => useKairo.setState({ run: !run })}>
          {run ? <Pause size={14} /> : <Play size={14} />}
          {run ? 'Pause' : 'Run'}
        </button>
        <button className="kr-pill" title="Simulation speed" aria-label="Simulation speed" onClick={() => useKairo.setState({ speed: speed >= 8 ? 1 : speed * 2 })}>{speed}x</button>
        <i className="kr-sep" />
        <button className="kr-pill" title="Undo (Ctrl+Z)" aria-label="Undo" disabled={!canU} onClick={() => useKairo.getState().undo()}><Undo2 size={14} /></button>
        <button className="kr-pill" title="Redo (Ctrl+Shift+Z)" aria-label="Redo" disabled={!canR} onClick={() => useKairo.getState().redo()}><Redo2 size={14} /></button>
        <button className={'kr-pill' + (tool === 'select' ? ' on' : '')} title="Select tool (V). Drag a box to select. Alt-click adds or removes one part." aria-label="Select tool" aria-pressed={tool === 'select'} onClick={() => useKairo.setState({ tool: tool === 'select' ? 'orbit' : 'select' })}><MousePointer2 size={14} /></button>
        <i className="kr-sep" />
        <button className="kr-pill" onClick={() => snap(Math.PI / 4, 0.6155)}>Iso</button>
        <button className="kr-pill" onClick={() => snap(st.current ? st.current.az : 0, 1.5)}>Top</button>
        <button className="kr-pill" aria-label="Rotate left" onClick={() => snap(st.current.az + Math.PI / 2, st.current.el)}><RotateCcw size={14} /></button>
        <button className="kr-pill" aria-label="Rotate right" onClick={() => snap(st.current.az - Math.PI / 2, st.current.el)}><RotateCw size={14} /></button>
        <i className="kr-sep" />
        <button className="kr-pill" aria-label="Delete selection" onClick={() => useKairo.getState().remove()}><Trash2 size={14} /></button>
      </div>
    </section>
  )
}

export const Inspector = ({ onHide }: { onHide: () => void }) => {
  const parts: Part[] = useKairo((s: any) => s.parts)
  const wires: Wire[] = useKairo((s: any) => s.wires)
  const lib: Lib = useKairo((s: any) => s.lib)
  const sel: number[] = useKairo((s: any) => s.sel)
  const run = useKairo((s: any) => s.run)
  const speed = useKairo((s: any) => s.speed)
  const msg = useKairo((s: any) => s.msg)
  const save = useKairo((s: any) => s.save)
  const exportBoard = useKairo((s: any) => s.exportBoard)
  const importFile = useKairo((s: any) => s.importFile)
  const vals = useLive((s: any) => s.vals)
  const t = useLive((s: any) => s.t)
  const [tab, setTab] = useState('inspect')
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const key = JSON.stringify([parts.map((p) => [p.id, p.kind, p.chip]), wires]) + Object.keys(lib).join()
  const tt = useMemo(() => truthTable({ parts, wires }, lib), [key])
  const cur = parts.find((p) => p.id === sel[0])
  const k = sel.length > 1 ? '' : cur ? cur.kind : ''
  const cnt: Record<string, number> = {}
  const rows = parts.filter((p) => p.kind === 'in' || p.kind === 'out' || p.kind === 'clk').map((p) => {
    const i = (cnt[p.kind] = (cnt[p.kind] || 0) + 1)
    return { id: p.id, title: p.kind === 'in' ? 'Switch ' + 'ABCDEFGH'[i - 1] : p.kind === 'out' ? 'Lamp ' + i : 'Clock', hi: !!vals[p.id] }
  })
  return (
    <aside className="kr-col kr-r">
      <div className="kr-tabs">
        <button className={'kr-pill' + (tab === 'inspect' ? ' dark' : '')} onClick={() => setTab('inspect')}>Inspector</button>
        <button className={'kr-pill' + (tab === 'out' ? ' dark' : '')} onClick={() => setTab('out')}>Output</button>
        <button className="kr-x" aria-label="Hide panel" onClick={onHide}><ChevronRight size={16} /></button>
      </div>
      {tab === 'out' ? (
        <div className="kr-card col">
          {tt ? (
            <table className="kr-tt">
              <thead><tr>{tt.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{tt.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={c ? 'kr-1' : ''}>{c}</td>)}</tr>)}</tbody>
            </table>
          ) : (
            <small>A truth table appears when the board has 1 to 4 switches and at least one lamp.</small>
          )}
        </div>
      ) : (
        <>
          <div className="kr-card">
            {k ? <PartTile kind={k} /> : <span className="kr-tile" style={{ background: '#e6e9e1' }}><Layers size={18} /></span>}
            <span>
              <b>{sel.length > 1 ? sel.length + ' parts selected' : cur ? (cur.kind === 'chip' ? cur.chip : KR_NAME[k]) : 'Whole board'}</b>
              <small>{sel.length > 1 ? 'Name them below to save as a chip.' : cur ? KR_DESC[k] : parts.length + ' parts, ' + wires.length + ' wires'}</small>
            </span>
            <span className="kr-state">{run ? 'RUNNING' : 'PAUSED'}</span>
          </div>
          {parts.some((p) => sel.includes(p.id) && p.g) && <button className="kr-pill" onClick={() => useKairo.getState().ungroup()}>Ungroup</button>}
          <div className="kr-lbl"><span>SAVE AS CHIP</span></div>
          <div className="kr-card col">
            <span className="kr-tag">REUSE IT</span>
            <input className="kr-in" aria-label="Chip name" placeholder="Name this circuit" value={name} onChange={(e) => setName(e.target.value)} />
            <small style={{ marginBottom: 10 }}>Saves the selected parts, or the whole board if nothing is selected. Copies keep their layout inside a colored outline, and every part stays editable.</small>
            <div className="kr-row2"><button className="kr-pill lime" onClick={() => save(name)}><Package size={15} />Save chip</button></div>
          </div>
          <div className="kr-lbl"><span>BOARD FILE</span></div>
          <div className="kr-card col">
            <small style={{ marginBottom: 10 }}>Export the board and your chips as a .json file, or import one. A chip file is added to Your chips.</small>
            <div className="kr-row2">
              <button className="kr-pill" onClick={() => exportBoard()}><Download size={14} />Export</button>
              <button className="kr-pill" onClick={() => fileRef.current && fileRef.current.click()}><Upload size={14} />Import</button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={async (e) => {
                const f = e.target.files && e.target.files[0]
                e.target.value = ''
                if (f) importFile(await f.text())
              }}
            />
          </div>
          {msg && <p className="kr-msg" role="status">{msg}</p>}
          <div className="kr-lbl"><span>WHAT IT IS ACTUALLY DOING</span></div>
          <div className="kr-tl">
            <div className="kr-step">
              <span className="kr-dot act"><Play size={10} /></span>
              <span style={{ flex: 1 }}>
                <b>Simulation</b>
                <small>Tick {t}, {speed}x speed</small>
                <div className="kr-prog"><span style={{ width: ((t % 48) / 48) * 100 + '%' }} /></div>
              </span>
            </div>
            {rows.map((r) => (
              <div key={r.id} className="kr-step">
                <span className={'kr-dot' + (r.hi ? '' : ' lo')}>{r.hi && <Check size={11} />}</span>
                <span><b>{r.title}</b><small>{r.hi ? 'High, 1' : 'Low, 0'}</small></span>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}

export const KairoApp = () => {
  const [tab, setTab] = useState('parts')
  const [lo, setLo] = useState(true)
  const [ro, setRo] = useState(true)
  const load = useKairo((s: any) => s.load)
  useEffect(() => {
    load()
  }, [load])
  const pick = (k: string) => {
    if (k === tab && lo) setLo(false)
    else {
      setTab(k)
      setLo(true)
    }
  }
  return (
    <div className="kr-root">
      <div className="kr-win">
        <BoardView />
        <Rail tab={tab} open={lo} pick={pick} />
        {lo && <SidePanel tab={tab} onHide={() => setLo(false)} />}
        {ro ? (
          <Inspector onHide={() => setRo(false)} />
        ) : (
          <button className="kr-x kr-open" aria-label="Show inspector" onClick={() => setRo(true)}><ChevronLeft size={16} /></button>
        )}
      </div>
    </div>
  )
}

/* @arkzen:web:components:board:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => <KairoApp />

/* @arkzen:web:page:index:end */