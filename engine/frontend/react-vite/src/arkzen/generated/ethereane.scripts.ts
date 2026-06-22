// ============================================================
// ARKZEN GENERATED SCRIPT — ethereane
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:57.868Z
// ============================================================

import * as THREE from 'three'

// ─── VIEWPORT / RENDER TARGET ──────────────────────────────────────────────────
export const GAME_W = 640
export const GAME_H = 360

// ─── WORLD / VOXEL GRID ─────────────────────────────────────────────────────────
export const TILE_SIZE    = 1
export const GRID_W       = 100
export const GRID_D       = 64
export const WORLD_W      = GRID_W * TILE_SIZE
export const WORLD_D      = GRID_D * TILE_SIZE
export const BLOCK_HEIGHT = 0.6
export const WORLD_MARGIN = TILE_SIZE * 2

// ─── CHARACTER ────────────────────────────────────────────────────────────────
export const CHAR_PLANE_W = TILE_SIZE * 1.0
export const CHAR_PLANE_H = TILE_SIZE * 1.5
export const CHAR_RADIUS  = TILE_SIZE * 0.28
export const CHAR_SPEED   = 0.0625

// ─── CAMERA ───────────────────────────────────────────────────────────────────
export const CAM_DIST_MIN      = 1.1
export const CAM_DIST_MAX      = 9
export const CAM_DIST_DEFAULT  = 2.4
export const CAM_POLAR_MIN     = 0.4
export const CAM_POLAR_MAX     = 1.45
export const CAM_POLAR_DEFAULT = 0.75
export const CAM_ROTATE_SPEED  = 0.0055
export const CAM_ZOOM_SPEED    = 0.0035
export const CAM_LERP          = 0.22
export const CAM_LOOK_HEIGHT   = CHAR_PLANE_H * 0.6
// "break delay" — camera target lags behind the character with this factor.
// Lower = more lag, feels heavier. 0.09 gives a gentle spring-follow.
export const CAM_FOLLOW_LERP   = 0.09

// ─── ANIMATION ────────────────────────────────────────────────────────────────
export const IDLE_FRAMES     = 4
export const IDLE_FRAME_RATE = 8
export const IDLE_PAUSE      = 60
export const WALK_FRAMES     = 6
export const WALK_FRAME_RATE = 8
export const WALK_ROW_OFFSET = 4
export const SHEET_COLS      = 6
export const SHEET_ROWS      = 8

export const DIR_DOWN  = 0
export const DIR_LEFT  = 1
export const DIR_RIGHT = 2
export const DIR_UP    = 3

// ─── ASSET PATHS ──────────────────────────────────────────────────────────────
export const ASSETS = {
  tileGrass:      '/tatemonos/ethereane/assets/images/tile-grass.png',
  tilePlainGrass: '/tatemonos/ethereane/assets/images/tile-plain-grass.png',
  character1:     '/tatemonos/ethereane/assets/images/character1.png',
  bush1:          '/tatemonos/ethereane/assets/images/bush1.png',
  bush2:          '/tatemonos/ethereane/assets/images/bush2.png',
  // ── sky parallax layers (drop PNGs here when you have them) ──
  // skyLayer0: '/tatemonos/ethereane/assets/images/sky-layer-0.png',
  // skyLayer1: '/tatemonos/ethereane/assets/images/sky-layer-1.png',
  // skyLayer2: '/tatemonos/ethereane/assets/images/sky-layer-2.png',
  // skyLayer3: '/tatemonos/ethereane/assets/images/sky-layer-3.png',
}

// ─── PROPS ────────────────────────────────────────────────────────────────────
export type PropType = 'bush1' | 'bush2'

export interface Prop {
  type: PropType
  x:    number
  z:    number
}

export const PROP_DEFS: Record<PropType, { size: number; collision: boolean; radius: number }> = {
  bush1: { size: TILE_SIZE * 0.85, collision: false, radius: 0 },
  bush2: { size: TILE_SIZE * 0.9,  collision: true,  radius: TILE_SIZE * 0.32 },
}

export const COUNT_BUSH1 = 86
export const COUNT_BUSH2 = 43

export function generateProps(seed: number = 42): Prop[] {
  const props: Prop[] = []
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  const halfW = WORLD_W / 2 - WORLD_MARGIN
  const halfD = WORLD_D / 2 - WORLD_MARGIN
  for (let i = 0; i < COUNT_BUSH1; i++) {
    props.push({ type: 'bush1', x: -halfW + rand() * halfW * 2, z: -halfD + rand() * halfD * 2 })
  }
  for (let i = 0; i < COUNT_BUSH2; i++) {
    props.push({ type: 'bush2', x: -halfW + rand() * halfW * 2, z: -halfD + rand() * halfD * 2 })
  }
  return props
}

export function resolveCollision(nextX: number, nextZ: number, props: Prop[]): { x: number; z: number } {
  let x = nextX
  let z = nextZ
  for (const p of props) {
    const def = PROP_DEFS[p.type]
    if (!def.collision) continue
    const dx = x - p.x
    const dz = z - p.z
    const distSq  = dx * dx + dz * dz
    const minDist = CHAR_RADIUS + def.radius
    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq) || 0.0001
      const push = minDist - dist
      x += (dx / dist) * push
      z += (dz / dist) * push
    }
  }
  return { x, z }
}

// ─── NPC ──────────────────────────────────────────────────────────────────────
export const NPC_COUNT           = 10
export const NPC_SPEED           = 0.025
export const NPC_WANDER_MIN      = 60
export const NPC_WANDER_MAX      = 240
export const NPC_SPAWN_RANGE     = 14
export const NPC_INTERACT_RADIUS = 1.2

export const NPC_DIALOGUES = [
  ["Hey there, traveler!", "This world is bigger than it looks..."],
  ["Beautiful day, isn't it?", "I've been walking for hours and still haven't seen it all."],
  ["Don't wander too far from the path.", "Strange things happen near the edges of the world."],
  ["I heard there are hidden places", "deep in this land. Have you found any?"],
  ["The grass here feels different.", "Like it remembers something."],
  ["Oh! You startled me.", "I was just enjoying the view."],
  ["They say if you walk far enough,", "the world wraps back around."],
  ["I've been here since dawn.", "Still not sure where I'm going."],
  ["Have you seen any strange lights", "to the north? I keep seeing them at night."],
  ["Just passing through.", "Same as everyone else, I suppose."],
]

export interface Npc {
  x:             number
  z:             number
  dx:            number
  dz:            number
  dirRow:        number
  frameIndex:    number
  frameTick:     number
  wanderTick:    number
  wanderMax:     number
  idlePausing:   boolean
  dialogueIndex: number
}

export function generateNpcs(): Npc[] {
  const npcs: Npc[] = []
  for (let i = 0; i < NPC_COUNT; i++) {
    const angle = (i / NPC_COUNT) * Math.PI * 2
    const dist  = 3 + Math.random() * NPC_SPAWN_RANGE
    npcs.push({
      x:             Math.cos(angle) * dist,
      z:             Math.sin(angle) * dist,
      dx:            0,
      dz:            0,
      dirRow:        DIR_DOWN,
      frameIndex:    Math.floor(Math.random() * WALK_FRAMES),
      frameTick:     0,
      wanderTick:    0,
      wanderMax:     NPC_WANDER_MIN + Math.floor(Math.random() * (NPC_WANDER_MAX - NPC_WANDER_MIN)),
      idlePausing:   false,
      dialogueIndex: i % NPC_DIALOGUES.length,
    })
  }
  return npcs
}

export function findNearbyNpc(charX: number, charZ: number, npcs: Npc[]): Npc | null {
  for (const npc of npcs) {
    const dist = Math.hypot(charX - npc.x, charZ - npc.z)
    if (dist < NPC_INTERACT_RADIUS) return npc
  }
  return null
}

export function updateNpcs(npcs: Npc[], paused: boolean = false): void {
  const halfW = WORLD_W / 2 - WORLD_MARGIN
  const halfD = WORLD_D / 2 - WORLD_MARGIN
  for (const npc of npcs) {
    npc.wanderTick++
    if (!paused && npc.wanderTick >= npc.wanderMax) {
      npc.wanderTick = 0
      npc.wanderMax  = NPC_WANDER_MIN + Math.floor(Math.random() * (NPC_WANDER_MAX - NPC_WANDER_MIN))
      if (Math.random() < 0.25) {
        npc.dx = 0
        npc.dz = 0
      } else {
        const angle = Math.random() * Math.PI * 2
        npc.dx = Math.cos(angle)
        npc.dz = Math.sin(angle)
      }
    }
    const moving = !paused && (Math.abs(npc.dx) > 0.1 || Math.abs(npc.dz) > 0.1)
    if (moving) {
      npc.x = Math.max(-halfW, Math.min(npc.x + npc.dx * NPC_SPEED, halfW))
      npc.z = Math.max(-halfD, Math.min(npc.z + npc.dz * NPC_SPEED, halfD))
      if      (npc.dz >  0.3) npc.dirRow = DIR_DOWN
      else if (npc.dz < -0.3) npc.dirRow = DIR_UP
      else if (npc.dx < -0.3) npc.dirRow = DIR_LEFT
      else if (npc.dx >  0.3) npc.dirRow = DIR_RIGHT
    }
    npc.frameTick++
    if (moving) {
      if (npc.frameTick >= WALK_FRAME_RATE) {
        npc.frameTick  = 0
        npc.frameIndex = (npc.frameIndex + 1) % WALK_FRAMES
      }
    } else {
      const rate = npc.idlePausing ? IDLE_PAUSE : IDLE_FRAME_RATE
      if (npc.frameTick >= rate) {
        npc.frameTick = 0
        if (npc.idlePausing) {
          npc.idlePausing = false
          npc.frameIndex  = 0
        } else {
          npc.frameIndex++
          if (npc.frameIndex >= IDLE_FRAMES) {
            npc.frameIndex  = 0
            npc.idlePausing = true
          }
        }
      }
    }
  }
}

// ─── TEXTURE LOADING ──────────────────────────────────────────────────────────
export function loadTexture(loader: THREE.TextureLoader, src: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      src,
      (tex) => {
        tex.magFilter       = THREE.NearestFilter
        tex.minFilter       = THREE.NearestFilter
        tex.generateMipmaps = false
        tex.colorSpace      = THREE.SRGBColorSpace
        resolve(tex)
      },
      undefined,
      () => reject(new Error(`Failed to load: ${src}`)),
    )
  })
}

// ─── SPRITE SHEET FRAMING ─────────────────────────────────────────────────────
export function initSheetTexture(tex: THREE.Texture): void {
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1 / SHEET_COLS, 1 / SHEET_ROWS)
}

export function setSheetFrame(tex: THREE.Texture, col: number, row: number): void {
  tex.offset.set(col / SHEET_COLS, 1 - (row + 1) / SHEET_ROWS)
}

// ─── BILLBOARDING ─────────────────────────────────────────────────────────────
const BILLBOARD_DEADZONE = 0.02

export function faceCamera(mesh: THREE.Object3D, camX: number, camZ: number): void {
  const dx = camX - mesh.position.x
  const dz = camZ - mesh.position.z
  if (Math.hypot(dx, dz) < BILLBOARD_DEADZONE) return
  mesh.rotation.y = Math.atan2(dx, dz)
}

const _billboardDummy = new THREE.Object3D()

// ─── CAMERA MATH ──────────────────────────────────────────────────────────────
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpAngle(a: number, b: number, t: number): number {
  const diff = (((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI
  return a + diff * t
}

export function orbitCameraPosition(
  charX: number, charZ: number,
  azimuth: number, polar: number, dist: number,
): { x: number; y: number; z: number } {
  const sinPolar = Math.sin(polar)
  return {
    x: charX + dist * sinPolar * Math.sin(azimuth),
    y: CAM_LOOK_HEIGHT + dist * Math.cos(polar),
    z: charZ + dist * sinPolar * Math.cos(azimuth),
  }
}

export function billboardInstances(
  mesh:      THREE.InstancedMesh,
  props:     { x: number; z: number }[],
  size:      number,
  cameraPos: THREE.Vector3,
): void {
  for (let i = 0; i < props.length; i++) {
    const p  = props[i]
    const dx = cameraPos.x - p.x
    const dz = cameraPos.z - p.z
    const angle = Math.hypot(dx, dz) < BILLBOARD_DEADZONE ? 0 : Math.atan2(dx, dz)
    _billboardDummy.position.set(p.x, size / 2, p.z)
    _billboardDummy.rotation.set(0, angle, 0)
    _billboardDummy.scale.set(size, size, 1)
    _billboardDummy.updateMatrix()
    mesh.setMatrixAt(i, _billboardDummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
}

// ─── GROUND ───────────────────────────────────────────────────────────────────
export interface GroundInstance { x: number; z: number }

export function buildGroundData(): { grass: GroundInstance[]; plain: GroundInstance[] } {
  const grass: GroundInstance[] = []
  const plain: GroundInstance[] = []
  for (let r = 0; r < GRID_D; r++) {
    for (let c = 0; c < GRID_W; c++) {
      const large  = Math.sin(c * 0.13 + r * 0.17) * Math.cos(c * 0.07 - r * 0.11)
      const medium = Math.sin(c * 0.31 + r * 0.29) * 0.4
      const small  = Math.sin(c * 0.61 + r * 0.53) * 0.2
      const noise  = large + medium + small
      const x = (c - GRID_W / 2) * TILE_SIZE + TILE_SIZE / 2
      const z = (r - GRID_D / 2) * TILE_SIZE + TILE_SIZE / 2
      ;(noise > 0 ? plain : grass).push({ x, z })
    }
  }
  return { grass, plain }
}

// ─── SKY DOME ─────────────────────────────────────────────────────────────────
// Gradient sphere mapped on the inside — every camera angle sees the right sky.
// depthTest: false + renderOrder -1 ensures it always sits behind all geometry.
// When you have real sky PNGs, replace createSkyTexture() with a loaded texture.
export const SKY_RADIUS = 90

export function createSkyTexture(): THREE.CanvasTexture {
  const w = 4, h = 256
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0,    '#1565c0')   // zenith — deep rich blue
  grad.addColorStop(0.3,  '#2196f3')   // upper
  grad.addColorStop(0.65, '#64b5f6')   // mid
  grad.addColorStop(0.88, '#b3e5fc')   // near horizon
  grad.addColorStop(1,    '#e1f5fe')   // horizon haze — matches fog
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

export function createSkyDome(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(SKY_RADIUS, 16, 10)
  const mat = new THREE.MeshBasicMaterial({
    map:        createSkyTexture(),
    side:       THREE.BackSide,
    depthWrite: false,
    depthTest:  false,   // ← always behind everything — no z-fighting
    fog:        false,   // ← sky must never fade to fog
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = -1  // ← render before all scene geometry
  return mesh
}

// ─── SHADOW BLOB ──────────────────────────────────────────────────────────────
export function createShadowTexture(): THREE.CanvasTexture {
  const size = 64
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(0,0,0,0.45)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

// ─── SCALE ────────────────────────────────────────────────────────────────────
export function calcScale(): number {
  const scaleX  = window.innerWidth  / GAME_W
  const scaleY  = window.innerHeight / GAME_H
  const fit     = Math.min(scaleX, scaleY)
  const integer = Math.floor(fit)
  return integer >= 1 ? integer : fit
}

// ─── MINIMAP ──────────────────────────────────────────────────────────────────
export const MINI_W      = 80
export const MINI_H      = 52
export const MINI_PAD    = 8
export const MINI_BORDER = 1

export function renderMinimap(
  ctx:        CanvasRenderingContext2D,
  charX:      number,
  charZ:      number,
  camAzimuth: number,
) {
  ctx.clearRect(0, 0, GAME_W, GAME_H)
  const x = GAME_W - MINI_W - MINI_PAD
  const y = MINI_PAD
  ctx.save()
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#0a1a0a'
  ctx.fillRect(x - MINI_BORDER, y - MINI_BORDER, MINI_W + MINI_BORDER * 2, MINI_H + MINI_BORDER * 2)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#2d5a27'
  ctx.fillRect(x, y, MINI_W, MINI_H)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, MINI_W, MINI_H)
  const dotX = x + ((charX + WORLD_W / 2) / WORLD_W) * MINI_W
  const dotY = y + ((charZ + WORLD_D / 2) / WORLD_D) * MINI_H
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(dotX, dotY)
  ctx.lineTo(dotX + Math.sin(camAzimuth) * 6, dotY + Math.cos(camAzimuth) * 6)
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
