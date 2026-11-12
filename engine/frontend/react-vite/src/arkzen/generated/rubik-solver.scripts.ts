// ============================================================
// ARKZEN GENERATED SCRIPT — rubik-solver
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T06:24:07.560Z
// ============================================================

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
// The four versions of a pattern around the vertical axis, each mapped to the real hold.
function rkVariants(alg: string, label: string): RkMacro[] {
  const out: RkMacro[] = []
  let cur = rkParseAlg(alg)
  for (let k = 0; k < 4; k++) {
    out.push({ moves: rkMapFaces(cur, RK_Z2), label, pattern: true })
    cur = rkMapFaces(cur, RK_YTURN)
  }
  return out
}
function rkOnePattern(alg: string, label: string): RkMacro {
  return { moves: rkMapFaces(rkParseAlg(alg), RK_Z2), label, pattern: true }
}

const RK_ALL_TURNS: RkMacro[] = (() => {
  const out: RkMacro[] = []
  for (const f of RK_FACES) for (const s of ['', '2', "'"]) out.push({ moves: [f + s], label: 'Cross move', pattern: false })
  return out
})()

// bottom layer turns (the canonical "U" turns after the half turn mapping)
const RK_SETUP: RkMacro[] = [
  { moves: ['D'], label: 'Setup turn', pattern: false },
  { moves: ["D'"], label: 'Setup turn', pattern: false },
  { moves: ['D2'], label: 'Setup turn', pattern: false },
]

const RK_CORNER_MACROS: RkMacro[] = RK_SETUP
  .concat(rkVariants("R U R' U'", 'Corner drop pattern'))
  .concat(rkVariants("L' U' L U", 'Corner drop pattern'))

const RK_MIDDLE_MACROS: RkMacro[] = RK_SETUP
  .concat(rkVariants("U R U' R' U' F' U F", 'Edge insert pattern'))
  .concat(rkVariants("U' L' U L U F U' F'", 'Edge insert pattern'))

const RK_YCROSS_MACROS: RkMacro[] = RK_SETUP.concat([
  rkOnePattern("F R U R' U' F'", 'Cross pattern'),
  rkOnePattern("F' L' U' L U F", 'Cross pattern'),
])

const RK_YFACE_MACROS: RkMacro[] = RK_SETUP.concat([
  rkOnePattern("R U R' U R U2 R'", 'Corner twist pattern'),
  rkOnePattern("L' U' L U' L' U2 L", 'Corner twist pattern'),
])

const RK_YCORNER_MACROS: RkMacro[] = RK_SETUP.concat([
  rkOnePattern("U R U' L' U R' U' L", 'Corner swap pattern'),
  rkOnePattern("U' L' U R U' L U R'", 'Corner swap pattern'),
])

const RK_YEDGE_MACROS: RkMacro[] = RK_SETUP.concat([
  rkOnePattern("R U' R U R U R U' R' U' R2", 'Edge cycle pattern'),
  rkOnePattern("R2 U R U R' U' R' U' R' U R'", 'Edge cycle pattern'),
])

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

const RK_BEGINNER_INFO: Record<string, { title: string; goal: string; tip: string }> = {
  cross: {
    title: 'White cross',
    goal: 'A white plus on the top face, with each edge matching the center of its side.',
    tip: 'There is no fixed pattern here. These are the fewest turns for each white edge.',
  },
  corners: {
    title: 'White corners',
    goal: 'The whole top layer is white and the top row of every side matches its center.',
    tip: 'Turn the bottom layer until the corner sits right under its spot, then repeat the short pattern until it drops in.',
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
  const moves: string[] = []
  const plan: RkPlanStage[] = []

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
  const whereIs = (colors: string[]) => findPiece(colors, (i) => state[i])

  const beginStage = (id: string): RkPlanStage => {
    const info = RK_BEGINNER_INFO[id]
    const st: RkPlanStage = { id, title: info.title, goal: info.goal, tip: info.tip, from: moves.length, to: moves.length, parts: [] }
    plan.push(st)
    return st
  }
  let lastSig = ''
  const run = (st: RkPlanStage, macro: RkMacro) => {
    const from = moves.length
    macro.moves.forEach((m) => moves.push(m))
    state = rkApplyMoves(state, macro.moves)
    const sig = macro.moves.join(' ')
    const lastPart = st.parts[st.parts.length - 1]
    if (macro.pattern && lastPart && lastSig === sig && lastPart.to === from) {
      lastPart.to = moves.length
      lastPart.times++
    } else {
      st.parts.push({ label: macro.label, from, to: moves.length, times: 1 })
    }
    lastSig = sig
    st.to = moves.length
  }

  const applyTracked = (s: number[], mv: string[]): number[] =>
    s.map((i) => { let j = i; for (const m of mv) j = TO[m][j]; return j })

  // Bring one piece home while every piece in `fixed` ends up back where it is now.
  const trackedPlan = (fixed: number[], from: number, goal: number, macros: RkMacro[]): number[] | null => {
    const goals = fixed.concat([goal])
    return rkSearch<number[]>(
      fixed.concat([from]), macros, applyTracked,
      (s) => s.join(','),
      (s) => { for (let k = 0; k < s.length; k++) if (s[k] !== goals[k]) return false; return true },
      90, 600000
    )
  }
  const planCost = (p: number[], macros: RkMacro[]) => p.reduce((a, mi) => a + macros[mi].moves.length, 0)

  // Greedy: of the pieces still to place, do the one that needs the fewest turns first.
  const placePieces = (st: RkPlanStage, pieces: string[][], refOf: (c: string[]) => string[], fixed: number[], macros: RkMacro[]): boolean => {
    let todo = pieces.slice()
    const fixedNow = fixed.slice()
    // pieces already home just join the fixed set
    todo = todo.filter((c) => {
      const ref = refOf(c)
      const here = whereIs(ref), home = targetOf(ref)
      if (here === home) { fixedNow.push(home); return false }
      return true
    })
    while (todo.length) {
      let bestIdx = -1
      let bestPlan: number[] | null = null
      let bestCost = Infinity
      for (let k = 0; k < todo.length; k++) {
        const ref = refOf(todo[k])
        const p = trackedPlan(fixedNow, whereIs(ref), targetOf(ref), macros)
        if (!p) continue
        const c = planCost(p, macros)
        if (c < bestCost) { bestCost = c; bestPlan = p; bestIdx = k }
      }
      if (!bestPlan || bestIdx < 0) return false
      bestPlan.forEach((mi) => run(st, macros[mi]))
      fixedNow.push(targetOf(refOf(todo[bestIdx])))
      todo.splice(bestIdx, 1)
    }
    return true
  }

  const fail = (what: string) => ({ error: 'The beginner method got stuck at ' + what + '. Check the stickers, or try the fastest mode.' })

  // 1. white cross
  {
    const st = beginStage('cross')
    const pieces = ['F', 'R', 'B', 'L'].map((x) => ['U', x])
    if (!placePieces(st, pieces, (c) => c, [], RK_ALL_TURNS)) return fail('the white cross')
  }

  // 2. white corners (cross edges stay tracked)
  {
    const st = beginStage('corners')
    const crossHome = ['F', 'R', 'B', 'L'].map((x) => targetOf(['U', x]))
    const pieces = [['F', 'R'], ['R', 'B'], ['B', 'L'], ['L', 'F']].map((p) => ['U', p[0], p[1]])
    if (!placePieces(st, pieces, (c) => c, crossHome, RK_CORNER_MACROS)) return fail('the white corners')
  }

  // 3. middle layer (whole first layer stays tracked)
  {
    const st = beginStage('middle')
    const firstLayer = [0, 1, 2, 3, 5, 6, 7, 8]
    const pieces = [['F', 'R'], ['R', 'B'], ['B', 'L'], ['L', 'F']]
    if (!placePieces(st, pieces, (c) => c, firstLayer, RK_MIDDLE_MACROS)) return fail('the middle layer')
  }

  // 4 to 7. last layer, small enough to search on whole cube states
  const lastLayer = (id: string, macros: RkMacro[], goal: (s: string[]) => boolean): boolean => {
    const st = beginStage(id)
    const p = rkSearch<string[]>(state, macros, rkApplyMoves, (s) => s.join(''), goal, 120, 300000)
    if (!p) return false
    p.forEach((mi) => run(st, macros[mi]))
    return true
  }
  const dEdges = [28, 30, 32, 34]
  const dFace = [27, 28, 29, 30, 31, 32, 33, 34, 35]
  const dCorners = [27, 29, 33, 35]
  if (!lastLayer('ycross', RK_YCROSS_MACROS, (s) => dEdges.every((i) => s[i] === 'D'))) return fail('the yellow cross')
  if (!lastLayer('yface', RK_YFACE_MACROS, (s) => dFace.every((i) => s[i] === 'D'))) return fail('the yellow face')
  if (!lastLayer('ycorners', RK_YCORNER_MACROS, (s) => dCorners.every((c) => RK_SIBLINGS[c].every((j) => s[j] === letterFace(j))))) return fail('the corner positions')
  if (!lastLayer('yedges', RK_YEDGE_MACROS, (s) => rkIsSolved(s))) return fail('the last edges')

  if (!rkIsSolved(state)) return fail('the end')
  return { moves, plan }
}
