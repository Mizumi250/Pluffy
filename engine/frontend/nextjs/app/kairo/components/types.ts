// ============================================================
// ARKZEN GENERATED TYPES — kairo
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:11:30.089Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Cpu, Lightbulb, Package, Pause, Play, ToggleRight, Trash2 } from 'lucide-react'
import { create } from 'zustand'

export type KairoState = {
  parts: Part[]
  wires: Wire[]
  sel: number[]
  wsel: number
  run: boolean
  speed: number
  lib: Lib
  libVer: number
  nid: number
  view: number[]
  msg: string
  [k: string]: any
}
