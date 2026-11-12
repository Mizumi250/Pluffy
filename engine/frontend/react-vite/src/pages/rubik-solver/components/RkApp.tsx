// ============================================================
// ARKZEN GENERATED COMPONENT — RkApp [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:03.593Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'
import { useRkSolver, useRkStore } from './hooks'
import { RkGlyph } from './RkGlyph'
import { RkReviewStage } from './RkReviewStage'
import { RkScanStage } from './RkScanStage'
import { RkSolveStage } from './RkSolveStage'

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
      link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap'
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
    { id: 'scan', label: 'Scan', enabled: true },
    { id: 'review', label: 'Check', enabled: true },
    { id: 'solve', label: 'Solve', enabled: !!solution },
  ]

  return (
    <div className="rk-app">
      <header className="rk-top">
        <div className="rk-brand">
          <RkGlyph />
          <div>
            <p className="rk-brand-name">Cube solver</p>
            <p className="rk-brand-sub">Scan six faces, fix misreads, follow the moves.</p>
          </div>
        </div>
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
        <p>The solver runs in your browser and uses no AI. Camera frames are never uploaded.</p>
      </footer>
    </div>
  )
};
