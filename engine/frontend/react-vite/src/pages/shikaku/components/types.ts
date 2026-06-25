// ============================================================
// ARKZEN GENERATED TYPES — shikaku [React+Vite]
// Source: @arkzen:components (shikaku)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:31:32.184Z
// ============================================================

export type Tool =
  | 'pencil' | 'eraser' | 'fill' | 'eyedropper'
  | 'select' | 'move' | 'line' | 'rect' | 'circle' | 'text'

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Pixel {
  [key: string]: string // "x,y" -> hex color
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: string
  pixels: Pixel
}

export interface Frame {
  id: string
  duration: number // ms
  layers: Layer[]
}

export interface Project {
  id: number
  name: string
  width: number
  height: number
  thumbnail: string | null
  created_at: string
  updated_at: string
}

// ─── Canvas Engine Component ───────────────────────────────────────────────────

export interface CanvasEngineProps {
  frames: Frame[]
  currentFrameIdx: number
  currentLayerIdx: number
  tool: Tool
  primaryColor: string
  secondaryColor: string
  zoom: number
  pan: { x: number; y: number }
  onPanChange: (p: { x: number; y: number }) => void
  onZoomChange: (z: number) => void
  onPixelChange: (frameIdx: number, layerIdx: number, pixels: Pixel) => void
  onColorPick: (color: string) => void
  onZoomInfo: (info: { x: number; y: number; zoom: number }) => void
  width: number
  height: number
  showGrid: boolean
  onionSkin: boolean
}

// ─── Layer Panel ───────────────────────────────────────────────────────────────

export interface LayerPanelProps {
  layers: Layer[]
  currentIdx: number
  onSelect: (idx: number) => void
  onToggleVisible: (idx: number) => void
  onToggleLock: (idx: number) => void
  onAdd: () => void
  onDelete: (idx: number) => void
  onDuplicate: (idx: number) => void
  onOpacityChange: (idx: number, v: number) => void
  onBlendChange: (idx: number, mode: string) => void
}

// ─── Palette Panel ─────────────────────────────────────────────────────────────

export interface PalettePanelProps {
  palette: string[]
  primaryColor: string
  secondaryColor: string
  onSelectColor: (hex: string) => void
  onAddColor: () => void
  activePaletteName: string
  onChangePalette: (name: string) => void
}
