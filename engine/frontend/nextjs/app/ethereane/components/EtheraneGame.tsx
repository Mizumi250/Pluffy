'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — EtheraneGame
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-19T22:51:31.768Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ASSETS, CAM_LERP, CHAR_H, CHAR_SPEED, CHAR_W, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP, GAME_H, GAME_W, IDLE_FRAMES, IDLE_FRAME_RATE, IDLE_PAUSE, NPC_DIALOGUES, Npc, Prop, WALK_FRAMES, WALK_FRAME_RATE, WALK_ROW_OFFSET, WORLD_H, WORLD_W, ZOOM, calcScale, findNearbyNpc, generateNpcs, generateProps, lerpCam, loadImage, renderFrame, renderMinimap, resolveCollision, updateNpcs } from '@/arkzen/generated/ethereane.scripts'
import { JOY_RADIUS, KNOB_MAX } from './constants'
import { angle, applyScale, assets, assetsRef, camPos, canvas, canvasRef, charPos, clamp, closeDialogue, ctx, dirRow, dist, frameIndex, frameTick, gameLoop, handleInteract, idlePausing, isWalking, joyActive, joyOrigin, joyVec, joyZoneRef, keys, keysHeld, knob, knobRef, mag, moving, nearby, nearbyNpcRef, npc, npcsRef, onKeyDown, onKeyUp, onTouchEnd, onTouchMove, onTouchStart, propsRef, rafRef, rate, rawDx, rawDy, resetKnob, resolved, s, setKnobPos, t, viewport, viewportRef, zone } from './utils'

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
