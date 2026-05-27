// ============================================================
// ARKZEN GENERATED ROOT ROUTE — [TanStack Start]
// Auto-generated from @arkzen:meta:web — do not edit directly.
// ============================================================
import {
  createRootRoute,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { ToastProvider } from '@/arkzen/core/components/Toast'
import appCss from '../index.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'visual-lab' },
      { name: 'description', content: 'Visual Lab — tests every new frontend package installed across all 5 stacks (Three.js/R3F, BabylonJS, PlayCanvas, PixiJS, OGL, Phaser, Matter.js, Rapier, p5.js, Konva, Fabric.js, REGL, TWGL, Lottie, tsParticles, Proton, Typed.js, Rough Notation, Splitting.js, Vanilla Tilt, Lenis, Canvas Confetti, CurtainsJS, Maath, TroikaText). Also demos both @arkzen:script DSL blocks (global + named) and the experimental HTML-in-Canvas API (Chrome 148+). The definitive Arkzen visual/graphics/canvas reference.' },
      { property: 'og:title', content: 'visual-lab' },
      { property: 'og:description', content: 'Visual Lab — tests every new frontend package installed across all 5 stacks (Three.js/R3F, BabylonJS, PlayCanvas, PixiJS, OGL, Phaser, Matter.js, Rapier, p5.js, Konva, Fabric.js, REGL, TWGL, Lottie, tsParticles, Proton, Typed.js, Rough Notation, Splitting.js, Vanilla Tilt, Lenis, Canvas Confetti, CurtainsJS, Maath, TroikaText). Also demos both @arkzen:script DSL blocks (global + named) and the experimental HTML-in-Canvas API (Chrome 148+). The definitive Arkzen visual/graphics/canvas reference.' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.bunny.net' },
      { rel: 'stylesheet', href: 'https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap' },
      { rel: 'icon', href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔬</text></svg>" },
    ],
  }),
  notFoundComponent: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>404 — Page not found</h2>
    </div>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider position="top-right">
          <Outlet />
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  )
}
