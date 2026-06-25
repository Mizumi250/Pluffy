// ============================================================
// ARKZEN GENERATED SCRIPT — ethereane
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:52:50.972Z
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
export const CHAR_SPEED       = 0.0625
export const CHAR_RUN_MULT    = 1.65         // speed multiplier when running
export const RUN_WALK_RATE    = 3            // frame ticks per walk frame (faster = snappier legs)

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
export const CAM_FOLLOW_LERP     = 0.09
export const CAM_FOLLOW_LERP_RUN = 0.07     // much lazier follow when sprinting — makes you feel fast

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
  // ── sky parallax layers ──
  skyLayer0: '/tatemonos/ethereane/assets/images/sky-layer-0.png',
  skyLayer1: '/tatemonos/ethereane/assets/images/sky-layer-1.png',
  skyLayer2: '/tatemonos/ethereane/assets/images/sky-layer-2.png',
  skyLayer3: '/tatemonos/ethereane/assets/images/sky-layer-3.png',
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
// Sky layers 0-3 are composited onto a canvas in order (back → front) so all
// four cloud PNGs appear on a single dome material — no extra meshes needed.
export const SKY_RADIUS = 90

// SKY_TEX_W / SKY_TEX_H — large enough for the cloud PNGs to tile cleanly.
const SKY_TEX_W = 1024
const SKY_TEX_H = 512

// Fallback gradient — drawn first so it shows even before images load, and
// also acts as the solid sky base that the cloud layers sit on top of.
function drawSkyGradient(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0,    '#1565c0')   // zenith — deep rich blue
  grad.addColorStop(0.3,  '#2196f3')   // upper sky
  grad.addColorStop(0.65, '#64b5f6')   // mid sky
  grad.addColorStop(0.88, '#b3e5fc')   // near horizon
  grad.addColorStop(1,    '#e1f5fe')   // horizon haze — matches fog colour
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

// createSkyDome — returns the mesh immediately with the gradient.
// Then loads the 4 cloud PNGs and composites them onto the canvas texture;
// the dome material updates automatically via tex.needsUpdate.
export function createSkyDome(): THREE.Mesh {
  // Canvas that backs the dome texture — lives for the lifetime of the scene.
  const canvas = document.createElement('canvas')
  canvas.width  = SKY_TEX_W
  canvas.height = SKY_TEX_H
  const ctx = canvas.getContext('2d')!

  // Draw the gradient base immediately so the sky isn't blank while loading.
  drawSkyGradient(ctx, SKY_TEX_W, SKY_TEX_H)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS    = THREE.RepeatWrapping
  tex.wrapT    = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true

  const geo = new THREE.SphereGeometry(SKY_RADIUS, 32, 16)
  const mat = new THREE.MeshBasicMaterial({
    map:        tex,
    side:       THREE.BackSide,
    depthWrite: false,
    depthTest:  false,   // ← always behind everything — no z-fighting
    fog:        false,   // ← sky must never fade to fog
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = -1  // ← render before all scene geometry

  // Load all 4 sky layer PNGs and composite them onto the canvas in order.
  // layer 0 = furthest back (faint, slow-moving clouds / colour wash)
  // layer 3 = closest (bright, fast-moving foreground clouds)
  const layerPaths = [
    ASSETS.skyLayer0,
    ASSETS.skyLayer1,
    ASSETS.skyLayer2,
    ASSETS.skyLayer3,
  ]

  // Parallax scroll offsets per layer (0 = static, higher = scrolls further).
  // These are driven by updateSkyScroll() called each frame from the game loop.
  const layerOffsets: number[] = [0, 0, 0, 0]

  // Load images sequentially so later layers always composite on top correctly.
  Promise.all(
    layerPaths.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload  = () => resolve(img)
          img.onerror = () => reject(new Error(`Sky layer failed: ${src}`))
          img.src = src
        }),
    ),
  )
    .then((imgs) => {
      // Store images on the mesh so the scroll updater can re-composite each frame.
      ;(mesh as any).__skyLayers  = imgs
      ;(mesh as any).__skyOffsets = layerOffsets
      ;(mesh as any).__skyCanvas  = canvas
      ;(mesh as any).__skyCtx    = ctx
      ;(mesh as any).__skyTex    = tex
      compositeSkyLayers(ctx, canvas, imgs, layerOffsets, tex)
    })
    .catch((err) => {
      // PNG load failed — gradient fallback is already visible, just warn.
      console.warn('[Ethereane] Sky layer load error:', err)
    })

  return mesh
}

// compositeSkyLayers — redraws the sky canvas with the gradient base then
// each cloud layer at its current horizontal scroll offset.
// Called once after load, then every frame from updateSkyScroll.
export function compositeSkyLayers(
  ctx:     CanvasRenderingContext2D,
  canvas:  HTMLCanvasElement,
  imgs:    HTMLImageElement[],
  offsets: number[],
  tex:     THREE.CanvasTexture,
) {
  const w = canvas.width
  const h = canvas.height

  // Redraw gradient base.
  drawSkyGradient(ctx, w, h)

  // Composite each layer — tiled horizontally via modulo wrap.
  imgs.forEach((img, i) => {
    if (!img.naturalWidth) return
    const ox  = ((offsets[i] % w) + w) % w   // keep positive
    const iw  = img.naturalWidth
    const ih  = img.naturalHeight
    // Scale image to canvas height.
    const sh  = h
    const sw  = Math.round(iw * (sh / ih))
    // Tile across full width with offset.
    for (let x = ox - sw; x < w; x += sw) {
      ctx.drawImage(img, x, 0, sw, sh)
    }
  })

  tex.needsUpdate = true
}

// updateSkyScroll — call this each frame with the camera azimuth (radians) so
// the cloud layers drift convincingly as the player rotates the camera.
// Parallax speeds: layer 0 is slowest, layer 3 is fastest.
const SKY_PARALLAX_SPEEDS = [0.08, 0.18, 0.30, 0.48]

export function updateSkyScroll(skyMesh: THREE.Mesh, azimuthRad: number) {
  const imgs    = (skyMesh as any).__skyLayers  as HTMLImageElement[] | undefined
  const offsets = (skyMesh as any).__skyOffsets as number[]           | undefined
  const ctx     = (skyMesh as any).__skyCtx     as CanvasRenderingContext2D | undefined
  const canvas  = (skyMesh as any).__skyCanvas  as HTMLCanvasElement  | undefined
  const tex     = (skyMesh as any).__skyTex     as THREE.CanvasTexture | undefined
  if (!imgs || !offsets || !ctx || !canvas || !tex) return

  // Map azimuth → pixel offset for each layer.
  const baseOffset = (azimuthRad / (Math.PI * 2)) * SKY_TEX_W
  offsets.forEach((_, i) => {
    offsets[i] = baseOffset * SKY_PARALLAX_SPEEDS[i]
  })

  compositeSkyLayers(ctx, canvas, imgs, offsets, tex)
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
