'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — KonvaSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T14:14:52.345Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: KONVA ───────────────────────────────────────────────────────────
export const KonvaSection = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    import('konva').then((Konva) => {
      const K = (Konva as any).default || Konva
      if (stageRef.current) stageRef.current.destroy()

      const stage = new K.Stage({ container: mount, width: mount.clientWidth || 320, height: 220 })
      stageRef.current = stage
      const layer = new K.Layer()
      stage.add(layer)

      // Draggable star
      const star = new K.Star({
        x: 80, y: 110, numPoints: 6,
        innerRadius: 25, outerRadius: 50,
        fill: '#a78bfa', stroke: '#7c3aed', strokeWidth: 2,
        draggable: true,
        shadowBlur: 10, shadowColor: '#a78bfa',
      })

      // Draggable circle
      const circle = new K.Circle({
        x: 200, y: 110, radius: 45,
        fillRadialGradientStartPoint: { x: 0, y: 0 },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndPoint: { x: 0, y: 0 },
        fillRadialGradientEndRadius: 45,
        fillRadialGradientColorStops: [0, '#60a5fa', 1, '#7c3aed'],
        draggable: true,
        shadowBlur: 12, shadowColor: '#60a5fa',
      })

      // Rect with transform
      const rect = new K.Rect({
        x: 260, y: 80, width: 50, height: 50,
        fill: '#f472b6', cornerRadius: 8,
        draggable: true, rotation: 20,
      })

      const label = new K.Text({
        x: 10, y: 200, text: 'Drag shapes • Konva@10.3',
        fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'monospace'
      })

      layer.add(star, circle, rect, label)

      // Animate star
      const anim = new K.Animation((frame: any) => {
        star.rotation(frame.time * 0.05)
      }, layer)
      anim.start()

      return () => { anim.stop(); stage.destroy() }
    })

    return () => stageRef.current?.destroy()
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Layers size={20} />}
        title="Konva + react-konva"
        subtitle="konva@10.3 · react-konva@19 — 2D canvas stage/layer system, draggable shapes, animations"
        badge="Installed ✓"
      />
      <DemoCard title="Konva Stage — Draggable Star, Circle, Rect" status="ok" note="Stage, Layer, Star, Circle, Rect, Text, Animation — all draggable">
        <div ref={mountRef} className="vl-canvas-mount" />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: FABRIC.JS ───────────────────────────────────────────────────────
