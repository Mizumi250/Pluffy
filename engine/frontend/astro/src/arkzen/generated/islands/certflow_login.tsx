// ============================================================
// ARKZEN GENERATED ISLAND — certflow/login
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T10:38:26.651Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { gsap } from 'gsap'
import { CheckCircle2, ClipboardList, Clock, Copy, FolderOpen, Frown, GraduationCap, LayoutTemplate, Link2, LogOut, Mail, Menu, PartyPopper, ScanLine, Trash2, Upload, UploadCloud, X, XCircle } from 'lucide-react'
import { create } from 'zustand'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { certflowAnimations, pageVariants } from '@/arkzen/generated/certflow.animations'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'

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

// Page component code (from @arkzen:page:login)
const LoginPage = () => {
  const { login, isLoading } = useAuthStore()
  const router = useArkzenRouter()
  const { push: toast } = useToastStore()
  const [email, setEmail]       = useState('admin@certflow.com')
  const [password, setPassword] = useState('certflow123')
  const [error, setError]       = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    FONT_OPTIONS.slice(0, 3).forEach(loadGoogleFont)
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 32, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' })
    }
    if (logoRef.current) {
      gsap.fromTo(logoRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 })
    }
  }, [])

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
      toast('Welcome back!', 'ok')
      router.push('/certflow/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eaf3fa 0%, #f5e8fe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <ToastStack />

      {/* Logo */}
      <div ref={logoRef} style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}>
          <GraduationCap size={28} color="#6366f1" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5, margin: 0 }}>CertFlow</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Admin Portal</p>
      </div>

      {/* Card */}
      <div ref={cardRef} style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        padding: '36px 32px',
      }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: '0 0 22px' }}>Sign in</h2>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={14} />
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Email</label>
          <input
            style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #6366f1' }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #e2e8f0' }}
          />
        </div>

        <div style={{ marginBottom: 26 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Password</label>
          <input
            style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #6366f1' }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.border = '1px solid #e2e8f0' }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            transition: 'opacity 0.2s',
          }}
        >
          {isLoading ? 'Signing in…' : 'Sign in →'}
        </motion.button>

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 18, fontFamily: 'monospace' }}>
          admin@certflow.com · certflow123
        </p>
      </div>
    </div>
  )
}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_Certflow_Login = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = certflowAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <GuestLayout guestOnly={true}>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <LoginPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenIsland_Certflow_Login
