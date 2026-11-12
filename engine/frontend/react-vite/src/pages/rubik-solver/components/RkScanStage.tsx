// ============================================================
// ARKZEN GENERATED COMPONENT — RkScanStage [React+Vite]
// Source: @arkzen:components (rubik-solver)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:03.584Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RK_COLOR_NAME, RK_FACES, RK_FACE_NAME, RK_HEX, RK_SCAN_ORDER, RK_SCAN_TOP, RK_SEARCH_LONG_MS, RK_SEARCH_MS, RK_SIBLINGS, RK_SOLVER_SRC, RK_STOP_AT, RK_STORAGE_KEY, RK_VIEWS, rkAnalyze, rkAnchorMeans, rkApplyMove, rkApplyMoves, rkAvgSamples, rkBlankStickers, rkBuildPolys, rkCaptureGrid, rkCenterMatches, rkClassify, rkClassifyFace, rkCreateWorker, rkDescribeMove, rkInlineSolver, rkIsCenter, rkIsSolved, rkLoadLocal, rkMaxShift, rkMoveNames, rkNearestFace, rkNominalFace, rkPieceKind, rkPieceLabel, rkRgbToLab, rkSampleGrid, rkSaveLocal, rkSolvedState, rkSolverBox, rkStatesAlong, rkViewFor } from '@/arkzen/generated/rubik-solver.scripts'
import { ArrowLeftRight, Ban, Camera, Check, ChevronLeft, ChevronRight, Copy, Eraser, Lock, Paintbrush, Pause, Play, RotateCcw, ScanLine, Search, Upload } from 'lucide-react'
import { create } from 'zustand'
import type { RkLab, RkReport, RkPoly, RkStage, RkSolveStatus, RkTool, RkStoreState, RkCamState } from '@/arkzen/generated/rubik-solver.scripts'
import { useRkCamera, useRkInterval, useRkStore } from './hooks'
import { RkMiniFace } from './RkMiniFace'

export const RkScanStage = () => {
  const scanIndex = useRkStore((s) => s.scanIndex)
  const captures = useRkStore((s) => s.captures)
  const rescanFace = useRkStore((s) => s.rescanFace)
  const captureFace = useRkStore((s) => s.captureFace)
  const finishPartial = useRkStore((s) => s.finishPartial)
  const startManual = useRkStore((s) => s.startManual)
  const cancelRescan = useRkStore((s) => s.cancelRescan)
  const jumpScan = useRkStore((s) => s.jumpScan)
  const restartScan = useRkStore((s) => s.restartScan)
  const setStage = useRkStore((s) => s.setStage)
  const { videoRef, camState, camMessage, facing, startCam, stopCam } = useRkCamera()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const histRef = useRef<number[][][]>([])
  const holdRef = useRef(0)
  const liveRef = useRef({ scanIndex, captures })
  const [cells, setCells] = useState<string[]>([])
  const [hold, setHold] = useState(0)
  const [hint, setHint] = useState('')
  const [flash, setFlash] = useState(false)
  const [photoCheck, setPhotoCheck] = useState<{ samples: number[][]; seen: string } | null>(null)

  liveRef.current = { scanIndex, captures }
  const finished = scanIndex >= 6
  const expected = RK_SCAN_ORDER[Math.min(scanIndex, 5)]
  const topNeighbor = RK_SCAN_TOP[expected]
  const doneCount = captures.filter(Boolean).length

  const doCapture = useCallback((avg: number[][]) => {
    histRef.current = []
    holdRef.current = 0
    setHold(0)
    setHint('')
    setPhotoCheck(null)
    setFlash(true)
    window.setTimeout(() => setFlash(false), 380)
    try { if (navigator.vibrate) navigator.vibrate(40) } catch (e) { /* not supported */ }
    captureFace(avg)
  }, [captureFace])

  const handleSamples = useCallback((samples: number[][]) => {
    const live = liveRef.current
    if (live.scanIndex >= 6) return
    const exp = RK_SCAN_ORDER[live.scanIndex]
    setCells(samples.map((p) => rkNearestFace(p)))
    const hist = histRef.current
    hist.push(samples)
    if (hist.length > 6) hist.shift()
    const centerOk = rkCenterMatches(samples[4], exp, live.captures)
    if (!centerOk) {
      holdRef.current = 0
      setHold(0)
      const seen = rkNearestFace(samples[4])
      setHint(seen === exp ? '' : 'I see a ' + RK_COLOR_NAME[seen] + ' center. Show the ' + RK_COLOR_NAME[exp] + ' center face.')
      return
    }
    const steady = hist.length >= 5 && rkMaxShift(hist[0], hist[hist.length - 1]) < 16
    if (!steady) {
      holdRef.current = 0
      setHold(0)
      setHint('Hold the cube still.')
      return
    }
    setHint('Hold still...')
    holdRef.current += 1
    setHold(Math.min(1, holdRef.current / 4))
    if (holdRef.current >= 4) doCapture(rkAvgSamples(hist))
  }, [doCapture])

  const tick = useCallback(() => {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c || v.videoWidth === 0) return
    const side = 240
    if (c.width !== side) { c.width = side; c.height = side }
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const m = Math.min(v.videoWidth, v.videoHeight)
    ctx.drawImage(v, (v.videoWidth - m) / 2, (v.videoHeight - m) / 2, m, m, 0, 0, side, side)
    handleSamples(rkSampleGrid(ctx.getImageData(0, 0, side, side).data, side))
  }, [handleSamples, videoRef])

  useRkInterval(tick, camState === 'live' && !finished ? 120 : null)

  useEffect(() => {
    histRef.current = []
    holdRef.current = 0
    setHold(0)
    setHint('')
    setPhotoCheck(null)
  }, [scanIndex])

  const captureNow = () => {
    const hist = histRef.current
    if (hist.length === 0) return
    doCapture(rkAvgSamples(hist.slice(-3)))
  }

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const c = canvasRef.current
      if (!c) { URL.revokeObjectURL(url); return }
      const side = 240
      c.width = side
      c.height = side
      const ctx = c.getContext('2d', { willReadFrequently: true })
      if (!ctx) { URL.revokeObjectURL(url); return }
      const m = Math.min(img.naturalWidth, img.naturalHeight)
      ctx.drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, side, side)
      URL.revokeObjectURL(url)
      const samples = rkSampleGrid(ctx.getImageData(0, 0, side, side).data, side)
      setCells(samples.map((p) => rkNearestFace(p)))
      const live = liveRef.current
      if (rkCenterMatches(samples[4], RK_SCAN_ORDER[live.scanIndex], live.captures)) doCapture(samples)
      else setPhotoCheck({ samples, seen: rkNearestFace(samples[4]) })
    }
    img.onerror = () => { URL.revokeObjectURL(url); setHint('That image could not be read.') }
    img.src = url
  }

  if (finished && !rescanFace) {
    return (
      <section className="rk-panel rk-done-panel">
        <h2 className="rk-h2">All six faces captured</h2>
        <p className="rk-p">You can scan again from the start, or go on to check every sticker.</p>
        <div className="rk-row">
          <button type="button" className="rk-btn rk-btn-primary" onClick={() => setStage('review')}>Check stickers <ChevronRight size={18} aria-hidden="true" /></button>
          <button type="button" className="rk-btn" onClick={restartScan}><RotateCcw size={16} aria-hidden="true" /> Scan again</button>
        </div>
      </section>
    )
  }

  const camOn = camState === 'live'

  return (
    <div className="rk-scan">
      <section className="rk-viewer-wrap" aria-label="Camera">
        <div className={'rk-viewer' + (flash ? ' is-flash' : '')}>
          <video ref={videoRef} className="rk-video" playsInline muted />
          <canvas ref={canvasRef} className="rk-hidden" />
          <div className="rk-guide" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
              <div key={k} className={'rk-guide-cell' + (k === 4 ? ' is-center' : '')}>
                {camOn && cells[k] ? <i style={{ background: RK_HEX[cells[k]] }} /> : null}
              </div>
            ))}
          </div>
          {!camOn ? (
            <div className="rk-viewer-empty">
              {camState === 'starting' ? <p className="rk-p">Starting the camera...</p> : (
                <>
                  <button type="button" className="rk-btn rk-btn-primary" onClick={() => startCam(facing)}>
                    <Camera size={18} aria-hidden="true" /> Turn on camera
                  </button>
                  {camMessage ? <p className="rk-note rk-note-warn" role="alert">{camMessage}</p> : <p className="rk-note">Camera frames stay on this device.</p>}
                </>
              )}
            </div>
          ) : null}
        </div>
        <div className="rk-meter" aria-hidden="true"><span style={{ width: Math.round(hold * 100) + '%' }} /></div>
        <p className="rk-status" role="status" aria-live="polite">
          {camOn ? (hint || 'Line the face up with the grid. Detection is automatic.') : 'Camera is off.'}
        </p>
        <div className="rk-row rk-row-wrap">
          {camOn ? (
            <>
              <button type="button" className="rk-btn" onClick={captureNow}><ScanLine size={16} aria-hidden="true" /> Capture now</button>
              <button type="button" className="rk-btn rk-btn-quiet" onClick={() => startCam(facing === 'environment' ? 'user' : 'environment')}>Switch camera</button>
              <button type="button" className="rk-btn rk-btn-quiet" onClick={stopCam}>Camera off</button>
            </>
          ) : null}
          <button type="button" className="rk-btn rk-btn-quiet" onClick={() => fileRef.current && fileRef.current.click()}>
            <Upload size={16} aria-hidden="true" /> Use a photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="rk-hidden" onChange={onPhoto} />
        </div>
        {photoCheck ? (
          <div className="rk-callout" role="alert">
            <p className="rk-p">That photo shows a {RK_COLOR_NAME[photoCheck.seen]} center, but I asked for {RK_COLOR_NAME[expected]}. Take another, or use it anyway.</p>
            <div className="rk-row">
              <button type="button" className="rk-btn" onClick={() => doCapture(photoCheck.samples)}>Use anyway</button>
              <button type="button" className="rk-btn rk-btn-quiet" onClick={() => setPhotoCheck(null)}>Retake</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rk-side">
        <div className="rk-prompt">
          <span className="rk-prompt-sw" style={{ background: RK_HEX[expected] }} aria-hidden="true" />
          <div>
            <p className="rk-kicker">{rescanFace ? 'Rescanning' : 'Face ' + (doneCount + 1 > 6 ? 6 : doneCount + 1) + ' of 6'}</p>
            <h2 className="rk-h2">Show the {RK_COLOR_NAME[expected]} center face</h2>
            <p className="rk-p">
              {topNeighbor === 'U' && expected !== 'U'
                ? 'Keep the white center on top.'
                : 'Hold it so the ' + RK_COLOR_NAME[topNeighbor] + ' center face is above it.'}
            </p>
          </div>
        </div>

        <ol className="rk-faces" aria-label="Faces to scan">
          {RK_SCAN_ORDER.map((f, i) => {
            const cap = captures[i]
            const mini = cap ? cap.map((p, k) => (k === 4 ? f : rkNearestFace(p))) : new Array(9).fill('').map((_, k) => (k === 4 ? f : ''))
            const state = cap ? 'done' : i === scanIndex ? 'now' : 'next'
            return (
              <li key={f} className={'rk-face-row is-' + state}>
                <RkMiniFace faces={mini} dim={!cap} />
                <span className="rk-face-name">{RK_FACE_NAME[f]}, {RK_COLOR_NAME[f]} center</span>
                <span className="rk-face-state">
                  {state === 'done' ? <><Check size={14} aria-hidden="true" /> Done</> : state === 'now' ? 'Now' : ''}
                </span>
                {cap && i !== scanIndex ? (
                  <button type="button" className="rk-link" onClick={() => jumpScan(i)}>Redo</button>
                ) : <span />}
              </li>
            )
          })}
        </ol>

        <p className="rk-note">
          Standard cube colors: white is opposite yellow, green is opposite blue, red is opposite orange. Turn the whole cube
          only; do not twist layers while scanning.
        </p>

        <div className="rk-row rk-row-wrap">
          {rescanFace ? (
            <button type="button" className="rk-btn" onClick={cancelRescan}>Cancel and go back</button>
          ) : (
            <>
              <button type="button" className="rk-btn" onClick={doneCount > 0 ? finishPartial : startManual}>
                <Paintbrush size={16} aria-hidden="true" /> {doneCount > 0 ? 'Enter the rest by hand' : 'Enter colors by hand'}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
};
