'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — EtheraneGame
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:37.282Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ASSETS, BLOCK_HEIGHT, CAM_DIST_DEFAULT, CAM_DIST_MAX, CAM_DIST_MIN, CAM_FOLLOW_LERP, CAM_FOLLOW_LERP_RUN, CAM_LERP, CAM_LOOK_HEIGHT, CAM_POLAR_DEFAULT, CAM_POLAR_MAX, CAM_POLAR_MIN, CAM_ROTATE_SPEED, CAM_ZOOM_SPEED, CHAR_PLANE_H, CHAR_PLANE_W, CHAR_RUN_MULT, CHAR_SPEED, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP, GAME_H, GAME_W, IDLE_FRAMES, IDLE_FRAME_RATE, IDLE_PAUSE, NPC_DIALOGUES, PROP_DEFS, RUN_WALK_RATE, TILE_SIZE, WALK_FRAMES, WALK_FRAME_RATE, WALK_ROW_OFFSET, WORLD_D, WORLD_MARGIN, WORLD_W, billboardInstances, buildGroundData, calcScale, clamp, compositeSkyLayers, createShadowTexture, createSkyDome, faceCamera, findNearbyNpc, generateNpcs, generateProps, initSheetTexture, lerp, lerpAngle, loadTexture, orbitCameraPosition, renderMinimap, resolveCollision, setSheetFrame, updateNpcs, updateSkyScroll } from '@/arkzen/generated/ethereane.scripts'
import type { Npc, Prop } from '@/arkzen/generated/ethereane.scripts'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { JOY_RADIUS, KNOB_MAX, UP_AXIS } from './constants'
import type { ThreeState } from './types'

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
  const [runActive,  setRunActive] = useState(false)

  // ─── ANIMATION STATE ──────────────────────────────────────────────────────
  const frameIndex  = useRef(0)
  const frameTick   = useRef(0)
  const dirRow      = useRef(DIR_DOWN)
  const idlePausing = useRef(false)
  const isWalking   = useRef(false)
  const isRunning   = useRef(false)   // true while run button / Shift held

  // ─── THREE.JS SCENE ───────────────────────────────────────────────────────
  const three = useRef<ThreeState | null>(null)

  // ─── CAMERA ORBIT ─────────────────────────────────────────────────────────
  const camAzimuth       = useRef(0)
  const camPolar         = useRef(CAM_POLAR_DEFAULT)
  const camDist          = useRef(CAM_DIST_DEFAULT)
  const camAzimuthTarget = useRef(0)
  const camPolarTarget   = useRef(CAM_POLAR_DEFAULT)
  const camDistTarget    = useRef(CAM_DIST_DEFAULT)

  // ─── CAMERA FOLLOW ("break delay" spring) ─────────────────────────────────
  // These lag behind charPos with CAM_FOLLOW_LERP, giving the camera a soft
  // inertia so it feels like it "brakes" to catch up rather than snapping.
  const camFollowX = useRef(0)
  const camFollowZ = useRef(0)

  const dragging         = useRef(false)
  const dragPointerId    = useRef<number | null>(null)
  const lastPointer      = useRef({ x: 0, y: 0 })

  // ─── JOYSTICK POINTER ID ───────────────────────────────────────────────────
  // Tracking the joystick's pointer separately from the camera pointer is what
  // fixes the multi-touch "joystick gets hijacked" bug.  Pointer capture on the
  // joystick zone means its touch never leaks into the canvas camera handler.
  const joyPointerId = useRef<number | null>(null)

  // ─── CAMERA POINTER ───────────────────────────────────────────────────────
  const onCamPointerDown = useCallback((e: PointerEvent) => {
    // Reject if this pointer is already owned by the joystick
    if (e.pointerId === joyPointerId.current) return
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

  // ─── JOYSTICK — pointer events (not touch) for proper multi-touch isolation ─
  // Using pointer events + setPointerCapture means the browser routes all
  // subsequent move/up events for this pointer to the joystick zone, even
  // if the finger wanders outside it — and it never bleeds into the canvas
  // camera handler which checks joyPointerId.current before accepting a drag.
  const onJoyPointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault()
    if (joyPointerId.current !== null) return   // already tracking a joystick touch
    const zone = joyZoneRef.current
    if (zone) zone.setPointerCapture(e.pointerId)
    joyPointerId.current = e.pointerId
    joyActive.current    = true
    joyOrigin.current    = { x: e.clientX, y: e.clientY }
  }, [])

  const onJoyPointerMove = useCallback((e: PointerEvent) => {
    if (!joyActive.current || e.pointerId !== joyPointerId.current) return
    const rawDx = e.clientX - joyOrigin.current.x
    const rawDy = e.clientY - joyOrigin.current.y
    const dist  = Math.sqrt(rawDx * rawDx + rawDy * rawDy)
    const angle = Math.atan2(rawDy, rawDx)
    setKnobPos(Math.cos(angle) * Math.min(dist, KNOB_MAX), Math.sin(angle) * Math.min(dist, KNOB_MAX))
    joyVec.current = {
      x: Math.cos(angle) * Math.min(dist / JOY_RADIUS, 1),
      y: Math.sin(angle) * Math.min(dist / JOY_RADIUS, 1),
    }
  }, [setKnobPos])

  const onJoyPointerUp = useCallback((e: PointerEvent) => {
    if (e.pointerId !== joyPointerId.current) return
    joyPointerId.current = null
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
    if (e.key === 'Shift') { isRunning.current = true; return }
    keysHeld.current.add(e.key)
  }, [handleInteract, closeDialogue])
  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') { isRunning.current = false; return }
    keysHeld.current.delete(e.key)
  }, [])

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

    // Running: Shift key OR run button held
    const running = isRunning.current && (Math.abs(joyVec.current.x) > 0.1 || Math.abs(joyVec.current.y) > 0.1 || kx !== 0 || ky !== 0)

    let dx = joyVec.current.x + kx
    let dy = joyVec.current.y + ky
    const mag = Math.sqrt(dx * dx + dy * dy)
    if (mag > 1) { dx /= mag; dy /= mag }

    // ── camera-relative movement ──
    const camForward = new THREE.Vector3()
    t.camera.getWorldDirection(camForward)
    camForward.y = 0
    camForward.normalize()
    const camRight = new THREE.Vector3().crossVectors(camForward, UP_AXIS).normalize()

    const moveX = camForward.x * -dy + camRight.x * dx
    const moveZ = camForward.z * -dy + camRight.z * dx

    let nextX = charPos.current.x + moveX * CHAR_SPEED * (running ? CHAR_RUN_MULT : 1)
    let nextZ = charPos.current.z + moveZ * CHAR_SPEED * (running ? CHAR_RUN_MULT : 1)
    const halfW = WORLD_W / 2 - WORLD_MARGIN
    const halfD = WORLD_D / 2 - WORLD_MARGIN
    nextX = Math.max(-halfW, Math.min(nextX, halfW))
    nextZ = Math.max(-halfD, Math.min(nextZ, halfD))
    const resolved = resolveCollision(nextX, nextZ, propsRef.current)
    charPos.current.x = resolved.x
    charPos.current.z = resolved.z

    // ── direction row ──
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

    // ── frame cycling ──
    frameTick.current++
    if (moving) {
      const walkRate = running ? RUN_WALK_RATE : WALK_FRAME_RATE
      if (frameTick.current >= walkRate) {
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

    // ── sync NPC billboards — camera-relative direction (moonwalk fix) ──
    npcsRef.current.forEach((npc, i) => {
      const mesh   = t.npcMeshes[i]
      const shadow = t.npcShadows[i]
      const tex    = t.npcTexes[i]
      mesh.position.set(npc.x, CHAR_PLANE_H / 2, npc.z)
      shadow.position.set(npc.x, 0.02, npc.z)
      const npcMoving = Math.abs(npc.dx) > 0.1 || Math.abs(npc.dz) > 0.1
      let npcVisualDir = npc.dirRow
      if (npcMoving) {
        const fwdDot   = npc.dx * camForward.x + npc.dz * camForward.z
        const rightDot = npc.dx * camRight.x   + npc.dz * camRight.z
        if (Math.abs(rightDot) >= Math.abs(fwdDot)) {
          npcVisualDir = rightDot > 0 ? DIR_RIGHT : DIR_LEFT
        } else {
          npcVisualDir = fwdDot > 0 ? DIR_UP : DIR_DOWN
        }
      }
      const row = npcMoving ? WALK_ROW_OFFSET + npcVisualDir : npc.dirRow
      setSheetFrame(tex, npc.frameIndex, row)
      faceCamera(mesh, t.camera.position.x, t.camera.position.z)
    })

    // ── sync bush billboards ──
    billboardInstances(t.bush1Mesh, t.bush1Props, PROP_DEFS.bush1.size, t.camera.position)
    billboardInstances(t.bush2Mesh, t.bush2Props, PROP_DEFS.bush2.size, t.camera.position)

    // ── orbit camera with spring follow ──
    camAzimuth.current = lerpAngle(camAzimuth.current, camAzimuthTarget.current, CAM_LERP)
    camPolar.current   = lerp(camPolar.current, camPolarTarget.current, CAM_LERP)
    camDist.current    = lerp(camDist.current, camDistTarget.current, CAM_LERP)

    // "break delay" — the orbit pivot chases charPos with gentle lag
    // When running, lerp is much lower so the camera dramatically lags behind
    const followLerp = running ? CAM_FOLLOW_LERP_RUN : CAM_FOLLOW_LERP
    camFollowX.current = lerp(camFollowX.current, charPos.current.x, followLerp)
    camFollowZ.current = lerp(camFollowZ.current, charPos.current.z, followLerp)

    const camPos = orbitCameraPosition(
      camFollowX.current, camFollowZ.current,
      camAzimuth.current, camPolar.current, camDist.current,
    )
    t.camera.position.set(camPos.x, camPos.y, camPos.z)
    t.camera.lookAt(camFollowX.current, CAM_LOOK_HEIGHT, camFollowZ.current)

    // sky dome follows camera — horizon stays correct at any camera height
    t.skyMesh.position.copy(t.camera.position)
    // scroll cloud layers to match camera azimuth (parallax effect)
    updateSkyScroll(t.skyMesh, camAzimuth.current)

    t.composer.render()

    if (t.minimapCtx) {
      renderMinimap(t.minimapCtx, charPos.current.x, charPos.current.z, camAzimuth.current)
    }

    rafRef.current = requestAnimationFrame(gameLoop)
  }, [dialogue])

  // ─── SETUP ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas        = canvasRef.current
    const minimapCanvas = minimapRef.current
    const viewport      = viewportRef.current
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
      canvas.style.width    = `${w}px`
      canvas.style.height   = `${h}px`
      minimapCanvas.style.width  = `${w}px`
      minimapCanvas.style.height = `${h}px`
    }
    applyScale()
    window.addEventListener('resize', applyScale)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    // ── scene ──
    const scene = new THREE.Scene()
    // Fog horizon colour matches the sky dome's horizon stop
    scene.fog = new THREE.Fog('#e1f5fe', 14, 34)

    const camera = new THREE.PerspectiveCamera(50, GAME_W / GAME_H, 0.1, 100)
    const startPos = orbitCameraPosition(0, 0, camAzimuth.current, camPolar.current, camDist.current)
    camera.position.set(startPos.x, startPos.y, startPos.z)
    camera.lookAt(0, CAM_LOOK_HEIGHT, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    renderer.setPixelRatio(1)
    renderer.setSize(GAME_W, GAME_H, false)
    // Clear colour = horizon haze — visible for 1 frame before the sky dome draws
    renderer.setClearColor('#e1f5fe', 1)
    // Shadow map — sun casts real shadows on the ground blocks
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    // Bloom needs linear tone mapping so colours don't clamp before the pass
    renderer.toneMapping         = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.outputColorSpace    = THREE.SRGBColorSpace

    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', onCamPointerDown)
    window.addEventListener('pointermove', onCamPointerMove)
    window.addEventListener('pointerup',   onCamPointerUp)
    window.addEventListener('pointercancel', onCamPointerUp)
    canvas.addEventListener('wheel', onCamWheel, { passive: false })

    let cancelled = false
    const loader = new THREE.TextureLoader()

    // ── post-processing: bloom ──────────────────────────────────────────────
    // RenderPass → UnrealBloomPass → OutputPass
    // Threshold 0.82 means only pixels brighter than ~82% white bloom —
    // so the sky clouds, sun-lit grass edges, and highlights glow but the
    // dark sprite outlines and ground shadows stay crisp.
    const composer    = new EffectComposer(renderer)
    const renderPass  = new RenderPass(scene, camera)
    const bloomPass   = new UnrealBloomPass(
      new THREE.Vector2(GAME_W, GAME_H),
      0.38,   // strength  — noticeable but not blinding
      0.5,    // radius    — soft spread
      0.88,   // threshold — bright highlights + sky bloom, darks stay crisp
    )
    const outputPass  = new OutputPass()
    composer.addPass(renderPass)
    composer.addPass(bloomPass)
    composer.addPass(outputPass)

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

      // ── sky dome — first in scene so it's always behind everything ──
      const skyMesh = createSkyDome()
      scene.add(skyMesh)

      // ── ground ──
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
      grassMesh.receiveShadow = true

      const plainMesh = new THREE.InstancedMesh(blockGeo, new THREE.MeshLambertMaterial({ map: plainTex }), plain.length)
      plain.forEach((g, i) => {
        dummy.position.set(g.x, -BLOCK_HEIGHT / 2, g.z)
        dummy.updateMatrix()
        plainMesh.setMatrixAt(i, dummy.matrix)
      })
      plainMesh.instanceMatrix.needsUpdate = true
      plainMesh.receiveShadow = true

      scene.add(grassMesh, plainMesh)

      // ── lighting ──
      // HemisphereLight = sky-blue from above, warm-brown bounce from below.
      // This is what gives the "glazed" outdoor feel — objects lit from above
      // get a cool bluish tint, undersides get a warm ground-bounce colour,
      // exactly like real open-sky daylight.  No faking needed.
      const hemi = new THREE.HemisphereLight(
        '#c8e8ff',   // sky colour  — cool blue-white from above
        '#6b8c42',   // ground colour — warm green-brown bounce from below
        1.0,
      )
      scene.add(hemi)

      // Directional sun — warm tint, casts real shadows, bright enough to bloom
      const sun = new THREE.DirectionalLight('#fff5e0', 1.35)
      sun.position.set(8, 14, 6)
      sun.castShadow            = true
      sun.shadow.mapSize.width  = 512
      sun.shadow.mapSize.height = 512
      sun.shadow.camera.near    = 1
      sun.shadow.camera.far     = 60
      sun.shadow.camera.left    = -30
      sun.shadow.camera.right   = 30
      sun.shadow.camera.top     = 30
      sun.shadow.camera.bottom  = -30
      scene.add(sun)

      // ── shadow blob ──
      const shadowTex  = createShadowTexture()
      const shadowGeo  = new THREE.PlaneGeometry(CHAR_PLANE_W * 0.9, CHAR_PLANE_W * 0.9)
      const makeShadow = () => {
        const m = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }))
        m.rotation.x = -Math.PI / 2
        m.position.y = 0.02
        scene.add(m)
        return m
      }

      // ── character billboard ──
      const charGeo = new THREE.PlaneGeometry(CHAR_PLANE_W, CHAR_PLANE_H)
      const charMat = new THREE.MeshBasicMaterial({ map: charTex, alphaTest: 0.5, side: THREE.DoubleSide })
      const charMesh = new THREE.Mesh(charGeo, charMat)
      charMesh.position.set(0, CHAR_PLANE_H / 2, 0)
      charMesh.castShadow = true
      scene.add(charMesh)
      const charShadow = makeShadow()

      // ── NPC billboards ──
      const npcMeshes:  THREE.Mesh[] = []
      const npcTexes:   THREE.Texture[] = []
      const npcShadows: THREE.Mesh[] = []
      npcsRef.current.forEach((npc) => {
        const tex = charTex.clone()
        tex.needsUpdate = true
        initSheetTexture(tex)
        setSheetFrame(tex, npc.frameIndex, npc.dirRow)
        const mat  = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide })
        const mesh = new THREE.Mesh(charGeo, mat)
        mesh.position.set(npc.x, CHAR_PLANE_H / 2, npc.z)
        mesh.castShadow = true
        scene.add(mesh)
        npcMeshes.push(mesh)
        npcTexes.push(tex)
        npcShadows.push(makeShadow())
      })

      // ── bush billboards ──
      const bush1Props = propsRef.current.filter(p => p.type === 'bush1')
      const bush2Props = propsRef.current.filter(p => p.type === 'bush2')
      const bushGeo    = new THREE.PlaneGeometry(1, 1)
      const bush1Mat   = new THREE.MeshBasicMaterial({ map: bush1Tex, alphaTest: 0.5, side: THREE.DoubleSide })
      const bush2Mat   = new THREE.MeshBasicMaterial({ map: bush2Tex, alphaTest: 0.5, side: THREE.DoubleSide })
      const bush1Mesh  = new THREE.InstancedMesh(bushGeo, bush1Mat, bush1Props.length)
      const bush2Mesh  = new THREE.InstancedMesh(bushGeo, bush2Mat, bush2Props.length)
      bush1Mesh.castShadow = true
      bush2Mesh.castShadow = true
      billboardInstances(bush1Mesh, bush1Props, PROP_DEFS.bush1.size, camera.position)
      billboardInstances(bush2Mesh, bush2Props, PROP_DEFS.bush2.size, camera.position)
      scene.add(bush1Mesh, bush2Mesh)

      three.current = {
        renderer, composer, scene, camera,
        skyMesh,
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
      if (t) t.renderer.dispose()
      three.current = null
    }
  }, [gameLoop, onKeyDown, onKeyUp, onCamPointerDown, onCamPointerMove, onCamPointerUp, onCamWheel])

  // ─── JOYSTICK POINTER EVENTS ───────────────────────────────────────────────
  // Pointer events (not touch events) so we can track pointer IDs and use
  // setPointerCapture — the combination that makes multi-touch actually work.
  useEffect(() => {
    const zone = joyZoneRef.current
    if (!zone) return
    zone.addEventListener('pointerdown',   onJoyPointerDown)
    zone.addEventListener('pointermove',   onJoyPointerMove)
    zone.addEventListener('pointerup',     onJoyPointerUp)
    zone.addEventListener('pointercancel', onJoyPointerUp)
    return () => {
      zone.removeEventListener('pointerdown',   onJoyPointerDown)
      zone.removeEventListener('pointermove',   onJoyPointerMove)
      zone.removeEventListener('pointerup',     onJoyPointerUp)
      zone.removeEventListener('pointercancel', onJoyPointerUp)
    }
  }, [onJoyPointerDown, onJoyPointerMove, onJoyPointerUp])

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

      {/* Run button — hold to sprint, Shift on keyboard */}
      <button
        className={`eth-run-btn${runActive ? ' active' : ''}`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); isRunning.current = true; setRunActive(true) }}
        onPointerUp={() => { isRunning.current = false; setRunActive(false) }}
        onPointerCancel={() => { isRunning.current = false; setRunActive(false) }}
      >
        RUN
      </button>

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
