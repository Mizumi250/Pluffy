// ============================================================
// ARKZEN GENERATED COMPONENT — RkGuide [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:03.589Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'
import { useRkInterval, useRkSolver, useRkStore } from './hooks'
import { RkCube3D } from './RkCube3D'
import { RkCubeNet } from './RkCubeNet'
import { RkMoveToken } from './RkMoveToken'

export const RkGuide = () => {
  const stickers = useRkStore((s) => s.stickers)
  const solution = useRkStore((s) => s.solution) || []
  const step = useRkStore((s) => s.step)
  const setStep = useRkStore((s) => s.setStep)
  const status = useRkStore((s) => s.solveStatus)
  const resetAll = useRkStore((s) => s.resetAll)
  const setStage = useRkStore((s) => s.setStage)
  const { solve } = useRkSolver()
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(2600)
  const [copied, setCopied] = useState(false)

  const states = React.useMemo(() => rkStatesAlong(stickers, solution), [stickers, solution])
  const total = solution.length
  const atEnd = step >= total
  const move = atEnd ? null : solution[step]
  const info = move ? rkDescribeMove(move) : null
  const nextMove = step + 1 < total ? solution[step + 1] : null

  const go = useCallback((n: number) => {
    setStep(Math.max(0, Math.min(total, n)))
  }, [setStep, total])

  useRkInterval(() => {
    if (step >= total) { setPlaying(false); return }
    go(step + 1)
  }, playing ? speed : null)

  useEffect(() => {
    if (playing && step >= total) setPlaying(false)
  }, [playing, step, total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowRight') { e.preventDefault(); go(step + 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(step - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, step])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rkMoveNames(solution))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch (e) { /* clipboard blocked */ }
  }

  return (
    <div className="rk-guide-layout">
      <section className="rk-stage-card" aria-label="Current move">
        <p className="rk-hold">
          <strong>Hold the cube the same way for every move:</strong> green center facing you, white center on top.
          You never need to turn the whole cube.
        </p>
        <div className="rk-stage-body">
          <div className="rk-cube-box">
            <RkCube3D
              state={states[Math.min(step, total)] || stickers}
              move={move}
              animate={!atEnd}
              size={300}
              label={info ? info.headline : 'The cube is solved'}
            />
          </div>
          <div className="rk-move-box">
            <p className="rk-kicker">{atEnd ? 'Finished' : 'Move ' + (step + 1) + ' of ' + total}</p>
            {move ? (
              <>
                <div className="rk-big"><RkMoveToken move={move} /></div>
                <h2 className="rk-h2">{info ? info.headline : ''}</h2>
                <p className="rk-p">{info ? info.detail : ''}</p>
                {nextMove ? <p className="rk-note">Next: <RkMoveToken move={nextMove} /></p> : <p className="rk-note">This is the last move.</p>}
              </>
            ) : (
              <>
                <h2 className="rk-h2">{total === 0 ? 'This cube is already solved' : 'Solved'}</h2>
                <p className="rk-p">{rkIsSolved(states[Math.min(step, total)] || stickers) ? 'Every face should now be one color.' : 'The final state does not match a solved cube. Rescan and try again.'}</p>
              </>
            )}
          </div>
        </div>
        <div className="rk-bar" aria-hidden="true"><span style={{ width: (total ? Math.round((Math.min(step, total) / total) * 100) : 100) + '%' }} /></div>
        <div className="rk-row rk-row-wrap rk-controls">
          <button type="button" className="rk-btn" onClick={() => go(step - 1)} disabled={step === 0}><ChevronLeft size={18} aria-hidden="true" /> Back</button>
          <button type="button" className="rk-btn rk-btn-primary" onClick={() => go(step + 1)} disabled={atEnd}>Next <ChevronRight size={18} aria-hidden="true" /></button>
          <button type="button" className="rk-btn rk-btn-quiet" onClick={() => setPlaying((p) => !p)} disabled={atEnd} aria-pressed={playing}>
            {playing ? <><Pause size={16} aria-hidden="true" /> Pause</> : <><Play size={16} aria-hidden="true" /> Auto</>}
          </button>
          <label className="rk-speed">
            <span>Pace</span>
            <select value={speed} onChange={(e) => setSpeed(parseInt(e.target.value, 10))}>
              <option value={4200}>Slow</option>
              <option value={2600}>Normal</option>
              <option value={1500}>Fast</option>
            </select>
          </label>
        </div>
        <p className="rk-note">Arrow keys also step through the moves.</p>
      </section>

      <section className="rk-side">
        <h2 className="rk-h2">All {total} moves</h2>
        <ol className="rk-moves" aria-label="Full move list">
          {solution.map((m, i) => (
            <li key={i}>
              <button type="button" className={'rk-mv' + (i === step ? ' is-now' : i < step ? ' is-past' : '')} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
                <RkMoveToken move={m} />
              </button>
            </li>
          ))}
        </ol>
        <div className="rk-row rk-row-wrap">
          <button type="button" className="rk-btn rk-btn-small" onClick={copy}><Copy size={14} aria-hidden="true" /> {copied ? 'Copied' : 'Copy moves'}</button>
          {step === 0 && status !== 'working' && total > 0 ? (
            <button type="button" className="rk-btn rk-btn-small" onClick={() => solve(stickers, RK_SEARCH_LONG_MS, total)}>
              <Search size={14} aria-hidden="true" /> Look for a shorter one
            </button>
          ) : null}
        </div>
        {status === 'working' ? <p className="rk-note" role="status">Searching for something shorter than {total} moves...</p> : null}

        <details className="rk-details">
          <summary>Does your cube match? Compare it here</summary>
          <p className="rk-note">This is how the cube should look right now, before move {Math.min(step + 1, total)}.</p>
          <RkCubeNet stickers={states[Math.min(step, total)] || stickers} compact />
        </details>

        <details className="rk-details">
          <summary>How to read the moves</summary>
          <ul className="rk-list">
            <li><strong>R, L, U, D, F, B</strong> are the right, left, top (up), bottom (down), front and back faces.</li>
            <li>A letter alone means a quarter turn clockwise, looking straight at that face.</li>
            <li>A letter with <strong>'</strong> means a quarter turn counterclockwise.</li>
            <li>A letter with <strong>2</strong> means a half turn.</li>
          </ul>
        </details>

        <div className="rk-row rk-row-wrap">
          <button type="button" className="rk-btn rk-btn-quiet" onClick={() => setStage('review')}>Back to stickers</button>
          <button type="button" className="rk-btn rk-btn-quiet" onClick={resetAll}><RotateCcw size={16} aria-hidden="true" /> Scan another cube</button>
        </div>
      </section>
    </div>
  )
};
