// ============================================================
// ARKZEN GENERATED COMPONENT — EtheraneGame [React+Vite]
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:16:27.631Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, useAuthStore } from '@/arkzen/core/stores/authStore'
import { ASSETS, CAM_LERP, CHAR_H, CHAR_SPEED, CHAR_W, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP, GAME_H, GAME_W, IDLE_FRAMES, IDLE_FRAME_RATE, IDLE_PAUSE, NPC_DIALOGUES, Npc, Prop, RemotePlayer, WALK_FRAMES, WALK_FRAME_RATE, WALK_ROW_OFFSET, WORLD_H, WORLD_W, ZOOM, calcScale, findNearbyNpc, generateNpcs, generateProps, lerpCam, loadImage, renderFrame, resolveCollision, updateNpcs } from '@/arkzen/generated/ethereane.scripts'
import { APP_KEY, JOY_RADIUS, KNOB_MAX, MOVE_BROADCAST_INTERVAL, REMOTE_LERP, REVERB_HOST, REVERB_PORT, REVERB_SCHEME } from './constants'
import { angle, applyScale, assets, assetsRef, broadcastTickRef, camPos, canvas, canvasRef, charPos, clamp, closeDialogue, connData, connectMultiplayer, ctx, d, dirRow, dist, existing, frameIndex, frameTick, gameLoop, handleInteract, hash, idlePausing, isWalking, joyActive, joyOrigin, joyVec, joyZoneRef, keys, keysHeld, knob, knobRef, mag, mountedRef, moving, name, names, nearby, nearbyNpcRef, npc, npcsRef, onKeyDown, onKeyUp, onTouchEnd, onTouchMove, onTouchStart, propsRef, rafRef, rate, rawDx, rawDy, remotesRef, res, resetKnob, resolved, rid, rname, s, setKnobPos, socketId, t, viewport, viewportRef, ws, wsRef, zone } from './utils'

export const EtheraneGame = () => {
  const { user } = useAuthStore()

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const knobRef     = useRef<HTMLDivElement>(null)
  const joyZoneRef  = useRef<HTMLDivElement>(null)

  const charPos  = useRef({ x: WORLD_W / 2 - CHAR_W / 2, y: WORLD_H / 2 - CHAR_H / 2 })
  const camPos   = useRef({ x: WORLD_W / 2 - GAME_W / 2, y: WORLD_H / 2 - GAME_H / 2 })

  const joyVec    = useRef({ x: 0, y: 0 })
  const keysHeld  = useRef<Set<string>>(new Set())
  const rafRef    = useRef<number>(0)
  const assetsRef = useRef<{ grass: HTMLImageElement; plainGrass: HTMLImageElement; char: HTMLImageElement; images: Record<string, HTMLImageElement> } | null>(null)
  const propsRef  = useRef<Prop[]>(generateProps(42))
  const npcsRef   = useRef<Npc[]>(generateNpcs(99))       // seeded — same on all clients
  const remotesRef = useRef<Map<number, RemotePlayer>>(new Map())
  const broadcastTickRef = useRef(0)

  const [nearbyNpc,  setNearbyNpc]  = useState<Npc | null>(null)
  const [dialogue,   setDialogue]   = useState<string[] | null>(null)
  const [onlineNames, setOnlineNames] = useState<string[]>([])
  const nearbyNpcRef = useRef<Npc | null>(null)
  const joyActive = useRef(false)
  const joyOrigin = useRef({ x: 0, y: 0 })

  // multiplayer WebSocket
  const wsRef      = useRef<WebSocket | null>(null)
  const mountedRef = useRef(true)

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

  // ─── MULTIPLAYER: connect to Reverb presence channel ──────────────────────
  const connectMultiplayer = useCallback(async (userId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}/app/${APP_KEY}`)
    wsRef.current = ws

    ws.onmessage = async (event) => {
      if (!mountedRef.current) return
      let msg: { event: string; data: unknown; channel?: string }
      try { msg = JSON.parse(event.data) } catch { return }

      if (msg.event === 'pusher:connection_established') {
        const connData = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const socketId = (connData as any).socket_id as string

        try {
          const res = await arkzenFetch('/api/ethereane/auth/broadcasting/auth', {
            method: 'POST',
            body:   JSON.stringify({ socket_id: socketId, channel_name: 'presence-ethereane-world' }),
          })
          if (res.ok) {
            const { auth, channel_data } = await res.json()
            ws.send(JSON.stringify({
              event: 'pusher:subscribe',
              data:  { channel: 'presence-ethereane-world', auth, channel_data },
            }))
          }
        } catch (e) { console.warn('[ethereane] presence auth failed', e) }
      }

      // initial member list on subscribe
      if (msg.event === 'pusher_internal:subscription_succeeded' && msg.channel === 'presence-ethereane-world') {
        const d    = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const hash = (d as any).presence?.hash ?? {}
        const names = Object.entries(hash)
          .filter(([id]) => Number(id) !== userId)
          .map(([, info]: [string, any]) => info?.name ?? 'Unknown')
        setOnlineNames(names)
      }

      // player joined
      if (msg.event === 'pusher_internal:member_added') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const rid = (d as any).user_id as number
        const rname = (d as any).user_info?.name ?? 'Unknown'
        if (rid !== userId) {
          setOnlineNames(prev => [...prev.filter(n => n !== rname), rname])
        }
      }

      // player left — remove from remotes + online list
      if (msg.event === 'pusher_internal:member_removed') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const rid = (d as any).user_id as number
        remotesRef.current.delete(rid)
        setOnlineNames(prev => {
          const name = remotesRef.current.get(rid)?.name
          return name ? prev.filter(n => n !== name) : prev
        })
      }

      // remote player moved
      if (msg.event === 'client-player-moved') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const { id, name, x, y, dirRow: dr, isWalking: iw } = d as any
        if (id === userId) return
        const existing = remotesRef.current.get(id)
        remotesRef.current.set(id, {
          id, name,
          x:  existing?.x  ?? x,
          y:  existing?.y  ?? y,
          targetX:   x,
          targetY:   y,
          dirRow:    dr,
          isWalking: iw,
        })
      }
    }

    ws.onerror = () => ws.close()
    ws.onclose = () => {
      if (!mountedRef.current) return
      // simple reconnect after 3s
      setTimeout(() => { if (mountedRef.current) connectMultiplayer(userId) }, 3000)
    }
  }, [])

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

    camPos.current = lerpCam(camPos.current, charPos.current, CAM_LERP, ZOOM)

    // ── Broadcast position at 15-16Hz via client event ──
    broadcastTickRef.current++
    if (broadcastTickRef.current >= MOVE_BROADCAST_INTERVAL) {
      broadcastTickRef.current = 0
      const ws = wsRef.current
      if (ws?.readyState === WebSocket.OPEN && user?.id) {
        ws.send(JSON.stringify({
          event:   'client-player-moved',
          channel: 'presence-ethereane-world',
          data: {
            id:        user.id,
            name:      user.name ?? `Player ${user.id}`,
            x:         Math.round(charPos.current.x),
            y:         Math.round(charPos.current.y),
            dirRow:    dirRow.current,
            isWalking: isWalking.current,
          },
        }))
      }
    }

    // ── Interpolate remote players ──
    for (const r of remotesRef.current.values()) {
      r.x += (r.targetX - r.x) * REMOTE_LERP
      r.y += (r.targetY - r.y) * REMOTE_LERP
    }

    updateNpcs(npcsRef.current, !!dialogue)

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
      Array.from(remotesRef.current.values()),
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
  }, [dialogue, user?.id, user?.name])

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
      assetsRef.current = { grass, plainGrass, char, images: { bush1, bush2 } }
      rafRef.current = requestAnimationFrame(gameLoop)
    }).catch((err) => {
      if (cancelled) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#111'; ctx.fillRect(0, 0, GAME_W, GAME_H)
      ctx.fillStyle = '#f87171'; ctx.font = '8px monospace'
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

  // ─── CONNECT MULTIPLAYER when user is ready ────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    if (user?.id) {
      connectMultiplayer(user.id)
    }
    return () => {
      mountedRef.current = false
      wsRef.current?.close()
    }
  }, [user?.id, connectMultiplayer])

  return (
    <div className="eth-root">
      <div className="eth-viewport" ref={viewportRef}>
        <canvas ref={canvasRef} className="eth-canvas" />
      </div>

      {/* Online players HUD */}
      {onlineNames.length > 0 && (
        <div className="eth-online-hud">
          {onlineNames.map((name, i) => (
            <div key={i} className="eth-online-dot">{name}</div>
          ))}
        </div>
      )}

      <div className="eth-joystick-zone" ref={joyZoneRef}>
        <div className="eth-joystick-base" />
        <div className="eth-joystick-knob" ref={knobRef} />
      </div>

      {nearbyNpc && !dialogue && (
        <button className="eth-interact-btn" onClick={handleInteract}>E</button>
      )}

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
