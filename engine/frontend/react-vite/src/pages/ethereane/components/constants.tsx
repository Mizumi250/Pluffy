// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — ethereane [React+Vite]
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:16:27.617Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, useAuthStore } from '@/arkzen/core/stores/authStore'
import { ASSETS, CAM_LERP, CHAR_H, CHAR_SPEED, CHAR_W, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP, GAME_H, GAME_W, IDLE_FRAMES, IDLE_FRAME_RATE, IDLE_PAUSE, NPC_DIALOGUES, Npc, Prop, RemotePlayer, WALK_FRAMES, WALK_FRAME_RATE, WALK_ROW_OFFSET, WORLD_H, WORLD_W, ZOOM, calcScale, findNearbyNpc, generateNpcs, generateProps, lerpCam, loadImage, renderFrame, resolveCollision, updateNpcs } from '@/arkzen/generated/ethereane.scripts'

export const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST    ?? 'localhost'

export const REVERB_PORT   = import.meta.env.VITE_REVERB_PORT    ?? '8080'

export const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME  ?? 'ws'

export const APP_KEY       = import.meta.env.VITE_REVERB_APP_KEY ?? 'arkzen-key'

// broadcast player position at ~16Hz (every 4 frames at 60fps → 15/s)

// broadcast player position at ~16Hz (every 4 frames at 60fps → 15/s)
export const MOVE_BROADCAST_INTERVAL = 4

export const JOY_RADIUS = 60

export const KNOB_MAX   = 38

// interpolation speed for remote players

// interpolation speed for remote players
export const REMOTE_LERP = 0.18
