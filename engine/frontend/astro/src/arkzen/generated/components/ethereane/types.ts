// ============================================================
// ARKZEN GENERATED TYPES — ethereane
// Source: @arkzen:components (ethereane)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:11.870Z
// ============================================================

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
