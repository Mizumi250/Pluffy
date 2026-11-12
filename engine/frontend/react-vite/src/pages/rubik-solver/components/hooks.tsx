// ============================================================
// ARKZEN GENERATED HOOKS — rubik-solver [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T06:24:07.462Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkMode, RkPlanStage, RkPlanPart, RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'


export const useRkStore = create<RkStoreState>((set, get) => ({
  stage: 'scan',
  stickers: rkBlankStickers(),
  uncertain: new Array(54).fill(false),
  captures: [null, null, null, null, null, null],
  scanIndex: 0,
  rescanFace: null,
  means: null,
  tool: 'paint',
  brush: 'U',
  selected: -1,
  swapFirst: -1,
  solveStatus: 'idle',
  prepPct: 0,
  prepStage: '',
  solution: null,
  solveMs: 0,
  solveError: '',
  guideOn: false,
  step: 0,
  refining: false,
  mode: 'kociemba',
  plan: null,

  setMode: (m) => set({ mode: m === 'pro' ? 'kociemba' : m }),
  setStage: (s) => set({ stage: s }),

  resetAll: () => set({
    stage: 'scan', stickers: rkBlankStickers(), uncertain: new Array(54).fill(false),
    captures: [null, null, null, null, null, null], scanIndex: 0, rescanFace: null, means: null,
    selected: -1, swapFirst: -1, solveStatus: 'idle', solution: null, solveError: '', guideOn: false, step: 0,
  }),

  startManual: () => set({
    stage: 'review', stickers: rkBlankStickers(), uncertain: new Array(54).fill(false),
    selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0,
  }),

  captureFace: (rgb9) => {
    const s = get()
    const caps = s.captures.slice()
    caps[s.scanIndex] = rgb9
    if (s.rescanFace) {
      const fi = RK_FACES.indexOf(s.rescanFace)
      const res = rkClassifyFace(rgb9, fi, s.means || rkAnchorMeans())
      const stickers = s.stickers.slice()
      const unsure = s.uncertain.slice()
      for (let k = 0; k < 9; k++) { stickers[fi * 9 + k] = res.faces[k]; unsure[fi * 9 + k] = res.uncertain[k] }
      set({ captures: caps, stickers, uncertain: unsure, stage: 'review', rescanFace: null, selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
      return
    }
    let nextIdx = -1
    for (let k = 1; k <= 5; k++) {
      const idx = (s.scanIndex + k) % 6
      if (!caps[idx]) { nextIdx = idx; break }
    }
    if (nextIdx < 0) {
      const res = rkClassify(rkCaptureGrid(caps), s.means || undefined)
      set({
        captures: caps, scanIndex: 6, stickers: res.faces, uncertain: res.uncertain, means: res.means,
        stage: 'review', selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0,
      })
    } else {
      set({ captures: caps, scanIndex: nextIdx })
    }
  },

  finishPartial: () => {
    const s = get()
    const res = rkClassify(rkCaptureGrid(s.captures), s.means || undefined)
    const base = rkBlankStickers()
    const stickers = base.map((b, i) => res.faces[i] || b)
    set({ stickers, uncertain: res.uncertain, stage: 'review', selected: -1, swapFirst: -1, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
  },

  startRescan: (face) => set({ stage: 'scan', rescanFace: face, scanIndex: RK_SCAN_ORDER.indexOf(face) }),
  cancelRescan: () => set({ stage: 'review', rescanFace: null }),
  restartScan: () => set({
    stage: 'scan', scanIndex: 0, rescanFace: null, captures: [null, null, null, null, null, null], means: null,
    solution: null, solveStatus: 'idle', guideOn: false, step: 0,
  }),

  setTool: (t) => set({ tool: t, swapFirst: -1 }),
  setBrush: (b) => set({ brush: b, tool: 'paint', swapFirst: -1 }),

  tapSticker: (i) => {
    const s = get()
    if (s.tool === 'swap') {
      if (rkIsCenter(i)) { set({ selected: i }); return }
      if (s.swapFirst < 0) { set({ swapFirst: i, selected: i }); return }
      if (s.swapFirst === i) { set({ swapFirst: -1 }); return }
      const st = s.stickers.slice()
      const t = st[i]; st[i] = st[s.swapFirst]; st[s.swapFirst] = t
      const un = s.uncertain.slice(); un[i] = false; un[s.swapFirst] = false
      set({ stickers: st, uncertain: un, swapFirst: -1, selected: i, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
      return
    }
    if (rkIsCenter(i)) { set({ selected: i }); return }
    const st = s.stickers.slice()
    st[i] = s.brush
    const un = s.uncertain.slice(); un[i] = false
    set({ stickers: st, uncertain: un, selected: i, solution: null, solveStatus: 'idle', guideOn: false, step: 0 })
  },

  clearSelection: () => set({ selected: -1, swapFirst: -1 }),

  clearStickers: () => set({
    stickers: rkBlankStickers(), uncertain: new Array(54).fill(false), selected: -1, swapFirst: -1,
    solution: null, solveStatus: 'idle', guideOn: false, step: 0,
  }),

  setPrep: (pct, stage) => set({ prepPct: pct, prepStage: stage }),

  beginSolve: () => set({ solveStatus: 'working', solution: null, plan: null, solveError: '', guideOn: false, step: 0, stage: 'solve', refining: false }),
  setPlan: (solution, stages) => set({ plan: { solution, stages } }),
  beginRefine: () => set({ solveStatus: 'working', refining: true }),
  endRefine: () => set({ solveStatus: 'done', refining: false }),

  setSolution: (moves, working, ms) => set({ solution: moves, solveStatus: working ? 'working' : 'done', solveMs: ms }),

  failSolve: (msg) => set({ solveStatus: 'error', solveError: msg }),

  startGuide: () => set({ guideOn: true, step: 0 }),
  setStep: (n) => set({ step: n }),
  jumpScan: (i) => set({ scanIndex: i }),

  hydrate: (stickers, stage) => set({ stickers, stage }),
}));

export function useRkCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [camState, setCamState] = useState<RkCamState>('idle')
  const [camMessage, setCamMessage] = useState('')
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')

  const stopCam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCamState('idle')
  }, [])

  const startCam = useCallback(async (mode: 'environment' | 'user') => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamState('unsupported')
      setCamMessage('This page cannot use the camera. Browsers only allow it on https or on localhost. You can still take a photo of each face, or enter colors by hand.')
      return
    }
    setCamState('starting')
    setCamMessage('')
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setFacing(mode)
      const v = videoRef.current
      if (v) {
        v.srcObject = stream
        v.muted = true
        await v.play()
      }
      setCamState('live')
    } catch (err: any) {
      const name = err && err.name ? String(err.name) : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCamState('blocked')
        setCamMessage('Camera permission was denied. Allow it in the browser address bar, or use a photo or manual entry.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCamState('error')
        setCamMessage('No camera was found on this device.')
      } else {
        setCamState('error')
        setCamMessage('The camera could not start. Another app may be using it.')
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return { videoRef, camState, camMessage, facing, startCam, stopCam }
}

export function useRkSolver() {
  const setPrep = useRkStore((s) => s.setPrep)

  const attach = useCallback((w: Worker) => {
    w.onmessage = (e: MessageEvent) => {
      const d = e.data || {}
      const st = useRkStore.getState()
      if (d.type === 'progress') st.setPrep(d.pct, d.stage)
      else if (d.type === 'ready') st.setPrep(1, 'Ready')
      else if (d.type === 'solution') {
        if (rkSolutionWorks(rkSolverBox.facelets, d.names)) st.setSolution(d.names, true, 0)
        else if (!st.refining) st.failSolve(RK_BAD_SOLUTION_MSG)
      }
      else if (d.type === 'done') {
        if (rkSolutionWorks(rkSolverBox.facelets, d.names)) st.setSolution(d.names, false, d.elapsed)
        else if (st.refining) { /* keep the earlier, verified solution */ }
        else st.failSolve(RK_BAD_SOLUTION_MSG)
      }
      else if (d.type === 'error') { if (st.refining) st.endRefine(); else st.failSolve(d.message) }
      if (d.type === 'done' && st.refining) st.endRefine()
    }
    w.onerror = () => {
      useRkStore.getState().failSolve('The solver worker failed to start. Try reloading the page.')
      rkSolverBox.worker = null
    }
  }, [])

  const warm = useCallback(() => {
    if (rkSolverBox.worker) return
    const w = rkCreateWorker()
    if (!w) return
    rkSolverBox.worker = w
    attach(w)
    w.postMessage({ type: 'init' })
  }, [attach])

  const stop = useCallback(() => {
    if (rkSolverBox.worker) {
      rkSolverBox.worker.terminate()
      rkSolverBox.worker = null
    }
    const st = useRkStore.getState()
    if (st.solveStatus === 'working') st.setSolution(st.solution || [], false, st.solveMs)
  }, [])

  const solve = useCallback((stickers: string[], maxTimeMs: number, maxLen?: number) => {
    const st = useRkStore.getState()
    rkSolverBox.facelets = stickers.slice()
    if (st.mode === 'beginner' && !maxLen) {
      st.beginSolve()
      window.setTimeout(() => {
        try {
          const t0 = Date.now()
          const res = rkSolveBeginner(stickers)
          const store = useRkStore.getState()
          if ('error' in res) store.failSolve(res.error)
          else if (!rkSolutionWorks(stickers, res.moves)) store.failSolve(RK_BAD_SOLUTION_MSG)
          else { store.setPlan(res.moves, res.plan); store.setSolution(res.moves, false, Date.now() - t0) }
        } catch (e: any) {
          useRkStore.getState().failSolve(String(e && e.message ? e.message : e))
        }
      }, 30)
      return
    }
    if (maxLen) st.beginRefine(); else st.beginSolve()
    let w = rkSolverBox.worker
    if (!w) {
      w = rkCreateWorker()
      if (w) { rkSolverBox.worker = w; attach(w) }
    }
    if (w) {
      w.postMessage({ type: 'solve', facelets: stickers.join(''), maxTimeMs, stopAt: RK_STOP_AT, maxLen })
      return
    }
    // No worker available (blocked by the browser): run on the main thread.
    window.setTimeout(() => {
      try {
        const sv = rkInlineSolver()
        const res = sv.solve(stickers.join(''), { maxTimeMs: Math.min(maxTimeMs, 3000), stopAt: RK_STOP_AT, maxLen })
        if (res.error) { if (maxLen) useRkStore.getState().endRefine(); else useRkStore.getState().failSolve(res.error) }
        else if (rkSolutionWorks(stickers, res.names)) useRkStore.getState().setSolution(res.names, false, res.elapsed)
        else if (!maxLen) useRkStore.getState().failSolve(RK_BAD_SOLUTION_MSG)
        else useRkStore.getState().endRefine()
      } catch (e: any) {
        useRkStore.getState().failSolve(String(e && e.message ? e.message : e))
      }
    }, 30)
  }, [attach])

  return { warm, solve, stop, setPrep }
}

export function useRkInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback)
  useEffect(() => { saved.current = callback }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = window.setInterval(() => saved.current(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}
