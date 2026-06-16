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
export const CHAR_SPEED = 2
export const CAM_LERP   = 0.08
export const ZOOM       = 2

// ─── ASSET PATHS ──────────────────────────────────────────────────────────────
export const ASSETS = {
  tileGrass:  '/tatemonos/ethereane/assets/images/tile-grass.png',
  character1: '/tatemonos/ethereane/assets/images/character1.png',
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

// ─── RENDER FRAME ─────────────────────────────────────────────────────────────
export function renderFrame(
  ctx:   CanvasRenderingContext2D,
  grass: HTMLImageElement,
  char:  HTMLImageElement,
  charX: number,
  charY: number,
  camX:  number,
  camY:  number,
  zoom:  number,
) {
  ctx.clearRect(0, 0, GAME_W, GAME_H)

  ctx.save()
  ctx.scale(zoom, zoom)

  const visW = GAME_W / zoom
  const visH = GAME_H / zoom

  // ── Tiles ──
  const startCol = Math.floor(camX / TILE_SIZE)
  const startRow = Math.floor(camY / TILE_SIZE)
  const endCol   = Math.ceil((camX + visW) / TILE_SIZE)
  const endRow   = Math.ceil((camY + visH) / TILE_SIZE)

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const sx = c * TILE_SIZE - camX
      const sy = r * TILE_SIZE - camY
      ctx.drawImage(grass, sx, sy, TILE_SIZE, TILE_SIZE)
    }
  }

  const screenX = Math.floor(charX - camX)
  const screenY = Math.floor(charY - camY)

  // ── Oval shadow under feet ──
  ctx.save()
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(
    screenX + CHAR_W / 2,
    screenY + CHAR_H,
    CHAR_W / 2.5,
    CHAR_H / 10,
    0, 0, Math.PI * 2,
  )
  ctx.fill()
  ctx.restore()

  // ── Character on top ──
  ctx.drawImage(char, screenX, screenY, CHAR_W, CHAR_H)

  ctx.restore()
}

/* @arkzen:web:script:end */

/* @arkzen:web:components:game */

'use client'

import React, { useEffect, useRef, useCallback } from 'react'
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
  ASSETS,
  loadImage,
  calcScale,
  lerpCam,
  renderFrame,
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
  const assetsRef = useRef<{ grass: HTMLImageElement; char: HTMLImageElement } | null>(null)
  const joyActive = useRef(false)
  const joyOrigin = useRef({ x: 0, y: 0 })

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

  // ─── KEYBOARD ─────────────────────────────────────────────────────────────
  const onKeyDown = useCallback((e: KeyboardEvent) => { keysHeld.current.add(e.key) }, [])
  const onKeyUp   = useCallback((e: KeyboardEvent) => { keysHeld.current.delete(e.key) }, [])

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

    charPos.current.x = Math.max(0, Math.min(charPos.current.x + dx * CHAR_SPEED, WORLD_W - CHAR_W))
    charPos.current.y = Math.max(0, Math.min(charPos.current.y + dy * CHAR_SPEED, WORLD_H - CHAR_H))

    camPos.current = lerpCam(camPos.current, charPos.current, CAM_LERP, ZOOM)

    renderFrame(
      ctx,
      assets.grass,
      assets.char,
      charPos.current.x,
      charPos.current.y,
      camPos.current.x,
      camPos.current.y,
      ZOOM,
    )

    rafRef.current = requestAnimationFrame(gameLoop)
  }, [])

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
      loadImage(ASSETS.character1),
    ]).then(([grass, char]) => {
      if (cancelled) return
      assetsRef.current = { grass, char }
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
