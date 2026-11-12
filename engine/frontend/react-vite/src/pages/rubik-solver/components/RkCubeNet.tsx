// ============================================================
// ARKZEN GENERATED COMPONENT — RkCubeNet [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T08:41:53.505Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkMode, RkPlanStage, RkPlanPart, RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'

export const RkCubeNet = ({
  stickers, uncertain, selected = -1, swapFirst = -1, bad, onTap, compact = false,
}: {
  stickers: string[]
  uncertain?: boolean[]
  selected?: number
  swapFirst?: number
  bad?: number[]
  onTap?: (i: number) => void
  compact?: boolean
}) => {
  const sib = selected >= 0 ? RK_SIBLINGS[selected] : []
  const badSet = new Set(bad || [])
  return (
    <div className={'rk-net' + (compact ? ' is-compact' : '')} role="group" aria-label="Cube faces">
      {RK_FACES.map((f, fi) => (
        <div key={f} className={'rk-face rk-face-' + f}>
          <div className="rk-face-cap">{RK_FACE_NAME[f]} <span>{RK_COLOR_NAME[f]}</span></div>
          <div className="rk-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
              const i = fi * 9 + k
              const col = stickers[i]
              const cls = [
                'rk-st',
                col ? '' : 'is-empty',
                k === 4 ? 'is-center' : '',
                selected === i ? 'is-selected' : '',
                selected !== i && sib.indexOf(i) >= 0 ? 'is-sibling' : '',
                badSet.has(i) ? 'is-bad' : '',
                uncertain && uncertain[i] ? 'is-unsure' : '',
                swapFirst === i ? 'is-swap' : '',
              ].filter(Boolean).join(' ')
              const label = RK_FACE_NAME[f] + ' face, row ' + (Math.floor(k / 3) + 1) + ', column ' + ((k % 3) + 1) + ': ' + (col ? RK_COLOR_NAME[col] : 'empty')
              const style = col ? { background: RK_HEX[col] } : undefined
              if (!onTap) return <span key={k} className={cls} style={style} aria-label={label} />
              return (
                <button key={k} type="button" className={cls} style={style} aria-label={label} onClick={() => onTap(i)}>
                  {k === 4 ? <Lock size={compact ? 9 : 13} strokeWidth={2.5} aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
};
