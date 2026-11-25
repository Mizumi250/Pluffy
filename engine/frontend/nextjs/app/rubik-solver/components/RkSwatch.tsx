'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — RkSwatch
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:37.700Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STICKER_BITS, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import type { RkCamState, RkLab, RkMode, RkPlanPart, RkPlanStage, RkPoly, RkReport, RkSolveStatus, RkStage, RkStoreState, RkTool } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'

export const RkSwatch = ({ face, size = 14 }: { face: string; size?: number }) => (
  <span className="rk-swatch" style={{ background: RK_HEX[face], width: size, height: size }} aria-hidden="true" />
)
