// ============================================================
// ARKZEN GENERATED TYPES — ethereane
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:32.234Z
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

export type ThreeState = {
  renderer:   THREE.WebGLRenderer
  composer:   EffectComposer
  scene:      THREE.Scene
  camera:     THREE.PerspectiveCamera
  skyMesh:    THREE.Mesh
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
