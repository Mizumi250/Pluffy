'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — RkCube3D
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:13.637Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STICKER_BITS, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import type { RkCamState, RkLab, RkMode, RkPlanPart, RkPlanStage, RkPoly, RkReport, RkSolveStatus, RkStage, RkStoreState, RkTool } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'

// ── canvas cube with the turning layer ───────────────────────────────────────

export const RkCube3D = ({
  state, move, animate = true, size = 300, label, art = true,
}: { state: string[]; move?: string | null; animate?: boolean; size?: number; label: string; art?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const info = move ? rkDescribeMove(move) : null
    const view = info ? rkViewFor(info.face) : 'front'
    const sign = info && 'URF'.indexOf(info.face) >= 0 ? 1 : -1
    const scale = size / 6.3
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = (t01: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)
      const anim = info && t01 > 0 ? { face: info.face, angle: -sign * (Math.PI / 2) * info.quarters * t01 } : null
      const polys: RkPoly[] = rkBuildPolys(state, view, anim, info ? info.face : null)
      ctx.lineJoin = 'round'
      for (const p of polys) {
        ctx.beginPath()
        p.pts.forEach((q, n) => {
          const x = size / 2 + q[0] * scale
          const y = size / 2 + q[1] * scale + size * 0.02
          if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.fillStyle = p.fill
        ctx.fill()
        ctx.lineWidth = p.sw
        ctx.strokeStyle = p.stroke
        ctx.stroke()
        const bits = art && p.col && p.pts.length === 4 ? RK_STICKER_BITS[p.col] : ''
        if (bits) {
          const c = p.pts.map((q) => [size / 2 + q[0] * scale, size / 2 + q[1] * scale + size * 0.02])
          const at = (s: number, t: number) => [
            (1 - s) * (1 - t) * c[0][0] + s * (1 - t) * c[1][0] + s * t * c[2][0] + (1 - s) * t * c[3][0],
            (1 - s) * (1 - t) * c[0][1] + s * (1 - t) * c[1][1] + s * t * c[2][1] + (1 - s) * t * c[3][1],
          ]
          const m = 0.14
          const cs = (1 - 2 * m) / 5
          ctx.beginPath()
          for (let j = 0; j < 25; j++) {
            if (bits.charAt(j) !== '1') continue
            const s0 = m + (j % 5) * cs
            const t0 = m + Math.floor(j / 5) * cs
            const a = at(s0, t0), b = at(s0 + cs, t0), d = at(s0 + cs, t0 + cs), e = at(s0, t0 + cs)
            ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath()
          }
          ctx.fillStyle = 'rgba(18, 18, 18, 0.78)'
          ctx.fill()
        }
      }
    }

    if (!animate || !info || reduce) { draw(0); return }
    let raf = 0
    const t0 = performance.now()
    const cycle = 3000
    const loop = (now: number) => {
      const t = (now - t0) % cycle
      let p = 0
      if (t > 700 && t < 1700) {
        const u = (t - 700) / 1000
        p = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
      } else if (t >= 1700 && t < 2500) p = 1
      draw(p)
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [state, move, animate, size])

  return <canvas ref={canvasRef} className="rk-canvas" style={{ width: size, height: size }} role="img" aria-label={label} />
}

// ── step 1: scan ─────────────────────────────────────────────────────────────
