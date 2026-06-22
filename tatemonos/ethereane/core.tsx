/* @arkzen:meta
name: ethereane
version: 2.0.1
label: Ethereane
auth: false
description: Real-time 3D voxel-pixel RPG — free-orbit camera, block-based ground (placeholder for upcoming voxelization), camera-facing billboard sprites for character/NPCs/bushes, virtual joystick + keyboard, low-res pixelated render target.
*/

/* @arkzen:meta:web
favicon: 🎮
title: Ethereane
description: A 3D pixel RPG world.
*/

/* @arkzen:web:style */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.eth-root {
  width: 100dvw;
  height: 100dvh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: monospace;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

@media (orientation: portrait) {
  .eth-root {
    align-items: flex-start;
    justify-content: center;
  }
}

.eth-viewport {
  position: relative;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.eth-canvas {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  touch-action: none;
}

.eth-minimap-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.eth-joystick-zone {
  position: fixed;
  bottom: 32px;
  left: 32px;
  width: 120px;
  height: 120px;
  pointer-events: auto;
  z-index: 10;
}

.eth-joystick-base {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.18);
  position: absolute;
  top: 0;
  left: 0;
}

.eth-joystick-knob {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.35);
  border: 2px solid rgba(255, 255, 255, 0.6);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background 0.1s;
}

.eth-interact-btn {
  position: fixed;
  bottom: 48px;
  right: 40px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  pointer-events: auto;
  animation: eth-pop 0.15s ease-out;
  -webkit-tap-highlight-color: transparent;
}

.eth-interact-btn:active {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0.92);
}

@keyframes eth-pop {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.eth-dialogue {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: min(480px, 90vw);
  background: rgba(10, 10, 20, 0.92);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 16px 20px;
  z-index: 30;
  pointer-events: auto;
  animation: eth-slide-up 0.18s ease-out;
}

@keyframes eth-slide-up {
  from { transform: translateX(-50%) translateY(16px); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
}

.eth-dialogue-name {
  color: #a8d8a8;
  font-family: monospace;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.eth-dialogue-text {
  color: #eee;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
}

.eth-dialogue-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-size: 16px;
  cursor: pointer;
  font-family: monospace;
  padding: 2px 6px;
  -webkit-tap-highlight-color: transparent;
}

.eth-dialogue-close:active {
  color: #fff;
}

/* @arkzen:web:style:end */

/* @arkzen:web:script */

import * as THREE from 'three'

// ─── VIEWPORT / RENDER TARGET ──────────────────────────────────────────────────
// internal WebGL buffer stays fixed-res and gets CSS-upscaled with crisp pixels,
// same trick the old 2D build used — keeps the chunky pixel-art look.
export const GAME_W = 640
export const GAME_H = 360

// ─── WORLD / VOXEL GRID ─────────────────────────────────────────────────────────
// "Blocks for the tiles for now" — simple textured cubes, placeholder until
// the real voxel meshes are ready.
export const TILE_SIZE    = 1        // world units per ground block
export const GRID_W       = 100      // blocks across X
export const GRID_D       = 64       // blocks across Z
export const WORLD_W      = GRID_W * TILE_SIZE
export const WORLD_D      = GRID_D * TILE_SIZE
export const BLOCK_HEIGHT = 0.6
export const WORLD_MARGIN = TILE_SIZE * 2

// ─── CHARACTER ────────────────────────────────────────────────────────────────
export const CHAR_PLANE_W = TILE_SIZE * 1.0   // billboard plane width  (matches 32px sprite)
export const CHAR_PLANE_H = TILE_SIZE * 1.5   // billboard plane height (matches 48px sprite)
export const CHAR_RADIUS  = TILE_SIZE * 0.28
export const CHAR_SPEED   = 0.0625            // world units / tick — same pace as the old 2D build

// ─── CAMERA — manual orbit, NOT OrbitControls ──────────────────────────────────
// OrbitControls re-derives its spherical offset from (camera.position - target)
// every update() call. Re-targeting it every frame (to follow a moving
// character) feeds it a target that's always slightly stale, so it never
// actually keeps pace with the player, and the leftover translation gets
// folded into its rotation math and compounds into the "swipe = chaos" glitch.
// Driving azimuth/polar/distance ourselves and rebuilding camera.position from
// the character's *current* position every frame sidesteps both problems.
export const CAM_DIST_MIN     = 1.1
export const CAM_DIST_MAX     = 9
export const CAM_DIST_DEFAULT = 2.4    // "very very close to the user"
export const CAM_POLAR_MIN     = 0.4   // clamped shy of true top-down (0) — avoids the pole glitch
export const CAM_POLAR_MAX     = 1.45  // clamped shy of straight-on/under
export const CAM_POLAR_DEFAULT = 0.75
export const CAM_ROTATE_SPEED = 0.0055 // radians of azimuth/polar per drag pixel
export const CAM_ZOOM_SPEED   = 0.0035 // distance units per wheel-delta pixel
export const CAM_LERP         = 0.22   // smoothing toward the latest input each frame
export const CAM_LOOK_HEIGHT  = CHAR_PLANE_H * 0.6

// ─── ANIMATION (pacing unchanged from the 2D build — chavarter still animates) ──
export const IDLE_FRAMES     = 4
export const IDLE_FRAME_RATE = 8    // ticks per frame during animation (snappy)
export const IDLE_PAUSE      = 60   // ~1 second at 60fps
export const WALK_FRAMES     = 6
export const WALK_FRAME_RATE = 8    // ticks per frame for walk
export const WALK_ROW_OFFSET = 4    // walk rows start at row 4
export const SHEET_COLS      = 6    // character1.png is 192x384 = 6 cols x 8 rows
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
}

// ─── PROPS — billboarded, camera-facing, same trick as the character ──────────
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

// ─── WORLD GENERATOR (same seeded RNG as before, now scattering in XZ) ────────
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

// ─── COLLISION CHECK — circle vs circle push-out in the XZ plane ──────────────
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
export const NPC_INTERACT_RADIUS = 1.2   // world units — how close to trigger button

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

// ─── TEXTURE LOADING — nearest filter, no mipmaps, crisp pixel art ────────────
export function loadTexture(loader: THREE.TextureLoader, src: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      src,
      (tex) => {
        tex.magFilter      = THREE.NearestFilter
        tex.minFilter      = THREE.NearestFilter
        tex.generateMipmaps = false
        tex.colorSpace      = THREE.SRGBColorSpace
        resolve(tex)
      },
      undefined,
      () => reject(new Error(`Failed to load: ${src}`)),
    )
  })
}

// ─── SPRITE SHEET FRAMING (UV offset trick, replaces the old ctx sub-rect draw) ─
export function initSheetTexture(tex: THREE.Texture): void {
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1 / SHEET_COLS, 1 / SHEET_ROWS)
}

export function setSheetFrame(tex: THREE.Texture, col: number, row: number): void {
  tex.offset.set(col / SHEET_COLS, 1 - (row + 1) / SHEET_ROWS)
}

// ─── BILLBOARDING — "thin paper from Gumball": Y-axis-only rotation so the ─────
// sprite stays upright and just turns to face the camera, never tilts.
// A small deadzone guards against the angle thrashing when the camera's
// horizontal offset from the sprite collapses near a top-down view.
const BILLBOARD_DEADZONE = 0.02

export function faceCamera(mesh: THREE.Object3D, camX: number, camZ: number): void {
  const dx = camX - mesh.position.x
  const dz = camZ - mesh.position.z
  if (Math.hypot(dx, dz) < BILLBOARD_DEADZONE) return // hold last angle instead of spinning
  mesh.rotation.y = Math.atan2(dx, dz)
}

const _billboardDummy = new THREE.Object3D()

// ─── MANUAL ORBIT CAMERA MATH ──────────────────────────────────────────────────
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// shortest-path angle interpolation — avoids spinning the long way around at the wrap point
export function lerpAngle(a: number, b: number, t: number): number {
  const diff = (((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI
  return a + diff * t
}

// camera position rebuilt fresh every frame from the character's *current*
// position — never relies on the camera's own previous position, so there's
// nothing to go stale or compound.
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

// same billboard trick, applied per-instance for the bush InstancedMesh-es
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
    const angle = Math.hypot(dx, dz) < BILLBOARD_DEADZONE
      ? 0
      : Math.atan2(dx, dz)
    _billboardDummy.position.set(p.x, size / 2, p.z)
    _billboardDummy.rotation.set(0, angle, 0)
    _billboardDummy.scale.set(size, size, 1)
    _billboardDummy.updateMatrix()
    mesh.setMatrixAt(i, _billboardDummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
}

// ─── GROUND BLOCK LAYOUT — same patch-noise distribution as the old 2D build ───
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

// ─── SHADOW BLOB — small radial-gradient texture, reused under every sprite ────
export function createShadowTexture(): THREE.CanvasTexture {
  const size = 64
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
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

// ─── SCALE CALCULATOR (unchanged) ──────────────────────────────────────────────
export function calcScale(): number {
  const scaleX  = window.innerWidth  / GAME_W
  const scaleY  = window.innerHeight / GAME_H
  const fit     = Math.min(scaleX, scaleY)
  const integer = Math.floor(fit)
  return integer >= 1 ? integer : fit
}

// ─── MINIMAP — drawn on a separate 2D overlay canvas above the WebGL canvas ────
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

  // facing arrow — shows which way the camera is currently looking from
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

/* @arkzen:web:script:end */

/* @arkzen:web:components:game */

'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import {
  GAME_W,
  GAME_H,
  TILE_SIZE,
  WORLD_W,
  WORLD_D,
  BLOCK_HEIGHT,
  WORLD_MARGIN,
  CHAR_PLANE_W,
  CHAR_PLANE_H,
  CHAR_SPEED,
  IDLE_FRAMES,
  IDLE_FRAME_RATE,
  IDLE_PAUSE,
  WALK_FRAMES,
  WALK_FRAME_RATE,
  WALK_ROW_OFFSET,
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  ASSETS,
  Prop,
  PROP_DEFS,
  generateProps,
  Npc,
  NPC_DIALOGUES,
  generateNpcs,
  updateNpcs,
  findNearbyNpc,
  resolveCollision,
  loadTexture,
  initSheetTexture,
  setSheetFrame,
  faceCamera,
  billboardInstances,
  buildGroundData,
  createShadowTexture,
  calcScale,
  renderMinimap,
  clamp,
  lerp,
  lerpAngle,
  orbitCameraPosition,
  CAM_DIST_MIN,
  CAM_DIST_MAX,
  CAM_DIST_DEFAULT,
  CAM_POLAR_MIN,
  CAM_POLAR_MAX,
  CAM_POLAR_DEFAULT,
  CAM_ROTATE_SPEED,
  CAM_ZOOM_SPEED,
  CAM_LERP,
  CAM_LOOK_HEIGHT,
} from '@/arkzen/generated/ethereane.scripts'

const JOY_RADIUS = 60
const KNOB_MAX   = 38
const UP_AXIS    = new THREE.Vector3(0, 1, 0)

type ThreeState = {
  renderer:   THREE.WebGLRenderer
  scene:      THREE.Scene
  camera:     THREE.PerspectiveCamera
  charMesh:   THREE.Mesh
  charTex:    THREE.Texture
  charShadow: THREE.Mesh
  npcMeshes:  THREE.Mesh[]
  npcTexes:   THREE.Texture[]
  npcShadows: THREE.Mesh[]
  bush1Mesh:  THREE.InstancedMesh
  bush2Mesh:  THREE.InstancedMesh
  bush1Props: Prop[]
  bush2Props: Prop[]
  minimapCtx: CanvasRenderingContext2D | null
}

export const EtheraneGame = () => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const minimapRef  = useRef<HTMLCanvasElement>(null)
  const knobRef     = useRef<HTMLDivElement>(null)
  const joyZoneRef  = useRef<HTMLDivElement>(null)

  const charPos = useRef({ x: 0, z: 0 })

  const joyVec    = useRef({ x: 0, y: 0 })
  const keysHeld  = useRef<Set<string>>(new Set())
  const rafRef    = useRef<number>(0)
  const joyActive = useRef(false)
  const joyOrigin = useRef({ x: 0, y: 0 })

  const propsRef = useRef<Prop[]>(generateProps(42))
  const npcsRef  = useRef<Npc[]>(generateNpcs())

  const [nearbyNpc, setNearbyNpc] = useState<Npc | null>(null)
  const [dialogue,  setDialogue]  = useState<string[] | null>(null)
  const nearbyNpcRef = useRef<Npc | null>(null)

  // ─── ANIMATION STATE (unchanged) ──────────────────────────────────────────
  const frameIndex  = useRef(0)
  const frameTick   = useRef(0)
  const dirRow      = useRef(DIR_DOWN)
  const idlePausing = useRef(false)
  const isWalking   = useRef(false)

  // ─── THREE.JS SCENE ─────────────────────────────────────────────────────────
  const three = useRef<ThreeState | null>(null)

  // ─── MANUAL ORBIT CAMERA — driven by pointer drag + wheel, not OrbitControls ─
  const camAzimuth       = useRef(0)
  const camPolar         = useRef(CAM_POLAR_DEFAULT)
  const camDist          = useRef(CAM_DIST_DEFAULT)
  const camAzimuthTarget = useRef(0)
  const camPolarTarget   = useRef(CAM_POLAR_DEFAULT)
  const camDistTarget    = useRef(CAM_DIST_DEFAULT)
  const dragging         = useRef(false)
  const dragPointerId    = useRef<number | null>(null)
  const lastPointer      = useRef({ x: 0, y: 0 })

  const onCamPointerDown = useCallback((e: PointerEvent) => {
    dragging.current      = true
    dragPointerId.current = e.pointerId
    lastPointer.current   = { x: e.clientX, y: e.clientY }
  }, [])

  const onCamPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current || e.pointerId !== dragPointerId.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    lastPointer.current = { x: e.clientX, y: e.clientY }
    camAzimuthTarget.current -= dx * CAM_ROTATE_SPEED
    camPolarTarget.current = clamp(camPolarTarget.current - dy * CAM_ROTATE_SPEED, CAM_POLAR_MIN, CAM_POLAR_MAX)
  }, [])

  const onCamPointerUp = useCallback((e: PointerEvent) => {
    if (e.pointerId !== dragPointerId.current) return
    dragging.current      = false
    dragPointerId.current = null
  }, [])

  const onCamWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    camDistTarget.current = clamp(camDistTarget.current + e.deltaY * CAM_ZOOM_SPEED, CAM_DIST_MIN, CAM_DIST_MAX)
  }, [])

  // ─── KNOB ─────────────────────────────────────────────────────────────────
  const setKnobPos = useCallback((dx: number, dy: number) => {
    const knob = knobRef.current
    if (!knob) return
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
  }, [])

  const resetKnob = useCallback(() => {
    joyVec.current    = { x: 0, y: 0 }
    joyActive.current = false
    setKnobPos(0, 0)
  }, [setKnobPos])

  // ─── TOUCH ────────────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    const t = e.changedTouches[0]
    joyActive.current = true
    joyOrigin.current = { x: t.clientX, y: t.clientY }
  }, [])

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    if (!joyActive.current) return
    const t     = e.changedTouches[0]
    const rawDx = t.clientX - joyOrigin.current.x
    const rawDy = t.clientY - joyOrigin.current.y
    const dist  = Math.sqrt(rawDx * rawDx + rawDy * rawDy)
    const angle = Math.atan2(rawDy, rawDx)
    const knobClamp = Math.min(dist, KNOB_MAX)
    setKnobPos(Math.cos(angle) * knobClamp, Math.sin(angle) * knobClamp)
    joyVec.current = {
      x: Math.cos(angle) * Math.min(dist / JOY_RADIUS, 1),
      y: Math.sin(angle) * Math.min(dist / JOY_RADIUS, 1),
    }
  }, [setKnobPos])

  const onTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    resetKnob()
  }, [resetKnob])

  // ─── INTERACT ─────────────────────────────────────────────────────────────
  const handleInteract = useCallback(() => {
    const npc = nearbyNpcRef.current
    if (!npc) return
    setDialogue(NPC_DIALOGUES[npc.dialogueIndex])
  }, [])

  const closeDialogue = useCallback(() => setDialogue(null), [])

  // ─── KEYBOARD ─────────────────────────────────────────────────────────────
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'e' || e.key === 'E') { handleInteract(); return }
    if (e.key === 'Escape') { closeDialogue(); return }
    keysHeld.current.add(e.key)
  }, [handleInteract, closeDialogue])
  const onKeyUp = useCallback((e: KeyboardEvent) => { keysHeld.current.delete(e.key) }, [])

  // ─── GAME LOOP ────────────────────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const t = three.current
    if (!t) { rafRef.current = requestAnimationFrame(gameLoop); return }

    let kx = 0, ky = 0
    const keys = keysHeld.current
    if (keys.has('ArrowLeft')  || keys.has('a') || keys.has('A')) kx -= 1
    if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) kx += 1
    if (keys.has('ArrowUp')    || keys.has('w') || keys.has('W')) ky -= 1
    if (keys.has('ArrowDown')  || keys.has('s') || keys.has('S')) ky += 1

    let dx = joyVec.current.x + kx
    let dy = joyVec.current.y + ky
    const mag = Math.sqrt(dx * dx + dy * dy)
    if (mag > 1) { dx /= mag; dy /= mag }

    // ── camera-relative movement: forward = -dy, strafe = dx ──
    const camForward = new THREE.Vector3()
    t.camera.getWorldDirection(camForward)
    camForward.y = 0
    camForward.normalize()
    const camRight = new THREE.Vector3().crossVectors(camForward, UP_AXIS).normalize()

    const moveX = camForward.x * -dy + camRight.x * dx
    const moveZ = camForward.z * -dy + camRight.z * dx

    let nextX = charPos.current.x + moveX * CHAR_SPEED
    let nextZ = charPos.current.z + moveZ * CHAR_SPEED
    const halfW = WORLD_W / 2 - WORLD_MARGIN
    const halfD = WORLD_D / 2 - WORLD_MARGIN
    nextX = Math.max(-halfW, Math.min(nextX, halfW))
    nextZ = Math.max(-halfD, Math.min(nextZ, halfD))
    const resolved = resolveCollision(nextX, nextZ, propsRef.current)
    charPos.current.x = resolved.x
    charPos.current.z = resolved.z

    // ── direction row (screen-relative input axes, same feel as the old build) ──
    const moving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1
    if (isWalking.current && !moving) {
      frameIndex.current  = 0
      frameTick.current   = 0
      idlePausing.current = true
    }
    isWalking.current = moving
    if (moving) {
      if      (dy >  0.1) dirRow.current = DIR_DOWN
      else if (dy < -0.1) dirRow.current = DIR_UP
      else if (dx < -0.1) dirRow.current = DIR_LEFT
      else if (dx >  0.1) dirRow.current = DIR_RIGHT
    }

    // ── frame cycling (unchanged) ──
    frameTick.current++
    if (moving) {
      if (frameTick.current >= WALK_FRAME_RATE) {
        frameTick.current = 0
        frameIndex.current = (frameIndex.current + 1) % WALK_FRAMES
      }
    } else {
      const rate = idlePausing.current ? IDLE_PAUSE : IDLE_FRAME_RATE
      if (frameTick.current >= rate) {
        frameTick.current = 0
        if (idlePausing.current) {
          idlePausing.current = false
          frameIndex.current  = 0
        } else {
          frameIndex.current++
          if (frameIndex.current >= IDLE_FRAMES) {
            frameIndex.current  = 0
            idlePausing.current = true
          }
        }
      }
    }

    // ── NPCs ──
    updateNpcs(npcsRef.current, !!dialogue)
    const nearby = findNearbyNpc(charPos.current.x, charPos.current.z, npcsRef.current)
    if (nearby !== nearbyNpcRef.current) {
      nearbyNpcRef.current = nearby
      setNearbyNpc(nearby)
    }

    // ── sync character billboard ──
    t.charMesh.position.set(charPos.current.x, CHAR_PLANE_H / 2, charPos.current.z)
    t.charShadow.position.set(charPos.current.x, 0.02, charPos.current.z)
    const sheetRow = isWalking.current ? WALK_ROW_OFFSET + dirRow.current : dirRow.current
    setSheetFrame(t.charTex, frameIndex.current, sheetRow)
    faceCamera(t.charMesh, t.camera.position.x, t.camera.position.z)

    // ── sync NPC billboards ──
    npcsRef.current.forEach((npc, i) => {
      const mesh   = t.npcMeshes[i]
      const shadow = t.npcShadows[i]
      const tex    = t.npcTexes[i]
      mesh.position.set(npc.x, CHAR_PLANE_H / 2, npc.z)
      shadow.position.set(npc.x, 0.02, npc.z)
      const npcMoving = Math.abs(npc.dx) > 0.1 || Math.abs(npc.dz) > 0.1
      const row = npcMoving ? WALK_ROW_OFFSET + npc.dirRow : npc.dirRow
      setSheetFrame(tex, npc.frameIndex, row)
      faceCamera(mesh, t.camera.position.x, t.camera.position.z)
    })

    // ── sync bush billboards ──
    billboardInstances(t.bush1Mesh, t.bush1Props, PROP_DEFS.bush1.size, t.camera.position)
    billboardInstances(t.bush2Mesh, t.bush2Props, PROP_DEFS.bush2.size, t.camera.position)

    // ── manual orbit camera — position rebuilt fresh from the character's
    //    CURRENT spot every frame, so it can never lag behind like before ──
    camAzimuth.current = lerpAngle(camAzimuth.current, camAzimuthTarget.current, CAM_LERP)
    camPolar.current   = lerp(camPolar.current, camPolarTarget.current, CAM_LERP)
    camDist.current    = lerp(camDist.current, camDistTarget.current, CAM_LERP)

    const camPos = orbitCameraPosition(
      charPos.current.x, charPos.current.z,
      camAzimuth.current, camPolar.current, camDist.current,
    )
    t.camera.position.set(camPos.x, camPos.y, camPos.z)
    t.camera.lookAt(charPos.current.x, CAM_LOOK_HEIGHT, charPos.current.z)
    t.renderer.render(t.scene, t.camera)

    if (t.minimapCtx) {
      renderMinimap(t.minimapCtx, charPos.current.x, charPos.current.z, camAzimuth.current)
    }

    rafRef.current = requestAnimationFrame(gameLoop)
  }, [dialogue])

  // ─── SETUP ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas        = canvasRef.current
    const minimapCanvas = minimapRef.current
    const viewport       = viewportRef.current
    if (!canvas || !minimapCanvas || !viewport) return

    canvas.width  = GAME_W
    canvas.height = GAME_H
    minimapCanvas.width  = GAME_W
    minimapCanvas.height = GAME_H

    const applyScale = () => {
      const s = calcScale()
      const w = Math.floor(GAME_W * s)
      const h = Math.floor(GAME_H * s)
      viewport.style.width  = `${w}px`
      viewport.style.height = `${h}px`
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`
      minimapCanvas.style.width  = `${w}px`
      minimapCanvas.style.height = `${h}px`
    }
    applyScale()
    window.addEventListener('resize', applyScale)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    // ── scene / camera / renderer ──
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#bfe6ff')
    scene.fog = new THREE.Fog('#bfe6ff', 14, 34)

    const camera = new THREE.PerspectiveCamera(50, GAME_W / GAME_H, 0.1, 100)
    const startPos = orbitCameraPosition(0, 0, camAzimuth.current, camPolar.current, camDist.current)
    camera.position.set(startPos.x, startPos.y, startPos.z)
    camera.lookAt(0, CAM_LOOK_HEIGHT, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    renderer.setPixelRatio(1)
    renderer.setSize(GAME_W, GAME_H, false)

    // ── free orbit camera — drag anywhere on the canvas to rotate, wheel/pinch to zoom ──
    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', onCamPointerDown)
    window.addEventListener('pointermove', onCamPointerMove)
    window.addEventListener('pointerup',   onCamPointerUp)
    window.addEventListener('pointercancel', onCamPointerUp)
    canvas.addEventListener('wheel', onCamWheel, { passive: false })

    let cancelled = false
    const loader = new THREE.TextureLoader()

    Promise.all([
      loadTexture(loader, ASSETS.tileGrass),
      loadTexture(loader, ASSETS.tilePlainGrass),
      loadTexture(loader, ASSETS.character1),
      loadTexture(loader, ASSETS.bush1),
      loadTexture(loader, ASSETS.bush2),
    ]).then(([grassTex, plainTex, charTex, bush1Tex, bush2Tex]) => {
      if (cancelled) return

      initSheetTexture(charTex)
      setSheetFrame(charTex, 0, DIR_DOWN)

      // ── ground blocks — placeholder cubes, ready to be voxelized later ──
      const { grass, plain } = buildGroundData()
      const blockGeo = new THREE.BoxGeometry(TILE_SIZE, BLOCK_HEIGHT, TILE_SIZE)
      const dummy = new THREE.Object3D()

      const grassMesh = new THREE.InstancedMesh(blockGeo, new THREE.MeshLambertMaterial({ map: grassTex }), grass.length)
      grass.forEach((g, i) => {
        dummy.position.set(g.x, -BLOCK_HEIGHT / 2, g.z)
        dummy.updateMatrix()
        grassMesh.setMatrixAt(i, dummy.matrix)
      })
      grassMesh.instanceMatrix.needsUpdate = true

      const plainMesh = new THREE.InstancedMesh(blockGeo, new THREE.MeshLambertMaterial({ map: plainTex }), plain.length)
      plain.forEach((g, i) => {
        dummy.position.set(g.x, -BLOCK_HEIGHT / 2, g.z)
        dummy.updateMatrix()
        plainMesh.setMatrixAt(i, dummy.matrix)
      })
      plainMesh.instanceMatrix.needsUpdate = true

      scene.add(grassMesh, plainMesh)

      // ── lighting — only the block ground is lit, so cube edges read in 3D ──
      scene.add(new THREE.AmbientLight('#ffffff', 0.8))
      const sun = new THREE.DirectionalLight('#ffffff', 0.9)
      sun.position.set(8, 14, 6)
      scene.add(sun)

      // ── shadow blob, reused under every billboard ──
      const shadowTex  = createShadowTexture()
      const shadowGeo  = new THREE.PlaneGeometry(CHAR_PLANE_W * 0.9, CHAR_PLANE_W * 0.9)
      const makeShadow = () => {
        const m = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }))
        m.rotation.x = -Math.PI / 2
        m.position.y = 0.02
        scene.add(m)
        return m
      }

      // ── character billboard — "thin paper from Gumball" ──
      const charGeo = new THREE.PlaneGeometry(CHAR_PLANE_W, CHAR_PLANE_H)
      const charMat = new THREE.MeshBasicMaterial({ map: charTex, alphaTest: 0.5, side: THREE.DoubleSide })
      const charMesh = new THREE.Mesh(charGeo, charMat)
      charMesh.position.set(0, CHAR_PLANE_H / 2, 0)
      scene.add(charMesh)
      const charShadow = makeShadow()

      // ── NPC billboards — same trick, each gets its own cloned texture for an independent frame ──
      const npcMeshes: THREE.Mesh[] = []
      const npcTexes:  THREE.Texture[] = []
      const npcShadows: THREE.Mesh[] = []
      npcsRef.current.forEach((npc) => {
        const tex = charTex.clone()
        tex.needsUpdate = true
        initSheetTexture(tex)
        setSheetFrame(tex, npc.frameIndex, npc.dirRow)
        const mat  = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide })
        const mesh = new THREE.Mesh(charGeo, mat)
        mesh.position.set(npc.x, CHAR_PLANE_H / 2, npc.z)
        scene.add(mesh)
        npcMeshes.push(mesh)
        npcTexes.push(tex)
        npcShadows.push(makeShadow())
      })

      // ── bushes — billboarded sprites, same camera-facing trick as the character ──
      const bush1Props = propsRef.current.filter(p => p.type === 'bush1')
      const bush2Props = propsRef.current.filter(p => p.type === 'bush2')

      const bushGeo  = new THREE.PlaneGeometry(1, 1)
      const bush1Mat = new THREE.MeshBasicMaterial({ map: bush1Tex, alphaTest: 0.5, side: THREE.DoubleSide })
      const bush2Mat = new THREE.MeshBasicMaterial({ map: bush2Tex, alphaTest: 0.5, side: THREE.DoubleSide })
      const bush1Mesh = new THREE.InstancedMesh(bushGeo, bush1Mat, bush1Props.length)
      const bush2Mesh = new THREE.InstancedMesh(bushGeo, bush2Mat, bush2Props.length)
      billboardInstances(bush1Mesh, bush1Props, PROP_DEFS.bush1.size, camera.position)
      billboardInstances(bush2Mesh, bush2Props, PROP_DEFS.bush2.size, camera.position)
      scene.add(bush1Mesh, bush2Mesh)

      three.current = {
        renderer, scene, camera,
        charMesh, charTex, charShadow,
        npcMeshes, npcTexes, npcShadows,
        bush1Mesh, bush2Mesh, bush1Props, bush2Props,
        minimapCtx: minimapCanvas.getContext('2d'),
      }

      rafRef.current = requestAnimationFrame(gameLoop)
    }).catch((err) => {
      if (cancelled) return
      console.error(err)
      const ctx2 = minimapCanvas.getContext('2d')
      if (!ctx2) return
      ctx2.fillStyle = '#111'
      ctx2.fillRect(0, 0, GAME_W, GAME_H)
      ctx2.fillStyle = '#f87171'
      ctx2.font = '12px monospace'
      ctx2.fillText('Asset load failed. Check console.', 12, 24)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', applyScale)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      canvas.removeEventListener('pointerdown', onCamPointerDown)
      window.removeEventListener('pointermove', onCamPointerMove)
      window.removeEventListener('pointerup',   onCamPointerUp)
      window.removeEventListener('pointercancel', onCamPointerUp)
      canvas.removeEventListener('wheel', onCamWheel)
      const t = three.current
      if (t) {
        t.renderer.dispose()
      }
      three.current = null
    }
  }, [gameLoop, onKeyDown, onKeyUp, onCamPointerDown, onCamPointerMove, onCamPointerUp, onCamWheel])

  // ─── JOYSTICK TOUCH EVENTS ────────────────────────────────────────────────
  useEffect(() => {
    const zone = joyZoneRef.current
    if (!zone) return
    zone.addEventListener('touchstart',  onTouchStart, { passive: false })
    zone.addEventListener('touchmove',   onTouchMove,  { passive: false })
    zone.addEventListener('touchend',    onTouchEnd,   { passive: false })
    zone.addEventListener('touchcancel', onTouchEnd,   { passive: false })
    return () => {
      zone.removeEventListener('touchstart',  onTouchStart)
      zone.removeEventListener('touchmove',   onTouchMove)
      zone.removeEventListener('touchend',    onTouchEnd)
      zone.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [onTouchStart, onTouchMove, onTouchEnd])

  return (
    <div className="eth-root">
      <div className="eth-viewport" ref={viewportRef}>
        <canvas ref={canvasRef} className="eth-canvas" />
        <canvas ref={minimapRef} className="eth-minimap-canvas" />
      </div>
      <div className="eth-joystick-zone" ref={joyZoneRef}>
        <div className="eth-joystick-base" />
        <div className="eth-joystick-knob" ref={knobRef} />
      </div>

      {/* Interact button — pops up when near NPC */}
      {nearbyNpc && !dialogue && (
        <button className="eth-interact-btn" onClick={handleInteract}>
          E
        </button>
      )}

      {/* Dialogue box */}
      {dialogue && (
        <div className="eth-dialogue">
          <div className="eth-dialogue-name">Villager</div>
          {dialogue.map((line, i) => (
            <div key={i} className="eth-dialogue-text">{line}</div>
          ))}
          <button className="eth-dialogue-close" onClick={closeDialogue}>✕</button>
        </div>
      )}
    </div>
  )
}

/* @arkzen:web:components:game:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  return <EtheraneGame />
}

/* @arkzen:web:page:index:end */
