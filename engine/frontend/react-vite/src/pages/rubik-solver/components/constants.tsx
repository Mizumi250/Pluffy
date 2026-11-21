// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — rubik-solver [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-21T15:26:07.874Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STICKER_BITS, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkMode, RkPlanStage, RkPlanPart, RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'


export const RK_HERO_BITS: string[] = [
  '00000' + '01010' + '00000' + '11111' + '00000',
  '00100' + '00100' + '11111' + '00100' + '00100',
  '11111' + '10001' + '10101' + '10001' + '11111',
  '00001' + '00011' + '00111' + '01111' + '11111',
  '00000' + '00000' + '11111' + '11111' + '11111',
  '01110' + '11111' + '11111' + '11110' + '01100',
  '10000' + '10000' + '10000' + '10000' + '11111',
  '00101' + '01010' + '00101' + '01010' + '00101',
  '00000' + '10001' + '01110' + '00000' + '00000',
  '11111' + '11111' + '11111' + '11111' + '11111',
];

export const RK_HERO_SCHEMES: Record<string, string[]> = {
  k: ['#121212', '#f6f7f9'],
  w: ['#f6f7f9', '#121212'],
  b: ['#4a82ff', '#f6f7f9'],
  p: ['#ff4f9f', '#121212'],
  l: ['#f8d7e6', '#121212'],
};

export const RK_HERO_FACES: Record<string, string[]> = {
  top: ['l5', 'k4', 'b9', 'l5', 'w0', 'b2', 'k7', 'k9', 'p3'],
  left: ['k5', 'b7', 'w9', 'w1', 'b8', 'w3', 'k5', 'b4', 'w6'],
  right: ['p9', 'p5', 'p7', 'k5', 'p1', 'k6', 'p5', 'k8', 'p4'],
};
