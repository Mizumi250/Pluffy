// ============================================================
// ARKZEN GENERATED SCRIPT — visual-lab
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T11:38:29.927Z
// ============================================================

// Global scene constants — shared across all visual-lab pages
export const VisualLabColors = {
  primary:   '#a78bfa',
  secondary: '#60a5fa',
  accent:    '#f472b6',
  success:   '#34d399',
}

// Factory: build a reusable Three.js scene with standard lighting
export function visualLabSceneSetup(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight)
  camera.position.z = 4

  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  const point   = new THREE.PointLight(VisualLabColors.primary, 3, 10)
  point.position.set(2, 3, 4)
  scene.add(ambient, point)

  return { renderer, scene, camera }
}
