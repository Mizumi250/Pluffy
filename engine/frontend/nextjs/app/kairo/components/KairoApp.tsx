'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — KairoApp
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:40:33.596Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Cpu, Lightbulb, Package, Pause, Play, ToggleRight, Trash2 } from 'lucide-react'
import { create } from 'zustand'
import { useKairo } from './hooks'
import type { KairoState } from './types'
import { BoardView } from './BoardView'
import { Inspector } from './Inspector'
import { Parts } from './Parts'

export const KairoApp = () => {
  const load = useKairo((s) => s.load)
  useEffect(() => {
    load()
  }, [load])
  return (
    <div className="kr-root">
      <div className="kr-win">
        <Parts />
        <BoardView />
        <Inspector />
      </div>
    </div>
  )
}
