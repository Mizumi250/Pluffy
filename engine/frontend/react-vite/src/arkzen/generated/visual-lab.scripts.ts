// ============================================================
// ARKZEN GENERATED SCRIPT — visual-lab
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-26T09:29:51.856Z
// ============================================================

// ─── VISUAL LAB GLOBAL CONSTANTS ─────────────────────────────────────────────
// Shared across all visual-lab pages. Imported from generated/visual-lab.scripts.ts
export const VisualLabColors = {
  primary:   '#a78bfa',
  secondary: '#60a5fa',
  accent:    '#f472b6',
  success:   '#34d399',
  warning:   '#fb923c',
}

// ─── SCENE FACTORY ─────────────────────────────────────────────────────────
// Builds a reusable Three.js scene with standard lighting rig
// Usage: const { renderer, scene, camera } = visualLabSceneSetup(canvas)
export function visualLabSceneSetup(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.z = 4

  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  const keyLight = new THREE.PointLight(VisualLabColors.primary, 3, 10)
  keyLight.position.set(2, 3, 4)
  const fillLight = new THREE.PointLight(VisualLabColors.secondary, 2, 10)
  fillLight.position.set(-3, -2, 2)
  scene.add(ambient, keyLight, fillLight)

  return { renderer, scene, camera }
}

// ─── ANIMATION LOOP HELPER ──────────────────────────────────────────────────
// Returns a cleanup function
export function createRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  onFrame?: (dt: number) => void
): () => void {
  let rafId: number
  let last = performance.now()

  const loop = () => {
    rafId = requestAnimationFrame(loop)
    const now = performance.now()
    const dt = (now - last) / 1000
    last = now
    onFrame?.(dt)
    renderer.render(scene, camera)
  }
  loop()

  return () => cancelAnimationFrame(rafId)
}
