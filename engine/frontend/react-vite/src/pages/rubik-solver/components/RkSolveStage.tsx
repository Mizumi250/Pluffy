// ============================================================
// ARKZEN GENERATED COMPONENT — RkSolveStage [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:03.591Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'
import { useRkSolver, useRkStore } from './hooks'
import { RkGuide } from './RkGuide'

export const RkSolveStage = () => {
  const status = useRkStore((s) => s.solveStatus)
  const solution = useRkStore((s) => s.solution)
  const prepPct = useRkStore((s) => s.prepPct)
  const prepStage = useRkStore((s) => s.prepStage)
  const solveError = useRkStore((s) => s.solveError)
  const solveMs = useRkStore((s) => s.solveMs)
  const guideOn = useRkStore((s) => s.guideOn)
  const startGuide = useRkStore((s) => s.startGuide)
  const setStage = useRkStore((s) => s.setStage)
  const { stop } = useRkSolver()

  if (status === 'error') {
    return (
      <section className="rk-panel">
        <h2 className="rk-h2">The solver could not finish</h2>
        <p className="rk-p" role="alert">{solveError}</p>
        <button type="button" className="rk-btn" onClick={() => setStage('review')}>Back to stickers</button>
      </section>
    )
  }

  if (guideOn && solution) return <RkGuide />

  const working = status === 'working'
  return (
    <section className="rk-panel rk-solve-panel" aria-live="polite">
      {working && !solution ? (
        <>
          <h2 className="rk-h2">{prepPct < 1 ? 'Getting the solver ready' : 'Searching'}</h2>
          <p className="rk-p">{prepPct < 1 ? prepStage || 'Building search tables' : 'Looking for a short solution...'}</p>
          <div className="rk-bar" aria-hidden="true"><span style={{ width: Math.round(Math.max(0.05, prepPct) * 100) + '%' }} /></div>
          <p className="rk-note">This takes a second or two the first time, then the search itself runs for a few seconds.</p>
        </>
      ) : null}

      {solution ? (
        <>
          <p className="rk-kicker">{working ? 'Best so far, still searching' : 'Solution ready'}</p>
          <h2 className="rk-h2">{solution.length === 0 ? 'This cube is already solved' : solution.length + ' moves'}</h2>
          <p className="rk-p rk-mono">{rkMoveNames(solution)}</p>
          <p className="rk-note">
            This is a very short solution found by a two-phase search, usually within 1 to 3 moves of the shortest possible.
            It is not proven to be the single shortest.{!working && solveMs > 0 ? ' Found in ' + (solveMs / 1000).toFixed(1) + ' s.' : ''}
          </p>
          <div className="rk-row rk-row-wrap">
            <button type="button" className="rk-btn rk-btn-primary" onClick={() => { if (working) stop(); startGuide() }}>
              {working ? 'Use this and start' : 'Start step by step'} <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="rk-btn rk-btn-quiet" onClick={() => { if (working) stop(); setStage('review') }}>Back to stickers</button>
          </div>
        </>
      ) : null}
    </section>
  )
};
