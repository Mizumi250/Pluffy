'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — RkHeroCube
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:40:44.116Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STICKER_BITS, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import type { RkCamState, RkLab, RkMode, RkPlanPart, RkPlanStage, RkPoly, RkReport, RkSolveStatus, RkStage, RkStoreState, RkTool } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import { RK_HERO_BITS, RK_HERO_FACES, RK_HERO_SCHEMES } from './constants'

export const RkHeroCube = ({ size = 260 }: { size?: number }) => {
  const e = 125
  const dx = 108.25
  const dy = 62.5
  const k = 66
  const face = (name: string, fill: string) => (
    <>
      <rect x="0" y="0" width="66" height="66" rx="5" fill={fill} />
      {RK_HERO_FACES[name].map((spec, i) => {
        const scheme = RK_HERO_SCHEMES[spec.charAt(0)] || RK_HERO_SCHEMES.k
        const bits = RK_HERO_BITS[parseInt(spec.charAt(1), 10)] || RK_HERO_BITS[9]
        const tx = 2 + (i % 3) * 22
        const ty = 2 + Math.floor(i / 3) * 22
        return (
          <g key={name + i} transform={'translate(' + tx + ' ' + ty + ')'}>
            <rect width="20" height="20" rx="3" fill={scheme[0]} stroke="#0b1038" strokeWidth="0.8" />
            {bits.split('').map((c, j) => (c === '1'
              ? <rect key={j} x={2.5 + (j % 5) * 3} y={2.5 + Math.floor(j / 5) * 3} width="3.05" height="3.05" fill={scheme[1]} />
              : null))}
          </g>
        )
      })}
    </>
  )
  return (
    <svg viewBox="0 0 220 262" width={size} height={Math.round(size * 262 / 220)} aria-hidden="true" focusable="false">
      <g transform={'matrix(' + dx / k + ' ' + dy / k + ' 0 ' + e / k + ' 1.75 68.5)'}>{face('left', '#2a45f0')}</g>
      <g transform={'matrix(' + dx / k + ' ' + (-dy / k) + ' 0 ' + e / k + ' 110 131)'}>{face('right', '#1a32d6')}</g>
      <g transform={'matrix(' + dx / k + ' ' + (-dy / k) + ' ' + dx / k + ' ' + dy / k + ' 1.75 68.5)'}>{face('top', '#3b5bff')}</g>
    </svg>
  )
}
