// ============================================================
// ARKZEN GENERATED COMPONENT — RkReviewStage [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T08:41:53.517Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_BAD_SOLUTION_MSG, RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_MODE_OPTIONS, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolutionWorks, rkSolveBeginner, rkSolvePro, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkMode, RkPlanStage, RkPlanPart, RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'
import { useRkSolver, useRkStore } from './hooks'
import { RkCubeNet } from './RkCubeNet'
import { RkSwatch } from './RkSwatch'

export const RkReviewStage = () => {
  const stickers = useRkStore((s) => s.stickers)
  const uncertain = useRkStore((s) => s.uncertain)
  const tool = useRkStore((s) => s.tool)
  const brush = useRkStore((s) => s.brush)
  const selected = useRkStore((s) => s.selected)
  const swapFirst = useRkStore((s) => s.swapFirst)
  const setTool = useRkStore((s) => s.setTool)
  const setBrush = useRkStore((s) => s.setBrush)
  const tapSticker = useRkStore((s) => s.tapSticker)
  const clearSelection = useRkStore((s) => s.clearSelection)
  const clearStickers = useRkStore((s) => s.clearStickers)
  const startRescan = useRkStore((s) => s.startRescan)
  const mode = useRkStore((s) => s.mode)
  const setMode = useRkStore((s) => s.setMode)
  const { solve } = useRkSolver()

  const report: RkReport = React.useMemo(() => rkAnalyze(stickers), [stickers])
  const unsureCount = uncertain.filter((u, i) => u && stickers[i]).length
  const pieceText = selected >= 0 ? rkPieceLabel(stickers, selected) : ''
  const kind = selected >= 0 ? rkPieceKind(selected) : null

  return (
    <div className="rk-review">
      <section className="rk-net-wrap" aria-label="Edit stickers">
        <RkCubeNet
          stickers={stickers}
          uncertain={uncertain}
          selected={selected}
          swapFirst={swapFirst}
          bad={report.badPieces}
          onTap={tapSticker}
        />
      </section>

      <section className="rk-side">
        <h2 className="rk-h2">Check every face against your cube</h2>
        <p className="rk-p">
          Tap a sticker to set it to the chosen color. Tapping a corner or edge sticker outlines the other stickers on the same piece,
          so you can compare it with the real piece. Centers are locked.
        </p>

        <div className="rk-tools" role="group" aria-label="Tool">
          <button type="button" className={'rk-tool' + (tool === 'paint' ? ' is-on' : '')} aria-pressed={tool === 'paint'} onClick={() => setTool('paint')}>
            <Paintbrush size={16} aria-hidden="true" /> Paint
          </button>
          <button type="button" className={'rk-tool' + (tool === 'swap' ? ' is-on' : '')} aria-pressed={tool === 'swap'} onClick={() => setTool('swap')}>
            <ArrowLeftRight size={16} aria-hidden="true" /> Swap two
          </button>
        </div>

        <div className="rk-palette" role="group" aria-label="Colors">
          {RK_FACES.map((f) => {
            const n = report.counts[f]
            return (
              <button
                key={f} type="button"
                className={'rk-pal' + (tool === 'paint' && brush === f ? ' is-on' : '') + (n !== 9 ? ' is-off' : '')}
                aria-pressed={tool === 'paint' && brush === f}
                aria-label={RK_COLOR_NAME[f] + ', ' + n + ' of 9 placed'}
                onClick={() => setBrush(f)}
              >
                <span className="rk-pal-sw" style={{ background: RK_HEX[f] }} />
                <span className="rk-pal-n">{n}/9</span>
              </button>
            )
          })}
        </div>
        {tool === 'swap' ? (
          <p className="rk-note">{swapFirst >= 0 ? 'Now tap the sticker to swap it with.' : 'Tap one sticker, then another, to swap their colors.'}</p>
        ) : null}

        <div className="rk-piece" aria-live="polite">
          {selected >= 0 ? (
            <>
              <p className="rk-piece-line"><strong>{pieceText}</strong></p>
              {kind !== 'center' ? <button type="button" className="rk-link" onClick={clearSelection}>Clear outline</button> : null}
            </>
          ) : <p className="rk-note">No sticker selected.</p>}
        </div>

        <div className={'rk-verdict ' + (report.solvable ? 'is-ok' : 'is-warn')} role="status">
          {report.solvable ? (
            <p className="rk-p"><Check size={16} aria-hidden="true" /> This cube is valid and can be solved.</p>
          ) : (
            <>
              <p className="rk-p"><Ban size={16} aria-hidden="true" /> Not solvable yet:</p>
              <ul className="rk-list">{report.messages.slice(0, 5).map((m, i) => <li key={i}>{m}</li>)}</ul>
            </>
          )}
          {unsureCount > 0 ? <p className="rk-note">{unsureCount} sticker{unsureCount === 1 ? '' : 's'} with a dot in the corner {unsureCount === 1 ? 'was' : 'were'} hard to read. Check those first.</p> : null}
        </div>

        <div className="rk-modes" role="radiogroup" aria-label="How to solve it">
          <p className="rk-kicker">How do you want to solve it?</p>
          {RK_MODE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={mode === o.id}
              disabled={o.soon}
              className={'rk-mode' + (mode === o.id ? ' is-on' : '') + (o.soon ? ' is-soon' : '')}
              onClick={() => setMode(o.id)}
            >
              <span className="rk-mode-name">{o.name}{o.soon ? <em className="rk-soon">Soon</em> : null}</span>
              <span className="rk-mode-blurb">{o.blurb}</span>
            </button>
          ))}
        </div>

        <div className="rk-row rk-row-wrap">
          <button type="button" className="rk-btn rk-btn-primary" disabled={!report.solvable} onClick={() => solve(stickers, RK_SEARCH_MS)}>
            Find the solution <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="rk-rescan">
          <span className="rk-kicker">Rescan one face</span>
          <div className="rk-row rk-row-wrap">
            {RK_SCAN_ORDER.map((f) => (
              <button key={f} type="button" className="rk-btn rk-btn-small" onClick={() => startRescan(f)} aria-label={'Rescan the ' + RK_COLOR_NAME[f] + ' center face'}>
                <RkSwatch face={f} /> {RK_FACE_NAME[f]}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="rk-link" onClick={clearStickers}><Eraser size={14} aria-hidden="true" /> Clear all stickers</button>
      </section>
    </div>
  )
};
