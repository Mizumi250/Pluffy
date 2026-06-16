// ============================================================
// ARKZEN GENERATED COMPONENT — EtheraneGame [React+Vite]
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T07:10:49.319Z
// ============================================================

import React, { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ASSETS, CAM_LERP, CHAR_H, CHAR_SPEED, CHAR_W, GAME_H, GAME_W, WORLD_H, WORLD_W, ZOOM, calcScale, lerpCam, loadImage, renderFrame } from '@/arkzen/generated/ethereane.scripts'
import { JOY_RADIUS, KNOB_MAX } from './constants'
import { angle, applyScale, assets, assetsRef, camPos, canvas, canvasRef, charPos, clamp, ctx, dist, gameLoop, joyActive, joyOrigin, joyVec, joyZoneRef, keys, keysHeld, knob, knobRef, mag, onKeyDown, onKeyUp, onTouchEnd, onTouchMove, onTouchStart, rafRef, rawDx, rawDy, resetKnob, s, setKnobPos, t, viewport, viewportRef, zone } from './utils'

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
