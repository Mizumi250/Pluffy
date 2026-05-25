// ============================================================
// ARKZEN GENERATED SCRIPT — visual-lab/three-scene
// Source: @arkzen:script:three-scene
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T07:54:13.905Z
// ============================================================

// ─── THREE SCENE HELPERS — named script for visual-lab ───────────────────────
// Generated as: visual-lab.three-scene.script.ts
// Import:  import { makeIcosahedron, makeTorusRing } from '@/arkzen/generated/visual-lab.three-scene.script'

export function makeIcosahedron(scene: THREE.Scene, color = '#a78bfa') {
  const geo  = new THREE.IcosahedronGeometry(1, 1)
  const mat  = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)
  return mesh
}

export function makeTorusRing(scene: THREE.Scene, color = '#60a5fa') {
  const geo  = new THREE.TorusGeometry(1.6, 0.06, 16, 80)
  const mat  = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)
  return mesh
}

export function makePointCloud(scene: THREE.Scene, count = 200) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 8
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({ color: '#a78bfa', size: 0.05, sizeAttenuation: true })
  const points = new THREE.Points(geo, mat)
  scene.add(points)
  return points
}
