'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — RkApp
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:15:05.011Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STICKER_BITS, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import type { RkCamState, RkLab, RkMode, RkPlanPart, RkPlanStage, RkPoly, RkReport, RkSolveStatus, RkStage, RkStoreState, RkTool } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import { useRkSolver, useRkStore } from './hooks'
import { RkReviewStage } from './RkReviewStage'
import { RkScanStage } from './RkScanStage'
import { RkSolveStage } from './RkSolveStage'
import { RkTally } from './RkTally'

// ── app shell ────────────────────────────────────────────────────────────────

export const RkApp = () => {
  const stage = useRkStore((s) => s.stage)
  const setStage = useRkStore((s) => s.setStage)
  const solution = useRkStore((s) => s.solution)
  const hydrate = useRkStore((s) => s.hydrate)
  const { warm } = useRkSolver()

  useEffect(() => {
    if (!document.getElementById('rk-fonts')) {
      const link = document.createElement('link')
      link.id = 'rk-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&family=Poppins:wght@400;500;600;700&display=swap'
      document.head.appendChild(link)
    }
    const saved = rkLoadLocal()
    if (saved) {
      const hasWork = saved.stickers.some((s, i) => s && i % 9 !== 4)
      if (hasWork) hydrate(saved.stickers, saved.stage)
    }
    warm()
  }, [])

  useEffect(() => {
    const unsub = useRkStore.subscribe((s, prev) => {
      if (s.stickers !== prev.stickers) rkSaveLocal(s.stickers, s.stage === 'review' ? 'review' : 'scan')
    })
    return unsub
  }, [])

  const tabs: { id: RkStage; label: string; enabled: boolean }[] = [
    { id: 'scan', label: 'scan', enabled: true },
    { id: 'review', label: 'check', enabled: true },
    { id: 'solve', label: 'solve', enabled: !!solution },
  ]

  return (
    <div className="rk-app">
      <header className="rk-top">
        <RkTally />
        <nav className="rk-tabs" aria-label="Steps">
          {tabs.map((t, i) => (
            <button
              key={t.id} type="button"
              className={'rk-tab' + (stage === t.id ? ' is-on' : '')}
              aria-current={stage === t.id ? 'step' : undefined}
              disabled={!t.enabled}
              onClick={() => setStage(t.id)}
            >
              <span className="rk-tab-n">{i + 1}</span> {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="rk-main">
        {stage === 'scan' ? <RkScanStage /> : null}
        {stage === 'review' ? <RkReviewStage /> : null}
        {stage === 'solve' ? <RkSolveStage /> : null}
      </main>
      <footer className="rk-foot">
        <p className="rk-foot-title">Cube solver.</p>
        <p className="rk-foot-sub">scan six faces, fix misreads, follow the moves.</p>
        <p className="rk-foot-note">The solver runs in your browser and uses no AI. Camera frames are never uploaded.</p>
      </footer>
    </div>
  )
}
