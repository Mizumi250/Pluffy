/* @arkzen:meta
name: rubik-solver
version: 1.0.0
description: Rubik's cube solver with no AI. Scan the six faces with the camera, fix misreads by tapping stickers, then follow a short two-phase solution move by move from one fixed holding position.
auth: false
*/

/* @arkzen:meta:web
title: Cube solver - scan, check, solve
label: Cube solver
description: Scan a 3x3 Rubik's cube with your camera and get a short, step by step solution. Runs fully in your browser with no AI.
*/

// Solver engine, color classifier and renderer math. Pure TypeScript, no DOM, no AI.
// The Kociemba style two-phase search lives inside RK_SOLVER_SRC and runs in a Web Worker.
/* @arkzen:web:script */
// ─────────────────────────────────────────────────────────────────────────────
// Rubik solver engine. Pure TypeScript, no DOM, no AI.
// Facelet order everywhere: U1-9 R1-9 F1-9 D1-9 L1-9 B1-9 (54 letters from URFDLB).
// A sticker's letter is the face whose center has that color.
// Standard color scheme: U white, R red, F green, D yellow, L orange, B blue.
// ─────────────────────────────────────────────────────────────────────────────

export const RK_FACES = ['U', 'R', 'F', 'D', 'L', 'B']

export const RK_HEX: Record<string, string> = {
  U: '#f3f1ea',
  R: '#d92b3a',
  F: '#17a34a',
  D: '#ffd60a',
  L: '#ff7b00',
  B: '#1556d9',
}

export const RK_COLOR_NAME: Record<string, string> = {
  U: 'white',
  R: 'red',
  F: 'green',
  D: 'yellow',
  L: 'orange',
  B: 'blue',
}

export const RK_FACE_NAME: Record<string, string> = {
  U: 'top',
  R: 'right',
  F: 'front',
  D: 'bottom',
  L: 'left',
  B: 'back',
}

// Scan order and how to hold the cube for each face. The camera always sees the
// face the same way the facelet numbering expects, so no rotation fix-up is needed.
export const RK_SCAN_ORDER = ['F', 'R', 'B', 'L', 'U', 'D']

export const RK_SCAN_TOP: Record<string, string> = {
  F: 'U', R: 'U', B: 'U', L: 'U', U: 'B', D: 'F',
}

export const RK_OPPOSITE: Record<string, string> = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'B', B: 'F' }

// ── geometry (x: R+/L-, y: U+/D-, z: F+/B-) ──────────────────────────────────
const RK_NORMALS: Record<string, [number, number, number]> = {
  U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1],
}

function rkStickerPos(face: string, r: number, c: number): [number, number, number] {
  switch (face) {
    case 'U': return [c - 1, 1, r - 1]
    case 'R': return [1, 1 - r, 1 - c]
    case 'F': return [c - 1, 1 - r, 1]
    case 'D': return [c - 1, -1, 1 - r]
    case 'L': return [-1, 1 - r, c - 1]
    default: return [1 - c, 1 - r, -1]
  }
}

type RkVec = [number, number, number]
export type RkSticker3D = { face: string; pos: RkVec; normal: RkVec }

export const RK_STICKERS: RkSticker3D[] = []
for (const f of RK_FACES) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) RK_STICKERS.push({ face: f, pos: rkStickerPos(f, r, c), normal: RK_NORMALS[f] })
  }
}

function rkRotAxis(v: RkVec, axis: number, quarters: number): RkVec {
  let out: RkVec = [v[0], v[1], v[2]]
  const q = ((quarters % 4) + 4) % 4
  for (let i = 0; i < q; i++) {
    const [x, y, z] = out
    if (axis === 0) out = [x, -z, y]
    else if (axis === 1) out = [z, y, -x]
    else out = [-y, x, z]
  }
  return out
}

function rkKey(p: RkVec, n: RkVec): string { return p.join(',') + '|' + n.join(',') }

const RK_INDEX: Record<string, number> = {}
RK_STICKERS.forEach((s, i) => { RK_INDEX[rkKey(s.pos, s.normal)] = i })

function rkFaceMovePerm(face: string, power: number): number[] {
  const n = RK_NORMALS[face]
  const axis = n[0] !== 0 ? 0 : n[1] !== 0 ? 1 : 2
  const sign = n[axis]
  const perm: number[] = []
  for (let i = 0; i < 54; i++) perm.push(i)
  RK_STICKERS.forEach((s, i) => {
    if (s.pos[axis] !== sign) return
    const q = -sign * power
    const np = rkRotAxis(s.pos, axis, q)
    const nn = rkRotAxis(s.normal, axis, q)
    perm[RK_INDEX[rkKey(np, nn)]] = i
  })
  return perm
}

export const RK_MOVE_PERMS: Record<string, number[]> = {}
for (const f of RK_FACES) {
  RK_MOVE_PERMS[f] = rkFaceMovePerm(f, 1)
  RK_MOVE_PERMS[f + '2'] = rkFaceMovePerm(f, 2)
  RK_MOVE_PERMS[f + "'"] = rkFaceMovePerm(f, 3)
}

export function rkSolvedState(): string[] {
  const s: string[] = []
  for (let i = 0; i < 54; i++) s.push(RK_FACES[Math.floor(i / 9)])
  return s
}

export function rkApplyMove(state: string[], move: string): string[] {
  const p = RK_MOVE_PERMS[move]
  if (!p) return state.slice()
  const out: string[] = []
  for (let i = 0; i < 54; i++) out.push(state[p[i]])
  return out
}

export function rkApplyMoves(state: string[], moves: string[]): string[] {
  let s = state
  for (const m of moves) s = rkApplyMove(s, m)
  return s
}

export function rkIsSolved(state: string[]): boolean {
  for (let i = 0; i < 54; i++) if (state[i] !== RK_FACES[Math.floor(i / 9)]) return false
  return true
}

// Which stickers share a physical piece (corner = 3, edge = 2, center = 1).
export const RK_SIBLINGS: number[][] = (() => {
  const byPos: Record<string, number[]> = {}
  RK_STICKERS.forEach((s, i) => {
    const k = s.pos.join(',')
    if (!byPos[k]) byPos[k] = []
    byPos[k].push(i)
  })
  return RK_STICKERS.map((s) => byPos[s.pos.join(',')])
})()

export function rkPieceKind(i: number): 'center' | 'edge' | 'corner' {
  const n = RK_SIBLINGS[i].length
  return n === 1 ? 'center' : n === 2 ? 'edge' : 'corner'
}

export function rkIsCenter(i: number): boolean { return i % 9 === 4 }

export function rkFaceOfIndex(i: number): string { return RK_FACES[Math.floor(i / 9)] }

// ── inline solver (used for validation on the main thread, and as a fallback) ─
let rkInlineCache: any = null
export function rkInlineSolver(): any {
  if (!rkInlineCache) rkInlineCache = new Function('return ' + RK_SOLVER_SRC)()
  return rkInlineCache
}

// ── cube validation with friendly messages ───────────────────────────────────
export type RkReport = {
  counts: Record<string, number>
  empty: number
  badPieces: number[]
  messages: string[]
  solvable: boolean
}

export function rkAnalyze(stickers: string[]): RkReport {
  const counts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 }
  let empty = 0
  stickers.forEach((s) => { if (s && counts[s] !== undefined) counts[s]++; else empty++ })
  const messages: string[] = []
  const bad = new Set<number>()

  if (empty > 0) messages.push(empty + (empty === 1 ? ' sticker is' : ' stickers are') + ' still empty.')
  for (const f of RK_FACES) {
    if (counts[f] > 9) messages.push('Too many ' + RK_COLOR_NAME[f] + ' stickers (' + counts[f] + ', need 9).')
  }
  if (empty === 0) {
    for (const f of RK_FACES) {
      if (counts[f] < 9) messages.push('Too few ' + RK_COLOR_NAME[f] + ' stickers (' + counts[f] + ', need 9).')
    }
  }

  const seenKeys: Record<string, number[]> = {}
  const groups: number[][] = []
  const done = new Set<number>()
  for (let i = 0; i < 54; i++) {
    if (done.has(i)) continue
    const g = RK_SIBLINGS[i]
    g.forEach((x) => done.add(x))
    if (g.length > 1) groups.push(g)
  }
  for (const g of groups) {
    const cols = g.map((i) => stickers[i])
    if (cols.some((c) => !c)) continue
    let ok = true
    for (let a = 0; a < cols.length; a++) {
      for (let b = a + 1; b < cols.length; b++) {
        if (cols[a] === cols[b] || RK_OPPOSITE[cols[a]] === cols[b]) ok = false
      }
    }
    if (!ok) {
      g.forEach((i) => bad.add(i))
      const names = cols.map((c) => RK_COLOR_NAME[c]).join(' + ')
      messages.push((g.length === 3 ? 'Corner' : 'Edge') + ' with ' + names + ' cannot exist.')
      continue
    }
    const key = cols.slice().sort().join('')
    if (!seenKeys[key]) seenKeys[key] = []
    seenKeys[key].push(...g)
  }
  Object.keys(seenKeys).forEach((k) => {
    if (seenKeys[k].length > (k.length === 3 ? 3 : 2)) {
      seenKeys[k].forEach((i) => bad.add(i))
      const names = k.split('').map((c) => RK_COLOR_NAME[c]).join(' + ')
      messages.push((k.length === 3 ? 'Corner' : 'Edge') + ' ' + names + ' appears more than once.')
    }
  })

  if (messages.length === 0) {
    const sv = rkInlineSolver()
    const parsed = sv.fromFacelets(stickers.join(''))
    if (parsed.error) {
      messages.push(
        parsed.error.indexOf('corner has a color combination') >= 0
          ? 'A corner shows its colors in an order that cannot exist. Check the corners.'
          : parsed.error
      )
    } else {
      const v = sv.verify(parsed.cube)
      if (v) messages.push(v + ' A sticker is probably misread. Compare each piece with the real cube.')
    }
  }

  return { counts, empty, badPieces: Array.from(bad), messages, solvable: messages.length === 0 }
}

export function rkPieceLabel(stickers: string[], i: number): string {
  const sib = RK_SIBLINGS[i]
  if (sib.length === 1) return 'Center, ' + RK_COLOR_NAME[stickers[i] || RK_FACES[Math.floor(i / 9)]]
  const names = sib.map((k) => (stickers[k] ? RK_COLOR_NAME[stickers[k]] : 'empty'))
  return (sib.length === 3 ? 'Corner: ' : 'Edge: ') + names.join(', ')
}

// ── color math ───────────────────────────────────────────────────────────────
export type RkLab = [number, number, number]

export function rkRgbToLab(r: number, g: number, b: number): RkLab {
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const R = lin(r), G = lin(g), B = lin(b)
  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175
  const Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X), fy = f(Y), fz = f(Z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

// Quick guess from one color, no context. Returns a face letter.
export function rkNominalFace(rgb: number[]): string {
  const lab = rkRgbToLab(rgb[0], rgb[1], rgb[2])
  const chroma = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2])
  let hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI
  if (hue < 0) hue += 360
  if (chroma < 30 && lab[0] > 40) return 'U'
  if (hue >= 47 && hue < 76) return 'L'
  if (hue >= 76 && hue < 118) return chroma < 38 ? 'U' : 'D'
  if (hue >= 118 && hue < 215) return 'F'
  if (hue >= 215 && hue < 330) return 'B'
  return 'R'
}

export const RK_ANCHOR_RGB: Record<string, number[]> = {
  U: [236, 236, 230], R: [196, 32, 46], F: [24, 150, 72], D: [250, 210, 20], L: [245, 120, 22], B: [24, 82, 200],
}

export function rkAnchorMeans(): Record<string, RkLab> {
  const out: Record<string, RkLab> = {}
  for (const f of RK_FACES) out[f] = rkRgbToLab(RK_ANCHOR_RGB[f][0], RK_ANCHOR_RGB[f][1], RK_ANCHOR_RGB[f][2])
  return out
}

function rkWeightedDist(a: RkLab, b: RkLab): number {
  const dl = (a[0] - b[0]) * 0.5
  const da = a[1] - b[1]
  const db = a[2] - b[2]
  return dl * dl + da * da + db * db
}

// Closest typical sticker color. refs can override anchors (for example colors already scanned).
export function rkNearestFace(rgb: number[], refs?: Record<string, RkLab>): string {
  const lab = rkRgbToLab(rgb[0], rgb[1], rgb[2])
  const anchors = rkAnchorMeans()
  let best = 'U', bd = Infinity
  for (const f of RK_FACES) {
    const d = rkWeightedDist(lab, (refs && refs[f]) || anchors[f])
    if (d < bd) { bd = d; best = f }
  }
  return best
}

function rkHungarian(cost: number[][]): number[] {
  const n = cost.length
  const m = cost[0].length
  const u: number[] = new Array(n + 1).fill(0)
  const v: number[] = new Array(m + 1).fill(0)
  const p: number[] = new Array(m + 1).fill(0)
  const way: number[] = new Array(m + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    p[0] = i
    let j0 = 0
    const minv: number[] = new Array(m + 1).fill(Infinity)
    const used: boolean[] = new Array(m + 1).fill(false)
    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = Infinity
      let j1 = 0
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j]
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0 }
        if (minv[j] < delta) { delta = minv[j]; j1 = j }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta } else minv[j] -= delta
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0)
  }
  const ans: number[] = new Array(n).fill(-1)
  for (let j = 1; j <= m; j++) if (p[j]) ans[p[j] - 1] = j - 1
  return ans
}

export type RkClassified = {
  faces: string[]
  uncertain: boolean[]
  means: Record<string, RkLab>
}

function rkLabDist(a: RkLab, b: RkLab): number {
  const dl = (a[0] - b[0]) * 0.5
  const da = a[1] - b[1]
  const db = a[2] - b[2]
  return dl * dl + da * da + db * db
}

// rgb[i] is the averaged color of sticker i, or null when that face was not scanned.
// With all 54 stickers known, every color must appear exactly 9 times, which lets us
// resolve ambiguous stickers (red vs orange, white vs yellow) by solving an assignment.
export function rkClassify(rgb: (number[] | null)[], priorMeans?: Record<string, RkLab>): RkClassified {
  const labs: (RkLab | null)[] = rgb.map((c) => (c ? rkRgbToLab(c[0], c[1], c[2]) : null))
  const faces: string[] = new Array(54).fill('')
  const uncertain: boolean[] = new Array(54).fill(false)
  const nominal: string[] = rgb.map((c, i) => (c ? (i % 9 === 4 ? RK_FACES[Math.floor(i / 9)] : rkNominalFace(c)) : ''))

  const meansOf = (assign: string[]): Record<string, RkLab> => {
    const out: Record<string, RkLab> = {}
    for (const f of RK_FACES) {
      let n = 0
      const s: RkLab = [0, 0, 0]
      assign.forEach((a, i) => {
        const lab = labs[i]
        if (a === f && lab) { s[0] += lab[0]; s[1] += lab[1]; s[2] += lab[2]; n++ }
      })
      if (n > 0) out[f] = [s[0] / n, s[1] / n, s[2] / n]
    }
    return out
  }

  let means = meansOf(nominal)
  if (priorMeans) {
    for (const f of RK_FACES) if (!means[f] && priorMeans[f]) means[f] = priorMeans[f]
  }
  const complete = labs.every((l) => l !== null)

  if (!complete) {
    // Partial scan: nearest known color per sticker, centers forced.
    const usable = RK_FACES.filter((f) => means[f] || (priorMeans && priorMeans[f]))
    labs.forEach((lab, i) => {
      if (!lab) return
      if (i % 9 === 4) { faces[i] = RK_FACES[Math.floor(i / 9)]; return }
      let best = '', bd = Infinity
      for (const f of usable) {
        const m = means[f] || (priorMeans as Record<string, RkLab>)[f]
        const d = rkLabDist(lab, m)
        if (d < bd) { bd = d; best = f }
      }
      faces[i] = best || nominal[i]
    })
    return { faces, uncertain, means }
  }

  const free: number[] = []
  for (let i = 0; i < 54; i++) { if (i % 9 === 4) faces[i] = RK_FACES[Math.floor(i / 9)]; else free.push(i) }
  let assign = faces.slice()
  for (let iter = 0; iter < 8; iter++) {
    const cost: number[][] = free.map((i) => {
      const row: number[] = []
      for (const f of RK_FACES) {
        const m = means[f] || [0, 0, 0]
        const d = rkLabDist(labs[i] as RkLab, m)
        for (let s = 0; s < 8; s++) row.push(d)
      }
      return row
    })
    const colOf = rkHungarian(cost)
    const next = faces.slice()
    free.forEach((i, r) => { next[i] = RK_FACES[Math.floor(colOf[r] / 8)] })
    const same = next.every((x, i) => x === assign[i])
    assign = next
    means = meansOf(assign)
    if (same) break
  }
  for (let i = 0; i < 54; i++) {
    faces[i] = assign[i]
    if (i % 9 === 4) continue
    const lab = labs[i] as RkLab
    const dOwn = Math.sqrt(rkLabDist(lab, means[assign[i]] || [0, 0, 0]))
    let alt = Infinity
    for (const f of RK_FACES) {
      if (f === assign[i] || !means[f]) continue
      alt = Math.min(alt, Math.sqrt(rkLabDist(lab, means[f])))
    }
    uncertain[i] = alt < dOwn * 1.5 + 4
  }
  return { faces, uncertain, means }
}

// Classify one freshly scanned face against color references from an earlier full scan.
export function rkClassifyFace(rgb9: number[][], faceIndex: number, means: Record<string, RkLab>): { faces: string[]; uncertain: boolean[] } {
  const faces: string[] = []
  const uncertain: boolean[] = []
  rgb9.forEach((c, k) => {
    if (k === 4) { faces.push(RK_FACES[faceIndex]); uncertain.push(false); return }
    const lab = rkRgbToLab(c[0], c[1], c[2])
    let best = '', bd = Infinity, second = Infinity
    for (const f of RK_FACES) {
      if (!means[f]) continue
      const d = Math.sqrt(rkLabDist(lab, means[f]))
      if (d < bd) { second = bd; bd = d; best = f } else if (d < second) second = d
    }
    faces.push(best || rkNominalFace(c))
    uncertain.push(second < bd * 1.5 + 4)
  })
  return { faces, uncertain }
}

// ── camera sampling ──────────────────────────────────────────────────────────
// data is RGBA pixels of a square canvas (side px). The 3x3 guide fills 78% of it.
export function rkSampleGrid(data: Uint8ClampedArray, side: number): number[][] {
  const out: number[][] = []
  const margin = side * 0.11
  const cell = (side * 0.78) / 3
  const half = cell * 0.2
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cx = margin + cell * (c + 0.5)
      const cy = margin + cell * (r + 0.5)
      const rs: number[] = [], gs: number[] = [], bs: number[] = []
      for (let y = Math.floor(cy - half); y <= Math.ceil(cy + half); y += 2) {
        for (let x = Math.floor(cx - half); x <= Math.ceil(cx + half); x += 2) {
          const o = (y * side + x) * 4
          rs.push(data[o]); gs.push(data[o + 1]); bs.push(data[o + 2])
        }
      }
      const med = (a: number[]) => { a.sort((p, q) => p - q); return a[a.length >> 1] }
      out.push([med(rs), med(gs), med(bs)])
    }
  }
  return out
}

export function rkAvgSamples(list: number[][][]): number[][] {
  const out: number[][] = []
  for (let k = 0; k < 9; k++) {
    const s = [0, 0, 0]
    list.forEach((smp) => { s[0] += smp[k][0]; s[1] += smp[k][1]; s[2] += smp[k][2] })
    out.push([s[0] / list.length, s[1] / list.length, s[2] / list.length])
  }
  return out
}

export function rkMaxShift(a: number[][], b: number[][]): number {
  let m = 0
  for (let k = 0; k < 9; k++) for (let c = 0; c < 3; c++) m = Math.max(m, Math.abs(a[k][c] - b[k][c]))
  return m
}

// ── notation ─────────────────────────────────────────────────────────────────
export type RkMoveInfo = {
  face: string
  quarters: number // signed: 1 clockwise, -1 counterclockwise, 2 half turn
  headline: string
  detail: string
}

export function rkDescribeMove(move: string): RkMoveInfo {
  const face = move.charAt(0)
  const suffix = move.slice(1)
  const where = RK_FACE_NAME[face]
  if (suffix === '2') {
    return {
      face, quarters: 2,
      headline: 'Half turn of the ' + where + ' face',
      detail: 'Turn the ' + where + ' face 180 degrees. Either direction gives the same result.',
    }
  }
  if (suffix === "'") {
    return {
      face, quarters: -1,
      headline: 'Counterclockwise on the ' + where + ' face',
      detail: 'Turn the ' + where + ' face a quarter turn counterclockwise, as if you were looking straight at that face.',
    }
  }
  return {
    face, quarters: 1,
    headline: 'Clockwise on the ' + where + ' face',
    detail: 'Turn the ' + where + ' face a quarter turn clockwise, as if you were looking straight at that face.',
  }
}

export const RK_VIEWS: Record<string, { yaw: number; pitch: number }> = {
  front: { yaw: -35, pitch: 28 },   // sees U F R
  left: { yaw: 35, pitch: 28 },     // sees U F L
  below: { yaw: -35, pitch: -28 },  // sees D F R
  back: { yaw: -145, pitch: 28 },   // sees U B R
}

export function rkViewFor(face: string): string {
  if (face === 'L') return 'left'
  if (face === 'D') return 'below'
  if (face === 'B') return 'back'
  return 'front'
}

// ── 3D drawing ───────────────────────────────────────────────────────────────
export type RkPoly = { pts: number[][]; fill: string; stroke: string; sw: number; z: number }

const RK_PERP: Record<string, [RkVec, RkVec]> = {
  x: [[0, 1, 0], [0, 0, 1]],
  y: [[1, 0, 0], [0, 0, 1]],
  z: [[1, 0, 0], [0, 1, 0]],
}

function rkAxisKey(n: RkVec): string { return n[0] !== 0 ? 'x' : n[1] !== 0 ? 'y' : 'z' }

function rkRotAngle(v: RkVec, axis: number, ang: number): RkVec {
  const c = Math.cos(ang), s = Math.sin(ang)
  const [x, y, z] = v
  if (axis === 0) return [x, y * c - z * s, y * s + z * c]
  if (axis === 1) return [x * c + z * s, y, -x * s + z * c]
  return [x * c - y * s, x * s + y * c, z]
}

export type RkAnim = { face: string; angle: number } // angle: right-handed radians about the outward normal

export function rkBuildPolys(state: string[], viewName: string, anim?: RkAnim | null, hiFace?: string | null): RkPoly[] {
  const view = RK_VIEWS[viewName] || RK_VIEWS.front
  const yaw = (view.yaw * Math.PI) / 180
  const pitch = (view.pitch * Math.PI) / 180
  const project = (p: RkVec): [number, number, number] => {
    const x1 = p[0] * Math.cos(yaw) + p[2] * Math.sin(yaw)
    const z1 = -p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw)
    const y2 = p[1] * Math.cos(pitch) - z1 * Math.sin(pitch)
    const z2 = p[1] * Math.sin(pitch) + z1 * Math.cos(pitch)
    return [x1, -y2, z2]
  }
  const polys: RkPoly[] = []
  const animNormal = anim ? RK_NORMALS[anim.face] : null
  const animAxis = animNormal ? (animNormal[0] !== 0 ? 0 : animNormal[1] !== 0 ? 1 : 2) : 0
  const animSign = animNormal ? animNormal[animAxis] : 0
  const hiNormal = hiFace ? RK_NORMALS[hiFace] : null
  const hiAxis = hiNormal ? (hiNormal[0] !== 0 ? 0 : hiNormal[1] !== 0 ? 1 : 2) : 0
  const hiSign = hiNormal ? hiNormal[hiAxis] : 0

  for (let ix = -1; ix <= 1; ix++) {
    for (let iy = -1; iy <= 1; iy++) {
      for (let iz = -1; iz <= 1; iz++) {
        if (ix === 0 && iy === 0 && iz === 0) continue
        const center: RkVec = [ix, iy, iz]
        const inLayer = !!anim && center[animAxis] === animSign
        const inHi = !!hiFace && center[hiAxis] === hiSign
        const normals: RkVec[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
        for (const n of normals) {
          const [u, w] = RK_PERP[rkAxisKey(n)]
          const quad = (half: number, lift: number): RkVec[] => {
            const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
            return corners.map(([a, b]) => {
              let p: RkVec = [
                center[0] + n[0] * (0.5 + lift) + u[0] * half * a + w[0] * half * b,
                center[1] + n[1] * (0.5 + lift) + u[1] * half * a + w[1] * half * b,
                center[2] + n[2] * (0.5 + lift) + u[2] * half * a + w[2] * half * b,
              ]
              if (inLayer && anim) p = rkRotAngle(p, animAxis, anim.angle)
              return p
            })
          }
          let nr: RkVec = n
          if (inLayer && anim) nr = rkRotAngle(n, animAxis, anim.angle)
          const nz = project(nr)[2] - project([0, 0, 0])[2]
          if (nz <= 0.0001) continue
          const body = quad(0.5, 0).map(project)
          const bz = (body[0][2] + body[1][2] + body[2][2] + body[3][2]) / 4
          polys.push({ pts: body.map((q) => [q[0], q[1]]), fill: '#0e1013', stroke: '#050607', sw: 0.6, z: bz })
          const idx = RK_INDEX[rkKey(center, n)]
          if (idx !== undefined && state[idx]) {
            const st = quad(0.42, 0.006).map(project)
            polys.push({
              pts: st.map((q) => [q[0], q[1]]),
              fill: RK_HEX[state[idx]] || '#444',
              stroke: inLayer || inHi ? '#ffffff' : 'rgba(0,0,0,0.35)',
              sw: inLayer || inHi ? 2.2 : 0.5,
              z: bz + 0.02,
            })
          }
        }
      }
    }
  }
  polys.sort((a, b) => a.z - b.z)
  return polys
}

// ── solver worker source (plain JS, runs in a Web Worker or inline) ──────────
export const RK_SOLVER_SRC = String.raw`(function () {
  'use strict';

  // Two-phase cube solver (no AI, no network). Written for Pluff rubik-solver.
  // Facelet string: 54 letters from URFDLB, order U1-9 R1-9 F1-9 D1-9 L1-9 B1-9.

  var URF = 0, UFL = 1, ULB = 2, UBR = 3, DFR = 4, DLF = 5, DBL = 6, DRB = 7;
  var UR = 0, UF = 1, UL = 2, UB = 3, DR = 4, DF = 5, DL = 6, DB = 7, FR = 8, FL = 9, BL = 10, BR = 11;
  var FACE_LETTERS = 'URFDLB';

  var MOVE_NAMES = [];
  (function () {
    for (var f = 0; f < 6; f++) {
      MOVE_NAMES.push(FACE_LETTERS.charAt(f));
      MOVE_NAMES.push(FACE_LETTERS.charAt(f) + '2');
      MOVE_NAMES.push(FACE_LETTERS.charAt(f) + "'");
    }
  })();

  function fl(face, n) { return face * 9 + (n - 1); }
  var U_ = 0, R_ = 1, F_ = 2, D_ = 3, L_ = 4, B_ = 5;

  var CORNER_FACELET = [
    [fl(U_, 9), fl(R_, 1), fl(F_, 3)], [fl(U_, 7), fl(F_, 1), fl(L_, 3)],
    [fl(U_, 1), fl(L_, 1), fl(B_, 3)], [fl(U_, 3), fl(B_, 1), fl(R_, 3)],
    [fl(D_, 3), fl(F_, 9), fl(R_, 7)], [fl(D_, 1), fl(L_, 9), fl(F_, 7)],
    [fl(D_, 7), fl(B_, 9), fl(L_, 7)], [fl(D_, 9), fl(R_, 9), fl(B_, 7)]
  ];
  var EDGE_FACELET = [
    [fl(U_, 6), fl(R_, 2)], [fl(U_, 8), fl(F_, 2)], [fl(U_, 4), fl(L_, 2)], [fl(U_, 2), fl(B_, 2)],
    [fl(D_, 6), fl(R_, 8)], [fl(D_, 2), fl(F_, 8)], [fl(D_, 4), fl(L_, 8)], [fl(D_, 8), fl(B_, 8)],
    [fl(F_, 6), fl(R_, 4)], [fl(F_, 4), fl(L_, 6)], [fl(B_, 6), fl(L_, 4)], [fl(B_, 4), fl(R_, 6)]
  ];
  var CORNER_COLOR = [
    [U_, R_, F_], [U_, F_, L_], [U_, L_, B_], [U_, B_, R_],
    [D_, F_, R_], [D_, L_, F_], [D_, B_, L_], [D_, R_, B_]
  ];
  var EDGE_COLOR = [
    [U_, R_], [U_, F_], [U_, L_], [U_, B_], [D_, R_], [D_, F_], [D_, L_], [D_, B_],
    [F_, R_], [F_, L_], [B_, L_], [B_, R_]
  ];

  var Z8 = [0, 0, 0, 0, 0, 0, 0, 0];
  var Z12 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var BASE = [
    { cp: [UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB], co: Z8, ep: [UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR], eo: Z12 },
    { cp: [DFR, UFL, ULB, URF, DRB, DLF, DBL, UBR], co: [2, 0, 0, 1, 1, 0, 0, 2], ep: [FR, UF, UL, UB, BR, DF, DL, DB, DR, FL, BL, UR], eo: Z12 },
    { cp: [UFL, DLF, ULB, UBR, URF, DFR, DBL, DRB], co: [1, 2, 0, 0, 2, 1, 0, 0], ep: [UR, FL, UL, UB, DR, FR, DL, DB, UF, DF, BL, BR], eo: [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0] },
    { cp: [URF, UFL, ULB, UBR, DLF, DBL, DRB, DFR], co: Z8, ep: [UR, UF, UL, UB, DF, DL, DB, DR, FR, FL, BL, BR], eo: Z12 },
    { cp: [URF, ULB, DBL, UBR, DFR, UFL, DLF, DRB], co: [0, 1, 2, 0, 0, 2, 1, 0], ep: [UR, UF, BL, UB, DR, DF, FL, DB, FR, UL, DL, BR], eo: Z12 },
    { cp: [URF, UFL, UBR, DRB, DFR, DLF, ULB, DBL], co: [0, 0, 1, 2, 0, 0, 2, 1], ep: [UR, UF, UL, BR, DR, DF, DL, BL, FR, FL, UB, DB], eo: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1] }
  ];

  function newCube() {
    return { cp: [0, 1, 2, 3, 4, 5, 6, 7], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
  }
  function copyCube(a) { return { cp: a.cp.slice(), co: a.co.slice(), ep: a.ep.slice(), eo: a.eo.slice() }; }
  function multiply(a, b) {
    var r = newCube(), i;
    for (i = 0; i < 8; i++) { r.cp[i] = a.cp[b.cp[i]]; r.co[i] = (a.co[b.cp[i]] + b.co[i]) % 3; }
    for (i = 0; i < 12; i++) { r.ep[i] = a.ep[b.ep[i]]; r.eo[i] = (b.eo[i] + a.eo[b.ep[i]]) % 2; }
    return r;
  }
  function invertCube(a) {
    var r = newCube(), i;
    for (i = 0; i < 12; i++) r.ep[a.ep[i]] = i;
    for (i = 0; i < 12; i++) r.eo[i] = a.eo[r.ep[i]];
    for (i = 0; i < 8; i++) r.cp[a.cp[i]] = i;
    for (i = 0; i < 8; i++) r.co[i] = (3 - a.co[r.cp[i]]) % 3;
    return r;
  }

  var MOVES = []; // 18 cubie moves, index face*3 + (power-1)
  (function () {
    for (var f = 0; f < 6; f++) {
      var m = { cp: BASE[f].cp.slice(), co: BASE[f].co.slice(), ep: BASE[f].ep.slice(), eo: BASE[f].eo.slice() };
      var cur = copyCube(m);
      MOVES[f * 3] = copyCube(cur);
      cur = multiply(cur, m); MOVES[f * 3 + 1] = copyCube(cur);
      cur = multiply(cur, m); MOVES[f * 3 + 2] = copyCube(cur);
    }
  })();

  // ---------- facelets <-> cubie ----------
  function fromFacelets(s) {
    if (typeof s !== 'string' || s.length !== 54) return { error: 'The cube needs exactly 54 stickers.' };
    var f = [], i, j;
    var counts = [0, 0, 0, 0, 0, 0];
    for (i = 0; i < 54; i++) {
      var k = FACE_LETTERS.indexOf(s.charAt(i));
      if (k < 0) return { error: 'Sticker ' + (i + 1) + ' has no color yet.' };
      f.push(k); counts[k]++;
    }
    for (i = 0; i < 6; i++) if (counts[i] !== 9) return { error: 'Each color must appear exactly 9 times.' };
    var cc = newCube();
    for (i = 0; i < 8; i++) {
      var ori = 0;
      for (ori = 0; ori < 3; ori++) if (f[CORNER_FACELET[i][ori]] === U_ || f[CORNER_FACELET[i][ori]] === D_) break;
      if (ori === 3) return { error: 'A corner has no white or yellow sticker.' };
      var c1 = f[CORNER_FACELET[i][(ori + 1) % 3]], c2 = f[CORNER_FACELET[i][(ori + 2) % 3]];
      var found = false;
      for (j = 0; j < 8; j++) {
        if (f[CORNER_FACELET[i][ori]] === CORNER_COLOR[j][0] && c1 === CORNER_COLOR[j][1] && c2 === CORNER_COLOR[j][2]) { cc.cp[i] = j; cc.co[i] = ori; found = true; break; }
      }
      if (!found) return { error: 'A corner has a color combination that does not exist.' };
    }
    for (i = 0; i < 12; i++) {
      var ok = false;
      for (j = 0; j < 12; j++) {
        if (f[EDGE_FACELET[i][0]] === EDGE_COLOR[j][0] && f[EDGE_FACELET[i][1]] === EDGE_COLOR[j][1]) { cc.ep[i] = j; cc.eo[i] = 0; ok = true; break; }
        if (f[EDGE_FACELET[i][0]] === EDGE_COLOR[j][1] && f[EDGE_FACELET[i][1]] === EDGE_COLOR[j][0]) { cc.ep[i] = j; cc.eo[i] = 1; ok = true; break; }
      }
      if (!ok) return { error: 'An edge has a color combination that does not exist.' };
    }
    return { cube: cc };
  }

  function parity(arr, n) {
    var p = 0, i, j;
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) if (arr[i] > arr[j]) p ^= 1;
    return p;
  }
  function verify(cc) {
    var i, seen = [], s;
    for (i = 0; i < 12; i++) seen[i] = 0;
    for (i = 0; i < 12; i++) seen[cc.ep[i]]++;
    for (i = 0; i < 12; i++) if (seen[i] !== 1) return 'Some edge pieces are missing or repeated.';
    s = 0; for (i = 0; i < 12; i++) s += cc.eo[i];
    if (s % 2 !== 0) return 'One edge looks flipped (edge orientation).';
    seen = [];
    for (i = 0; i < 8; i++) seen[i] = 0;
    for (i = 0; i < 8; i++) seen[cc.cp[i]]++;
    for (i = 0; i < 8; i++) if (seen[i] !== 1) return 'Some corner pieces are missing or repeated.';
    s = 0; for (i = 0; i < 8; i++) s += cc.co[i];
    if (s % 3 !== 0) return 'One corner looks twisted (corner orientation).';
    if (parity(cc.ep, 12) !== parity(cc.cp, 8)) return 'Two pieces look swapped (parity).';
    return '';
  }

  // ---------- coordinates ----------
  var CNK = [];
  (function () {
    for (var n = 0; n < 13; n++) { CNK[n] = []; for (var k = 0; k < 13; k++) CNK[n][k] = 0; }
    for (n = 0; n < 13; n++) { CNK[n][0] = 1; for (k = 1; k <= n; k++) CNK[n][k] = CNK[n - 1][k - 1] + (k <= n - 1 ? CNK[n - 1][k] : 0); }
  })();

  function getTwist(c) { var t = 0; for (var i = 0; i < 7; i++) t = 3 * t + c.co[i]; return t; }
  function setTwist(c, t) { var p = 0; for (var i = 6; i >= 0; i--) { c.co[i] = t % 3; p += c.co[i]; t = (t / 3) | 0; } c.co[7] = (3 - (p % 3)) % 3; }
  function getFlip(c) { var t = 0; for (var i = 0; i < 11; i++) t = 2 * t + c.eo[i]; return t; }
  function setFlip(c, t) { var p = 0; for (var i = 10; i >= 0; i--) { c.eo[i] = t % 2; p += c.eo[i]; t = t >> 1; } c.eo[11] = (2 - (p % 2)) % 2; }
  function getSlice(c) {
    var a = 0, x = 0;
    for (var j = 11; j >= 0; j--) if (c.ep[j] >= FR) { a += CNK[11 - j][x + 1]; x++; }
    return a;
  }
  function setSlice(c, idx) {
    var i, k, p;
    var isSlice = [];
    for (i = 0; i < 12; i++) isSlice[i] = false;
    for (k = 4; k >= 1; k--) {
      p = 11;
      while (CNK[p][k] > idx) p--;
      idx -= CNK[p][k];
      isSlice[11 - p] = true;
    }
    var s = FR, o = 0;
    for (i = 0; i < 12; i++) { if (isSlice[i]) c.ep[i] = s++; else c.ep[i] = o++; }
  }
  function permRank(arr, off, n) {
    var idx = 0, i, j, cnt;
    for (i = 0; i < n; i++) {
      cnt = 0;
      for (j = i + 1; j < n; j++) if (arr[off + j] < arr[off + i]) cnt++;
      idx = idx * (n - i) + cnt;
    }
    return idx;
  }
  function permUnrank(idx, n, out, off, base) {
    var digits = [], i, avail = [];
    for (i = n - 1; i >= 0; i--) { var radix = n - i; digits[i] = idx % radix; idx = (idx / radix) | 0; }
    for (i = 0; i < n; i++) avail.push(i);
    for (i = 0; i < n; i++) { out[off + i] = base + avail[digits[i]]; avail.splice(digits[i], 1); }
  }

  // ---------- tables ----------
  var T = null;
  var P2_MOVES = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];

  function buildMoveTable(size, nm, moveIdx, setCoord, getCoord) {
    var tab = new Int32Array(size * nm);
    var c, i, m, k;
    for (i = 0; i < size; i++) {
      c = newCube();
      setCoord(c, i);
      for (m = 0; m < nm; m++) {
        var mv = MOVES[moveIdx[m]];
        tab[i * nm + m] = getCoord(multiply(c, mv));
      }
    }
    return tab;
  }

  function buildPrune(n1, n2, mt1, mt2, nm) {
    var size = n1 * n2;
    var t = new Uint8Array(size);
    t.fill(255);
    t[0] = 0;
    var depth = 0, added = 1, i, m, a, b, j;
    while (added > 0) {
      added = 0;
      for (i = 0; i < size; i++) {
        if (t[i] !== depth) continue;
        a = (i / n2) | 0; b = i - a * n2;
        for (m = 0; m < nm; m++) {
          j = mt1[a * nm + m] * n2 + mt2[b * nm + m];
          if (t[j] === 255) { t[j] = depth + 1; added++; }
        }
      }
      depth++;
    }
    return t;
  }

  var ALL18 = []; for (var q = 0; q < 18; q++) ALL18.push(q);

  function init(progress) {
    if (T) return;
    var say = progress || function () {};
    var t = {};
    say('Building move tables', 0.02);
    t.twistMove = buildMoveTable(2187, 18, ALL18, setTwist, getTwist);
    t.flipMove = buildMoveTable(2048, 18, ALL18, setFlip, getFlip);
    t.sliceMove = buildMoveTable(495, 18, ALL18, setSlice, getSlice);
    say('Building move tables', 0.12);
    t.cpMove = buildMoveTable(40320, 10, P2_MOVES,
      function (c, i) { permUnrank(i, 8, c.cp, 0, 0); },
      function (c) { return permRank(c.cp, 0, 8); });
    t.udMove = buildMoveTable(40320, 10, P2_MOVES,
      function (c, i) { permUnrank(i, 8, c.ep, 0, 0); },
      function (c) { return permRank(c.ep, 0, 8); });
    t.spMove = buildMoveTable(24, 10, P2_MOVES,
      function (c, i) { permUnrank(i, 4, c.ep, 8, 8); },
      function (c) { var tmp = [c.ep[8] - 8, c.ep[9] - 8, c.ep[10] - 8, c.ep[11] - 8]; return permRank(tmp, 0, 4); });
    say('Building search tables', 0.3);
    t.pTwSl = buildPrune(2187, 495, t.twistMove, t.sliceMove, 18);
    say('Building search tables', 0.5);
    t.pFlSl = buildPrune(2048, 495, t.flipMove, t.sliceMove, 18);
    say('Building search tables', 0.7);
    t.pCpSp = buildPrune(40320, 24, t.cpMove, t.spMove, 10);
    say('Building search tables', 0.85);
    t.pUdSp = buildPrune(40320, 24, t.udMove, t.spMove, 10);
    say('Ready', 1);
    T = t;
  }

  // ---------- move list helpers ----------
  function simplify(moves) {
    var st = [], i;
    for (i = 0; i < moves.length; i++) {
      var f = (moves[i] / 3) | 0, p = (moves[i] % 3) + 1;
      var merged = false;
      for (var back = 1; back <= 2 && st.length - back >= 0 && !merged; back++) {
        var idx = st.length - back, pf = (st[idx] / 3) | 0;
        if (back === 2) {
          var between = (st[st.length - 1] / 3) | 0;
          if ((between % 3) !== (f % 3) || between === f) break;
        }
        if (pf === f) {
          var np = (((st[idx] % 3) + 1) + p) % 4;
          if (np === 0) st.splice(idx, 1); else st[idx] = f * 3 + (np - 1);
          merged = true;
        }
      }
      if (!merged) st.push(moves[i]);
    }
    return st;
  }
  function invertMoves(moves) {
    var r = [];
    for (var i = moves.length - 1; i >= 0; i--) { var f = (moves[i] / 3) | 0, p = moves[i] % 3; r.push(f * 3 + (2 - p)); }
    return r;
  }

  // ---------- search ----------
  var ctx = null;

  function search2(cp, ud, sp, depth, last, ply) {
    if (depth === 0) return cp === 0 && ud === 0 && sp === 0;
    var h1 = T.pCpSp[cp * 24 + sp], h2 = T.pUdSp[ud * 24 + sp];
    if (h1 > depth || h2 > depth) return false;
    if (((++ctx.nodes) & 4095) === 0 && Date.now() > ctx.deadline) { ctx.timedOut = true; return false; }
    for (var k = 0; k < 10; k++) {
      var mv = P2_MOVES[k], face = (mv / 3) | 0;
      if (last >= 0) {
        if (face === last) continue;
        if (face % 3 === last % 3 && face < last) continue;
      }
      ctx.path2[ply] = mv;
      if (search2(T.cpMove[cp * 10 + k], T.udMove[ud * 10 + k], T.spMove[sp * 10 + k], depth - 1, face, ply + 1)) return true;
      if (ctx.timedOut) return false;
    }
    return false;
  }

  function finishPhase1(d1, lastFace) {
    var c = copyCube(ctx.start), i;
    for (i = 0; i < d1; i++) c = multiply(c, MOVES[ctx.path1[i]]);
    var cp = permRank(c.cp, 0, 8), ud = permRank(c.ep, 0, 8);
    var sp = permRank([c.ep[8] - 8, c.ep[9] - 8, c.ep[10] - 8, c.ep[11] - 8], 0, 4);
    var limit = ctx.bestLen - 1 - d1;
    if (limit < 0) return false;
    var lb = Math.max(T.pCpSp[cp * 24 + sp], T.pUdSp[ud * 24 + sp]);
    for (var d2 = lb; d2 <= limit; d2++) {
      if (search2(cp, ud, sp, d2, lastFace, d1)) {
        var seq = [];
        for (i = 0; i < d1 + d2; i++) seq.push(i < d1 ? ctx.path1[i] : ctx.path2[i]);
        return seq;
      }
      if (ctx.timedOut) return false;
    }
    return false;
  }

  function search1(tw, fp, sl, depth, last, ply) {
    if (depth === 0) {
      if (tw !== 0 || fp !== 0 || sl !== 0) return;
      if (last >= 0) {
        var lf = last;
        var lm = ctx.path1[ply - 1];
        var lp = lm % 3;
        if (lf === 0 || lf === 3 || lp === 1) return; // ends in a phase-2 move
      }
      var seq = finishPhase1(ply, last);
      if (seq) {
        var simp = simplify(seq);
        if (simp.length < ctx.bestLen) {
          ctx.bestLen = simp.length;
          ctx.best = simp;
          if (ctx.onSolution) ctx.onSolution(simp);
          if (simp.length <= ctx.stopAt) ctx.done = true;
        }
      }
      return;
    }
    var h1 = T.pTwSl[tw * 495 + sl], h2 = T.pFlSl[fp * 495 + sl];
    if (h1 > depth || h2 > depth) return;
    if (((++ctx.nodes) & 4095) === 0 && Date.now() > ctx.deadline) { ctx.timedOut = true; return; }
    for (var m = 0; m < 18; m++) {
      var face = (m / 3) | 0;
      if (last >= 0) {
        if (face === last) continue;
        if (face % 3 === last % 3 && face < last) continue;
      }
      ctx.path1[ply] = m;
      search1(T.twistMove[tw * 18 + m], T.flipMove[fp * 18 + m], T.sliceMove[sl * 18 + m], depth - 1, face, ply + 1);
      if (ctx.timedOut || ctx.done) return;
    }
  }

  function runVariant(cc, deadline, shared, transform) {
    ctx = {
      start: cc, deadline: deadline, nodes: 0, timedOut: false, done: false,
      path1: new Array(32), path2: new Array(32),
      bestLen: shared.bestLen, best: null, stopAt: shared.stopAt,
      onSolution: function (seq) {
        var real = transform(seq);
        real = simplify(real);
        if (real.length < shared.bestLen) {
          shared.bestLen = real.length; shared.best = real;
          if (shared.emit) shared.emit(real);
        }
        ctx.bestLen = Math.min(ctx.bestLen, shared.bestLen);
        if (shared.bestLen <= shared.stopAt) ctx.done = true;
      }
    };
    var tw = getTwist(cc), fp = getFlip(cc), sl = getSlice(cc);
    for (var d1 = 0; d1 < ctx.bestLen && d1 <= 12; d1++) {
      search1(tw, fp, sl, d1, -1, 0);
      if (ctx.timedOut || ctx.done) break;
    }
    return ctx.timedOut;
  }

  // opts: { maxTimeMs, stopAt, maxLen }
  function solve(facelets, opts, emit) {
    opts = opts || {};
    var parsed = fromFacelets(facelets);
    if (parsed.error) return { error: parsed.error };
    var bad = verify(parsed.cube);
    if (bad) return { error: bad };
    init();
    var cube = parsed.cube;
    var shared = { bestLen: opts.maxLen || 31, best: null, stopAt: opts.stopAt == null ? 20 : opts.stopAt, emit: emit };
    var t0 = Date.now();
    var total = opts.maxTimeMs == null ? 5000 : opts.maxTimeMs;
    var solvedAlready = true, i;
    for (i = 0; i < 8; i++) if (cube.cp[i] !== i || cube.co[i] !== 0) solvedAlready = false;
    for (i = 0; i < 12; i++) if (cube.ep[i] !== i || cube.eo[i] !== 0) solvedAlready = false;
    if (solvedAlready) { if (emit) emit([]); return { moves: [], names: [], elapsed: 0, length: 0, timedOut: false }; }
    var inv = invertCube(cube);
    var round = 0, budget = 150, timedOutAny = false;
    var identity = function (s) { return s; };
    var reverse = function (s) { return invertMoves(s); };
    while (Date.now() - t0 < total && shared.bestLen > shared.stopAt) {
      var left = total - (Date.now() - t0);
      var slice = Math.min(budget, left);
      var a = runVariant(cube, Date.now() + slice, shared, identity);
      if (shared.bestLen <= shared.stopAt) break;
      left = total - (Date.now() - t0);
      if (left <= 0) break;
      var b = runVariant(inv, Date.now() + Math.min(budget, left), shared, reverse);
      timedOutAny = a || b;
      if (!a && !b) break; // both searches finished without timing out: nothing shorter exists in range
      budget *= 2; round++;
    }
    if (!shared.best) return { error: 'No solution found in time. Try again or check the scan.' };
    var names = [];
    for (i = 0; i < shared.best.length; i++) names.push(MOVE_NAMES[shared.best[i]]);
    return { moves: shared.best, names: names, elapsed: Date.now() - t0, length: shared.best.length, timedOut: timedOutAny };
  }

  var api = { init: init, solve: solve, fromFacelets: fromFacelets, verify: verify, MOVE_NAMES: MOVE_NAMES };

  if (typeof importScripts === 'function' && typeof self !== 'undefined' && typeof self.postMessage === 'function') {
    self.onmessage = function (e) {
      var d = e.data || {};
      try {
        if (d.type === 'init') {
          init(function (stage, pct) { self.postMessage({ type: 'progress', stage: stage, pct: pct }); });
          self.postMessage({ type: 'ready' });
        } else if (d.type === 'solve') {
          init(function (stage, pct) { self.postMessage({ type: 'progress', stage: stage, pct: pct }); });
          var res = solve(d.facelets, { maxTimeMs: d.maxTimeMs, stopAt: d.stopAt, maxLen: d.maxLen }, function (mv) {
            var nm = [];
            for (var i = 0; i < mv.length; i++) nm.push(MOVE_NAMES[mv[i]]);
            self.postMessage({ type: 'solution', names: nm, length: nm.length });
          });
          if (res.error) self.postMessage({ type: 'error', message: res.error });
          else self.postMessage({ type: 'done', names: res.names, length: res.length, elapsed: res.elapsed });
        }
      } catch (err) {
        self.postMessage({ type: 'error', message: String(err && err.message ? err.message : err) });
      }
    };
  }

  return api;
})()`

// App state types and pure helpers shared by the hooks and components.
// ── constants ────────────────────────────────────────────────────────────────
export const RK_STORAGE_KEY = 'pluff-rubik-solver-v1'
export const RK_SEARCH_MS = 6000
export const RK_SEARCH_LONG_MS = 20000
export const RK_STOP_AT = 18

// ── types ────────────────────────────────────────────────────────────────────
export type RkStage = 'scan' | 'review' | 'solve'
export type RkSolveStatus = 'idle' | 'working' | 'done' | 'error'
export type RkTool = 'paint' | 'swap'

export type RkStoreState = {
  stage: RkStage
  stickers: string[]
  uncertain: boolean[]
  captures: (number[][] | null)[]
  scanIndex: number
  rescanFace: string | null
  means: Record<string, RkLab> | null
  tool: RkTool
  brush: string
  selected: number
  swapFirst: number
  solveStatus: RkSolveStatus
  prepPct: number
  prepStage: string
  solution: string[] | null
  solveMs: number
  solveError: string
  guideOn: boolean
  step: number
  refining: boolean
  mode: RkMode
  plan: { solution: string[]; stages: RkPlanStage[] } | null
  setMode: (m: RkMode) => void
  setStage: (s: RkStage) => void
  resetAll: () => void
  startManual: () => void
  captureFace: (rgb9: number[][]) => void
  finishPartial: () => void
  startRescan: (face: string) => void
  cancelRescan: () => void
  restartScan: () => void
  setTool: (t: RkTool) => void
  setBrush: (b: string) => void
  tapSticker: (i: number) => void
  clearSelection: () => void
  clearStickers: () => void
  setPrep: (pct: number, stage: string) => void
  beginSolve: () => void
  setPlan: (solution: string[], stages: RkPlanStage[]) => void
  setSolution: (moves: string[], working: boolean, ms: number) => void
  failSolve: (msg: string) => void
  startGuide: () => void
  setStep: (n: number) => void
  jumpScan: (i: number) => void
  beginRefine: () => void
  endRefine: () => void
  hydrate: (stickers: string[], stage: RkStage) => void
}

// ── pure helpers ─────────────────────────────────────────────────────────────
export function rkBlankStickers(): string[] {
  const out: string[] = []
  for (let i = 0; i < 54; i++) out.push(i % 9 === 4 ? RK_FACES[Math.floor(i / 9)] : '')
  return out
}

export function rkCaptureGrid(captures: (number[][] | null)[]): (number[] | null)[] {
  const grid: (number[] | null)[] = new Array(54).fill(null)
  captures.forEach((cap, i) => {
    if (!cap) return
    const fi = RK_FACES.indexOf(RK_SCAN_ORDER[i])
    for (let k = 0; k < 9; k++) grid[fi * 9 + k] = cap[k]
  })
  return grid
}

export function rkCenterMatches(sample: number[], expected: string, captures: (number[][] | null)[]): boolean {
  const refs: Record<string, RkLab> = {}
  captures.forEach((cap, i) => {
    if (cap) refs[RK_SCAN_ORDER[i]] = rkRgbToLab(cap[4][0], cap[4][1], cap[4][2])
  })
  return rkNearestFace(sample, refs) === expected
}

export function rkMoveNames(moves: string[] | null): string {
  return moves ? moves.join(' ') : ''
}

export function rkStatesAlong(start: string[], moves: string[]): string[][] {
  const out: string[][] = [start]
  let cur = start
  for (const m of moves) { cur = rkApplyMove(cur, m); out.push(cur) }
  return out
}

export function rkSaveLocal(stickers: string[], stage: RkStage): void {
  try {
    window.localStorage.setItem(RK_STORAGE_KEY, JSON.stringify({ stickers, stage }))
  } catch (e) { /* storage can be blocked, that is fine */ }
}

export function rkLoadLocal(): { stickers: string[]; stage: RkStage } | null {
  try {
    const raw = window.localStorage.getItem(RK_STORAGE_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!d || !Array.isArray(d.stickers) || d.stickers.length !== 54) { window.localStorage.removeItem(RK_STORAGE_KEY); return null }
    const okLetters = d.stickers.every((s: unknown) => s === '' || (typeof s === 'string' && RK_FACES.indexOf(s) >= 0))
    if (!okLetters) { window.localStorage.removeItem(RK_STORAGE_KEY); return null }
    const stage: RkStage = d.stage === 'review' ? 'review' : 'scan'
    return { stickers: d.stickers, stage }
  } catch (e) {
    try { window.localStorage.removeItem(RK_STORAGE_KEY) } catch (e2) { /* ignore */ }
    return null
  }
}

export const rkSolverBox: { worker: Worker | null; facelets: string[] | null } = { worker: null, facelets: null }

// A solution is only trusted if replaying it on the scanned cube really gives a solved cube.
export function rkSolutionWorks(start: string[] | null, names: string[]): boolean {
  if (!start || start.length !== 54) return false
  return rkIsSolved(rkApplyMoves(start, names))
}

export const RK_BAD_SOLUTION_MSG = 'The solver could not find a valid solution for these stickers. A sticker is probably misread, or the cube is not a real, solvable cube. Check every face against your cube.'

export function rkCreateWorker(): Worker | null {
  try {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined') return null
    const blob = new Blob([RK_SOLVER_SRC], { type: 'text/javascript' })
    return new Worker(URL.createObjectURL(blob))
  } catch (e) {
    return null
  }
}


export type RkCamState = 'idle' | 'starting' | 'live' | 'blocked' | 'unsupported' | 'error'
// ─────────────────────────────────────────────────────────────────────────────
// Beginner mode: layer by layer with the classic patterns, using the shortest
// route for the cube in front of you. Pure TypeScript, no DOM, no AI.
// Hold: white on top, green in front (same as the rest of the app, no cube turns).
// First layer = U (white), last layer = D (yellow). The classic patterns are written
// the usual way (first layer down, last layer up) and mapped through a half turn of
// the whole cube (z2): U<->D, R<->L, F and B stay.
// ─────────────────────────────────────────────────────────────────────────────

export type RkMode = 'kociemba' | 'beginner' | 'pro'

export const RK_MODE_OPTIONS: { id: RkMode; name: string; blurb: string; soon: boolean }[] = [
  { id: 'kociemba', name: 'Fastest', blurb: 'The shortest solution, usually about 20 moves. Best when you just want it solved.', soon: false },
  { id: 'beginner', name: 'Beginner', blurb: 'One layer at a time with the classic patterns, using the fewest turns for your cube. Longer, but easy to learn from.', soon: false },
  { id: 'pro', name: 'Pro', blurb: 'Cross, F2L, OLL and PLL like a speedcuber.', soon: true },
]

export type RkPlanPart = { label: string; from: number; to: number; times: number }
export type RkPlanStage = { id: string; title: string; goal: string; tip: string; from: number; to: number; parts: RkPlanPart[] }

type RkMacro = { moves: string[]; label: string; pattern: boolean }

let rkMoveToCache: Record<string, number[]> | null = null
function rkMoveTo(): Record<string, number[]> {
  if (!rkMoveToCache) {
    const out: Record<string, number[]> = {}
    Object.keys(RK_MOVE_PERMS).forEach((m) => {
      const p = RK_MOVE_PERMS[m]
      const to: number[] = new Array(54)
      for (let j = 0; j < 54; j++) to[p[j]] = j
      out[m] = to
    })
    rkMoveToCache = out
  }
  return rkMoveToCache
}

const RK_Z2: Record<string, string> = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'F', B: 'B' }
const RK_YTURN: Record<string, string> = { U: 'U', D: 'D', R: 'F', F: 'L', L: 'B', B: 'R' }

function rkParseAlg(alg: string): string[] { return alg.split(' ').filter(Boolean) }
function rkMapFaces(moves: string[], map: Record<string, string>): string[] {
  return moves.map((m) => map[m.charAt(0)] + m.slice(1))
}
// The same pattern played backwards (reverse the order, flip every turn).
function rkInvertAlg(moves: string[]): string[] {
  return moves.slice().reverse().map((m) => (m.length === 1 ? m + "'" : m.charAt(1) === "'" ? m.charAt(0) : m))
}
// Drop duplicate macros so the search never looks at the same sequence twice.
function rkUnique(list: RkMacro[]): RkMacro[] {
  const seen: Record<string, boolean> = {}
  return list.filter((m) => { const k = m.moves.join(' '); if (seen[k]) return false; seen[k] = true; return true })
}
// The four versions of a pattern around the vertical axis, each mapped to the real hold.
// Each one also comes with its reverse: a pattern that would have to run 5 times
// (20 turns) is just its reverse run once (4 turns).
function rkVariants(alg: string, label: string): RkMacro[] {
  const out: RkMacro[] = []
  let cur = rkParseAlg(alg)
  for (let k = 0; k < 4; k++) {
    const mapped = rkMapFaces(cur, RK_Z2)
    out.push({ moves: mapped, label, pattern: true })
    out.push({ moves: rkInvertAlg(mapped), label, pattern: true })
    cur = rkMapFaces(cur, RK_YTURN)
  }
  return rkUnique(out)
}
function rkOnePattern(alg: string, label: string): RkMacro[] {
  const mapped = rkMapFaces(rkParseAlg(alg), RK_Z2)
  return rkUnique([
    { moves: mapped, label, pattern: true },
    { moves: rkInvertAlg(mapped), label, pattern: true },
  ])
}

// bottom layer turns (the canonical "U" turns after the half turn mapping)
const RK_SETUP: RkMacro[] = [
  { moves: ['D'], label: 'Setup turn', pattern: false },
  { moves: ["D'"], label: 'Setup turn', pattern: false },
  { moves: ['D2'], label: 'Setup turn', pattern: false },
]

const RK_CORNER_MACROS: RkMacro[] = rkUnique(RK_SETUP
  .concat(rkVariants("R U R' U'", 'Corner drop pattern'))
  .concat(rkVariants("L' U' L U", 'Corner drop pattern')))

const RK_MIDDLE_MACROS: RkMacro[] = rkUnique(RK_SETUP
  .concat(rkVariants("U R U' R' U' F' U F", 'Edge insert pattern'))
  .concat(rkVariants("U' L' U L U F U' F'", 'Edge insert pattern')))

const RK_YCROSS_MACROS: RkMacro[] = rkUnique(RK_SETUP
  .concat(rkOnePattern("F R U R' U' F'", 'Cross pattern'))
  .concat(rkOnePattern("F' L' U' L U F", 'Cross pattern')))

const RK_YFACE_MACROS: RkMacro[] = rkUnique(RK_SETUP
  .concat(rkOnePattern("R U R' U R U2 R'", 'Corner twist pattern'))
  .concat(rkOnePattern("L' U' L U' L' U2 L", 'Corner twist pattern')))

const RK_YCORNER_MACROS: RkMacro[] = rkUnique(RK_SETUP
  .concat(rkOnePattern("U R U' L' U R' U' L", 'Corner swap pattern'))
  .concat(rkOnePattern("U' L' U R U' L U R'", 'Corner swap pattern')))

const RK_YEDGE_MACROS: RkMacro[] = rkUnique(RK_SETUP
  .concat(rkOnePattern("R U' R U R U R U' R' U' R2", 'Edge cycle pattern'))
  .concat(rkOnePattern("R2 U R U R' U' R' U' R' U R'", 'Edge cycle pattern')))

// Cheapest sequence of macros (cost = number of face turns) from start to a goal state.
function rkSearch<S>(
  start: S,
  macros: RkMacro[],
  apply: (s: S, mv: string[]) => S,
  keyOf: (s: S) => string,
  isGoal: (s: S) => boolean,
  maxCost: number,
  maxNodes: number
): number[] | null {
  const states: S[] = [start]
  const keys: string[] = [keyOf(start)]
  const parent: number[] = [-1]
  const via: number[] = [-1]
  const cost: number[] = [0]
  const best: Record<string, number> = {}
  best[keys[0]] = 0
  const buckets: number[][] = []
  for (let i = 0; i <= maxCost + 40; i++) buckets.push([])
  buckets[0].push(0)
  for (let c = 0; c <= maxCost; c++) {
    const list = buckets[c]
    for (let li = 0; li < list.length; li++) {
      const id = list[li]
      if (cost[id] !== c || best[keys[id]] !== c) continue
      const s = states[id]
      if (isGoal(s)) {
        const path: number[] = []
        let cur = id
        while (parent[cur] >= 0) { path.push(via[cur]); cur = parent[cur] }
        return path.reverse()
      }
      for (let mi = 0; mi < macros.length; mi++) {
        const nc = c + macros[mi].moves.length
        if (nc > maxCost) continue
        const ns = apply(s, macros[mi].moves)
        const k = keyOf(ns)
        if (best[k] !== undefined && best[k] <= nc) continue
        best[k] = nc
        states.push(ns); keys.push(k); parent.push(id); via.push(mi); cost.push(nc)
        buckets[nc].push(states.length - 1)
      }
      if (states.length > maxNodes) return null
    }
  }
  return null
}

// Like rkSearch on whole cube states, but returns several different finished cubes that are
// all within `slack` turns of the cheapest one, so the next step can pick the best start.
function rkSearchMany(
  start: string[],
  macros: RkMacro[],
  isGoal: (s: string[]) => boolean,
  maxCost: number,
  maxNodes: number,
  want: number,
  slack: number
): number[][] {
  const states: string[][] = [start]
  const keys: string[] = [start.join('')]
  const parent: number[] = [-1]
  const via: number[] = [-1]
  const cost: number[] = [0]
  const best: Record<string, number> = {}
  best[keys[0]] = 0
  const buckets: number[][] = []
  for (let i = 0; i <= maxCost + 40; i++) buckets.push([])
  buckets[0].push(0)
  const found: number[][] = []
  let limit = maxCost
  for (let c = 0; c <= limit; c++) {
    const list = buckets[c]
    for (let li = 0; li < list.length; li++) {
      const id = list[li]
      if (cost[id] !== c || best[keys[id]] !== c) continue
      const s = states[id]
      if (isGoal(s)) {
        const path: number[] = []
        let cur = id
        while (parent[cur] >= 0) { path.push(via[cur]); cur = parent[cur] }
        found.push(path.reverse())
        if (found.length === 1) limit = Math.min(maxCost, c + slack)
        if (found.length >= want) return found
        continue
      }
      for (let mi = 0; mi < macros.length; mi++) {
        const nc = c + macros[mi].moves.length
        if (nc > limit) continue
        const ns = rkApplyMoves(s, macros[mi].moves)
        const k = ns.join('')
        if (best[k] !== undefined && best[k] <= nc) continue
        best[k] = nc
        states.push(ns); keys.push(k); parent.push(id); via.push(mi); cost.push(nc)
        buckets[nc].push(states.length - 1)
      }
      if (states.length > maxNodes) return found
    }
  }
  return found
}

// ── no wasted turns ──────────────────────────────────────────────────────────
// Searches are done one piece at a time, so the seams between them can leave turns that
// undo or double up (U' then U, D' then D'). This folds them away: same-face turns
// combine (D' D' -> D2, U' U -> nothing) and a turn can slide past turns of the
// opposite face (U D U' -> D) because those two faces never get in each other's way.
type RkTok = { f: string; q: number; seg: number }

function rkTokOf(move: string, seg: number): RkTok {
  const q = move.length === 1 ? 1 : move.charAt(1) === '2' ? 2 : 3
  return { f: move.charAt(0), q, seg }
}
function rkTokName(t: RkTok): string { return t.q === 1 ? t.f : t.q === 2 ? t.f + '2' : t.f + "'" }

function rkReduceToks(toks: RkTok[]): RkTok[] {
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < toks.length && !changed; i++) {
      for (let j = i + 1; j < toks.length; j++) {
        if (toks[j].f === toks[i].f) {
          const q = (toks[i].q + toks[j].q) % 4
          if (q === 0) { toks.splice(j, 1); toks.splice(i, 1) }
          else { toks[i] = { f: toks[i].f, q, seg: toks[i].seg }; toks.splice(j, 1) }
          changed = true
          break
        }
        if (toks[j].f !== RK_OPPOSITE[toks[i].f]) break
      }
    }
  }
  return toks
}
function rkMacroToks(macros: RkMacro[]): RkTok[] {
  const toks: RkTok[] = []
  macros.forEach((mc, si) => mc.moves.forEach((m) => toks.push(rkTokOf(m, si))))
  return rkReduceToks(toks)
}

// Cheapest way to bring all four white edges home at once (breadth first over just those
// four edges: under 200 thousand states, so it is quick and always the true minimum).
const RK_KEEP_SLACK = 2

// Reused between solves so the big table is only allocated once.
let rkCrossMem: { seen: Uint8Array; pos: Uint8Array; par: Int32Array; via: Uint8Array } | null = null

function rkOptimalCross(starts: number[], goals: number[], TO: Record<string, number[]>, keepHome: boolean): string[] | null {
  const names = Object.keys(TO)
  // edges that are already home stay home after every single turn (when keepHome is on)
  const lock = starts.map((p, i) => keepHome && p === goals[i])
  const enc = (a: number, b: number, c: number, d: number) => ((a * 54 + b) * 54 + c) * 54 + d
  const goalKey = enc(goals[0], goals[1], goals[2], goals[3])
  const startKey = enc(starts[0], starts[1], starts[2], starts[3])
  if (startKey === goalKey) return []
  const CAP = 400000
  if (!rkCrossMem) rkCrossMem = { seen: new Uint8Array(54 * 54 * 54 * 54), pos: new Uint8Array(CAP * 4), par: new Int32Array(CAP), via: new Uint8Array(CAP) }
  const { seen, pos, par, via } = rkCrossMem
  seen.fill(0)
  let n = 1
  pos[0] = starts[0]; pos[1] = starts[1]; pos[2] = starts[2]; pos[3] = starts[3]
  par[0] = -1
  seen[startKey] = 1
  let lo = 0
  while (lo < n) {
    const hi = n
    for (let id = lo; id < hi; id++) {
      const a = pos[id * 4], b = pos[id * 4 + 1], c = pos[id * 4 + 2], d = pos[id * 4 + 3]
      for (let mi = 0; mi < names.length; mi++) {
        const t = TO[names[mi]]
        const qa = t[a], qb = t[b], qc = t[c], qd = t[d]
        if ((lock[0] && qa !== goals[0]) || (lock[1] && qb !== goals[1]) || (lock[2] && qc !== goals[2]) || (lock[3] && qd !== goals[3])) continue
        const k = enc(qa, qb, qc, qd)
        if (seen[k]) continue
        seen[k] = 1
        if (n >= CAP) return null
        pos[n * 4] = qa; pos[n * 4 + 1] = qb; pos[n * 4 + 2] = qc; pos[n * 4 + 3] = qd
        par[n] = id; via[n] = mi
        if (k === goalKey) {
          const out: string[] = []
          let cur = n
          while (par[cur] >= 0) { out.push(names[via[cur]]); cur = par[cur] }
          return out.reverse()
        }
        n++
      }
    }
    lo = hi
  }
  return null
}

const RK_BEGINNER_INFO: Record<string, { title: string; goal: string; tip: string }> = {
  cross: {
    title: 'White cross',
    goal: 'A white plus on the top face, with each edge matching the center of its side.',
    tip: 'There is no fixed pattern here. These are the fewest turns that bring all four white edges home together.',
  },
  corners: {
    title: 'White corners',
    goal: 'The whole top layer is white and the top row of every side matches its center.',
    tip: 'Turn the bottom layer until the corner sits right under its spot, then run the short pattern (or its reverse, whichever is shorter) until it drops in.',
  },
  middle: {
    title: 'Middle layer',
    goal: 'The middle row of every side matches its center.',
    tip: 'Line the edge up under the side it belongs to, then use the insert pattern. The same pattern also pops out a wrong edge.',
  },
  ycross: {
    title: 'Yellow cross',
    goal: 'A yellow plus on the bottom face.',
    tip: 'Run the cross pattern. Turn the bottom layer between runs so the pattern starts from the right place.',
  },
  yface: {
    title: 'Yellow face',
    goal: 'The whole bottom face is yellow.',
    tip: 'Run the twist pattern, turning the bottom layer between runs. The yellow cross stays put.',
  },
  ycorners: {
    title: 'Corner positions',
    goal: 'Every bottom corner sits at its correct spot.',
    tip: 'The swap pattern moves three corners around. The bottom turn lines them up.',
  },
  yedges: {
    title: 'Last edges',
    goal: 'The cube is solved.',
    tip: 'The cycle pattern moves three edges around. One last bottom turn finishes it.',
  },
}

export function rkSolveBeginner(start: string[]): { moves: string[]; plan: RkPlanStage[] } | { error: string } {
  if (rkIsSolved(start)) return { moves: [], plan: [] }
  const TO = rkMoveTo()
  let state = start.slice()
  const stageMacros: { id: string; macros: RkMacro[] }[] = []

  const letterFace = (i: number) => RK_FACES[Math.floor(i / 9)]
  const findPiece = (colors: string[], letterAt: (i: number) => string): number => {
    const a = colors[0]
    const rest = colors.slice(1).sort().join('')
    for (let i = 0; i < 54; i++) {
      const sib = RK_SIBLINGS[i]
      if (sib.length !== colors.length || letterAt(i) !== a) continue
      if (sib.filter((j) => j !== i).map(letterAt).sort().join('') === rest) return i
    }
    return -1
  }
  const targetOf = (colors: string[]) => findPiece(colors, letterFace)
  const whereIn = (st: string[], colors: string[]) => findPiece(colors, (i) => st[i])

  const applyTracked = (s: number[], mv: string[]): number[] =>
    s.map((i) => { let j = i; for (const m of mv) j = TO[m][j]; return j })

  // Bring one piece home while every piece in `fixed` ends up back where it is now.
  // The answer only depends on where the pieces are, so it is cached.
  const planCache = new Map<string, number[] | null>()
  const trackedPlan = (fixed: number[], from: number, goal: number, macros: RkMacro[]): number[] | null => {
    const ck = macros.length + ':' + fixed.join(',') + '|' + from + '>' + goal
    if (planCache.has(ck)) return planCache.get(ck)!
    const goals = fixed.concat([goal])
    const p = rkSearch<number[]>(
      fixed.concat([from]), macros, applyTracked,
      (s) => s.join(','),
      (s) => { for (let k = 0; k < s.length; k++) if (s[k] !== goals[k]) return false; return true },
      90, 600000
    )
    planCache.set(ck, p)
    return p
  }
  const toMacros = (st: string[], p: number[], macros: RkMacro[]): { list: RkMacro[]; end: string[] } => {
    const list = p.map((mi) => macros[mi])
    let end = st
    list.forEach((mc) => { end = rkApplyMoves(end, mc.moves) })
    return { list, end }
  }

  // Try every order for the pieces and keep the one with the fewest turns once the seams
  // between pieces are folded away. Each piece still uses its own shortest route.
  const placeBest = (pieces: string[][], fixedBase: number[], macros: RkMacro[]): RkMacro[] | null => {
    let best: RkMacro[] | null = null
    let bestLen = Infinity
    const rec = (st: string[], todo: string[][], fixedNow: number[], acc: RkMacro[]) => {
      const fx = fixedNow.slice()
      const rest = todo.filter((c) => {
        const home = targetOf(c)
        if (whereIn(st, c) === home) { fx.push(home); return false }
        return true
      })
      if (!rest.length) {
        const len = rkMacroToks(acc).length
        if (len < bestLen) { bestLen = len; best = acc }
        return
      }
      for (let k = 0; k < rest.length; k++) {
        const c = rest[k]
        const p = trackedPlan(fx, whereIn(st, c), targetOf(c), macros)
        if (!p) continue
        const step = toMacros(st, p, macros)
        rec(step.end, rest.filter((_, j) => j !== k), fx.concat([targetOf(c)]), acc.concat(step.list))
      }
    }
    rec(state, pieces, fixedBase, [])
    return best
  }

  const fail = (what: string) => ({ error: 'The beginner method got stuck at ' + what + '. Check the stickers, or try the fastest mode.' })
  const commit = (id: string, macros: RkMacro[]) => {
    stageMacros.push({ id, macros })
    macros.forEach((mc) => { state = rkApplyMoves(state, mc.moves) })
  }

  // 1. white cross: all four edges together, the true minimum number of turns
  {
    const sides = ['F', 'R', 'B', 'L']
    const starts = sides.map((x) => whereIn(state, ['U', x]))
    const goals = sides.map((x) => targetOf(['U', x]))
    // Edges that are already home stay put. Only if that costs more than a couple of extra
    // turns than the absolute shortest cross do we take one apart.
    const free = rkOptimalCross(starts, goals, TO, false)
    if (!free) return fail('the white cross')
    const kept = starts.some((p, i) => p === goals[i]) ? rkOptimalCross(starts, goals, TO, true) : null
    const seq = kept && kept.length <= free.length + RK_KEEP_SLACK ? kept : free
    commit('cross', seq.map((m) => ({ moves: [m], label: 'Cross move', pattern: false })))
  }

  // 2. white corners (cross edges stay tracked)
  {
    const crossHome = ['F', 'R', 'B', 'L'].map((x) => targetOf(['U', x]))
    const pieces = [['F', 'R'], ['R', 'B'], ['B', 'L'], ['L', 'F']].map((p) => ['U', p[0], p[1]])
    const list = placeBest(pieces, crossHome, RK_CORNER_MACROS)
    if (!list) return fail('the white corners')
    commit('corners', list)
  }

  // 3. middle layer (whole first layer stays tracked)
  {
    const firstLayer = [0, 1, 2, 3, 5, 6, 7, 8]
    const pieces = [['F', 'R'], ['R', 'B'], ['B', 'L'], ['L', 'F']]
    const list = placeBest(pieces, firstLayer, RK_MIDDLE_MACROS)
    if (!list) return fail('the middle layer')
    commit('middle', list)
  }

  // 4 to 7. last layer, small enough to search on whole cube states.
  // Each step keeps a few near-shortest answers instead of only the first one, and the four
  // steps are chosen together so the total is the shortest, not just each step on its own.
  const dEdges = [28, 30, 32, 34]
  const dFace = [27, 28, 29, 30, 31, 32, 33, 34, 35]
  const dCorners = [27, 29, 33, 35]
  const lastSteps: { id: string; macros: RkMacro[]; goal: (s: string[]) => boolean }[] = [
    { id: 'ycross', macros: RK_YCROSS_MACROS, goal: (s) => dEdges.every((i) => s[i] === 'D') },
    { id: 'yface', macros: RK_YFACE_MACROS, goal: (s) => dFace.every((i) => s[i] === 'D') },
    { id: 'ycorners', macros: RK_YCORNER_MACROS, goal: (s) => dCorners.every((c) => RK_SIBLINGS[c].every((j) => s[j] === letterFace(j))) },
    { id: 'yedges', macros: RK_YEDGE_MACROS, goal: (s) => rkIsSolved(s) },
  ]
  {
    type Cand = { state: string[]; stages: RkMacro[][]; len: number }
    let beam: Cand[] = [{ state, stages: [], len: 0 }]
    for (let si = 0; si < lastSteps.length; si++) {
      const step = lastSteps[si]
      const next: Record<string, Cand> = {}
      for (const cand of beam) {
        const paths = rkSearchMany(cand.state, step.macros, step.goal, 120, 300000, 16, 6)
        for (const p of paths) {
          const list = p.map((mi) => step.macros[mi])
          let end = cand.state
          list.forEach((mc) => { end = rkApplyMoves(end, mc.moves) })
          const stages = cand.stages.concat([list])
          const len = stages.reduce((a, l) => a + rkMacroToks(l).length, 0)
          const key = end.join('')
          if (!next[key] || next[key].len > len) next[key] = { state: end, stages, len }
        }
      }
      beam = Object.keys(next).map((k) => next[k]).sort((a, b) => a.len - b.len).slice(0, 16)
      if (!beam.length) return fail(RK_BEGINNER_INFO[step.id].title.toLowerCase())
    }
    const win = beam[0]
    win.stages.forEach((list, i) => commit(lastSteps[i].id, list))
  }

  if (!rkIsSolved(state)) return fail('the end')

  // Fold away wasted turns inside each step.
  const stageToks: RkTok[][] = stageMacros.map((sm) => rkMacroToks(sm.macros))

  // What must be true when each step is finished (every earlier step stays finished too).
  const home = (st: string[], list: string[][]) => list.every((c) => whereIn(st, c) === targetOf(c))
  const sideNames = ['F', 'R', 'B', 'L']
  const crossSet = sideNames.map((x) => ['U', x])
  const cornerSet = [['F', 'R'], ['R', 'B'], ['B', 'L'], ['L', 'F']].map((p) => ['U', p[0], p[1]])
  const middleSet = [['F', 'R'], ['R', 'B'], ['B', 'L'], ['L', 'F']]
  const layer1 = (s: string[]) => home(s, crossSet) && home(s, cornerSet)
  const layer2 = (s: string[]) => layer1(s) && home(s, middleSet)
  const goalOf: Record<string, (s: string[]) => boolean> = {
    cross: (s) => home(s, crossSet),
    corners: layer1,
    middle: layer2,
    ycross: (s) => layer2(s) && dEdges.every((i) => s[i] === 'D'),
    yface: (s) => layer2(s) && dFace.every((i) => s[i] === 'D'),
    ycorners: (s) => layer2(s) && dFace.every((i) => s[i] === 'D') && dCorners.every((c) => RK_SIBLINGS[c].every((j) => s[j] === letterFace(j))),
    yedges: (s) => rkIsSolved(s),
  }
  const stateAfter = (upTo: number): string[] => {
    let s = start
    for (let k = 0; k <= upTo; k++) s = rkApplyMoves(s, stageToks[k].map(rkTokName))
    return s
  }

  // The same folding across the seam between two steps (F' | F, D' | D2 ...). The seam only
  // moves if the finished step is still really finished at its new end.
  for (let k = 0; k + 1 < stageToks.length; k++) {
    for (let guard = 0; guard < 8; guard++) {
      const cur = stageToks[k], nxt = stageToks[k + 1]
      if (!nxt.length || !cur.length) break
      const b = nxt[0]
      let j = cur.length - 1
      while (j >= 0 && cur[j].f !== b.f && cur[j].f === RK_OPPOSITE[b.f]) j--
      if (j < 0 || cur[j].f !== b.f) break
      const q = (cur[j].q + b.q) % 4
      let done = false
      // A: the merged turn stays at the end of the finished step
      {
        const a = cur.slice()
        if (q === 0) a.splice(j, 1); else a[j] = { f: b.f, q, seg: cur[j].seg }
        const n2 = nxt.slice(1)
        const saved = [stageToks[k], stageToks[k + 1]]
        stageToks[k] = rkReduceToks(a); stageToks[k + 1] = n2
        if (goalOf[stageMacros[k].id](stateAfter(k))) done = true
        else { stageToks[k] = saved[0]; stageToks[k + 1] = saved[1] }
      }
      // B: the merged turn moves to the start of the next step
      if (!done && j === cur.length - 1) {
        const a = cur.slice(0, j)
        const n2 = nxt.slice(1)
        if (q !== 0) n2.unshift({ f: b.f, q, seg: nxt[0].seg })
        const saved = [stageToks[k], stageToks[k + 1]]
        stageToks[k] = a; stageToks[k + 1] = n2
        if (goalOf[stageMacros[k].id](stateAfter(k))) done = true
        else { stageToks[k] = saved[0]; stageToks[k + 1] = saved[1] }
      }
      if (!done) break
      stageToks[k + 1] = rkReduceToks(stageToks[k + 1])
    }
  }

  // Lay out the steps and their parts.
  const moves: string[] = []
  const plan: RkPlanStage[] = []
  let lastKey = ''
  stageMacros.forEach((sm, si) => {
    const info = RK_BEGINNER_INFO[sm.id]
    const st: RkPlanStage = { id: sm.id, title: info.title, goal: info.goal, tip: info.tip, from: moves.length, to: moves.length, parts: [] }
    const toks = stageToks[si]
    let i = 0
    while (i < toks.length) {
      // one run = all turns that still belong to the same macro
      let j = i
      while (j < toks.length && toks[j].seg === toks[i].seg) j++
      const run = toks.slice(i, j).map(rkTokName)
      const macro = sm.macros[toks[i].seg]
      const from = moves.length
      run.forEach((m) => moves.push(m))
      const last = st.parts[st.parts.length - 1]
      const key = run.join(' ')
      if (macro.pattern && last && last.label === macro.label && lastKey === key && last.to === from) {
        last.to = moves.length
        last.times++
      } else {
        st.parts.push({ label: macro.label, from, to: moves.length, times: 1 })
      }
      lastKey = macro.pattern ? key : ''
      i = j
    }
    lastKey = ''
    st.to = moves.length
    plan.push(st)
  })

  if (!rkSolutionWorks(start, moves)) return fail('the end')
  return { moves, plan }
}

/* @arkzen:web:script:end */

/* @arkzen:web:style */
:root {
  --rk-bg: #eef1f7;
  --rk-surface: #ffffff;
  --rk-ink: #12151c;
  --rk-ink-2: #4a5263;
  --rk-line: #d9deea;
  --rk-accent: #2146d6;
  --rk-accent-ink: #ffffff;
  --rk-accent-soft: #e3e9ff;
  --rk-good: #12805c;
  --rk-good-soft: #dcf5ea;
  --rk-warn: #b4430a;
  --rk-warn-soft: #ffe9dc;
  --rk-cube-bg: #0e1013;
  --rk-radius: 16px;
  --rk-shadow: 0 1px 2px rgba(18, 21, 28, 0.06), 0 8px 24px rgba(18, 21, 28, 0.07);
}

html, body { background: var(--rk-bg); }

.rk-app {
  min-height: 100vh;
  color: var(--rk-ink);
  font-family: 'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  max-width: 1120px;
  margin: 0 auto;
  padding: 20px 16px 40px;
}
.rk-app *, .rk-app *::before, .rk-app *::after { box-sizing: border-box; }
.rk-hidden { display: none !important; }
.rk-mono { font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace; letter-spacing: 0.01em; word-break: break-word; }

/* header */
.rk-top {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  margin-bottom: 20px;
}
.rk-brand { display: flex; align-items: center; gap: 12px; }
.rk-brand-name { margin: 0; font-family: 'Bricolage Grotesque', 'Figtree', sans-serif; font-weight: 700; font-size: 22px; line-height: 1.1; }
.rk-brand-sub { margin: 2px 0 0; font-size: 14px; color: var(--rk-ink-2); }
.rk-glyph {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; width: 40px; height: 40px; padding: 3px;
  background: var(--rk-cube-bg); border-radius: 10px; flex: none;
}
.rk-glyph i { display: block; border-radius: 2px; }

.rk-tabs { display: flex; gap: 6px; background: var(--rk-surface); border: 1px solid var(--rk-line); border-radius: 14px; padding: 4px; }
.rk-tab {
  display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px;
  border: 0; border-radius: 10px; background: transparent; color: var(--rk-ink-2);
  font: inherit; font-weight: 600; cursor: pointer;
}
.rk-tab:disabled { opacity: 0.45; cursor: not-allowed; }
.rk-tab.is-on { background: var(--rk-ink); color: #fff; }
.rk-tab-n {
  display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%;
  background: var(--rk-line); color: var(--rk-ink); font-size: 12px; font-weight: 700;
}
.rk-tab.is-on .rk-tab-n { background: #fff; color: var(--rk-ink); }

.rk-main { display: block; }
.rk-foot { margin-top: 28px; color: var(--rk-ink-2); font-size: 13px; }
.rk-foot p { margin: 0; }

/* type */
.rk-h2 { margin: 0 0 6px; font-family: 'Bricolage Grotesque', 'Figtree', sans-serif; font-weight: 700; font-size: 24px; line-height: 1.15; }
.rk-p { margin: 0 0 10px; color: var(--rk-ink); }
.rk-note { margin: 0 0 10px; font-size: 14px; color: var(--rk-ink-2); }
.rk-note-warn { color: var(--rk-warn); }
.rk-kicker { margin: 0 0 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--rk-accent); }
.rk-list { margin: 0 0 10px; padding-left: 20px; font-size: 14px; color: var(--rk-ink); }
.rk-list li { margin: 3px 0; }
.rk-link {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 2px; border: 0; background: none;
  color: var(--rk-accent); font: inherit; font-size: 14px; font-weight: 600; text-decoration: underline; cursor: pointer;
}

/* buttons */
.rk-row { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
.rk-row-wrap { flex-wrap: wrap; }
.rk-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 16px;
  border: 1px solid var(--rk-line); border-radius: 12px; background: var(--rk-surface); color: var(--rk-ink);
  font: inherit; font-weight: 600; cursor: pointer; transition: transform 0.12s ease, background 0.12s ease;
}
.rk-btn:hover:not(:disabled) { background: #f5f7fd; }
.rk-btn:active:not(:disabled) { transform: translateY(1px); }
.rk-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.rk-btn-primary { background: var(--rk-accent); border-color: var(--rk-accent); color: var(--rk-accent-ink); }
.rk-btn-primary:hover:not(:disabled) { background: #1a3bb8; }
.rk-btn-quiet { background: transparent; }
.rk-btn-small { min-height: 36px; padding: 0 12px; font-size: 14px; border-radius: 10px; }
.rk-app button:focus-visible, .rk-app select:focus-visible, .rk-app summary:focus-visible { outline: 3px solid #7f9bff; outline-offset: 2px; }

/* generic panels */
.rk-panel, .rk-stage-card, .rk-side, .rk-viewer-wrap, .rk-net-wrap {
  background: var(--rk-surface); border: 1px solid var(--rk-line); border-radius: var(--rk-radius); box-shadow: var(--rk-shadow);
}
.rk-panel { padding: 24px; max-width: 640px; }
.rk-side, .rk-viewer-wrap, .rk-net-wrap { padding: 18px; }
.rk-stage-card { padding: 18px; }
.rk-callout { background: var(--rk-warn-soft); border-radius: 12px; padding: 12px 14px; margin-top: 8px; }

/* step 1, scan */
.rk-scan, .rk-review { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.rk-viewer { position: relative; width: 100%; max-width: 520px; margin: 0 auto; aspect-ratio: 1 / 1; border-radius: 14px; overflow: hidden; background: var(--rk-cube-bg); }
.rk-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.rk-viewer.is-flash::after { content: ''; position: absolute; inset: 0; background: #fff; opacity: 0.7; animation: rk-flash 0.38s ease-out forwards; }
@keyframes rk-flash { to { opacity: 0; } }
.rk-guide {
  position: absolute; left: 11%; top: 11%; width: 78%; height: 78%;
  display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3%;
  pointer-events: none;
}
.rk-guide-cell { position: relative; border: 2px solid rgba(255, 255, 255, 0.85); border-radius: 8px; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35); display: grid; place-items: center; }
.rk-guide-cell.is-center { border-width: 3px; border-color: #fff; }
.rk-guide-cell i { display: block; width: 34%; height: 34%; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4); }
.rk-viewer-empty {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  padding: 24px; text-align: center; background: rgba(14, 16, 19, 0.88); color: #fff;
}
.rk-viewer-empty .rk-p, .rk-viewer-empty .rk-note { color: #dfe4f2; margin: 0; }
.rk-viewer-empty .rk-note-warn { color: #ffc8a8; }
.rk-meter, .rk-bar { height: 8px; border-radius: 999px; background: var(--rk-line); overflow: hidden; margin: 12px 0 6px; }
.rk-meter span, .rk-bar span { display: block; height: 100%; background: var(--rk-accent); border-radius: 999px; transition: width 0.18s ease; }
.rk-status { margin: 0 0 8px; min-height: 24px; font-weight: 600; }

.rk-prompt { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.rk-prompt-sw { flex: none; width: 56px; height: 56px; border-radius: 14px; border: 2px solid rgba(0, 0, 0, 0.18); box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.12); }
.rk-prompt .rk-p { margin: 0; color: var(--rk-ink-2); }

.rk-faces { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 6px; }
.rk-face-row {
  display: grid; grid-template-columns: 34px 1fr auto auto; align-items: center; gap: 10px;
  padding: 6px 10px; border-radius: 10px; border: 1px solid transparent; background: #f6f8fc; font-size: 14px;
}
.rk-face-row.is-now { border-color: var(--rk-accent); background: var(--rk-accent-soft); }
.rk-face-row.is-done { background: var(--rk-good-soft); }
.rk-face-name { font-weight: 600; }
.rk-face-state { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: var(--rk-good); }
.rk-face-row.is-now .rk-face-state { color: var(--rk-accent); }
.rk-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; width: 30px; height: 30px; padding: 1px; background: var(--rk-cube-bg); border-radius: 5px; }
.rk-mini i { display: block; border-radius: 1px; background: #444; }
.rk-mini.is-dim { opacity: 0.55; }

/* step 2, net editor */
.rk-net { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(3, auto); gap: 10px; }
.rk-face-U { grid-column: 2; grid-row: 1; }
.rk-face-L { grid-column: 1; grid-row: 2; }
.rk-face-F { grid-column: 2; grid-row: 2; }
.rk-face-R { grid-column: 3; grid-row: 2; }
.rk-face-B { grid-column: 4; grid-row: 2; }
.rk-face-D { grid-column: 2; grid-row: 3; }
.rk-face-cap { margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--rk-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rk-face-cap span { font-weight: 500; text-transform: none; letter-spacing: 0; }
.rk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; padding: 3px; background: var(--rk-cube-bg); border-radius: 8px; }
.rk-st {
  position: relative; display: grid; place-items: center; aspect-ratio: 1 / 1; min-width: 0; padding: 0;
  border: 2px solid transparent; border-radius: 5px; background: #2b303a; color: rgba(0, 0, 0, 0.55); cursor: pointer;
}
span.rk-st { cursor: default; }
.rk-st.is-empty { background: repeating-linear-gradient(45deg, #2b303a, #2b303a 4px, #3a404c 4px, #3a404c 8px); }
.rk-st.is-center { cursor: not-allowed; border-color: rgba(0, 0, 0, 0.35); }
.rk-st.is-sibling { border-color: #fff; box-shadow: 0 0 0 2px var(--rk-accent), 0 0 0 4px #fff; z-index: 1; }
.rk-st.is-selected { border-color: #fff; box-shadow: 0 0 0 3px var(--rk-ink), 0 0 0 5px #fff; z-index: 2; }
.rk-st.is-swap { border-color: #fff; box-shadow: 0 0 0 3px #ff7a00, 0 0 0 5px #fff; z-index: 2; }
.rk-st.is-bad { border-color: #ff3b30; border-style: dashed; }
.rk-st.is-unsure::after { content: ''; position: absolute; top: 2px; right: 2px; width: 7px; height: 7px; border-radius: 50%; background: #fff; border: 2px solid #12151c; }
.rk-net.is-compact { gap: 6px; }
.rk-net.is-compact .rk-grid { gap: 2px; padding: 2px; }
.rk-net.is-compact .rk-st { border-radius: 3px; border-width: 1px; }
.rk-net.is-compact .rk-face-cap { display: none; }

.rk-tools { display: inline-flex; gap: 4px; padding: 4px; margin: 4px 0 12px; background: #f1f3f9; border-radius: 12px; }
.rk-tool { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px; border: 0; border-radius: 9px; background: transparent; font: inherit; font-weight: 600; color: var(--rk-ink-2); cursor: pointer; }
.rk-tool.is-on { background: var(--rk-surface); color: var(--rk-ink); box-shadow: 0 1px 3px rgba(18, 21, 28, 0.15); }
.rk-palette { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 10px; }
.rk-pal { display: grid; justify-items: center; gap: 4px; padding: 6px 0; border: 2px solid transparent; border-radius: 12px; background: #f6f8fc; font: inherit; cursor: pointer; }
.rk-pal.is-on { border-color: var(--rk-ink); background: #fff; }
.rk-pal-sw { width: 36px; height: 36px; border-radius: 9px; border: 2px solid rgba(0, 0, 0, 0.2); box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.12); }
.rk-pal-n { font-size: 12px; font-weight: 700; color: var(--rk-good); }
.rk-pal.is-off .rk-pal-n { color: var(--rk-warn); }
.rk-piece { min-height: 44px; }
.rk-piece-line { margin: 0 0 2px; }
.rk-verdict { padding: 12px 14px; border-radius: 12px; margin: 10px 0; }
.rk-verdict .rk-p { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-weight: 600; }
.rk-verdict.is-ok { background: var(--rk-good-soft); color: #0b5a40; }
.rk-verdict.is-warn { background: var(--rk-warn-soft); color: #7a2d05; }
.rk-rescan { margin: 10px 0 6px; }

.rk-modes { margin: 12px 0 6px; display: grid; gap: 8px; }
.rk-mode { display: grid; gap: 2px; text-align: left; padding: 10px 14px; border: 2px solid var(--rk-line); border-radius: 12px; background: #fff; font: inherit; color: var(--rk-ink); cursor: pointer; }
.rk-mode.is-on { border-color: var(--rk-ink); background: #f6f8fc; }
.rk-mode.is-soon { opacity: 0.55; cursor: not-allowed; }
.rk-mode-name { font-weight: 700; display: flex; align-items: center; gap: 8px; }
.rk-mode-blurb { font-size: 14px; color: var(--rk-ink-2); line-height: 1.4; }
.rk-soon { font-style: normal; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; background: #e7ebf5; color: var(--rk-ink-2); }
.rk-stagechip { display: inline-block; margin: 0 0 8px; padding: 4px 10px; border-radius: 999px; background: var(--rk-ink); color: #fff; font-size: 13px; font-weight: 700; }
.rk-stages { display: grid; gap: 10px; margin-bottom: 12px; }
.rk-stage { padding: 10px 12px; border: 1px solid var(--rk-line); border-radius: 12px; }
.rk-stage.is-now { border-color: var(--rk-ink); }
.rk-stage.is-skip { opacity: 0.6; }
.rk-stage .rk-moves { margin: 8px 0 0; }
.rk-stage-h { margin: 0; font-size: 15px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rk-stage-n { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: #e7ebf5; font-size: 12px; }
.rk-stage-c { margin-left: auto; font-size: 13px; font-weight: 500; color: var(--rk-ink-2); }

/* step 3, solve and guide */
.rk-solve-panel .rk-bar { max-width: 420px; }
.rk-guide-layout { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.rk-hold { margin: 0 0 14px; padding: 10px 12px; border-radius: 10px; background: var(--rk-accent-soft); color: #14287d; font-size: 14px; }
.rk-stage-body { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: center; }
.rk-cube-box { background: radial-gradient(circle at 50% 40%, #2a3350, #151a2a); border-radius: 16px; padding: 4px; line-height: 0; }
.rk-canvas { display: block; max-width: 100%; }
.rk-big { margin: 4px 0 8px; }
.rk-tok { display: inline-flex; align-items: baseline; font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace; font-weight: 700; }
.rk-tok-f { font-size: 1em; }
.rk-tok-m { font-size: 0.9em; margin-left: 1px; }
.rk-big .rk-tok { font-size: 56px; line-height: 1; padding: 8px 18px; border-radius: 14px; background: var(--rk-ink); color: #fff; }
.rk-big .rk-tok-m { color: #ffcf5c; }
.rk-controls { margin-top: 12px; }
.rk-speed { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--rk-ink-2); }
.rk-speed select { min-height: 40px; padding: 0 10px; border: 1px solid var(--rk-line); border-radius: 10px; background: #fff; font: inherit; color: var(--rk-ink); }
.rk-moves { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.rk-mv { min-width: 44px; min-height: 40px; padding: 0 10px; border: 1px solid var(--rk-line); border-radius: 10px; background: #f6f8fc; color: var(--rk-ink); font-size: 15px; cursor: pointer; }
.rk-mv.is-past { background: var(--rk-good-soft); border-color: transparent; color: #0b5a40; }
.rk-mv.is-now { background: var(--rk-ink); color: #fff; border-color: var(--rk-ink); }
.rk-details { border-top: 1px solid var(--rk-line); padding: 10px 0; margin-top: 8px; }
.rk-details summary { cursor: pointer; font-weight: 600; min-height: 32px; }
.rk-details .rk-net { margin-top: 8px; }

@media (max-width: 880px) {
  .rk-scan, .rk-review, .rk-guide-layout { grid-template-columns: minmax(0, 1fr); }
  .rk-stage-body { grid-template-columns: minmax(0, 1fr); justify-items: center; text-align: center; }
  .rk-tabs { width: 100%; }
  .rk-tab { flex: 1; justify-content: center; padding: 0 8px; }
  .rk-big .rk-tok { font-size: 44px; }
}
@media (max-width: 520px) {
  .rk-app { padding: 14px 12px 32px; }
  .rk-net { gap: 6px; }
  .rk-face-cap { font-size: 9px; }
  .rk-st { border-radius: 3px; }
  .rk-st svg { display: none; }
  .rk-palette { grid-template-columns: repeat(3, 1fr); }
  .rk-side, .rk-viewer-wrap, .rk-net-wrap, .rk-stage-card { padding: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .rk-app * { transition: none !important; animation: none !important; }
}
/* @arkzen:web:style:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'
import {
  Camera, Check, ChevronLeft, ChevronRight, Copy, Lock, Play, Pause, Upload,
  RotateCcw, ScanLine, Eraser, ArrowLeftRight, Paintbrush, Search, Ban,
} from 'lucide-react'
import {
  RK_FACES, RK_HEX, RK_COLOR_NAME, RK_FACE_NAME, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SIBLINGS,
  RK_VIEWS, RK_SOLVER_SRC,
  rkApplyMove, rkApplyMoves, rkSolvedState, rkIsSolved, rkAnalyze, rkPieceLabel, rkPieceKind,
  rkIsCenter, rkClassify, rkClassifyFace, rkAnchorMeans, rkNearestFace, rkRgbToLab, rkNominalFace,
  rkSampleGrid, rkAvgSamples, rkMaxShift, rkDescribeMove, rkViewFor, rkBuildPolys, rkInlineSolver,
  RK_STORAGE_KEY, RK_SEARCH_MS, RK_SEARCH_LONG_MS, RK_STOP_AT, rkBlankStickers, rkCaptureGrid, rkCenterMatches, rkMoveNames, rkStatesAlong, rkSaveLocal, rkLoadLocal, rkSolverBox, rkSolutionWorks, RK_BAD_SOLUTION_MSG, rkCreateWorker, rkSolveBeginner, RK_MODE_OPTIONS,
} from '@/arkzen/generated/rubik-solver.scripts'
import type { RkMode, RkPlanStage, RkPlanPart, RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'

// ── store ────────────────────────────────────────────────────────────────────
export const useRkStore = create<RkStoreState>((set, get) => ({
  stage: 'scan',
  stickers: rkBlankStickers(),
  uncertain: new Array(54).fill(false),
  captures: [null, null, null, null, null, null],
  scanIndex: 0,
  rescanFace: null,
  means: null,
  tool: 'paint',
  brush: 'U',
  selected: -1,
  swapFirst: -1,
  solveStatus: 'idle',
  prepPct: 0,
  prepStage: '',
  solution: null,
  solveMs: 0,
  solveError: '',
  guideOn: false,
  step: 0,
  refining: false,
  mode: 'kociemba',
  plan: null,

  setMode: (m) => set({ mode: m === 'pro' ? 'kociemba' : m }),
  setStage: (s) => set({ stage: s }),

  resetAll: () => set({
    stage: 'scan', stickers: rkBlankStickers(), uncertain: new Array(54).fill(false),
    captures: [null, null, null, null, null, null], scanIndex: 0, rescanFace: null, means: null,
    selected: -1, swapFirst: -1, solveStatus: 'idle', solution: null, solveError: '', guideOn: false, step: 0,
  }),

  startManual: () => set({
    stage: 'review', stickers: rkBlankStickers(), uncertain: new Array(54).fill(false),
    selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0,
  }),

  captureFace: (rgb9) => {
    const s = get()
    const caps = s.captures.slice()
    caps[s.scanIndex] = rgb9
    if (s.rescanFace) {
      const fi = RK_FACES.indexOf(s.rescanFace)
      const res = rkClassifyFace(rgb9, fi, s.means || rkAnchorMeans())
      const stickers = s.stickers.slice()
      const unsure = s.uncertain.slice()
      for (let k = 0; k < 9; k++) { stickers[fi * 9 + k] = res.faces[k]; unsure[fi * 9 + k] = res.uncertain[k] }
      set({ captures: caps, stickers, uncertain: unsure, stage: 'review', rescanFace: null, selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
      return
    }
    let nextIdx = -1
    for (let k = 1; k <= 5; k++) {
      const idx = (s.scanIndex + k) % 6
      if (!caps[idx]) { nextIdx = idx; break }
    }
    if (nextIdx < 0) {
      const res = rkClassify(rkCaptureGrid(caps), s.means || undefined)
      set({
        captures: caps, scanIndex: 6, stickers: res.faces, uncertain: res.uncertain, means: res.means,
        stage: 'review', selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0,
      })
    } else {
      set({ captures: caps, scanIndex: nextIdx })
    }
  },

  finishPartial: () => {
    const s = get()
    const res = rkClassify(rkCaptureGrid(s.captures), s.means || undefined)
    const base = rkBlankStickers()
    const stickers = base.map((b, i) => res.faces[i] || b)
    set({ stickers, uncertain: res.uncertain, stage: 'review', selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
  },

  startRescan: (face) => set({ stage: 'scan', rescanFace: face, scanIndex: RK_SCAN_ORDER.indexOf(face) }),
  cancelRescan: () => set({ stage: 'review', rescanFace: null }),
  restartScan: () => set({
    stage: 'scan', scanIndex: 0, rescanFace: null, captures: [null, null, null, null, null, null], means: null,
    solution: null, solveStatus: 'idle', guideOn: false, step: 0,
  }),

  setTool: (t) => set({ tool: t, swapFirst: -1 }),
  setBrush: (b) => set({ brush: b, tool: 'paint', swapFirst: -1 }),

  tapSticker: (i) => {
    const s = get()
    if (s.tool === 'swap') {
      if (rkIsCenter(i)) { set({ selected: i }); return }
      if (s.swapFirst < 0) { set({ swapFirst: i, selected: i }); return }
      if (s.swapFirst === i) { set({ swapFirst: -1 }); return }
      const st = s.stickers.slice()
      const t = st[i]; st[i] = st[s.swapFirst]; st[s.swapFirst] = t
      const un = s.uncertain.slice(); un[i] = false; un[s.swapFirst] = false
      set({ stickers: st, uncertain: un, swapFirst: -1, selected: i, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
      return
    }
    if (rkIsCenter(i)) { set({ selected: i }); return }
    const st = s.stickers.slice()
    st[i] = s.brush
    const un = s.uncertain.slice(); un[i] = false
    set({ stickers: st, uncertain: un, selected: i, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
  },

  clearSelection: () => set({ selected: -1, swapFirst: -1 }),

  clearStickers: () => set({
    stickers: rkBlankStickers(), uncertain: new Array(54).fill(false), selected: -1, swapFirst: -1,
    solution: null, solveStatus: 'idle', guideOn: false, step: 0,
  }),

  setPrep: (pct, stage) => set({ prepPct: pct, prepStage: stage }),

  beginSolve: () => set({ solveStatus: 'working', solution: null, plan: null, solveError: '', guideOn: false, step: 0, stage: 'solve', refining: false }),
  setPlan: (solution, stages) => set({ plan: { solution, stages } }),
  beginRefine: () => set({ solveStatus: 'working', refining: true }),
  endRefine: () => set({ solveStatus: 'done', refining: false }),

  setSolution: (moves, working, ms) => set({ solution: moves, solveStatus: working ? 'working' : 'done', solveMs: ms }),

  failSolve: (msg) => set({ solveStatus: 'error', solveError: msg }),

  startGuide: () => set({ guideOn: true, step: 0 }),
  setStep: (n) => set({ step: n }),
  jumpScan: (i) => set({ scanIndex: i }),

  hydrate: (stickers, stage) => set({ stickers, stage }),
}))

// ── camera ───────────────────────────────────────────────────────────────────

export function useRkCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [camState, setCamState] = useState<RkCamState>('idle')
  const [camMessage, setCamMessage] = useState('')
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')

  const stopCam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCamState('idle')
  }, [])

  const startCam = useCallback(async (mode: 'environment' | 'user') => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamState('unsupported')
      setCamMessage('This page cannot use the camera. Browsers only allow it on https or on localhost. You can still take a photo of each face, or enter colors by hand.')
      return
    }
    setCamState('starting')
    setCamMessage('')
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setFacing(mode)
      const v = videoRef.current
      if (v) {
        v.srcObject = stream
        v.muted = true
        await v.play()
      }
      setCamState('live')
    } catch (err: any) {
      const name = err && err.name ? String(err.name) : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCamState('blocked')
        setCamMessage('Camera permission was denied. Allow it in the browser address bar, or use a photo or manual entry.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCamState('error')
        setCamMessage('No camera was found on this device.')
      } else {
        setCamState('error')
        setCamMessage('The camera could not start. Another app may be using it.')
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return { videoRef, camState, camMessage, facing, startCam, stopCam }
}

// ── solver worker ────────────────────────────────────────────────────────────
export function useRkSolver() {
  const setPrep = useRkStore((s) => s.setPrep)

  const attach = useCallback((w: Worker) => {
    w.onmessage = (e: MessageEvent) => {
      const d = e.data || {}
      const st = useRkStore.getState()
      if (d.type === 'progress') st.setPrep(d.pct, d.stage)
      else if (d.type === 'ready') st.setPrep(1, 'Ready')
      else if (d.type === 'solution') {
        if (rkSolutionWorks(rkSolverBox.facelets, d.names)) st.setSolution(d.names, true, 0)
        else if (!st.refining) st.failSolve(RK_BAD_SOLUTION_MSG)
      }
      else if (d.type === 'done') {
        if (rkSolutionWorks(rkSolverBox.facelets, d.names)) st.setSolution(d.names, false, d.elapsed)
        else if (st.refining) { /* keep the earlier, verified solution */ }
        else st.failSolve(RK_BAD_SOLUTION_MSG)
      }
      else if (d.type === 'error') { if (st.refining) st.endRefine(); else st.failSolve(d.message) }
      if (d.type === 'done' && st.refining) st.endRefine()
    }
    w.onerror = () => {
      useRkStore.getState().failSolve('The solver worker failed to start. Try reloading the page.')
      rkSolverBox.worker = null
    }
  }, [])

  const warm = useCallback(() => {
    if (rkSolverBox.worker) return
    const w = rkCreateWorker()
    if (!w) return
    rkSolverBox.worker = w
    attach(w)
    w.postMessage({ type: 'init' })
  }, [attach])

  const stop = useCallback(() => {
    if (rkSolverBox.worker) {
      rkSolverBox.worker.terminate()
      rkSolverBox.worker = null
    }
    const st = useRkStore.getState()
    if (st.solveStatus === 'working') st.setSolution(st.solution || [], false, st.solveMs)
  }, [])

  const solve = useCallback((stickers: string[], maxTimeMs: number, maxLen?: number) => {
    const st = useRkStore.getState()
    rkSolverBox.facelets = stickers.slice()
    if (st.mode === 'beginner' && !maxLen) {
      st.beginSolve()
      window.setTimeout(() => {
        try {
          const t0 = Date.now()
          const res = rkSolveBeginner(stickers)
          const store = useRkStore.getState()
          if ('error' in res) store.failSolve(res.error)
          else if (!rkSolutionWorks(stickers, res.moves)) store.failSolve(RK_BAD_SOLUTION_MSG)
          else { store.setPlan(res.moves, res.plan); store.setSolution(res.moves, false, Date.now() - t0) }
        } catch (e: any) {
          useRkStore.getState().failSolve(String(e && e.message ? e.message : e))
        }
      }, 30)
      return
    }
    if (maxLen) st.beginRefine(); else st.beginSolve()
    let w = rkSolverBox.worker
    if (!w) {
      w = rkCreateWorker()
      if (w) { rkSolverBox.worker = w; attach(w) }
    }
    if (w) {
      w.postMessage({ type: 'solve', facelets: stickers.join(''), maxTimeMs, stopAt: RK_STOP_AT, maxLen })
      return
    }
    // No worker available (blocked by the browser): run on the main thread.
    window.setTimeout(() => {
      try {
        const sv = rkInlineSolver()
        const res = sv.solve(stickers.join(''), { maxTimeMs: Math.min(maxTimeMs, 3000), stopAt: RK_STOP_AT, maxLen })
        if (res.error) { if (maxLen) useRkStore.getState().endRefine(); else useRkStore.getState().failSolve(res.error) }
        else if (rkSolutionWorks(stickers, res.names)) useRkStore.getState().setSolution(res.names, false, res.elapsed)
        else if (!maxLen) useRkStore.getState().failSolve(RK_BAD_SOLUTION_MSG)
        else useRkStore.getState().endRefine()
      } catch (e: any) {
        useRkStore.getState().failSolve(String(e && e.message ? e.message : e))
      }
    }, 30)
  }, [attach])

  return { warm, solve, stop, setPrep }
}

// ── autoplay timer ───────────────────────────────────────────────────────────
export function useRkInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback)
  useEffect(() => { saved.current = callback }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = window.setInterval(() => saved.current(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}

// ── small pieces ─────────────────────────────────────────────────────────────

export const RkGlyph = () => {
  const pattern = ['U', 'R', 'F', 'L', 'D', 'U', 'B', 'F', 'R']
  return (
    <span className="rk-glyph" aria-hidden="true">
      {pattern.map((f, i) => <i key={i} style={{ background: RK_HEX[f] }} />)}
    </span>
  )
}

export const RkSwatch = ({ face, size = 14 }: { face: string; size?: number }) => (
  <span className="rk-swatch" style={{ background: RK_HEX[face], width: size, height: size }} aria-hidden="true" />
)

export const RkMiniFace = ({ faces, dim }: { faces: string[]; dim?: boolean }) => (
  <span className={'rk-mini' + (dim ? ' is-dim' : '')} aria-hidden="true">
    {faces.map((f, i) => <i key={i} style={{ background: f ? RK_HEX[f] : 'transparent' }} />)}
  </span>
)

// ── the editable / read only net ─────────────────────────────────────────────

export const RkCubeNet = ({
  stickers, uncertain, selected = -1, swapFirst = -1, bad, onTap, compact = false,
}: {
  stickers: string[]
  uncertain?: boolean[]
  selected?: number
  swapFirst?: number
  bad?: number[]
  onTap?: (i: number) => void
  compact?: boolean
}) => {
  const sib = selected >= 0 ? RK_SIBLINGS[selected] : []
  const badSet = new Set(bad || [])
  return (
    <div className={'rk-net' + (compact ? ' is-compact' : '')} role="group" aria-label="Cube faces">
      {RK_FACES.map((f, fi) => (
        <div key={f} className={'rk-face rk-face-' + f}>
          <div className="rk-face-cap">{RK_FACE_NAME[f]} <span>{RK_COLOR_NAME[f]}</span></div>
          <div className="rk-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
              const i = fi * 9 + k
              const col = stickers[i]
              const cls = [
                'rk-st',
                col ? '' : 'is-empty',
                k === 4 ? 'is-center' : '',
                selected === i ? 'is-selected' : '',
                selected !== i && sib.indexOf(i) >= 0 ? 'is-sibling' : '',
                badSet.has(i) ? 'is-bad' : '',
                uncertain && uncertain[i] ? 'is-unsure' : '',
                swapFirst === i ? 'is-swap' : '',
              ].filter(Boolean).join(' ')
              const label = RK_FACE_NAME[f] + ' face, row ' + (Math.floor(k / 3) + 1) + ', column ' + ((k % 3) + 1) + ': ' + (col ? RK_COLOR_NAME[col] : 'empty')
              const style = col ? { background: RK_HEX[col] } : undefined
              if (!onTap) return <span key={k} className={cls} style={style} aria-label={label} />
              return (
                <button key={k} type="button" className={cls} style={style} aria-label={label} onClick={() => onTap(i)}>
                  {k === 4 ? <Lock size={compact ? 9 : 13} strokeWidth={2.5} aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── canvas cube with the turning layer ───────────────────────────────────────

export const RkCube3D = ({
  state, move, animate = true, size = 300, label,
}: { state: string[]; move?: string | null; animate?: boolean; size?: number; label: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const info = move ? rkDescribeMove(move) : null
    const view = info ? rkViewFor(info.face) : 'front'
    const sign = info && 'URF'.indexOf(info.face) >= 0 ? 1 : -1
    const scale = size / 6.3
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = (t01: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)
      const anim = info && t01 > 0 ? { face: info.face, angle: -sign * (Math.PI / 2) * info.quarters * t01 } : null
      const polys: RkPoly[] = rkBuildPolys(state, view, anim, info ? info.face : null)
      ctx.lineJoin = 'round'
      for (const p of polys) {
        ctx.beginPath()
        p.pts.forEach((q, n) => {
          const x = size / 2 + q[0] * scale
          const y = size / 2 + q[1] * scale + size * 0.02
          if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.fillStyle = p.fill
        ctx.fill()
        ctx.lineWidth = p.sw
        ctx.strokeStyle = p.stroke
        ctx.stroke()
      }
    }

    if (!animate || !info || reduce) { draw(0); return }
    let raf = 0
    const t0 = performance.now()
    const cycle = 3000
    const loop = (now: number) => {
      const t = (now - t0) % cycle
      let p = 0
      if (t > 700 && t < 1700) {
        const u = (t - 700) / 1000
        p = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
      } else if (t >= 1700 && t < 2500) p = 1
      draw(p)
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [state, move, animate, size])

  return <canvas ref={canvasRef} className="rk-canvas" style={{ width: size, height: size }} role="img" aria-label={label} />
}

// ── step 1: scan ─────────────────────────────────────────────────────────────

export const RkScanStage = () => {
  const scanIndex = useRkStore((s) => s.scanIndex)
  const captures = useRkStore((s) => s.captures)
  const rescanFace = useRkStore((s) => s.rescanFace)
  const captureFace = useRkStore((s) => s.captureFace)
  const finishPartial = useRkStore((s) => s.finishPartial)
  const startManual = useRkStore((s) => s.startManual)
  const cancelRescan = useRkStore((s) => s.cancelRescan)
  const jumpScan = useRkStore((s) => s.jumpScan)
  const restartScan = useRkStore((s) => s.restartScan)
  const setStage = useRkStore((s) => s.setStage)
  const { videoRef, camState, camMessage, facing, startCam, stopCam } = useRkCamera()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const histRef = useRef<number[][][]>([])
  const holdRef = useRef(0)
  const liveRef = useRef({ scanIndex, captures })
  const [cells, setCells] = useState<string[]>([])
  const [hold, setHold] = useState(0)
  const [hint, setHint] = useState('')
  const [flash, setFlash] = useState(false)
  const [photoCheck, setPhotoCheck] = useState<{ samples: number[][]; seen: string } | null>(null)

  liveRef.current = { scanIndex, captures }
  const finished = scanIndex >= 6
  const expected = RK_SCAN_ORDER[Math.min(scanIndex, 5)]
  const topNeighbor = RK_SCAN_TOP[expected]
  const doneCount = captures.filter(Boolean).length

  const doCapture = useCallback((avg: number[][]) => {
    histRef.current = []
    holdRef.current = 0
    setHold(0)
    setHint('')
    setPhotoCheck(null)
    setFlash(true)
    window.setTimeout(() => setFlash(false), 380)
    try { if (navigator.vibrate) navigator.vibrate(40) } catch (e) { /* not supported */ }
    captureFace(avg)
  }, [captureFace])

  const handleSamples = useCallback((samples: number[][]) => {
    const live = liveRef.current
    if (live.scanIndex >= 6) return
    const exp = RK_SCAN_ORDER[live.scanIndex]
    setCells(samples.map((p) => rkNearestFace(p)))
    const hist = histRef.current
    hist.push(samples)
    if (hist.length > 6) hist.shift()
    const centerOk = rkCenterMatches(samples[4], exp, live.captures)
    if (!centerOk) {
      holdRef.current = 0
      setHold(0)
      const seen = rkNearestFace(samples[4])
      setHint(seen === exp ? '' : 'I see a ' + RK_COLOR_NAME[seen] + ' center. Show the ' + RK_COLOR_NAME[exp] + ' center face.')
      return
    }
    const steady = hist.length >= 5 && rkMaxShift(hist[0], hist[hist.length - 1]) < 16
    if (!steady) {
      holdRef.current = 0
      setHold(0)
      setHint('Hold the cube still.')
      return
    }
    setHint('Hold still...')
    holdRef.current += 1
    setHold(Math.min(1, holdRef.current / 4))
    if (holdRef.current >= 4) doCapture(rkAvgSamples(hist))
  }, [doCapture])

  const tick = useCallback(() => {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c || v.videoWidth === 0) return
    const side = 240
    if (c.width !== side) { c.width = side; c.height = side }
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const m = Math.min(v.videoWidth, v.videoHeight)
    ctx.drawImage(v, (v.videoWidth - m) / 2, (v.videoHeight - m) / 2, m, m, 0, 0, side, side)
    handleSamples(rkSampleGrid(ctx.getImageData(0, 0, side, side).data, side))
  }, [handleSamples, videoRef])

  useRkInterval(tick, camState === 'live' && !finished ? 120 : null)

  useEffect(() => {
    histRef.current = []
    holdRef.current = 0
    setHold(0)
    setHint('')
    setPhotoCheck(null)
  }, [scanIndex])

  const captureNow = () => {
    const hist = histRef.current
    if (hist.length === 0) return
    doCapture(rkAvgSamples(hist.slice(-3)))
  }

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const c = canvasRef.current
      if (!c) { URL.revokeObjectURL(url); return }
      const side = 240
      c.width = side
      c.height = side
      const ctx = c.getContext('2d', { willReadFrequently: true })
      if (!ctx) { URL.revokeObjectURL(url); return }
      const m = Math.min(img.naturalWidth, img.naturalHeight)
      ctx.drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, side, side)
      URL.revokeObjectURL(url)
      const samples = rkSampleGrid(ctx.getImageData(0, 0, side, side).data, side)
      setCells(samples.map((p) => rkNearestFace(p)))
      const live = liveRef.current
      if (rkCenterMatches(samples[4], RK_SCAN_ORDER[live.scanIndex], live.captures)) doCapture(samples)
      else setPhotoCheck({ samples, seen: rkNearestFace(samples[4]) })
    }
    img.onerror = () => { URL.revokeObjectURL(url); setHint('That image could not be read.') }
    img.src = url
  }

  if (finished && !rescanFace) {
    return (
      <section className="rk-panel rk-done-panel">
        <h2 className="rk-h2">All six faces captured</h2>
        <p className="rk-p">You can scan again from the start, or go on to check every sticker.</p>
        <div className="rk-row">
          <button type="button" className="rk-btn rk-btn-primary" onClick={() => setStage('review')}>Check stickers <ChevronRight size={18} aria-hidden="true" /></button>
          <button type="button" className="rk-btn" onClick={restartScan}><RotateCcw size={16} aria-hidden="true" /> Scan again</button>
        </div>
      </section>
    )
  }

  const camOn = camState === 'live'

  return (
    <div className="rk-scan">
      <section className="rk-viewer-wrap" aria-label="Camera">
        <div className={'rk-viewer' + (flash ? ' is-flash' : '')}>
          <video ref={videoRef} className="rk-video" playsInline muted />
          <canvas ref={canvasRef} className="rk-hidden" />
          <div className="rk-guide" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
              <div key={k} className={'rk-guide-cell' + (k === 4 ? ' is-center' : '')}>
                {camOn && cells[k] ? <i style={{ background: RK_HEX[cells[k]] }} /> : null}
              </div>
            ))}
          </div>
          {!camOn ? (
            <div className="rk-viewer-empty">
              {camState === 'starting' ? <p className="rk-p">Starting the camera...</p> : (
                <>
                  <button type="button" className="rk-btn rk-btn-primary" onClick={() => startCam(facing)}>
                    <Camera size={18} aria-hidden="true" /> Turn on camera
                  </button>
                  {camMessage ? <p className="rk-note rk-note-warn" role="alert">{camMessage}</p> : <p className="rk-note">Camera frames stay on this device.</p>}
                </>
              )}
            </div>
          ) : null}
        </div>
        <div className="rk-meter" aria-hidden="true"><span style={{ width: Math.round(hold * 100) + '%' }} /></div>
        <p className="rk-status" role="status" aria-live="polite">
          {camOn ? (hint || 'Line the face up with the grid. Detection is automatic.') : 'Camera is off.'}
        </p>
        <div className="rk-row rk-row-wrap">
          {camOn ? (
            <>
              <button type="button" className="rk-btn" onClick={captureNow}><ScanLine size={16} aria-hidden="true" /> Capture now</button>
              <button type="button" className="rk-btn rk-btn-quiet" onClick={() => startCam(facing === 'environment' ? 'user' : 'environment')}>Switch camera</button>
              <button type="button" className="rk-btn rk-btn-quiet" onClick={stopCam}>Camera off</button>
            </>
          ) : null}
          <button type="button" className="rk-btn rk-btn-quiet" onClick={() => fileRef.current && fileRef.current.click()}>
            <Upload size={16} aria-hidden="true" /> Use a photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="rk-hidden" onChange={onPhoto} />
        </div>
        {photoCheck ? (
          <div className="rk-callout" role="alert">
            <p className="rk-p">That photo shows a {RK_COLOR_NAME[photoCheck.seen]} center, but I asked for {RK_COLOR_NAME[expected]}. Take another, or use it anyway.</p>
            <div className="rk-row">
              <button type="button" className="rk-btn" onClick={() => doCapture(photoCheck.samples)}>Use anyway</button>
              <button type="button" className="rk-btn rk-btn-quiet" onClick={() => setPhotoCheck(null)}>Retake</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rk-side">
        <div className="rk-prompt">
          <span className="rk-prompt-sw" style={{ background: RK_HEX[expected] }} aria-hidden="true" />
          <div>
            <p className="rk-kicker">{rescanFace ? 'Rescanning' : 'Face ' + (doneCount + 1 > 6 ? 6 : doneCount + 1) + ' of 6'}</p>
            <h2 className="rk-h2">Show the {RK_COLOR_NAME[expected]} center face</h2>
            <p className="rk-p">
              {topNeighbor === 'U' && expected !== 'U'
                ? 'Keep the white center on top.'
                : 'Hold it so the ' + RK_COLOR_NAME[topNeighbor] + ' center face is above it.'}
            </p>
          </div>
        </div>

        <ol className="rk-faces" aria-label="Faces to scan">
          {RK_SCAN_ORDER.map((f, i) => {
            const cap = captures[i]
            const mini = cap ? cap.map((p, k) => (k === 4 ? f : rkNearestFace(p))) : new Array(9).fill('').map((_, k) => (k === 4 ? f : ''))
            const state = cap ? 'done' : i === scanIndex ? 'now' : 'next'
            return (
              <li key={f} className={'rk-face-row is-' + state}>
                <RkMiniFace faces={mini} dim={!cap} />
                <span className="rk-face-name">{RK_FACE_NAME[f]}, {RK_COLOR_NAME[f]} center</span>
                <span className="rk-face-state">
                  {state === 'done' ? <><Check size={14} aria-hidden="true" /> Done</> : state === 'now' ? 'Now' : ''}
                </span>
                {cap && i !== scanIndex ? (
                  <button type="button" className="rk-link" onClick={() => jumpScan(i)}>Redo</button>
                ) : <span />}
              </li>
            )
          })}
        </ol>

        <p className="rk-note">
          Standard cube colors: white is opposite yellow, green is opposite blue, red is opposite orange. Turn the whole cube
          only; do not twist layers while scanning.
        </p>

        <div className="rk-row rk-row-wrap">
          {rescanFace ? (
            <button type="button" className="rk-btn" onClick={cancelRescan}>Cancel and go back</button>
          ) : (
            <>
              <button type="button" className="rk-btn" onClick={doneCount > 0 ? finishPartial : startManual}>
                <Paintbrush size={16} aria-hidden="true" /> {doneCount > 0 ? 'Enter the rest by hand' : 'Enter colors by hand'}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

// ── step 2: check and fix ────────────────────────────────────────────────────

export const RkReviewStage = () => {
  const stickers = useRkStore((s) => s.stickers)
  const uncertain = useRkStore((s) => s.uncertain)
  const tool = useRkStore((s) => s.tool)
  const brush = useRkStore((s) => s.brush)
  const selected = useRkStore((s) => s.selected)
  const swapFirst = useRkStore((s) => s.swapFirst)
  const setTool = useRkStore((s) => s.setTool)
  const setBrush = useRkStore((s) => s.setBrush)
  const tapSticker = useRkStore((s) => s.tapSticker)
  const clearSelection = useRkStore((s) => s.clearSelection)
  const clearStickers = useRkStore((s) => s.clearStickers)
  const startRescan = useRkStore((s) => s.startRescan)
  const mode = useRkStore((s) => s.mode)
  const setMode = useRkStore((s) => s.setMode)
  const { solve } = useRkSolver()

  const report: RkReport = React.useMemo(() => rkAnalyze(stickers), [stickers])
  const unsureCount = uncertain.filter((u, i) => u && stickers[i]).length
  const pieceText = selected >= 0 ? rkPieceLabel(stickers, selected) : ''
  const kind = selected >= 0 ? rkPieceKind(selected) : null

  return (
    <div className="rk-review">
      <section className="rk-net-wrap" aria-label="Edit stickers">
        <RkCubeNet
          stickers={stickers}
          uncertain={uncertain}
          selected={selected}
          swapFirst={swapFirst}
          bad={report.badPieces}
          onTap={tapSticker}
        />
      </section>

      <section className="rk-side">
        <h2 className="rk-h2">Check every face against your cube</h2>
        <p className="rk-p">
          Tap a sticker to set it to the chosen color. Tapping a corner or edge sticker outlines the other stickers on the same piece,
          so you can compare it with the real piece. Centers are locked.
        </p>

        <div className="rk-tools" role="group" aria-label="Tool">
          <button type="button" className={'rk-tool' + (tool === 'paint' ? ' is-on' : '')} aria-pressed={tool === 'paint'} onClick={() => setTool('paint')}>
            <Paintbrush size={16} aria-hidden="true" /> Paint
          </button>
          <button type="button" className={'rk-tool' + (tool === 'swap' ? ' is-on' : '')} aria-pressed={tool === 'swap'} onClick={() => setTool('swap')}>
            <ArrowLeftRight size={16} aria-hidden="true" /> Swap two
          </button>
        </div>

        <div className="rk-palette" role="group" aria-label="Colors">
          {RK_FACES.map((f) => {
            const n = report.counts[f]
            return (
              <button
                key={f} type="button"
                className={'rk-pal' + (tool === 'paint' && brush === f ? ' is-on' : '') + (n !== 9 ? ' is-off' : '')}
                aria-pressed={tool === 'paint' && brush === f}
                aria-label={RK_COLOR_NAME[f] + ', ' + n + ' of 9 placed'}
                onClick={() => setBrush(f)}
              >
                <span className="rk-pal-sw" style={{ background: RK_HEX[f] }} />
                <span className="rk-pal-n">{n}/9</span>
              </button>
            )
          })}
        </div>
        {tool === 'swap' ? (
          <p className="rk-note">{swapFirst >= 0 ? 'Now tap the sticker to swap it with.' : 'Tap one sticker, then another, to swap their colors.'}</p>
        ) : null}

        <div className="rk-piece" aria-live="polite">
          {selected >= 0 ? (
            <>
              <p className="rk-piece-line"><strong>{pieceText}</strong></p>
              {kind !== 'center' ? <button type="button" className="rk-link" onClick={clearSelection}>Clear outline</button> : null}
            </>
          ) : <p className="rk-note">No sticker selected.</p>}
        </div>

        <div className={'rk-verdict ' + (report.solvable ? 'is-ok' : 'is-warn')} role="status">
          {report.solvable ? (
            <p className="rk-p"><Check size={16} aria-hidden="true" /> This cube is valid and can be solved.</p>
          ) : (
            <>
              <p className="rk-p"><Ban size={16} aria-hidden="true" /> Not solvable yet:</p>
              <ul className="rk-list">{report.messages.slice(0, 5).map((m, i) => <li key={i}>{m}</li>)}</ul>
            </>
          )}
          {unsureCount > 0 ? <p className="rk-note">{unsureCount} sticker{unsureCount === 1 ? '' : 's'} with a dot in the corner {unsureCount === 1 ? 'was' : 'were'} hard to read. Check those first.</p> : null}
        </div>

        <div className="rk-modes" role="radiogroup" aria-label="How to solve it">
          <p className="rk-kicker">How do you want to solve it?</p>
          {RK_MODE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={mode === o.id}
              disabled={o.soon}
              className={'rk-mode' + (mode === o.id ? ' is-on' : '') + (o.soon ? ' is-soon' : '')}
              onClick={() => setMode(o.id)}
            >
              <span className="rk-mode-name">{o.name}{o.soon ? <em className="rk-soon">Soon</em> : null}</span>
              <span className="rk-mode-blurb">{o.blurb}</span>
            </button>
          ))}
        </div>

        <div className="rk-row rk-row-wrap">
          <button type="button" className="rk-btn rk-btn-primary" disabled={!report.solvable} onClick={() => solve(stickers, RK_SEARCH_MS)}>
            Find the solution <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="rk-rescan">
          <span className="rk-kicker">Rescan one face</span>
          <div className="rk-row rk-row-wrap">
            {RK_SCAN_ORDER.map((f) => (
              <button key={f} type="button" className="rk-btn rk-btn-small" onClick={() => startRescan(f)} aria-label={'Rescan the ' + RK_COLOR_NAME[f] + ' center face'}>
                <RkSwatch face={f} /> {RK_FACE_NAME[f]}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="rk-link" onClick={clearStickers}><Eraser size={14} aria-hidden="true" /> Clear all stickers</button>
      </section>
    </div>
  )
}

// ── step 3: solve and guide ──────────────────────────────────────────────────

export const RkMoveToken = ({ move }: { move: string }) => (
  <span className="rk-tok">
    <span className="rk-tok-f">{move.charAt(0)}</span>
    <span className="rk-tok-m">{move.slice(1)}</span>
  </span>
)

export const RkGuide = () => {
  const stickers = useRkStore((s) => s.stickers)
  const solution = useRkStore((s) => s.solution) || []
  const step = useRkStore((s) => s.step)
  const setStep = useRkStore((s) => s.setStep)
  const status = useRkStore((s) => s.solveStatus)
  const planState = useRkStore((s) => s.plan)
  const resetAll = useRkStore((s) => s.resetAll)
  const setStage = useRkStore((s) => s.setStage)
  const { solve } = useRkSolver()
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(2600)
  const [copied, setCopied] = useState(false)

  const states = React.useMemo(() => rkStatesAlong(stickers, solution), [stickers, solution])
  const total = solution.length
  const atEnd = step >= total
  const move = atEnd ? null : solution[step]
  const info = move ? rkDescribeMove(move) : null
  const nextMove = step + 1 < total ? solution[step + 1] : null

  // Beginner mode: which step and which pattern the current move belongs to.
  const plan: RkPlanStage[] | null = planState && planState.solution === solution ? planState.stages : null
  const doneAt = (st: RkPlanStage) => st.to === st.from
  let curStageIdx = -1
  let curPart: RkPlanPart | null = null
  if (plan) {
    const at = Math.min(step, Math.max(total - 1, 0))
    curStageIdx = plan.findIndex((st) => !doneAt(st) && at >= st.from && at < st.to)
    if (curStageIdx >= 0 && !atEnd) curPart = plan[curStageIdx].parts.find((pt) => step >= pt.from && step < pt.to) || null
  }
  const curStage = plan && curStageIdx >= 0 ? plan[curStageIdx] : null

  const go = useCallback((n: number) => {
    setStep(Math.max(0, Math.min(total, n)))
  }, [setStep, total])

  useRkInterval(() => {
    if (step >= total) { setPlaying(false); return }
    go(step + 1)
  }, playing ? speed : null)

  useEffect(() => {
    if (playing && step >= total) setPlaying(false)
  }, [playing, step, total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowRight') { e.preventDefault(); go(step + 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(step - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, step])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rkMoveNames(solution))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch (e) { /* clipboard blocked */ }
  }

  return (
    <div className="rk-guide-layout">
      <section className="rk-stage-card" aria-label="Current move">
        <p className="rk-hold">
          <strong>Hold the cube the same way for every move:</strong> green center facing you, white center on top.
          You never need to turn the whole cube.
        </p>
        <div className="rk-stage-body">
          <div className="rk-cube-box">
            <RkCube3D
              state={states[Math.min(step, total)] || stickers}
              move={move}
              animate={!atEnd}
              size={300}
              label={info ? info.headline : 'The cube is solved'}
            />
          </div>
          <div className="rk-move-box">
            {curStage && !atEnd ? (
              <p className="rk-stagechip">Step {curStageIdx + 1} of {plan ? plan.length : 0} · {curStage.title}</p>
            ) : null}
            <p className="rk-kicker">{atEnd ? 'Finished' : 'Move ' + (step + 1) + ' of ' + total}</p>
            {move ? (
              <>
                <div className="rk-big"><RkMoveToken move={move} /></div>
                <h2 className="rk-h2">{info ? info.headline : ''}</h2>
                <p className="rk-p">{info ? info.detail : ''}</p>
                {curPart && curPart.label !== 'Setup turn' ? (
                  <p className="rk-note"><strong>{curPart.label}</strong>{curPart.times > 1 ? ' · run ' + (Math.floor((step - curPart.from) / ((curPart.to - curPart.from) / curPart.times)) + 1) + ' of ' + curPart.times : ''}</p>
                ) : curPart ? <p className="rk-note"><strong>Setup turn</strong> · lines the piece up for the next pattern</p> : null}
                {curStage && step === curStage.from ? <p className="rk-note">{curStage.goal} {curStage.tip}</p> : null}
                {nextMove ? <p className="rk-note">Next: <RkMoveToken move={nextMove} /></p> : <p className="rk-note">This is the last move.</p>}
              </>
            ) : (
              <>
                <h2 className="rk-h2">{rkIsSolved(states[Math.min(step, total)] || stickers) ? (total === 0 ? 'This cube is already solved' : 'Solved') : 'Something is off'}</h2>
                <p className="rk-p">{rkIsSolved(states[Math.min(step, total)] || stickers) ? 'Every face should now be one color.' : 'The final state does not match a solved cube. Rescan and try again.'}</p>
              </>
            )}
          </div>
        </div>
        <div className="rk-bar" aria-hidden="true"><span style={{ width: (total ? Math.round((Math.min(step, total) / total) * 100) : 100) + '%' }} /></div>
        <div className="rk-row rk-row-wrap rk-controls">
          <button type="button" className="rk-btn" onClick={() => go(step - 1)} disabled={step === 0}><ChevronLeft size={18} aria-hidden="true" /> Back</button>
          <button type="button" className="rk-btn rk-btn-primary" onClick={() => go(step + 1)} disabled={atEnd}>Next <ChevronRight size={18} aria-hidden="true" /></button>
          <button type="button" className="rk-btn rk-btn-quiet" onClick={() => setPlaying((p) => !p)} disabled={atEnd} aria-pressed={playing}>
            {playing ? <><Pause size={16} aria-hidden="true" /> Pause</> : <><Play size={16} aria-hidden="true" /> Auto</>}
          </button>
          <label className="rk-speed">
            <span>Pace</span>
            <select value={speed} onChange={(e) => setSpeed(parseInt(e.target.value, 10))}>
              <option value={4200}>Slow</option>
              <option value={2600}>Normal</option>
              <option value={1500}>Fast</option>
            </select>
          </label>
        </div>
        <p className="rk-note">Arrow keys also step through the moves.</p>
      </section>

      <section className="rk-side">
        <h2 className="rk-h2">All {total} moves</h2>
        {plan ? (
          <div className="rk-stages">
            {plan.map((st, si) => (
              <div key={st.id} className={'rk-stage' + (si === curStageIdx ? ' is-now' : '') + (doneAt(st) ? ' is-skip' : '')}>
                <h3 className="rk-stage-h"><span className="rk-stage-n">{si + 1}</span> {st.title} <span className="rk-stage-c">{doneAt(st) ? 'already done' : st.to - st.from + ' moves'}</span></h3>
                {doneAt(st) ? null : (
                  <ol className="rk-moves" aria-label={st.title + ' moves'}>
                    {solution.slice(st.from, st.to).map((m, k) => {
                      const i = st.from + k
                      return (
                        <li key={i}>
                          <button type="button" className={'rk-mv' + (i === step ? ' is-now' : i < step ? ' is-past' : '')} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
                            <RkMoveToken move={m} />
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ol className="rk-moves" aria-label="Full move list">
            {solution.map((m, i) => (
              <li key={i}>
                <button type="button" className={'rk-mv' + (i === step ? ' is-now' : i < step ? ' is-past' : '')} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
                  <RkMoveToken move={m} />
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className="rk-row rk-row-wrap">
          <button type="button" className="rk-btn rk-btn-small" onClick={copy}><Copy size={14} aria-hidden="true" /> {copied ? 'Copied' : 'Copy moves'}</button>
          {step === 0 && status !== 'working' && total > 0 && !plan ? (
            <button type="button" className="rk-btn rk-btn-small" onClick={() => solve(stickers, RK_SEARCH_LONG_MS, total)}>
              <Search size={14} aria-hidden="true" /> Look for a shorter one
            </button>
          ) : null}
        </div>
        {status === 'working' ? <p className="rk-note" role="status">Searching for something shorter than {total} moves...</p> : null}

        <details className="rk-details">
          <summary>Does your cube match? Compare it here</summary>
          <p className="rk-note">This is how the cube should look right now, before move {Math.min(step + 1, total)}.</p>
          <RkCubeNet stickers={states[Math.min(step, total)] || stickers} compact />
        </details>

        <details className="rk-details">
          <summary>How to read the moves</summary>
          <ul className="rk-list">
            <li><strong>R, L, U, D, F, B</strong> are the right, left, top (up), bottom (down), front and back faces.</li>
            <li>A letter alone means a quarter turn clockwise, looking straight at that face.</li>
            <li>A letter with <strong>'</strong> means a quarter turn counterclockwise.</li>
            <li>A letter with <strong>2</strong> means a half turn.</li>
          </ul>
        </details>

        <div className="rk-row rk-row-wrap">
          <button type="button" className="rk-btn rk-btn-quiet" onClick={() => setStage('review')}>Back to stickers</button>
          <button type="button" className="rk-btn rk-btn-quiet" onClick={resetAll}><RotateCcw size={16} aria-hidden="true" /> Scan another cube</button>
        </div>
      </section>
    </div>
  )
}

export const RkSolveStage = () => {
  const status = useRkStore((s) => s.solveStatus)
  const solution = useRkStore((s) => s.solution)
  const prepPct = useRkStore((s) => s.prepPct)
  const prepStage = useRkStore((s) => s.prepStage)
  const solveError = useRkStore((s) => s.solveError)
  const solveMs = useRkStore((s) => s.solveMs)
  const guideOn = useRkStore((s) => s.guideOn)
  const startGuide = useRkStore((s) => s.startGuide)
  const setStage = useRkStore((s) => s.setStage)
  const mode = useRkStore((s) => s.mode)
  const { stop } = useRkSolver()

  if (status === 'error') {
    return (
      <section className="rk-panel">
        <h2 className="rk-h2">The solver could not finish</h2>
        <p className="rk-p" role="alert">{solveError}</p>
        <button type="button" className="rk-btn" onClick={() => setStage('review')}>Back to stickers</button>
      </section>
    )
  }

  if (guideOn && solution) return <RkGuide />

  const working = status === 'working'
  return (
    <section className="rk-panel rk-solve-panel" aria-live="polite">
      {working && !solution ? (
        <>
          <h2 className="rk-h2">{mode === 'beginner' ? 'Planning the layers' : prepPct < 1 ? 'Getting the solver ready' : 'Searching'}</h2>
          <p className="rk-p">{mode === 'beginner' ? 'Finding the fewest turns for each step...' : prepPct < 1 ? prepStage || 'Building search tables' : 'Looking for a short solution...'}</p>
          <div className="rk-bar" aria-hidden="true"><span style={{ width: Math.round(Math.max(0.05, prepPct) * 100) + '%' }} /></div>
          <p className="rk-note">This takes a second or two the first time, then the search itself runs for a few seconds.</p>
        </>
      ) : null}

      {solution ? (
        <>
          <p className="rk-kicker">{working ? 'Best so far, still searching' : 'Solution ready'}</p>
          <h2 className="rk-h2">{solution.length === 0 ? 'This cube is already solved' : solution.length + ' moves'}</h2>
          <p className="rk-p rk-mono">{rkMoveNames(solution)}</p>
          <p className="rk-note">
            {mode === 'beginner'
              ? 'Layer by layer, in 7 steps, with the classic patterns. Each step uses the fewest turns for your cube, so it is much longer than the fastest mode but easy to follow.'
              : 'This is a very short solution found by a two-phase search, usually within 1 to 3 moves of the shortest possible. It is not proven to be the single shortest.'}
            {!working && solveMs > 0 ? ' Found in ' + (solveMs >= 1000 ? (solveMs / 1000).toFixed(1) + ' s.' : solveMs + ' ms.') : ''}
          </p>
          <div className="rk-row rk-row-wrap">
            <button type="button" className="rk-btn rk-btn-primary" onClick={() => { if (working) stop(); startGuide() }}>
              {working ? 'Use this and start' : 'Start step by step'} <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="rk-btn rk-btn-quiet" onClick={() => { if (working) stop(); setStage('review') }}>Back to stickers</button>
          </div>
        </>
      ) : null}
    </section>
  )
}

// ── app shell ────────────────────────────────────────────────────────────────

export const RkApp = () => {
  const stage = useRkStore((s) => s.stage)
  const setStage = useRkStore((s) => s.setStage)
  const solution = useRkStore((s) => s.solution)
  const hydrate = useRkStore((s) => s.hydrate)
  const { warm } = useRkSolver()

  useEffect(() => {
    if (!document.getElementById('rk-fonts')) {
      const link = document.createElement('link')
      link.id = 'rk-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap'
      document.head.appendChild(link)
    }
    const saved = rkLoadLocal()
    if (saved) {
      const hasWork = saved.stickers.some((s, i) => s && i % 9 !== 4)
      if (hasWork) hydrate(saved.stickers, saved.stage)
    }
    warm()
  }, [])

  useEffect(() => {
    const unsub = useRkStore.subscribe((s, prev) => {
      if (s.stickers !== prev.stickers) rkSaveLocal(s.stickers, s.stage === 'review' ? 'review' : 'scan')
    })
    return unsub
  }, [])

  const tabs: { id: RkStage; label: string; enabled: boolean }[] = [
    { id: 'scan', label: 'Scan', enabled: true },
    { id: 'review', label: 'Check', enabled: true },
    { id: 'solve', label: 'Solve', enabled: !!solution },
  ]

  return (
    <div className="rk-app">
      <header className="rk-top">
        <div className="rk-brand">
          <RkGlyph />
          <div>
            <p className="rk-brand-name">Cube solver</p>
            <p className="rk-brand-sub">Scan six faces, fix misreads, follow the moves.</p>
          </div>
        </div>
        <nav className="rk-tabs" aria-label="Steps">
          {tabs.map((t, i) => (
            <button
              key={t.id} type="button"
              className={'rk-tab' + (stage === t.id ? ' is-on' : '')}
              aria-current={stage === t.id ? 'step' : undefined}
              disabled={!t.enabled}
              onClick={() => setStage(t.id)}
            >
              <span className="rk-tab-n">{i + 1}</span> {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="rk-main">
        {stage === 'scan' ? <RkScanStage /> : null}
        {stage === 'review' ? <RkReviewStage /> : null}
        {stage === 'solve' ? <RkSolveStage /> : null}
      </main>
      <footer className="rk-foot">
        <p>The solver runs in your browser and uses no AI. Camera frames are never uploaded.</p>
      </footer>
    </div>
  )
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => <RkApp />

/* @arkzen:web:page:index:end */