// ============================================================
// ARKZEN GENERATED TYPES — ethereane [React+Vite]
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:41.064Z
// ============================================================

import type * as THREE from 'three'
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import type { Prop } from '@/arkzen/generated/ethereane.scripts'

export type ThreeState = {
  renderer:   THREE.WebGLRenderer
  composer:   EffectComposer
  scene:      THREE.Scene
  camera:     THREE.PerspectiveCamera
  skyMesh:    THREE.Mesh
  charMesh:   THREE.Mesh
  charTex:    THREE.Texture
  charShadow: THREE.Mesh
  npcMeshes:  THREE.Mesh[]
  npcTexes:   THREE.Texture[]
  npcShadows: THREE.Mesh[]
  bush1Mesh:  THREE.InstancedMesh
  bush2Mesh:  THREE.InstancedMesh
  bush1Props: Prop[]
  bush2Props: Prop[]
  minimapCtx: CanvasRenderingContext2D | null
}
