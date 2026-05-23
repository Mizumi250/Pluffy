// ============================================================
// ARKZEN GENERATED SCRIPT — visual-lab/particles-config
// Source: @arkzen:script:particles-config
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T13:57:42.110Z
// ============================================================

// ─── PARTICLE SYSTEM CONFIG — named script for visual-lab ────────────────────
// Generated as: visual-lab.particles-config.script.ts
// Import: import { defaultParticleConfig, tsParticlesConfig } from '@/arkzen/generated/visual-lab.particles-config.script'

export const defaultParticleConfig = {
  count:    200,
  size:     { min: 2, max: 6 },
  speed:    { min: 0.5, max: 2 },
  lifetime: { min: 1.5, max: 3.5 },
  colors:   ['#a78bfa', '#60a5fa', '#f472b6', '#34d399'],
}

// tsParticles JSON config — pass to <Particles options={tsParticlesConfig} />
export const tsParticlesConfig = {
  particles: {
    number:   { value: 80, density: { enable: true } },
    color:    { value: ['#a78bfa', '#60a5fa', '#f472b6'] },
    size:     { value: { min: 1, max: 4 } },
    opacity:  { value: { min: 0.2, max: 0.8 } },
    move:     { enable: true, speed: 1.5, direction: 'none', random: true, outModes: 'out' },
    links:    { enable: true, distance: 120, color: '#a78bfa', opacity: 0.2 },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'repulse' },
      onClick: { enable: true, mode: 'push' },
    },
  },
}

export function getEmitterConfig(origin: { x: number; y: number }) {
  return { ...defaultParticleConfig, origin }
}
