'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — RkTally
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:13.615Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STICKER_BITS, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import type { RkCamState, RkLab, RkMode, RkPlanPart, RkPlanStage, RkPoly, RkReport, RkSolveStatus, RkStage, RkStoreState, RkTool } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import { useRkStore } from './hooks'

// ── small pieces ─────────────────────────────────────────────────────────────

// Poster marks. Each one does a job: the tally counts faces, the rule shows progress,
// the corner marks frame the live view, the hero cube fills the empty and finished states.
export const RkTally = () => {
  const stickers = useRkStore((s) => s.stickers)
  const captures = useRkStore((s) => s.captures)
  const flags = RK_SCAN_ORDER.map((f, i) => {
    if (captures[i]) return true
    const fi = RK_FACES.indexOf(f)
    for (let k = 0; k < 9; k++) if (!stickers[fi * 9 + k]) return false
    return true
  })
  const count = flags.filter(Boolean).length
  return (
    <div className="rk-tally-wrap">
      <p className="rk-tally-label">your cube</p>
      <span className="rk-tally" role="img" aria-label={count + ' of 6 faces filled in'}>
        {flags.map((on, i) => <i key={i} className={on ? 'is-on' : ''} />)}
      </span>
      <span className="rk-short" aria-hidden="true" />
    </div>
  )
}
