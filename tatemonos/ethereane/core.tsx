/* @arkzen:meta
name: ethereane
version: 1.3.0
label: Ethereane
auth: false
description: Pixel RPG game — fixed 640x360 viewport, 6400x3600 world, smooth follow camera, virtual joystick + keyboard, simple oval shadow.
*/

/* @arkzen:meta:web
favicon: 🎮
title: Ethereane
description: A pixel RPG world.
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

// ─── GAME CONSTANTS ────────────────────────────────────────────────────────────
export const GAME_W     = 640
export const GAME_H     = 360
export const WORLD_W    = 6400
export const WORLD_H    = 3600
export const TILE_SIZE  = 32
export const CHAR_W     = 32
export const CHAR_H     = 48
export const CHAR_SPEED    = 2
export const CAM_LERP      = 0.08
export const ZOOM          = 2

// ─── ANIMATION ────────────────────────────────────────────────────────────────
export const IDLE_FRAMES     = 4
export const IDLE_FRAME_RATE = 8    // ticks per frame during animation (snappy)
export const IDLE_PAUSE      = 60   // ~1 second at 60fps
export const WALK_FRAMES     = 6
export const WALK_FRAME_RATE = 8    // ticks per frame for walk
export const WALK_ROW_OFFSET = 4    // walk rows start at row 4

// Direction rows in sprite sheet (idle rows 0-3, walk rows 4-7 — not drawn yet)
export const DIR_DOWN  = 0
export const DIR_LEFT  = 1
export const DIR_RIGHT = 2
export const DIR_UP    = 3

// ─── ASSET PATHS ──────────────────────────────────────────────────────────────
export const ASSETS = {
  tileGrass:       '/tatemonos/ethereane/assets/images/tile-grass.png',
  tilePlainGrass:  '/tatemonos/ethereane/assets/images/tile-plain-grass.png',
  character1:      '/tatemonos/ethereane/assets/images/character1.png',
  bush1:           '/tatemonos/ethereane/assets/images/bush1.png',
  bush2:           '/tatemonos/ethereane/assets/images/bush2.png',
}

// ─── PROP TYPES ───────────────────────────────────────────────────────────────
export type PropType = 'bush1' | 'bush2'

export interface Prop {
  type:      PropType
  x:         number
  y:         number
  w:         number
  h:         number
  collision: boolean
}

// bush2 collision box — bottom half only so top overlaps character
export const PROP_DEFS: Record<PropType, { w: number; h: number; collision: boolean; colOffsetY: number; colH: number }> = {
  bush1: { w: 32, h: 32, collision: false, colOffsetY: 0,  colH: 0  },
  bush2: { w: 32, h: 32, collision: true,  colOffsetY: 16, colH: 16 },
}

// ─── WORLD GENERATOR ──────────────────────────────────────────────────────────
export function generateProps(seed: number = 42): Prop[] {
  const props: Prop[] = []
  // simple seeded random
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }

  const COUNT_BUSH1 = 300
  const COUNT_BUSH2 = 150
  const MARGIN      = 64  // keep away from world edges

  for (let i = 0; i < COUNT_BUSH1; i++) {
    props.push({
      type: 'bush1',
      x: Math.floor(MARGIN + rand() * (WORLD_W - MARGIN * 2)),
      y: Math.floor(MARGIN + rand() * (WORLD_H - MARGIN * 2)),
      w: 32, h: 32,
      collision: false,
    })
  }
  for (let i = 0; i < COUNT_BUSH2; i++) {
    props.push({
      type: 'bush2',
      x: Math.floor(MARGIN + rand() * (WORLD_W - MARGIN * 2)),
      y: Math.floor(MARGIN + rand() * (WORLD_H - MARGIN * 2)),
      w: 32, h: 32,
      collision: true,
    })
  }
  return props
}

// ─── COLLISION CHECK ──────────────────────────────────────────────────────────
export function resolveCollision(
  nextX:  number,
  nextY:  number,
  props:  Prop[],
): { x: number; y: number } {
  // character feet box
  const cLeft   = nextX + 4
  const cRight  = nextX + CHAR_W - 4
  const cTop    = nextY + CHAR_H - 12
  const cBottom = nextY + CHAR_H

  for (const p of props) {
    if (!p.collision) continue
    const def     = PROP_DEFS[p.type]
    const pLeft   = p.x
    const pRight  = p.x + p.w
    const pTop    = p.y + def.colOffsetY
    const pBottom = p.y + def.colOffsetY + def.colH

    if (cRight > pLeft && cLeft < pRight && cBottom > pTop && cTop < pBottom) {
      // push back — find smallest overlap axis
      const overlapLeft  = cRight  - pLeft
      const overlapRight = pRight  - cLeft
      const overlapTop   = cBottom - pTop
      const overlapBot   = pBottom - cTop

      const minH = Math.min(overlapLeft, overlapRight)
      const minV = Math.min(overlapTop,  overlapBot)

      if (minH < minV) {
        nextX += overlapLeft < overlapRight ? -overlapLeft : overlapRight
      } else {
        nextY += overlapTop  < overlapBot   ? -overlapTop  : overlapBot
      }
    }
  }
  return { x: nextX, y: nextY }
}

// ─── NPC ──────────────────────────────────────────────────────────────────────
export const NPC_COUNT      = 10
export const NPC_SPEED      = 0.8
export const NPC_WANDER_MIN = 60
export const NPC_WANDER_MAX = 240
export const NPC_SPAWN_RANGE = 400
export const NPC_INTERACT_RADIUS = 36  // pixels — how close to trigger button

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
  x:            number
  y:            number
  dx:           number
  dy:           number
  dirRow:       number
  frameIndex:   number
  frameTick:    number
  wanderTick:   number
  wanderMax:    number
  idlePausing:  boolean
  idleTick:     number
  dialogueIndex: number
}

export function generateNpcs(): Npc[] {
  const npcs: Npc[] = []
  const cx = WORLD_W / 2
  const cy = WORLD_H / 2
  for (let i = 0; i < NPC_COUNT; i++) {
    const angle = (i / NPC_COUNT) * Math.PI * 2
    const dist  = 100 + Math.random() * NPC_SPAWN_RANGE
    npcs.push({
      x:           cx + Math.cos(angle) * dist,
      y:           cy + Math.sin(angle) * dist,
      dx:          0,
      dy:          0,
      dirRow:      DIR_DOWN,
      frameIndex:  Math.floor(Math.random() * WALK_FRAMES),
      frameTick:   0,
      wanderTick:  0,
      wanderMax:     NPC_WANDER_MIN + Math.floor(Math.random() * (NPC_WANDER_MAX - NPC_WANDER_MIN)),
      idlePausing:   false,
      idleTick:      0,
      dialogueIndex: i % NPC_DIALOGUES.length,
    })
  }
  return npcs
}

export function findNearbyNpc(
  charX: number,
  charY: number,
  npcs:  Npc[],
): Npc | null {
  const cx = charX + CHAR_W / 2
  const cy = charY + CHAR_H / 2
  for (const npc of npcs) {
    const nx   = npc.x + CHAR_W / 2
    const ny   = npc.y + CHAR_H / 2
    const dist = Math.sqrt((cx - nx) ** 2 + (cy - ny) ** 2)
    if (dist < NPC_INTERACT_RADIUS) return npc
  }
  return null
}

// ─── NPC UPDATE FUNCTION (added to fix parse error) ─────────────────────────
export function updateNpcs(npcs: Npc[], paused: boolean = false): void {
  for (const npc of npcs) {
    npc.wanderTick++

    // Pick new direction only when not paused
    if (!paused && npc.wanderTick >= npc.wanderMax) {
      npc.wanderTick = 0
      npc.wanderMax  = NPC_WANDER_MIN + Math.floor(Math.random() * (NPC_WANDER_MAX - NPC_WANDER_MIN))
      if (Math.random() < 0.25) {
        npc.dx = 0
        npc.dy = 0
      } else {
        const angle = Math.random() * Math.PI * 2
        npc.dx = Math.cos(angle)
        npc.dy = Math.sin(angle)
      }
    }

    const moving = !paused && (Math.abs(npc.dx) > 0.1 || Math.abs(npc.dy) > 0.1)

    // Move only if not paused
    if (moving) {
      npc.x = Math.max(0, Math.min(npc.x + npc.dx * NPC_SPEED, WORLD_W - CHAR_W))
      npc.y = Math.max(0, Math.min(npc.y + npc.dy * NPC_SPEED, WORLD_H - CHAR_H))
      if      (npc.dy >  0.3) npc.dirRow = DIR_DOWN
      else if (npc.dy < -0.3) npc.dirRow = DIR_UP
      else if (npc.dx < -0.3) npc.dirRow = DIR_LEFT
      else if (npc.dx >  0.3) npc.dirRow = DIR_RIGHT
    }

    // Animation always runs (idle or walk frames)
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

// ─── IMAGE LOADER ─────────────────────────────────────────────────────────────
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${src}`))
    img.src = src
  })
}

// ─── SCALE CALCULATOR ─────────────────────────────────────────────────────────
export function calcScale(): number {
  const scaleX  = window.innerWidth  / GAME_W
  const scaleY  = window.innerHeight / GAME_H
  const fit     = Math.min(scaleX, scaleY)
  const integer = Math.floor(fit)
  return integer >= 1 ? integer : fit
}

// ─── CAMERA ───────────────────────────────────────────────────────────────────
export function lerpCam(
  cam:    { x: number; y: number },
  target: { x: number; y: number },
  lerp:   number,
  zoom:   number,
): { x: number; y: number } {
  const visW = GAME_W / zoom
  const visH = GAME_H / zoom
  const targetCamX = target.x + CHAR_W / 2 - visW / 2
  const targetCamY = target.y + CHAR_H / 2 - visH / 2
  let cx = cam.x + (targetCamX - cam.x) * lerp
  let cy = cam.y + (targetCamY - cam.y) * lerp
  cx = Math.max(0, Math.min(cx, WORLD_W - visW))
  cy = Math.max(0, Math.min(cy, WORLD_H - visH))
  return { x: cx, y: cy }
}

// ─── MINIMAP ──────────────────────────────────────────────────────────────────
export const MINI_W      = 80   // minimap width in pixels
export const MINI_H      = 45   // minimap height (keeps 16:9 ratio of world)
export const MINI_PAD    = 8    // padding from corner
export const MINI_BORDER = 1

export function renderMinimap(
  ctx:   CanvasRenderingContext2D,
  charX: number,
  charY: number,
) {
  const x = GAME_W - MINI_W - MINI_PAD
  const y = MINI_PAD

  // ── Background ──
  ctx.save()
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#0a1a0a'
  ctx.fillRect(x - MINI_BORDER, y - MINI_BORDER, MINI_W + MINI_BORDER * 2, MINI_H + MINI_BORDER * 2)
  ctx.globalAlpha = 1

  // ── World fill ──
  ctx.fillStyle = '#2d5a27'
  ctx.fillRect(x, y, MINI_W, MINI_H)

  // ── Border ──
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, MINI_W, MINI_H)

  // ── Player dot ──
  const dotX = x + (charX / WORLD_W) * MINI_W
  const dotY = y + (charY / WORLD_H) * MINI_H
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // ── Viewport box — shows what camera sees ──
  const vx = x + ((charX - GAME_W / ZOOM / 2) / WORLD_W) * MINI_W
  const vy = y + ((charY - GAME_H / ZOOM / 2) / WORLD_H) * MINI_H
  const vw = (GAME_W / ZOOM / WORLD_W) * MINI_W
  const vh = (GAME_H / ZOOM / WORLD_H) * MINI_H
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(vx, vy, vw, vh)

  ctx.restore()
}

// ─── RENDER FRAME ─────────────────────────────────────────────────────────────
export function renderFrame(
  ctx:        CanvasRenderingContext2D,
  grass:      HTMLImageElement,
  plainGrass: HTMLImageElement,
  char:       HTMLImageElement,
  images:     Record<string, HTMLImageElement>,
  props:      Prop[],
  npcs:       Npc[],
  charX:      number,
  charY:      number,
  camX:       number,
  camY:       number,
  zoom:       number,
  frameIndex: number,
  dirRow:     number,
  isWalking:  boolean,
) {
  // ── Keep pixels sharp ──
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, GAME_W, GAME_H)

  // floor camera to prevent sub-pixel jitter on all sprites
  camX = Math.floor(camX)
  camY = Math.floor(camY)

  ctx.save()
  ctx.scale(zoom, zoom)

  const visW = GAME_W / zoom
  const visH = GAME_H / zoom

  // ── Tiles — patchy distribution using multi-frequency hash ──
  const startCol = Math.floor(camX / TILE_SIZE)
  const startRow = Math.floor(camY / TILE_SIZE)
  const endCol   = Math.ceil((camX + visW) / TILE_SIZE)
  const endRow   = Math.ceil((camY + visH) / TILE_SIZE)

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const sx = c * TILE_SIZE - camX
      const sy = r * TILE_SIZE - camY
      // patch noise — large scale + medium blended, more mix visible
      const large  = Math.sin(c * 0.13 + r * 0.17) * Math.cos(c * 0.07 - r * 0.11)
      const medium = Math.sin(c * 0.31 + r * 0.29) * 0.4
      const small  = Math.sin(c * 0.61 + r * 0.53) * 0.2
      const noise  = large + medium + small
      const tile   = noise > 0.0 ? plainGrass : grass
      ctx.drawImage(tile, sx, sy, TILE_SIZE, TILE_SIZE)
    }
  }

  // ── Y-sort: collect visible props + character into one list ──
  const visibleProps = props.filter(p =>
    p.x + p.w > camX - 32 && p.x < camX + visW + 32 &&
    p.y + p.h > camY - 32 && p.y < camY + visH + 32
  )

  // character sort key = bottom of feet
  const charSortY = charY + CHAR_H

  // sort everything by bottom Y
  type Drawable = { sortY: number; draw: () => void }
  const drawables: Drawable[] = []

  // add props
  for (const p of visibleProps) {
    const sx = Math.floor(p.x - camX)
    const sy = Math.floor(p.y - camY)
    const img = images[p.type]
    if (!img) continue
    drawables.push({
      sortY: p.y + p.h,
      draw: () => {
        // shadow under bush2
        if (p.type === 'bush2') {
          ctx.save()
          ctx.globalAlpha = 0.3
          ctx.fillStyle = '#000'
          ctx.beginPath()
          ctx.ellipse(
            sx + p.w / 2,
            sy + p.h,
            p.w / 2.5,
            p.h / 5,
            0, 0, Math.PI * 2,
          )
          ctx.fill()
          ctx.restore()
        }
        ctx.drawImage(img, sx, sy, p.w, p.h)
      },
    })
  }

  // add npcs
  for (const npc of npcs) {
    const nx = Math.floor(npc.x - camX)
    const ny = Math.floor(npc.y - camY)
    // skip if off screen
    if (nx + CHAR_W < 0 || nx > visW || ny + CHAR_H < 0 || ny > visH) continue
    const moving   = Math.abs(npc.dx) > 0.1 || Math.abs(npc.dy) > 0.1
    const npcRow   = moving ? WALK_ROW_OFFSET + npc.dirRow : npc.dirRow
    drawables.push({
      sortY: npc.y + CHAR_H,
      draw: () => {
        // shadow
        ctx.save()
        ctx.globalAlpha = 0.25
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.ellipse(nx + CHAR_W / 2, ny + CHAR_H, CHAR_W / 2.5, CHAR_H / 10, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        // sprite
        ctx.drawImage(char, npc.frameIndex * CHAR_W, npcRow * CHAR_H, CHAR_W, CHAR_H, nx, ny, CHAR_W, CHAR_H)
      },
    })
  }

  // add character
  const screenX = Math.floor(charX - camX)
  const screenY = Math.floor(charY - camY)
  const sheetRow = isWalking ? WALK_ROW_OFFSET + dirRow : dirRow
  drawables.push({
    sortY: charSortY,
    draw: () => {
      // shadow
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(
        screenX + CHAR_W / 2, screenY + CHAR_H,
        CHAR_W / 2.5, CHAR_H / 10,
        0, 0, Math.PI * 2,
      )
      ctx.fill()
      ctx.restore()
      // sprite
      ctx.drawImage(
        char,
        frameIndex * CHAR_W, sheetRow * CHAR_H,
        CHAR_W, CHAR_H,
        screenX, screenY,
        CHAR_W, CHAR_H,
      )
    },
  })

  // draw in Y order
  drawables.sort((a, b) => a.sortY - b.sortY)
  for (const d of drawables) d.draw()

  ctx.restore()

  // ── Minimap — outside zoom so it stays fixed size ──
  renderMinimap(ctx, charX, charY)
}

/* @arkzen:web:script:end */

/* @arkzen:web:components:game */

'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import {
  GAME_W,
  GAME_H,
  WORLD_W,
  WORLD_H,
  CHAR_W,
  CHAR_H,
  CHAR_SPEED,
  CAM_LERP,
  ZOOM,
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
  Npc,
  NPC_DIALOGUES,
  generateProps,
  generateNpcs,
  updateNpcs,
  findNearbyNpc,
  resolveCollision,
  loadImage,
  calcScale,
  lerpCam,
  renderFrame,
  renderMinimap,
} from '@/arkzen/generated/ethereane.scripts'

const JOY_RADIUS = 60
const KNOB_MAX   = 38

export const EtheraneGame = () => {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const knobRef     = useRef<HTMLDivElement>(null)
  const joyZoneRef  = useRef<HTMLDivElement>(null)

  const charPos  = useRef({
    x: WORLD_W / 2 - CHAR_W / 2,
    y: WORLD_H / 2 - CHAR_H / 2,
  })
  const camPos   = useRef({
    x: WORLD_W / 2 - GAME_W / 2,
    y: WORLD_H / 2 - GAME_H / 2,
  })

  const joyVec    = useRef({ x: 0, y: 0 })
  const keysHeld  = useRef<Set<string>>(new Set())
  const rafRef    = useRef<number>(0)
  const assetsRef = useRef<{ grass: HTMLImageElement; plainGrass: HTMLImageElement; char: HTMLImageElement; images: Record<string, HTMLImageElement> } | null>(null)
  const propsRef  = useRef<Prop[]>(generateProps(42))
  const npcsRef   = useRef<Npc[]>(generateNpcs())

  const [nearbyNpc,  setNearbyNpc]  = useState<Npc | null>(null)
  const [dialogue,   setDialogue]   = useState<string[] | null>(null)
  const nearbyNpcRef = useRef<Npc | null>(null)
  const joyActive = useRef(false)
  const joyOrigin = useRef({ x: 0, y: 0 })

  // ─── ANIMATION STATE ──────────────────────────────────────────────────────
  const frameIndex  = useRef(0)
  const frameTick   = useRef(0)
  const dirRow      = useRef(DIR_DOWN)
  const idlePausing = useRef(false)
  const isWalking   = useRef(false)

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
    const clamp = Math.min(dist, KNOB_MAX)
    setKnobPos(Math.cos(angle) * clamp, Math.sin(angle) * clamp)
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
    const canvas = canvasRef.current
    const assets = assetsRef.current
    if (!canvas || !assets) { rafRef.current = requestAnimationFrame(gameLoop); return }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

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

    let nextX = charPos.current.x + dx * CHAR_SPEED
    let nextY = charPos.current.y + dy * CHAR_SPEED
    nextX = Math.max(0, Math.min(nextX, WORLD_W - CHAR_W))
    nextY = Math.max(0, Math.min(nextY, WORLD_H - CHAR_H))
    const resolved = resolveCollision(nextX, nextY, propsRef.current)
    charPos.current.x = resolved.x
    charPos.current.y = resolved.y

    // ── Direction ──
    const moving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1

    // reset to idle start when transitioning from walk to idle
    if (isWalking.current && !moving) {
      frameIndex.current  = 0
      frameTick.current   = 0
      idlePausing.current = true  // start with pause before first idle cycle
    }
    isWalking.current = moving

    if (moving) {
      if      (dy >  0.1) dirRow.current = DIR_DOWN
      else if (dy < -0.1) dirRow.current = DIR_UP
      else if (dx < -0.1) dirRow.current = DIR_LEFT
      else if (dx >  0.1) dirRow.current = DIR_RIGHT
    }

    // ── Frame cycling ──
    frameTick.current++
    if (moving) {
      // walk — loop continuously
      if (frameTick.current >= WALK_FRAME_RATE) {
        frameTick.current = 0
        frameIndex.current = (frameIndex.current + 1) % WALK_FRAMES
      }
    } else {
      // idle — play once, pause 3s, repeat
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

    camPos.current = lerpCam(camPos.current, charPos.current, CAM_LERP, ZOOM)

    // ── Update NPCs ──
    updateNpcs(npcsRef.current, !!dialogue)

    // ── Nearby NPC detection ──
    const nearby = findNearbyNpc(charPos.current.x, charPos.current.y, npcsRef.current)
    if (nearby !== nearbyNpcRef.current) {
      nearbyNpcRef.current = nearby
      setNearbyNpc(nearby)
    }

    renderFrame(
      ctx,
      assets.grass,
      assets.plainGrass,
      assets.char,
      assets.images,
      propsRef.current,
      npcsRef.current,
      charPos.current.x,
      charPos.current.y,
      camPos.current.x,
      camPos.current.y,
      ZOOM,
      frameIndex.current,
      dirRow.current,
      isWalking.current,
    )

    rafRef.current = requestAnimationFrame(gameLoop)
  }, [dialogue])

  // ─── SETUP ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas   = canvasRef.current
    const viewport = viewportRef.current
    if (!canvas || !viewport) return

    canvas.width  = GAME_W
    canvas.height = GAME_H

    const applyScale = () => {
      const s = calcScale()
      viewport.style.width  = `${Math.floor(GAME_W * s)}px`
      viewport.style.height = `${Math.floor(GAME_H * s)}px`
      canvas.style.width    = `${Math.floor(GAME_W * s)}px`
      canvas.style.height   = `${Math.floor(GAME_H * s)}px`
    }
    applyScale()
    window.addEventListener('resize', applyScale)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    let cancelled = false
    Promise.all([
      loadImage(ASSETS.tileGrass),
      loadImage(ASSETS.tilePlainGrass),
      loadImage(ASSETS.character1),
      loadImage(ASSETS.bush1),
      loadImage(ASSETS.bush2),
    ]).then(([grass, plainGrass, char, bush1, bush2]) => {
      if (cancelled) return
      assetsRef.current = {
        grass, plainGrass, char,
        images: { bush1, bush2 },
      }
      rafRef.current = requestAnimationFrame(gameLoop)
    }).catch((err) => {
      if (cancelled) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, GAME_W, GAME_H)
      ctx.fillStyle = '#f87171'
      ctx.font = '8px monospace'
      ctx.fillText('Asset load failed. Check console.', 4, 12)
      console.error(err)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', applyScale)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
    }
  }, [gameLoop, onKeyDown, onKeyUp])

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
