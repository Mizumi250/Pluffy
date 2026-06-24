// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — ethereane [React+Vite]
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-24T16:50:57.103Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ASSETS, BLOCK_HEIGHT, CAM_DIST_DEFAULT, CAM_DIST_MAX, CAM_DIST_MIN, CAM_FOLLOW_LERP, CAM_FOLLOW_LERP_RUN, CAM_LERP, CAM_LOOK_HEIGHT, CAM_POLAR_DEFAULT, CAM_POLAR_MAX, CAM_POLAR_MIN, CAM_ROTATE_SPEED, CAM_ZOOM_SPEED, CHAR_PLANE_H, CHAR_PLANE_W, CHAR_RUN_MULT, CHAR_SPEED, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP, GAME_H, GAME_W, IDLE_FRAMES, IDLE_FRAME_RATE, IDLE_PAUSE, NPC_DIALOGUES, Npc, PROP_DEFS, Prop, RUN_WALK_RATE, TILE_SIZE, WALK_FRAMES, WALK_FRAME_RATE, WALK_ROW_OFFSET, WORLD_D, WORLD_MARGIN, WORLD_W, billboardInstances, buildGroundData, calcScale, clamp, compositeSkyLayers, createShadowTexture, createSkyDome, faceCamera, findNearbyNpc, generateNpcs, generateProps, initSheetTexture, lerp, lerpAngle, loadTexture, orbitCameraPosition, renderMinimap, resolveCollision, setSheetFrame, updateNpcs, updateSkyScroll } from '@/arkzen/generated/ethereane.scripts'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export const JOY_RADIUS = 60

export const KNOB_MAX   = 38

export const UP_AXIS    = new THREE.Vector3(0, 1, 0)
