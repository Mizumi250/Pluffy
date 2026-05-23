'use client'
// ============================================================
// ARKZEN GENERATED PAGE — certflow/dashboard
// Layout: auth | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T23:45:57.666Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { gsap } from 'gsap'
import { CheckCircle2, ClipboardList, Clock, Copy, FolderOpen, Frown, GraduationCap, LayoutTemplate, Link2, LogOut, Mail, Menu, PartyPopper, ScanLine, Trash2, Upload, UploadCloud, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'
import { certflowAnimations, pageVariants } from '@/arkzen/generated/certflow.animations'

// Utilities, types, and helper functions from @arkzen:components
if (typeof window !== 'undefined') {
  setActiveTatemono('certflow')
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type FieldDef = {
  id: number
  template_id: number
  label: string
  field_type: 'text' | 'date' | 'email' | 'number'
  placeholder: string | null
  x: number
  y: number
  width: number
  height: number
  font_size: number
  font_family: string
  font_weight: string
  font_style: string
  text_align: 'left' | 'center' | 'right'
  color: string
  layer_order: number
  is_required: boolean
}

export type Template = {
  id: number
  name: string
  description: string | null
  file_path: string
  file_type: 'png' | 'pdf'
  global_font: string
  is_default: boolean
  link_token: string | null
  fields?: FieldDef[]
}

export type Submission = {
  id: number
  template_id: number
  submission_token: string
  form_data: string
  recipient_email: string | null
  qr_code: string | null
  email_sent: boolean
  email_sent_at: string | null
  created_at: string
}

export type Scan = {
  id: number
  submission_id: number
  scanned_at: string
  ip_address: string | null
}

// ─── STORE ────────────────────────────────────────────────────────────────────

type AdminStore = {
  templates: Template[]
  submissions: Submission[]
  scans: Scan[]
  selectedTemplate: Template | null
  selectedField: FieldDef | null
  activeTab: 'templates' | 'submissions' | 'scans'
  setTemplates: (t: Template[]) => void
  setSubmissions: (s: Submission[]) => void
  setScans: (s: Scan[]) => void
  setSelectedTemplate: (t: Template | null) => void
  setSelectedField: (f: FieldDef | null) => void
  setActiveTab: (tab: 'templates' | 'submissions' | 'scans') => void
  updateFieldInTemplate: (field: FieldDef) => void
  addFieldToTemplate: (field: FieldDef) => void
  removeFieldFromTemplate: (fieldId: number) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  templates: [],
  submissions: [],
  scans: [],
  selectedTemplate: null,
  selectedField: null,
  activeTab: 'templates',
  setTemplates: (templates) => set({ templates }),
  setSubmissions: (submissions) => set({ submissions }),
  setScans: (scans) => set({ scans }),
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate, selectedField: null }),
  setSelectedField: (selectedField) => set({ selectedField }),
  setActiveTab: (activeTab) => set({ activeTab }),
  updateFieldInTemplate: (field) =>
    set((state) => ({
      selectedTemplate: state.selectedTemplate
        ? { ...state.selectedTemplate, fields: state.selectedTemplate.fields?.map((f) => (f.id === field.id ? field : f)) }
        : null,
      selectedField: state.selectedField?.id === field.id ? field : state.selectedField,
    })),
  addFieldToTemplate: (field) =>
    set((state) => ({
      selectedTemplate: state.selectedTemplate
        ? { ...state.selectedTemplate, fields: [...(state.selectedTemplate.fields || []), field] }
        : null,
    })),
  removeFieldFromTemplate: (fieldId) =>
    set((state) => ({
      selectedTemplate: state.selectedTemplate
        ? { ...state.selectedTemplate, fields: state.selectedTemplate.fields?.filter((f) => f.id !== fieldId) }
        : null,
      selectedField: state.selectedField?.id === fieldId ? null : state.selectedField,
    })),
}))

// ─── TOAST ────────────────────────────────────────────────────────────────────

type Toast = { id: string; msg: string; type: 'ok' | 'err' }

type ToastStore = {
  toasts: Toast[]
  push: (msg: string, type?: 'ok' | 'err') => void
  pop: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (msg, type = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500)
  },
  pop: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// ─── TOAST UI ─────────────────────────────────────────────────────────────────

export const ToastStack = () => {
  const { toasts } = useToastStore()
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{
              background: t.type === 'ok' ? 'rgba(16,185,129,0.92)' : 'rgba(239,68,68,0.92)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              pointerEvents: 'auto',
            }}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── GOOGLE FONTS ─────────────────────────────────────────────────────────────

export const FONT_OPTIONS = [
  'Inter', 'Playfair Display', 'Montserrat', 'Georgia',
  'Lato', 'Roboto', 'Merriweather', 'Open Sans',
  'Oswald', 'Raleway', 'Cinzel', 'Dancing Script',
]

export const loadGoogleFont = (font: string) => {
  if (typeof document === 'undefined') return
  const slug = font.replace(/ /g, '+')
  const id   = 'gf-' + slug
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id   = id
    link.rel  = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${slug}:wght@400;700&display=swap`
    document.head.appendChild(link)
  }
}

// ─── COPY UTIL ────────────────────────────────────────────────────────────────

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard) navigator.clipboard.writeText(text)
  else {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

// ─── CANVAS BUILDER ───────────────────────────────────────────────────────────

type CanvasBuilderProps = {
  template: import('./shared').Template
  fields: import('./shared').FieldDef[]
  selectedFieldId: number | null
  onSelectField: (id: number | null) => void
  onFieldMove: (id: number, x: number, y: number) => void
  onAddField: (x: number, y: number) => void
}

export const CanvasBuilder = ({
  template,
  fields,
  selectedFieldId,
  onSelectField,
  onFieldMove,
  onAddField,
}: CanvasBuilderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef       = useRef<HTMLImageElement>(null)
  const [imgDims, setImgDims]     = useState({ w: 800, h: 566 })
  const [scale, setScale]         = useState(1)
  const draggingRef               = useRef<{ id: number; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const movedRef                  = useRef(false)

  useEffect(() => {
    loadGoogleFont(template.global_font)
    fields.forEach((f) => loadGoogleFont(f.font_family))
  }, [template, fields])

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && imgDims.w > 0) {
        const cw = containerRef.current.clientWidth - 2
        setScale(Math.min(1, cw / imgDims.w))
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [imgDims.w])

  const onImgLoad = () => {
    if (imgRef.current) {
      setImgDims({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight })
    }
  }

  const toCanvasCoords = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      x: Math.round((e.clientX - rect.left) / scale),
      y: Math.round((e.clientY - rect.top) / scale),
    }
  }

  const onMouseDown = (e: React.MouseEvent, fieldId: number) => {
    e.stopPropagation()
    const { x, y } = toCanvasCoords(e)
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return
    draggingRef.current = { id: fieldId, startX: x, startY: y, origX: field.x, origY: field.y }
    movedRef.current    = false
    e.preventDefault()
  }

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingRef.current) return
      const { x, y } = toCanvasCoords(e)
      const dx = x - draggingRef.current.startX
      const dy = y - draggingRef.current.startY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true
      if (movedRef.current) {
        onFieldMove(
          draggingRef.current.id,
          Math.max(0, draggingRef.current.origX + dx),
          Math.max(0, draggingRef.current.origY + dy)
        )
      }
    },
    [onFieldMove]
  )

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (draggingRef.current) {
        if (!movedRef.current) onSelectField(draggingRef.current.id)
        draggingRef.current = null
        movedRef.current    = false
      }
    },
    [onSelectField]
  )

  const onCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target === containerRef.current || target === imgRef.current) {
      onSelectField(null)
    }
  }

  const onCanvasDblClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target === containerRef.current || target === imgRef.current) {
      const { x, y } = toCanvasCoords(e)
      onAddField(x, y)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: Math.round(imgDims.h * scale),
        overflow: 'hidden',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        cursor: 'crosshair',
        userSelect: 'none',
        background: 'rgba(255,255,255,0.6)',
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onCanvasClick}
      onDoubleClick={onCanvasDblClick}
    >
      {/* Template image */}
      <img
        ref={imgRef}
        src={template.file_path}
        alt={template.name}
        onLoad={onImgLoad}
        draggable={false}
        style={{
          width: imgDims.w * scale,
          height: imgDims.h * scale,
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Fields overlay */}
      {fields.map((field) => {
        const isSelected = field.id === selectedFieldId
        return (
          <div
            key={field.id}
            onMouseDown={(e) => onMouseDown(e, field.id)}
            style={{
              position: 'absolute',
              left:   field.x * scale,
              top:    field.y * scale,
              width:  field.width * scale,
              height: field.height * scale,
              border: isSelected
                ? '2px solid #6366f1'
                : '1.5px dashed rgba(99,102,241,0.4)',
              borderRadius: 6,
              background: isSelected
                ? 'rgba(99,102,241,0.1)'
                : 'rgba(99,102,241,0.05)',
              cursor: 'grab',
              boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
              transition: 'border 0.15s, background 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: field.text_align === 'left' ? 'flex-start' : field.text_align === 'right' ? 'flex-end' : 'center',
            }}
          >
            <span
              style={{
                fontFamily: field.font_family,
                fontSize:   field.font_size * scale,
                fontWeight: field.font_weight,
                fontStyle:  field.font_style,
                color:      field.color,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                overflow:   'hidden',
                padding:    '0 4px',
                textAlign:  field.text_align,
                width:      '100%',
              }}
            >
              {field.label}
            </span>
            {isSelected && (
              <div style={{
                position: 'absolute',
                top: -20,
                left: 0,
                background: '#6366f1',
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                letterSpacing: 0.5,
              }}>
                {field.label}
              </div>
            )}
          </div>
        )
      })}

      {/* Hint */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        fontSize: 11,
        padding: '5px 12px',
        borderRadius: 20,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        opacity: fields.length === 0 ? 1 : 0.5,
      }}>
        Double-click to add field • Click to select • Drag to move
      </div>
    </div>
  )
}

// ─── PROPERTY PANEL ───────────────────────────────────────────────────────────

export const PropertyPanel = ({
  field,
  globalFont,
  onUpdate,
  onDelete,
}: {
  field: import('./shared').FieldDef
  globalFont: string
  onUpdate: (updates: Partial<import('./shared').FieldDef>) => void
  onDelete: () => void
}) => {
  const [localField, setLocal] = useState(field)

  React.useEffect(() => {
    setLocal(field)
    loadGoogleFont(field.font_family)
  }, [field.id])

  const update = (key: string, value: any) => {
    const updated = { ...localField, [key]: value }
    setLocal(updated as any)
    onUpdate({ [key]: value })
    if (key === 'font_family') loadGoogleFont(value)
  }

  const row: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }
  const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }
  const input: React.CSSProperties = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 10px',
    color: '#0f172a',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }
  const select = input
  const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }

  return (
    <div style={{ padding: '16px 16px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Field Properties
      </div>

      <div style={row}>
        <span style={label}>Label</span>
        <input style={input} value={localField.label} onChange={(e) => update('label', e.target.value)} />
      </div>

      <div style={row}>
        <span style={label}>Type</span>
        <select style={select} value={localField.field_type} onChange={(e) => update('field_type', e.target.value)}>
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="date">Date</option>
          <option value="number">Number</option>
        </select>
      </div>

      <div style={row}>
        <span style={label}>Placeholder</span>
        <input style={input} value={localField.placeholder ?? ''} onChange={(e) => update('placeholder', e.target.value)} />
      </div>

      <div style={row2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={label}>X</span>
          <input style={input} type="number" value={localField.x} onChange={(e) => update('x', parseInt(e.target.value) || 0)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={label}>Y</span>
          <input style={input} type="number" value={localField.y} onChange={(e) => update('y', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div style={row2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={label}>Width</span>
          <input style={input} type="number" value={localField.width} onChange={(e) => update('width', parseInt(e.target.value) || 100)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={label}>Height</span>
          <input style={input} type="number" value={localField.height} onChange={(e) => update('height', parseInt(e.target.value) || 36)} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={label}>Font Family</span>
        <div style={{ marginTop: 4 }}>
          <select style={select} value={localField.font_family} onChange={(e) => update('font_family', e.target.value)}>
            {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div style={row2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={label}>Size (px)</span>
          <input style={input} type="number" value={localField.font_size} onChange={(e) => update('font_size', parseInt(e.target.value) || 16)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={label}>Color</span>
          <input style={{ ...input, padding: '4px 8px', height: 36, cursor: 'pointer' }} type="color" value={localField.color} onChange={(e) => update('color', e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={label}>Weight</span>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {[['normal', 'Regular'], ['bold', 'Bold']].map(([v, l]) => (
            <button key={v} onClick={() => update('font_weight', v)} style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              background: localField.font_weight === v ? '#6366f1' : '#e2e8f0',
              color: localField.font_weight === v ? '#fff' : '#0f172a',
              transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={label}>Align</span>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {[['left', '←'], ['center', '↔'], ['right', '→']].map(([v, l]) => (
            <button key={v} onClick={() => update('text_align', v)} style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              background: localField.text_align === v ? '#6366f1' : '#e2e8f0',
              color: localField.text_align === v ? '#fff' : '#0f172a',
              transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span style={label}>Required</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <button onClick={() => update('is_required', !localField.is_required)} style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            border: 'none',
            cursor: 'pointer',
            background: localField.is_required ? '#6366f1' : '#cbd5e1',
            position: 'relative',
            transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute',
              top: 3,
              left: localField.is_required ? 20 : 3,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontSize: 12, color: '#64748b' }}>{localField.is_required ? 'Required' : 'Optional'}</span>
        </div>
      </div>

      <button onClick={onDelete} style={{
        width: '100%',
        padding: '10px',
        borderRadius: 10,
        border: '1px solid #fecaca',
        background: '#fef2f2',
        color: '#ef4444',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}>
        <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Delete Field
      </button>
    </div>
  )
}

// ─── LAYERS PANEL ─────────────────────────────────────────────────────────────

export const LayersPanel = ({
  fields,
  selectedFieldId,
  onSelect,
  onReorder,
}: {
  fields: import('./shared').FieldDef[]
  selectedFieldId: number | null
  onSelect: (id: number) => void
  onReorder: (fromIdx: number, toIdx: number) => void
}) => {
  const sorted = [...fields].sort((a, b) => b.layer_order - a.layer_order)

  return (
    <div style={{ padding: '16px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Layers ({fields.length})
      </div>
      {sorted.length === 0 && (
        <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingTop: 24 }}>
          No fields yet.<br />Double-click canvas to add.
        </div>
      )}
      {sorted.map((f, i) => (
        <div
          key={f.id}
          onClick={() => onSelect(f.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 8,
            marginBottom: 4,
            background: selectedFieldId === f.id ? 'rgba(99,102,241,0.1)' : '#f8fafc',
            border: selectedFieldId === f.id ? '1px solid #6366f1' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.12s',
          }}
        >
          <span style={{ fontSize: 10, color: '#64748b', minWidth: 14 }}>{i + 1}</span>
          <span style={{ flex: 1, fontSize: 12, color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {f.label}
          </span>
          <span style={{ fontSize: 10, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
            {f.field_type}
          </span>
        </div>
      ))}
    </div>
  )
}

// Page component code (from @arkzen:page:dashboard)
const DashboardPage = () => {
  const { user, logout } = useAuthStore()
  const router           = useRouter()
  const { push: toast }  = useToastStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {
    templates, submissions, scans,
    selectedTemplate, selectedField, activeTab,
    setTemplates, setSubmissions, setScans,
    setSelectedTemplate, setSelectedField, setActiveTab,
    updateFieldInTemplate, addFieldToTemplate, removeFieldFromTemplate,
  } = useAdminStore()

  const [uploading, setUploading]         = useState(false)
  const [uploadName, setUploadName]       = useState('')
  const [uploadFile, setUploadFile]       = useState<File | null>(null)
  const [showUpload, setShowUpload]       = useState(false)
  const [savingField, setSavingField]     = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const headerRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    FONT_OPTIONS.forEach(loadGoogleFont)
    if (headerRef.current) gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    loadAll()
  }, [])

  useEffect(() => {
    if (selectedTemplate) setGeneratedLink(null)
  }, [selectedTemplate?.id])

  const loadAll = async () => {
    try {
      const [tr, sb, sc] = await Promise.all([
        arkzenFetch('/api/certflow/templates').then((r) => r.json()),
        arkzenFetch('/api/certflow/submissions').then((r) => r.json()),
        arkzenFetch('/api/certflow/scans').then((r) => r.json()),
      ])
      setTemplates(tr.data ?? [])
      setSubmissions(sb.data ?? [])
      setScans(sc.data ?? [])
    } catch {
      toast('Failed to load data', 'err')
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) { toast('Name and file required', 'err'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', uploadFile)
    fd.append('name', uploadName)
    try {
      const res = await fetch('/api/certflow/templates/upload', { method: 'POST', body: fd, headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTemplates([data.template, ...templates])
      setShowUpload(false)
      setUploadName('')
      setUploadFile(null)
      toast('Template uploaded!', 'ok')
    } catch {
      toast('Upload failed', 'err')
    }
    setUploading(false)
  }

  const handleSelectTemplate = async (t: Template) => {
    setSelectedTemplate(t)
    if (!t.fields || t.fields.length === 0) {
      const res  = await arkzenFetch(`/api/certflow/templates/${t.id}`)
      const data = await res.json()
      setSelectedTemplate(data.data)
    }
  }

  const handleFieldMove = useCallback(async (id: number, x: number, y: number) => {
    updateFieldInTemplate({ ...selectedTemplate!.fields!.find((f) => f.id === id)!, x, y })
    await arkzenFetch(`/api/certflow/fields/${id}`, { method: 'PUT', body: JSON.stringify({ x, y }) })
  }, [selectedTemplate, updateFieldInTemplate])

  const handleAddField = async (x: number, y: number) => {
    if (!selectedTemplate) return
    try {
      const res  = await arkzenFetch('/api/certflow/fields', {
        method: 'POST',
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          label:       'New Field',
          x, y,
          width:       200,
          height:      44,
          font_family: selectedTemplate.global_font,
          font_size:   18,
          layer_order: (selectedTemplate.fields?.length ?? 0),
        }),
      })
      const data = await res.json()
      addFieldToTemplate(data.data)
      setSelectedField(data.data)
      toast('Field added!', 'ok')
    } catch {
      toast('Failed to add field', 'err')
    }
  }

  const handleFieldUpdate = async (updates: Partial<FieldDef>) => {
    if (!selectedField) return
    setSavingField(true)
    try {
      const res  = await arkzenFetch(`/api/certflow/fields/${selectedField.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      updateFieldInTemplate(data.data)
    } catch {}
    setSavingField(false)
  }

  const handleFieldDelete = async () => {
    if (!selectedField) return
    await arkzenFetch(`/api/certflow/fields/${selectedField.id}`, { method: 'DELETE' })
    removeFieldFromTemplate(selectedField.id)
    setSelectedField(null)
    toast('Field removed', 'ok')
  }

  const handleGenerateLink = async () => {
    if (!selectedTemplate) return
    const res  = await arkzenFetch(`/api/certflow/templates/${selectedTemplate.id}/generate-link`, { method: 'POST' })
    const data = await res.json()
    setGeneratedLink(data.link)
    copyToClipboard(data.link)
    toast('Link copied to clipboard!', 'ok')
  }

  const handleUpdateGlobalFont = async (font: string) => {
    if (!selectedTemplate) return
    loadGoogleFont(font)
    const res  = await arkzenFetch(`/api/certflow/templates/${selectedTemplate.id}`, { method: 'PUT', body: JSON.stringify({ global_font: font }) })
    const data = await res.json()
    setSelectedTemplate(data.data)
    toast('Global font updated', 'ok')
  }

  const handleDeleteTemplate = async (id: number) => {
    await arkzenFetch(`/api/certflow/templates/${id}`, { method: 'DELETE' })
    setTemplates(templates.filter((t) => t.id !== id))
    if (selectedTemplate?.id === id) setSelectedTemplate(null)
    toast('Template deleted', 'ok')
  }

  const handleLogout = async () => {
    await logout()
    router.push('/certflow/login')
  }

  const glassCard = {
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
  }

  const navItems = [
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'submissions', label: 'Submissions', icon: ClipboardList },
    { id: 'scans', label: 'Scans', icon: ScanLine },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eaf3fa 0%, #f5e8fe 100%)', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: '5%', left: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <ToastStack />

          {/* HEADER - transparent, bold text on left, round glass hamburger on right */}
    <div ref={headerRef} style={{ 
      position: 'sticky', top: 0, zIndex: 100, 
      padding: '0 24px', height: 70, 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      background: 'transparent' 
    }}>
      {/* Left side: bold text */}
      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: -0.3 }}>
        Certificate Automation
      </div>
    
      {/* Right side: round glass hamburger button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.9)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.65)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        }}
      >
        <Menu size={22} color="#0f172a" />
      </button>
    </div>

      {/* DRAWER (Hamburger menu side drawer) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 200 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 280, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)', zIndex: 201, display: 'flex', flexDirection: 'column', padding: '24px 16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>
              <div style={{ marginBottom: 32, paddingLeft: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 }}>Menu</div>
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any)
                        setIsMenuOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        width: '100%',
                        padding: '12px 12px',
                        borderRadius: 12,
                        border: 'none',
                        background: activeTab === item.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: activeTab === item.id ? '#6366f1' : '#334155',
                        fontSize: 14,
                        fontWeight: activeTab === item.id ? 600 : 500,
                        cursor: 'pointer',
                        marginBottom: 4,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { if (activeTab !== item.id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)' }}
                      onMouseLeave={(e) => { if (activeTab !== item.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 32, borderTop: '1px solid rgba(0,0,0,0.06)', marginLeft: 12, marginRight: 12 }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 12px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div style={{ position: 'relative', zIndex: 5, padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedTemplate ? '260px 1fr 280px' : '1fr', gap: 20 }}>
            {/* Left: template list */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Templates ({templates.length})</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowUpload(true)}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  + Upload
                </motion.button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {templates.map((t) => (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => handleSelectTemplate(t)}
                    style={{
                      ...glassCard,
                      padding: '14px 16px',
                      cursor: 'pointer',
                      border: selectedTemplate?.id === t.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.8)',
                      background: selectedTemplate?.id === t.id ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <div style={{ width: '100%', height: 80, borderRadius: 10, overflow: 'hidden', marginBottom: 10, background: '#f1f5f9' }}>
                      <img src={t.file_path} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{t.fields?.length ?? 0} fields</span>
                      {t.is_default && <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>DEFAULT</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Center: canvas */}
            {selectedTemplate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ ...glassCard, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, flex: 1, color: '#0f172a' }}>{selectedTemplate.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Global Font:</span>
                    <select
                      value={selectedTemplate.global_font}
                      onChange={(e) => handleUpdateGlobalFont(e.target.value)}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', color: '#0f172a', fontSize: 12, cursor: 'pointer', outline: 'none' }}
                    >
                      {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGenerateLink}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Link2 size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} /> Generate Link
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '8px 14px', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete
                  </motion.button>
                </div>
                {generatedLink && (
                  <div style={{ ...glassCard, padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle2 size={13} /> Client Link (copied to clipboard)</div>
                    <div style={{ fontSize: 12, color: '#334155', wordBreak: 'break-all', fontFamily: 'monospace' }}>{generatedLink}</div>
                  </div>
                )}
                <CanvasBuilder
                  template={selectedTemplate}
                  fields={selectedTemplate.fields ?? []}
                  selectedFieldId={selectedField?.id ?? null}
                  onSelectField={(id) => {
                    if (id === null) setSelectedField(null)
                    else setSelectedField(selectedTemplate.fields?.find((f) => f.id === id) ?? null)
                  }}
                  onFieldMove={handleFieldMove}
                  onAddField={handleAddField}
                />
                <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>
                  {selectedTemplate.fields?.length ?? 0} field{(selectedTemplate.fields?.length ?? 0) !== 1 ? 's' : ''} placed
                </div>
              </div>
            )}

            {/* Right: panels */}
            {selectedTemplate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ ...glassCard, overflow: 'hidden' }}>
                  <LayersPanel
                    fields={selectedTemplate.fields ?? []}
                    selectedFieldId={selectedField?.id ?? null}
                    onSelect={(id) => setSelectedField(selectedTemplate.fields?.find((f) => f.id === id) ?? null)}
                    onReorder={() => {}}
                  />
                </div>
                {selectedField && (
                  <div style={{ ...glassCard, overflow: 'hidden' }}>
                    <PropertyPanel
                      field={selectedField}
                      globalFont={selectedTemplate.global_font}
                      onUpdate={handleFieldUpdate}
                      onDelete={handleFieldDelete}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#0f172a' }}>Submissions ({submissions.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {submissions.map((s) => {
                const fd = (() => { try { return JSON.parse(s.form_data) } catch { return {} } })()
                return (
                  <motion.div key={s.id} whileHover={{ y: -4 }} style={{ ...glassCard, padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={16} color="#fff" /></div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Submission #{s.id}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(s.created_at).toLocaleString()}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: 10, padding: '3px 8px', borderRadius: 6, background: s.email_sent ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: s.email_sent ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                        {s.email_sent ? <><Mail size={11} style={{ marginRight: 3 }} /> Sent</> : <><Clock size={11} style={{ marginRight: 3 }} /> Pending</>}
                      </span>
                    </div>
                    {s.recipient_email && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>📧 {s.recipient_email}</div>}
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                      {Object.entries(fd).slice(0, 4).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: '#64748b', minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>{k}</span>
                          <span style={{ fontSize: 11, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                    {s.qr_code && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={s.qr_code} alt="QR" style={{ width: 48, height: 48, borderRadius: 8 }} />
                        <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.submission_token.slice(0, 20)}…</div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
              {submissions.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', paddingTop: 60, fontSize: 14 }}>
                  No submissions yet. Share a template link to get started!
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCANS TAB */}
        {activeTab === 'scans' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#0f172a' }}>QR Scans ({scans.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scans.map((sc) => (
                <motion.div key={sc.id} whileHover={{ x: 4 }} style={{ ...glassCard, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ScanLine size={16} color="#fff" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Submission #{sc.submission_id}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(sc.scanned_at).toLocaleString()}</div>
                  </div>
                  {sc.ip_address && <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{sc.ip_address}</div>}
                </motion.div>
              ))}
              {scans.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: 60, fontSize: 14 }}>
                  No scans yet. QR codes from submitted certificates will appear here.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false) }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: '36px 32px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: '#0f172a' }}>Upload Template</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7 }}>Template Name</label>
                <input
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="e.g. Employee of the Month"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7 }}>File (PNG, JPG, PDF)</label>
                <div
                  onClick={() => document.getElementById('file-input')?.click()}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: uploadFile ? '#f1f5f9' : '#f8fafc',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{uploadFile ? <CheckCircle2 size={32} color="#10b981" /> : <FolderOpen size={32} color="#94a3b8" />}</div>
                  <div style={{ fontSize: 13, color: uploadFile ? '#0f172a' : '#64748b' }}>
                    {uploadFile ? uploadFile.name : 'Click to select file'}
                  </div>
                  <input id="file-input" type="file" accept=".png,.jpg,.jpeg,.pdf" style={{ display: 'none' }} onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowUpload(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
                >
                  {uploading ? 'Uploading…' : 'Upload Template'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Certflow_Dashboard = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = certflowAnimations(pageRef)
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

export default ArkzenPage_Certflow_Dashboard
