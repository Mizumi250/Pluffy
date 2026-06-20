'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — HTMLCanvasSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:24:05.980Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { addLog, angle, canvas, canvasRef, ctx, ctx2d, dpr, el, formEl, formRef, gl, grad, has, hasDrawElement, label, paint, rafRef, render, run2D, shapes, stopDemo, transform } from './utils'
import { DemoCard } from './DemoCard'
import { PlayCanvasSection } from './PlayCanvasSection'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: HTML-IN-CANVAS (Google Chrome 148+) ────────────────────────────
export const HTMLCanvasSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [supported, setSupported] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'2d' | 'webgl' | 'webgpu'>('2d')
  const [isRunning, setIsRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const rafRef = useRef<number>(0)

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-6), msg])

  useEffect(() => {
    // Detect support — canvas.onpaint and layoutsubtree are the signals
    const canvas = document.createElement('canvas')
    const has = 'onpaint' in canvas || (canvas as any).layoutsubtree !== undefined
    // Also check for drawElementImage
    const ctx2d = canvas.getContext('2d') as any
    const hasDrawElement = ctx2d && typeof ctx2d.drawElementImage === 'function'
    setSupported(has || hasDrawElement)
    addLog(hasDrawElement ? '✓ drawElementImage detected — Chrome 148+' : '⚠ HTML-in-Canvas not available in this browser. Needs Chrome 148+ with flag enabled.')
  }, [])

  const run2D = useCallback(() => {
    const canvas = canvasRef.current
    const formEl = formRef.current
    if (!canvas || !formEl) return
    cancelAnimationFrame(rafRef.current)

    const ctx = canvas.getContext('2d') as any
    if (!ctx?.drawElementImage) {
      addLog('✗ ctx.drawElementImage not available — enable chrome://flags/#canvas-draw-element in Chrome 148+')
      return
    }

    setIsRunning(true)
    addLog('▶ Running HTML-in-Canvas 2D mode')

    // Step 1: Add layoutsubtree attribute
    canvas.setAttribute('layoutsubtree', '')
    addLog('✓ layoutsubtree attribute set on <canvas>')

    // Step 3: Size canvas to device pixel ratio
    const dpr = window.devicePixelRatio || 1
    canvas.width  = canvas.clientWidth  * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.scale(dpr, dpr)
    addLog(`✓ Canvas sized to ${canvas.width}×${canvas.height} (DPR ${dpr})`)

    let angle = 0
    const paint = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      // Background
      ctx.fillStyle = '#0a0a10'
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      // Rotating gradient ring (pure 2D context, behind the DOM element)
      ctx.save()
      ctx.translate(canvas.clientWidth / 2, canvas.clientHeight / 2)
      ctx.rotate(angle)
      const grad = ctx.createLinearGradient(-80, 0, 80, 0)
      grad.addColorStop(0, 'rgba(167,139,250,0.6)')
      grad.addColorStop(1, 'rgba(96,165,250,0.6)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(0, 0, 80, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      angle += 0.02

      // Step 2: Draw the DOM element INTO the canvas
      const transform = ctx.drawElementImage(formEl, canvas.clientWidth / 2 - 100, canvas.clientHeight / 2 - 50)

      // Step 3: Apply transform so browser knows element's screen position (for events)
      if (transform) {
        formEl.style.transform = transform.toString()
        addLog(`✓ transform applied: ${transform.toString().slice(0, 40)}…`)
      }
    }

    // canvas.onpaint fires whenever the element redraws (input, focus, hover, etc.)
    ;(canvas as any).onpaint = paint
    addLog('✓ canvas.onpaint handler registered')

    // Kick off first render
    paint()
  }, [])

  const stopDemo = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setIsRunning(false)
    const canvas = canvasRef.current
    if (canvas) (canvas as any).onpaint = null
    addLog('■ Demo stopped')
  }, [])

  return (
    <div>
      <SectionHeader
        icon={<FlaskConical size={20} />}
        title="HTML-in-Canvas API"
        subtitle="Chrome Origin Trial — Chrome 148+ · chrome://flags/#canvas-draw-element · ctx.drawElementImage() / texElementImage2D / copyElementImageToTexture"
        badge="Experimental"
      />

      {/* Support indicator */}
      <div className={`vl-support-banner ${supported === true ? 'ok' : supported === false ? 'warn' : 'neutral'}`}>
        {supported === true  && <><Check size={15} /> HTML-in-Canvas API detected in this browser</>}
        {supported === false && <><AlertCircle size={15} /> Not detected — enable chrome://flags/#canvas-draw-element in Chrome 148+</>}
        {supported === null  && <><Info size={15} /> Checking browser support…</>}
      </div>

      {/* What is this? */}
      <div className="vl-hic-explainer">
        <h3>What is the HTML-in-Canvas API?</h3>
        <p>
          A new Chrome experiment (origin trial, Chrome 148–150) that lets you draw DOM content
          directly into a 2D canvas or WebGL/WebGPU texture while keeping it <strong>interactive,
          accessible, and indexable</strong>. No more choosing between DOM richness and canvas performance.
        </p>
        <div className="vl-hic-grid">
          <div className="vl-hic-col">
            <h4>Three shapes</h4>
            {[
              { api: 'ctx.drawElementImage(el, x, y)', ctx: '2D Canvas' },
              { api: 'gl.texElementImage2D(target, …, el)', ctx: 'WebGL' },
              { api: 'device.queue.copyElementImageToTexture(el, …)', ctx: 'WebGPU' },
            ].map(({ api, ctx }) => (
              <div key={api} className="vl-hic-api-row">
                <code>{api}</code>
                <span className="vl-badge">{ctx}</span>
              </div>
            ))}
          </div>
          <div className="vl-hic-col">
            <h4>What you get for free</h4>
            {[
              'Text selection & copy/paste inside 3D scenes',
              'Find-in-page (Ctrl+F) searches canvas text',
              'Screen reader / accessibility tree',
              'Browser extensions (translate, autofill)',
              'DevTools inspector for WebGL textures',
              'AI agent & crawler indexability',
            ].map(f => (
              <div key={f} className="vl-feature-item"><Check size={11} color="#4ade80" /> {f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Three phases explained */}
      <div className="vl-hic-steps">
        <h3>Three phases (per Google's docs)</h3>
        <div className="vl-step">
          <span className="vl-step-num">1</span>
          <div>
            <strong>Canvas setup</strong> — add <code>layoutsubtree</code> attribute to <code>&lt;canvas&gt;</code>,
            resize to device pixel ratio via <code>ResizeObserver</code>
          </div>
        </div>
        <div className="vl-step">
          <span className="vl-step-num">2</span>
          <div>
            <strong>Render DOM into canvas</strong> — call <code>ctx.drawElementImage(domElement, x, y)</code>
            inside <code>canvas.onpaint</code> (fires on repaint). For WebGL: <code>gl.texElementImage2D()</code>.
            For WebGPU: <code>device.queue.copyElementImageToTexture()</code>
          </div>
        </div>
        <div className="vl-step">
          <span className="vl-step-num">3</span>
          <div>
            <strong>Sync CSS transform</strong> — apply the return value of <code>drawElementImage()</code>
            to <code>element.style.transform</code> so the browser maps click/hover zones correctly
          </div>
        </div>
      </div>

      {/* Live demo */}
      <DemoCard
        title="Live 2D Context Demo — Form element rendered into canvas"
        status={supported ? 'ok' : 'warn'}
        note="Requires Chrome 148+ with chrome://flags/#canvas-draw-element enabled"
      >
        <div className="vl-hic-demo">
          {/* The DOM element that gets drawn INTO the canvas */}
          <div
            ref={formRef}
            className="vl-hic-form"
            style={{ position: 'absolute', zIndex: -1, pointerEvents: isRunning ? 'auto' : 'none' }}
          >
            <label>Name</label>
            <input type="text" placeholder="Type here (stays interactive!)" defaultValue="Arkzen" />
            <label>Role</label>
            <select defaultValue="dev">
              <option value="dev">Developer</option>
              <option value="designer">Designer</option>
            </select>
          </div>

          {/* The canvas that receives the drawn DOM */}
          <canvas
            ref={canvasRef}
            className="vl-hic-canvas"
            style={{ width: '100%', height: 220 }}
          />

          <div className="vl-hic-controls">
            <div className="vl-mode-tabs">
              {(['2d', 'webgl', 'webgpu'] as const).map(m => (
                <button
                  key={m}
                  className={`vl-tab ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            {!isRunning
              ? <button className="vl-action-btn" onClick={run2D} disabled={mode !== '2d'}>
                  ▶ Run {mode.toUpperCase()} Demo
                </button>
              : <button className="vl-action-btn danger" onClick={stopDemo}>■ Stop</button>
            }
          </div>

          {/* PlayCanvas note */}
          {mode === 'webgl' && (
            <div className="vl-script-note">
              <Info size={13} />
              <span>
                PlayCanvas ships native HTML-in-Canvas support via <code>htmlTexture.setSource(domElement)</code> + the <code>paint</code> event.
                See <code>PlayCanvasSection</code> above — <code>canvas.addEventListener('paint', () =&gt; htmlTexture.setSource(el))</code>
              </span>
            </div>
          )}
          {mode === 'webgpu' && (
            <div className="vl-script-note">
              <Info size={13} />
              <span>
                WebGPU variant: <code>device.queue.copyElementImageToTexture(domElement, {'{ texture: targetTexture }'})</code>
                — analogous to <code>copyExternalImageToTexture</code>
              </span>
            </div>
          )}

          {/* Debug log */}
          <div className="vl-log">
            {log.map((l, i) => <div key={i} className="vl-log-line">{l}</div>)}
          </div>
        </div>
      </DemoCard>

      {/* Limitations */}
      <div className="vl-hic-limits">
        <h4>Known Limitations</h4>
        <div className="vl-feature-item"><AlertCircle size={12} color="#facc15" /> Cross-origin iframes: not supported (security)</div>
        <div className="vl-feature-item"><AlertCircle size={12} color="#facc15" /> Scrolling is JS-driven — no off-thread scroll like normal DOM</div>
        <div className="vl-feature-item"><Info size={12} color="#60a5fa" /> Only Chrome 148–150 origin trial for now (May 2026)</div>
        <div className="vl-feature-item"><Info size={12} color="#60a5fa" /> Three.js THREE.HTMLTexture and PlayCanvas htmlTexture already ship support</div>
      </div>
    </div>
  )
}
