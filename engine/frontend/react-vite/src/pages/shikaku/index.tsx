// ============================================================
// ARKZEN GENERATED PAGE — shikaku/index [React+Vite]
// Layout: +auth | Auth: true | Guest: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T01:17:01.466Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'
import { shikakuAnimations, pageVariants } from '@/arkzen/generated/shikaku.animations'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { CanvasEngine } from './components/CanvasEngine'
import { LayerPanel } from './components/LayerPanel'
import { PICO8_PALETTE } from './components/PICO8_PALETTE'
import { PalettePanel } from './components/PalettePanel'
import { SWEETIE16_PALETTE } from './components/SWEETIE16_PALETTE'
import { color, i, id, key, px, skFetch, target } from './components/utils'
import type { Project } from './components/types'
import { Pencil, Eraser, Pipette, Move, Square, Circle, Minus, Type, Trash2, Plus, Eye, EyeOff, Lock, Unlock, ChevronDown, Play, Pause, SkipBack, SkipForward, Undo2, Redo2, Download, Share2, Settings, ArrowLeft, Layers, Palette, Sparkles, Film, Grid3x3, FlipHorizontal, FlipVertical, RotateCcw, Copy, Crosshair, Bucket, Save, RefreshCw, Check, X } from 'lucide-react'
import { Pencil, Eraser, Bucket, Pipette, Move, Square, Minus, Type, Trash2, Plus, Eye, EyeOff, Lock, ChevronDown, Play, Pause, SkipBack, SkipForward, Undo2, Redo2, Download, Share2, ArrowLeft, Layers, Palette, Sparkles, Film, Grid3x3, FlipHorizontal, FlipVertical, Save, Check, RotateCcw } from 'lucide-react'

// ── Page component from @arkzen:page:index ─────────────────────────────
const DashboardPage = () => {
  const router = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('Untitled')
  const [newSize, setNewSize] = useState(32)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    skFetch('/api/shikaku/projects')
      .then(d => setProjects(d.data ?? d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const p = await skFetch('/api/shikaku/projects', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), width: newSize, height: newSize }),
      })
      router(`/shikaku/editor/${p.data?.id ?? p.id}`)
    } catch (e: any) {
      setError(e.message)
      setCreating(false)
    }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    try {
      await skFetch(`/api/shikaku/projects/${id}`, { method: 'DELETE' })
      setProjects(ps => ps.filter(p => p.id !== id))
    } catch {}
  }

  if (loading) {
    return (
      <div className="sk-loading">
        <div className="sk-spinner" />
        <span>Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="sk-dash">
      <header className="sk-dash-header">
        <div className="sk-logo">
          <div className="sk-logo-sq">🟦</div>
          Shikaku
        </div>
        <div className="sk-dash-actions">
          <button className="sk-btn sk-btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={14} /> New Project
          </button>
        </div>
      </header>

      <div className="sk-dash-body">
        {error && (
          <div style={{ background: '#f8717122', border: '1px solid #f8717144', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <div className="sk-dash-title">Your Projects — {projects.length}</div>

        {projects.length === 0 ? (
          <div className="sk-empty">
            <div className="sk-empty-icon">🟦</div>
            <div className="sk-empty-text">No projects yet. Create your first pixel art!</div>
            <button className="sk-btn sk-btn-primary" onClick={() => setShowNew(true)}>
              <Plus size={14} /> New Project
            </button>
          </div>
        ) : (
          <div className="sk-grid">
            {projects.map(project => (
              <div
                key={project.id}
                className="sk-project-card"
                onClick={() => router(`/shikaku/editor/${project.id}`)}
              >
                <div className="sk-project-thumb">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} />
                  ) : (
                    <div className="sk-project-thumb-empty">
                      {Array.from({ length: 64 }).map((_, i) => <span key={i} />)}
                    </div>
                  )}
                </div>
                <div className="sk-project-info">
                  <div className="sk-project-name">{project.name}</div>
                  <div className="sk-project-meta">{project.width}×{project.height}px</div>
                </div>
                <div className="sk-project-actions">
                  <button
                    className="sk-btn sk-btn-ghost sk-btn-sm"
                    style={{ flex: 1 }}
                    onClick={e => { e.stopPropagation(); router(`/shikaku/editor/${project.id}`) }}
                  >
                    Open
                  </button>
                  <button
                    className="sk-btn sk-btn-danger sk-btn-sm"
                    onClick={e => handleDelete(project.id, e)}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="sk-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="sk-modal" onClick={e => e.stopPropagation()}>
            <div className="sk-modal-title">New Project</div>

            <div className="sk-field">
              <label className="sk-label">Project Name</label>
              <input
                className="sk-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Untitled"
                autoFocus
              />
            </div>

            <div className="sk-field">
              <label className="sk-label">Canvas Size</label>
              <div className="sk-size-grid">
                {[8,16,32,64,128].map(s => (
                  <button
                    key={s}
                    className={`sk-size-btn ${newSize === s ? 'active' : ''}`}
                    onClick={() => setNewSize(s)}
                  >
                    {s}×{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="sk-modal-footer">
              <button className="sk-btn sk-btn-ghost" onClick={() => setShowNew(false)}>
                Cancel
              </button>
              <button
                className="sk-btn sk-btn-primary"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_Shikaku_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = shikakuAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <DashboardPage />
      </motion.div>
    </AuthLayout>
  )
}

export default ArkzenPage_Shikaku_Index
